import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { sessionFromRequest } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import { CONTENT_TAGS, ensureTables } from "@/lib/content";
import { deleteS3Urls } from "@/lib/s3";

export const dynamic = "force-dynamic";

interface PlanMember {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  groupSpecializations?: unknown;
  personalSpecializations?: unknown;
  philosophy?: unknown;
  experience?: unknown;
  education?: unknown;
  photoUrl?: unknown;
  visible?: unknown;
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

function toLines(value: unknown, max: number): string[] {
  return (Array.isArray(value) ? value : [])
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

function validate(payload: PlanMember[]): string | null {
  if (!Array.isArray(payload) || payload.length === 0) {
    return "Нужен хотя бы один тренер в команде";
  }
  if (payload.length > 30) return "Слишком много тренеров (максимум 30)";
  for (const member of payload) {
    const name = typeof member.name === "string" ? member.name.trim() : "";
    const role = typeof member.role === "string" ? member.role.trim() : "";
    const philosophy = typeof member.philosophy === "string" ? member.philosophy.trim() : "";
    const experience = typeof member.experience === "string" ? member.experience.trim() : "";
    if (name.length < 2 || name.length > 120) return `Имя тренера: 2–120 символов («${name}»)`;
    if (role.length < 2 || role.length > 120) return `Роль тренера «${name}»: 2–120 символов`;
    if (philosophy.length > 1000) return `Философия «${name}»: максимум 1000 символов`;
    if (experience.length < 10 || experience.length > 2000) {
      return `Опыт и подход «${name}»: 10–2000 символов`;
    }
    const photoUrl = typeof member.photoUrl === "string" ? member.photoUrl.trim() : "";
    if (photoUrl && !/^https?:\/\//.test(photoUrl)) {
      return `Ссылка на фото «${name}» должна начинаться с http(s)://`;
    }
  }
  return null;
}

export async function PUT(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();
  await ensureTables();

  let payload: PlanMember[];
  try {
    const body = (await request.json()) as { members?: unknown };
    payload = (body.members ?? []) as PlanMember[];
  } catch {
    return badRequest("Некорректный запрос");
  }

  const validationError = validate(payload);
  if (validationError) return badRequest(validationError);

  const client = await pool.connect();
  const oldPhotos = await query<{ photo_url: string }>(
    "SELECT photo_url FROM team_members WHERE photo_url IS NOT NULL"
  );
  try {
    await client.query("BEGIN");

    const keepIds: number[] = [];
    for (const [i, member] of payload.entries()) {
      const name = String(member.name).trim();
      const role = String(member.role).trim();
      const philosophy = String(member.philosophy ?? "").trim();
      const experience = String(member.experience).trim();
      const photoUrl = String(member.photoUrl ?? "").trim();
      const visible = member.visible !== false;
      const group = JSON.stringify(toLines(member.groupSpecializations, 30));
      const personal = JSON.stringify(toLines(member.personalSpecializations, 30));
      const education = JSON.stringify(toLines(member.education, 30));
      const rawId = typeof member.id === "number" ? member.id : null;

      if (rawId && rawId > 0) {
        await client.query(
          `INSERT INTO team_members
             (id, name, role, group_specializations, personal_specializations, philosophy,
              experience, education, photo_url, visible, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name, role = EXCLUDED.role,
             group_specializations = EXCLUDED.group_specializations,
             personal_specializations = EXCLUDED.personal_specializations,
             philosophy = EXCLUDED.philosophy, experience = EXCLUDED.experience,
             education = EXCLUDED.education, photo_url = EXCLUDED.photo_url,
             visible = EXCLUDED.visible, sort_order = EXCLUDED.sort_order, updated_at = now()`,
          [rawId, name, role, group, personal, philosophy, experience, education, photoUrl || null, visible, i]
        );
        keepIds.push(rawId);
      } else {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO team_members
             (name, role, group_specializations, personal_specializations, philosophy,
              experience, education, photo_url, visible, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [name, role, group, personal, philosophy, experience, education, photoUrl || null, visible, i]
        );
        keepIds.push(Number(inserted.rows[0].id));
      }
    }

    await client.query(
      `SELECT setval(pg_get_serial_sequence('team_members','id'),
                     COALESCE((SELECT max(id) FROM team_members), 0) + 1, false)`
    );

    if (keepIds.length > 0) {
      await client.query(`DELETE FROM team_members WHERE id <> ALL($1::bigint[])`, [keepIds]);
    } else {
      await client.query("DELETE FROM team_members");
    }

    await client.query("COMMIT");

    const newPhotoUrls = new Set<string>();
    for (const member of payload) {
      const photoUrl = String(member.photoUrl ?? "").trim();
      if (photoUrl) newPhotoUrls.add(photoUrl);
    }
    const orphaned = oldPhotos.rows
      .map((r) => r.photo_url)
      .filter((url) => !newPhotoUrls.has(url));
    if (orphaned.length > 0) {
      await deleteS3Urls(orphaned);
    }
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Ошибка транзакции";
    return NextResponse.json({ error: `Не удалось сохранить: ${message}` }, { status: 500 });
  } finally {
    client.release();
  }

  revalidateTag(CONTENT_TAGS.team, "max");
  return NextResponse.json({ ok: true });
}
