import { query } from "@/lib/db";
import type { ContactMethod } from "@/lib/telegram-shared";

export interface NewLead {
  name: string;
  phone: string;
  contactMethod: ContactMethod;
  message: string | null;
  source: string;
  consent: boolean;
  ip: string | null;
}

let tableEnsured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  tableEnsured ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id bigserial PRIMARY KEY,
        name text NOT NULL,
        phone text NOT NULL,
        contact_method text NOT NULL,
        message text,
        source text NOT NULL,
        consent boolean NOT NULL,
        ip text,
        telegram_delivered boolean NOT NULL DEFAULT false,
        telegram_error text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  })();
  return tableEnsured;
}

export async function insertLead(lead: NewLead): Promise<number> {
  await ensureTable();
  const result = await query<{ id: string }>(
    `INSERT INTO leads (name, phone, contact_method, message, source, consent, ip)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      lead.name,
      lead.phone,
      lead.contactMethod,
      lead.message,
      lead.source,
      lead.consent,
      lead.ip,
    ]
  );
  return Number(result.rows[0].id);
}

export async function markLeadDelivery(
  id: number,
  delivered: boolean,
  error?: string | null
): Promise<void> {
  await ensureTable();
  await query(
    `UPDATE leads SET telegram_delivered = $2, telegram_error = $3 WHERE id = $1`,
    [id, delivered, error ?? null]
  );
}

export interface LeadRow {
  id: number;
  name: string;
  phone: string;
  contactMethod: string;
  message: string | null;
  source: string;
  telegramDelivered: boolean;
  telegramError: string | null;
  createdAt: Date;
}

export async function listLeads(
  page: number,
  perPage: number
): Promise<{ rows: LeadRow[]; total: number }> {
  await ensureTable();

  const count = await query<{ total: string }>("SELECT count(*) AS total FROM leads");
  const total = Number(count.rows[0]?.total ?? 0);

  const offset = (page - 1) * perPage;
  const result = await query<{
    id: string;
    name: string;
    phone: string;
    contact_method: string;
    message: string | null;
    source: string;
    telegram_delivered: boolean;
    telegram_error: string | null;
    created_at: Date;
  }>(
    `SELECT id, name, phone, contact_method, message, source,
            telegram_delivered, telegram_error, created_at
     FROM leads ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
    [perPage, offset]
  );

  return {
    rows: result.rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      phone: r.phone,
      contactMethod: r.contact_method,
      message: r.message,
      source: r.source,
      telegramDelivered: r.telegram_delivered,
      telegramError: r.telegram_error,
      createdAt: r.created_at,
    })),
    total,
  };
}
