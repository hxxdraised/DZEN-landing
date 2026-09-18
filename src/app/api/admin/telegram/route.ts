import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import {
  SETTING_BOT_TOKEN,
  SETTING_CHAT_ID,
  SETTING_NOTIFY_TEMPLATE,
  getTelegramConfig,
} from "@/lib/telegram";
import { maskToken } from "@/lib/telegram-shared";
import { setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();

  const config = await getTelegramConfig();

  return NextResponse.json({
    bot_token_masked: config.token ? maskToken(config.token) : null,
    chat_id: config.chatId,
    notify_template: config.template,
  });
}

export async function POST(request: NextRequest) {
  if (!sessionFromRequest(request)) return unauthorized();

  let body: {
    bot_token?: unknown;
    chat_id?: unknown;
    notify_template?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const updates: Array<[string, string | null]> = [];

  if (body.bot_token !== undefined) {
    const token = typeof body.bot_token === "string" ? body.bot_token.trim() : "";
    if (token && !/^[\w:-]{20,}$/.test(token)) {
      return NextResponse.json({ error: "Некорректный формат токена бота" }, { status: 400 });
    }
    updates.push([SETTING_BOT_TOKEN, token || null]);
  }

  if (body.chat_id !== undefined) {
    const chatId = typeof body.chat_id === "string" ? body.chat_id.trim() : "";
    if (chatId && !/^(-100\d+|@\w{4,}|\d+)$/.test(chatId)) {
      return NextResponse.json(
        { error: "Некорректный chat_id: ожидается -100…, @username или число" },
        { status: 400 }
      );
    }
    updates.push([SETTING_CHAT_ID, chatId || null]);
  }

  if (body.notify_template !== undefined) {
    const template = typeof body.notify_template === "string" ? body.notify_template : "";
    if (template.length < 10 || template.length > 2000) {
      return NextResponse.json(
        { error: "Шаблон должен быть от 10 до 2000 символов" },
        { status: 400 }
      );
    }
    if (!template.includes("{{name}}") || !template.includes("{{phone")) {
      return NextResponse.json(
        { error: "Шаблон должен содержать плейсхолдеры {{name}} и {{phone}} (или {{phone_link}})" },
        { status: 400 }
      );
    }
    updates.push([SETTING_NOTIFY_TEMPLATE, template]);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Нет полей для обновления" }, { status: 400 });
  }

  for (const [key, value] of updates) {
    await setSetting(key, value);
  }

  const config = await getTelegramConfig();
  return NextResponse.json({
    ok: true,
    bot_token_masked: config.token ? maskToken(config.token) : null,
    chat_id: config.chatId,
    notify_template: config.template,
  });
}
