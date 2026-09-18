import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  authenticateAdmin,
  createSessionToken,
  isHttpsRequest,
  sessionCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

export async function POST(request: NextRequest) {
  let body: { login?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { login?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!login || !password) {
    return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(`${ip}:${login}`)) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Повторите через 15 минут." },
      { status: 429 }
    );
  }

  let valid = false;
  try {
    valid = await authenticateAdmin(login, password);
  } catch {
    return NextResponse.json({ error: "Ошибка проверки учётных данных" }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(login),
    sessionCookieOptions(isHttpsRequest(request)),
  );
  return response;
}
