import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { sessionFromRequest } from "@/lib/auth";
import { pool } from "@/lib/db";
import { CONTENT_TAGS, ensureTables } from "@/lib/content";

export const dynamic = "force-dynamic";

interface PlanItem {
  id?: unknown;
  name?: unknown;
  label?: unknown;
  details?: unknown;
  audience?: unknown;
  duration?: unknown;
  fullPrice?: unknown;
  discountPrice?: unknown;
  ctaText?: unknown;
  visible?: unknown;
}

interface PlanBlock {
  id?: unknown;
  title?: unknown;
  subtitle?: unknown;
  note?: unknown;
  visible?: unknown;
  plans?: unknown;
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePrice(value: unknown, field: string): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    return null;
  }
  if (value < 0 || value > 10_000_000) return null;
  void field;
  return value;
}

function validate(payload: PlanBlock[]): string | null {
  if (!Array.isArray(payload) || payload.length === 0) return "Нужен хотя бы один блок";
  if (payload.length > 20) return "Слишком много блоков (максимум 20)";
  for (const block of payload) {
    const title = str(block.title);
    if (title.length < 2 || title.length > 200) return "Заголовок блока: 2–200 символов";
    if (str(block.note).length > 1000) return "Примечание блока: максимум 1000 символов";
    const plans = Array.isArray(block.plans) ? (block.plans as PlanItem[]) : [];
    if (plans.length === 0) return `В блоке «${title}» нужен хотя бы один тариф`;
    if (plans.length > 20) return `В блоке «${title}» максимум 20 тарифов`;
    for (const plan of plans) {
      const name = str(plan.name);
      if (name.length < 2 || name.length > 200) return `Название тарифа: 2–200 символов`;
      if (validatePrice(plan.fullPrice) === null) {
        return `Полная цена тарифа «${name}»: целое число 0–10 000 000`;
      }
      const discount = plan.discountPrice;
      if (discount !== null && discount !== undefined && discount !== "") {
        if (validatePrice(discount) === null) {
          return `Цена со скидкой «${name}»: целое число 0–10 000 000`;
        }
        if (Number(discount) >= Number(plan.fullPrice)) {
          return `Цена со скидкой «${name}» должна быть меньше полной`;
        }
      }
      if (str(plan.ctaText).length < 2 || str(plan.ctaText).length > 40) {
        return `Текст кнопки «${name}»: 2–40 символов`;
      }
    }
  }
  return null;
}

export async function PUT(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();
  await ensureTables();

  let payload: PlanBlock[];
  try {
    const body = (await request.json()) as { blocks?: unknown };
    payload = (body.blocks ?? []) as PlanBlock[];
  } catch {
    return badRequest("Некорректный запрос");
  }

  const validationError = validate(payload);
  if (validationError) return badRequest(validationError);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const keepBlockIds: number[] = [];
    const keepPlanIds: number[] = [];

    for (const [bi, block] of payload.entries()) {
      const title = str(block.title);
      const subtitle = str(block.subtitle) || null;
      const note = str(block.note) || null;
      const visible = block.visible !== false;
      const rawBlockId = typeof block.id === "number" ? block.id : null;

      let blockId: number;
      if (rawBlockId && rawBlockId > 0) {
        await client.query(
          `UPDATE pricing_blocks SET title = $1, subtitle = $2, note = $3, visible = $4,
                 sort_order = $5, updated_at = now()
           WHERE id = $6`,
          [title, subtitle, note, visible, bi, rawBlockId]
        );
        blockId = rawBlockId;
      } else {
        const inserted = await client.query<{ id: string }>(
          `INSERT INTO pricing_blocks (title, subtitle, note, visible, sort_order)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [title, subtitle, note, visible, bi]
        );
        blockId = Number(inserted.rows[0].id);
      }
      keepBlockIds.push(blockId);

      const plans = Array.isArray(block.plans) ? (block.plans as PlanItem[]) : [];
      for (const [pi, plan] of plans.entries()) {
        const discountRaw = plan.discountPrice;
        const discount =
          discountRaw === null || discountRaw === undefined || discountRaw === ""
            ? null
            : validatePrice(discountRaw);
        const rawPlanId = typeof plan.id === "number" ? plan.id : null;

        if (rawPlanId && rawPlanId > 0) {
          await client.query(
            `UPDATE pricing_plans SET block_id = $1, name = $2, label = $3, details = $4,
                   audience = $5, duration = $6, full_price = $7, discount_price = $8,
                   cta_text = $9, visible = $10, sort_order = $11, updated_at = now()
             WHERE id = $12`,
            [
              blockId,
              str(plan.name),
              str(plan.label) || null,
              str(plan.details) || null,
              str(plan.audience) || null,
              str(plan.duration) || null,
              validatePrice(plan.fullPrice) ?? 0,
              discount,
              str(plan.ctaText),
              plan.visible !== false,
              pi,
              rawPlanId,
            ]
          );
          keepPlanIds.push(rawPlanId);
        } else {
          const inserted = await client.query<{ id: string }>(
            `INSERT INTO pricing_plans
               (block_id, name, label, details, audience, duration, full_price,
                discount_price, cta_text, visible, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
              blockId,
              str(plan.name),
              str(plan.label) || null,
              str(plan.details) || null,
              str(plan.audience) || null,
              str(plan.duration) || null,
              validatePrice(plan.fullPrice) ?? 0,
              discount,
              str(plan.ctaText),
              plan.visible !== false,
              pi,
            ]
          );
          keepPlanIds.push(Number(inserted.rows[0].id));
        }
      }
    }

    if (keepPlanIds.length > 0) {
      await client.query(`DELETE FROM pricing_plans WHERE id <> ALL($1::bigint[])`, [keepPlanIds]);
    } else {
      await client.query("DELETE FROM pricing_plans");
    }
    if (keepBlockIds.length > 0) {
      await client.query(`DELETE FROM pricing_blocks WHERE id <> ALL($1::bigint[])`, [keepBlockIds]);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    const message = e instanceof Error ? e.message : "Ошибка транзакции";
    return NextResponse.json({ error: `Не удалось сохранить: ${message}` }, { status: 500 });
  } finally {
    client.release();
  }

  revalidateTag(CONTENT_TAGS.pricing, "max");
  return NextResponse.json({ ok: true });
}
