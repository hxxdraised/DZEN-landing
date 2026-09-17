import { query } from "@/lib/db";

export interface ListokTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
}

let tableEnsured: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  tableEnsured ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS listok_tokens (
        id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        access_token text NOT NULL,
        refresh_token text NOT NULL,
        expires_at bigint,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  })();
  return tableEnsured;
}

export async function getTokens(): Promise<ListokTokens | null> {
  await ensureTable();
  const result = await query<{
    access_token: string;
    refresh_token: string;
    expires_at: string | bigint | null;
  }>("SELECT access_token, refresh_token, expires_at FROM listok_tokens WHERE id = 1");

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expires_at: row.expires_at === null ? null : Number(row.expires_at),
  };
}

export async function saveTokens(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number | null;
}): Promise<void> {
  await ensureTable();

  const existing = await getTokens();
  const refreshToken = tokens.refresh_token ?? existing?.refresh_token;
  if (!refreshToken) {
    throw new Error("refresh_token is required when no previous token exists");
  }

  const expiresAt =
    typeof tokens.expires_in === "number" ? Date.now() + tokens.expires_in * 1000 : null;

  await query(
    `INSERT INTO listok_tokens (id, access_token, refresh_token, expires_at, updated_at)
     VALUES (1, $1, $2, $3, now())
     ON CONFLICT (id) DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       expires_at = EXCLUDED.expires_at,
       updated_at = now()`,
    [tokens.access_token, refreshToken, expiresAt]
  );
}

export async function clearTokens(): Promise<void> {
  await ensureTable();
  await query("DELETE FROM listok_tokens WHERE id = 1");
}
