import { readFileSync } from "node:fs";
import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

const DEFAULT_NOTIFY_TEMPLATE = [
  "🆕 <b>Заявка с сайта</b>",
  "",
  "👤 <b>{{name}}</b>",
  '📞 <a href="{{phone_link}}">{{phone}}</a>',
  "💬 Предпочитает: <b>{{method}}</b>",
  "{{message_line}}",
  "📍 Источник: {{source}}",
  "🕐 {{datetime}} МСК",
].join("\n");

const fileEnv = loadEnvFile(".env.local");
const env = { ...fileEnv, ...process.env };

const connectionString = env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set (.env.local or environment)");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id bigserial PRIMARY KEY,
      login text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key text PRIMARY KEY,
      value text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS listok_tokens (
      id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      access_token text NOT NULL,
      refresh_token text NOT NULL,
      expires_at bigint,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
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

  if (env.ADMIN_LOGIN && env.ADMIN_PASSWORD) {
    const existing = await pool.query("SELECT id FROM admin_users LIMIT 1");
    if ((existing.rowCount ?? 0) === 0) {
      await pool.query("INSERT INTO admin_users (login, password_hash) VALUES ($1, $2)", [
        env.ADMIN_LOGIN,
        hashPassword(env.ADMIN_PASSWORD),
      ]);
      console.log(`admin user created: ${env.ADMIN_LOGIN}`);
    } else {
      console.log("admin user already exists, skipped");
    }
  } else {
    console.log("ADMIN_LOGIN/ADMIN_PASSWORD not set, admin creation skipped");
  }

  const template = await pool.query(
    "SELECT value FROM settings WHERE key = 'telegram.notify_template'"
  );
  if ((template.rowCount ?? 0) === 0) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('telegram.notify_template', $1)
       ON CONFLICT (key) DO NOTHING`,
      [DEFAULT_NOTIFY_TEMPLATE]
    );
    console.log("default telegram.notify_template seeded");
  } else {
    console.log("telegram.notify_template already set, skipped");
  }

  console.log("seed complete");
}

main()
  .catch((e) => {
    console.error("seed failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
