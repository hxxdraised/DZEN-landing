import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { sessionFromRequest } from "@/lib/auth";
import { pool } from "@/lib/db";
import { CONTENT_TAGS, ensureTables } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PlanDirection {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  photoUrl?: unknown;
  visible?: unknown;
}

interface PlanCategory {
  id?: unknown;
  title?: unknown;
  visible?: unknown;
  directions?: unknown;
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validate(payload: PlanCategory[]): string | null {
  if (!Array.isArray(payload) || payload.length === 0) return "Нужна хотя бы одна категория";
  if (payload.length > 20) return "Слишком много категорий (максимум 20)";
  for (const category of payload) {
    const title = typeof category.title === "string" ? category.title.trim() : "";
    if (title.length < 2 || title.length > 200) return "Название категории: 2–200 символов";
    const directions = Array.isArray(category.directions) ? category.directions : [];
    if (directions.length > 30) return "Максимум 30 направлений в категории";
    for (const direction of directions as PlanDirection[]) {
      const dTitle = typeof direction.title === "string" ? direction.title.trim() : "";
      const dDescription =
        typeof direction.description === "string" ? direction.description.trim() : "";
      const photoUrl = typeof direction.photoUrl === "string" ? direction.photoUrl.trim() : "";
      if (dTitle.length < 2 || dTitle.length > 200) return "Название направления: 2–200 символов";
      if (dDescription.length < 10 || dDescription.length > 2000) {
        return `Описание направления «${dTitle}»: 10–2000 символов`;
      }
      if (photoUrl && !/^https?:\/\//.test(photoUrl)) {
        return `Ссылка на фото в «${dTitle}» должна начинаться с http(s)://`;
      }
    }
  }
  return null;
}

export async function PUT(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();
  await ensureTables();

  let payload: PlanCategory[];
  try {
    const body = (await request.json()) as { categories?: unknown };
    payload = (body.categories ?? []) as PlanCategory[];
  } catch {
    return badRequest("Некорректный запрос");
  }

  const validationError = validate(payload);
  if (validationError) return badRequest(validationError);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const keepCategoryIds: number[] = [];
    const keepDirectionIds: number[] = [];

    for (const [ci, category] of payload.entries()) {
      const title = String(category.title).trim();
      const visible = category.visible !== false;
      const rawId = typeof category.id === "number" ? category.id : null;
      const categoryId = rawId && rawId > 0 ? rawId : null;

      let realCategoryId: number;
      if (categoryId) {
        await client.query(
          `UPDATE direction_categories SET title = $1, visible = $2, sort_order = $3, updated_at = now()
           WHERE id = $4`,
          [title, visible, ci, categoryId]
        );
        realCategoryId = categoryId;
      } else {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO direction_categories (title, visible, sort_order)
           VALUES ($1, $2, $3) RETURNING id`,
          [title, visible, ci]
        );
        realCategoryId = Number(inserted.rows[0].id);
      }
      keepCategoryIds.push(realCategoryId);

      const directions = Array.isArray(category.directions) ? category.directions : [];
      for (const [di, direction] of (directions as PlanDirection[]).entries()) {
        const dTitle = String(direction.title).trim();
        const dDescription = String(direction.description).trim();
        const photoUrl = String(direction.photoUrl ?? "").trim();
        const dVisible = direction.visible !== false;
        const dRawId = typeof direction.id === "number" ? direction.id : null;
        const directionId = dRawId && dRawId > 0 ? dRawId : null;

        if (directionId) {
          await client.query(
            `UPDATE directions SET category_id = $1, title = $2, description = $3,
                   photo_url = $4, visible = $5, sort_order = $6, updated_at = now()
             WHERE id = $7`,
            [realCategoryId, dTitle, dDescription, photoUrl || null, dVisible, di, directionId]
          );
          keepDirectionIds.push(directionId);
        } else {
          const inserted = await client.query<{ id: string }>(
            `INSERT INTO directions (category_id, title, description, photo_url, visible, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [realCategoryId, dTitle, dDescription, photoUrl || null, dVisible, di]
          );
          keepDirectionIds.push(Number(inserted.rows[0].id));
        }
      }
    }

    if (keepDirectionIds.length > 0) {
      await client.query(`DELETE FROM directions WHERE id <> ALL($1::bigint[])`, [
        keepDirectionIds,
      ]);
    } else {
      await client.query("DELETE FROM directions");
    }
    if (keepCategoryIds.length > 0) {
      await client.query(`DELETE FROM direction_categories WHERE id <> ALL($1::bigint[])`, [
        keepCategoryIds,
      ]);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Ошибка транзакции";
    return NextResponse.json({ error: `Не удалось сохранить: ${message}` }, { status: 500 });
  } finally {
    client.release();
  }

  revalidateTag(CONTENT_TAGS.directions);
  return NextResponse.json({ ok: true });
}
