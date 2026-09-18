import { query } from "@/lib/db";

let tableEnsured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  tableEnsured ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  })();
  return tableEnsured;
}

export async function getSetting(key: string): Promise<string | null> {
  await ensureTable();
  const result = await query<{ value: string }>(
    "SELECT value FROM settings WHERE key = $1",
    [key]
  );
  return result.rows.length > 0 ? result.rows[0].value : null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  await ensureTable();
  const result = await query<{ key: string; value: string }>(
    "SELECT key, value FROM settings WHERE key = ANY($1)",
    [keys]
  );
  const map: Record<string, string | null> = Object.fromEntries(keys.map((k) => [k, null]));
  for (const row of result.rows) map[row.key] = row.value;
  return map;
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  await ensureTable();
  if (value === null) {
    await query("DELETE FROM settings WHERE key = $1", [key]);
    return;
  }
  await query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value]
  );
}
