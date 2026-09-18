import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { query } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "dzen_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

export interface AdminSession {
  login: string;
}

export function createSessionToken(login: string): string {
  const payload = { sub: login, exp: Date.now() + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | null | undefined): AdminSession | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      sub?: unknown;
      exp?: unknown;
    };
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return { login: payload.sub };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export function sessionFromRequest(request: NextRequest): AdminSession | null {
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(secure = false) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function isHttpsRequest(request: NextRequest): boolean {
  return request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
    const expected = Buffer.from(hashHex, "hex");
    return hash.length === expected.length && timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
}

let adminTableEnsured: Promise<void> | null = null;

function ensureAdminTable(): Promise<void> {
  adminTableEnsured ??= (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id bigserial PRIMARY KEY,
        login text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  })();
  return adminTableEnsured;
}

export async function ensureAdminFromEnv(): Promise<boolean> {
  const login = process.env.ADMIN_LOGIN;
  const password = process.env.ADMIN_PASSWORD;
  if (!login || !password) return false;

  await ensureAdminTable();
  const existing = await query("SELECT id FROM admin_users LIMIT 1");
  if ((existing.rowCount ?? 0) > 0) return false;

  await query("INSERT INTO admin_users (login, password_hash) VALUES ($1, $2)", [
    login,
    hashPassword(password),
  ]);
  return true;
}

export async function authenticateAdmin(login: string, password: string): Promise<boolean> {
  await ensureAdminFromEnv();
  const result = await query<{ password_hash: string }>(
    "SELECT password_hash FROM admin_users WHERE login = $1",
    [login]
  );
  if (result.rows.length === 0) return false;
  return verifyPassword(password, result.rows[0].password_hash);
}
