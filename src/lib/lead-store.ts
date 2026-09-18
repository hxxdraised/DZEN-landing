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
