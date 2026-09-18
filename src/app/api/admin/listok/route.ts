import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import {
  SETTING_LISTOK_CLIENT_ID,
  SETTING_LISTOK_CLIENT_SECRET,
  getListokConfig,
  resolveRedirectUri,
} from "@/lib/listok/oauth";
import { maskToken } from "@/lib/telegram-shared";
import { originFromHeaders } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();

  let config;
  try {
    config = await getListokConfig();
  } catch (e) {
    return NextResponse.json({
      client_id_masked: null,
      base_url: null,
      redirect_uri: resolveRedirectUri(originFromHeaders(request.headers)),
      error: e instanceof Error ? e.message : "config error",
    });
  }

  return NextResponse.json({
    client_id_masked: config.clientId ? maskToken(config.clientId) : null,
    base_url: config.baseUrl,
    redirect_uri: resolveRedirectUri(originFromHeaders(request.headers)),
  });
}

export async function POST(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();

  let body: { client_id?: unknown; client_secret?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const updates: Array<[string, string | null]> = [];

  if (body.client_id !== undefined) {
    const clientId = typeof body.client_id === "string" ? body.client_id.trim() : "";
    if (clientId && !/^[0-9a-fA-F-]{8,64}$/.test(clientId)) {
      return NextResponse.json({ error: "Некорректный формат ID интеграции" }, { status: 400 });
    }
    updates.push([SETTING_LISTOK_CLIENT_ID, clientId || null]);
  }

  if (body.client_secret !== undefined) {
    const clientSecret = typeof body.client_secret === "string" ? body.client_secret.trim() : "";
    if (clientSecret && !/^[\w:-]{10,}$/.test(clientSecret)) {
      return NextResponse.json({ error: "Некорректный формат секретного ключа" }, { status: 400 });
    }
    updates.push([SETTING_LISTOK_CLIENT_SECRET, clientSecret || null]);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  }

  for (const [key, value] of updates) {
    await setSetting(key, value);
  }

  const config = await getListokConfig();
  return NextResponse.json({
    ok: true,
    client_id_masked: config.clientId ? maskToken(config.clientId) : null,
  });
}
