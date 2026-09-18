import { getSetting } from "@/lib/settings";
import {
  DEFAULT_NOTIFY_TEMPLATE,
  renderTemplate,
  type LeadPayload,
} from "@/lib/telegram-shared";

export const SETTING_BOT_TOKEN = "telegram.bot_token";
export const SETTING_CHAT_ID = "telegram.chat_id";
export const SETTING_NOTIFY_TEMPLATE = "telegram.notify_template";

export interface TelegramRuntimeConfig {
  token: string | null;
  chatId: string | null;
  template: string;
}

export class TelegramError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramError";
  }
}

export async function getTelegramConfig(): Promise<TelegramRuntimeConfig> {
  const [token, chatId, template] = await Promise.all([
    getSetting(SETTING_BOT_TOKEN),
    getSetting(SETTING_CHAT_ID),
    getSetting(SETTING_NOTIFY_TEMPLATE),
  ]);

  return {
    token: token ?? null,
    chatId: chatId ?? null,
    template: template ?? DEFAULT_NOTIFY_TEMPLATE,
  };
}

async function sendTelegramText(
  token: string,
  chatId: string,
  text: string,
  silent = false
): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_notification: silent,
      link_preview_options: { is_disabled: true },
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!response.ok || !data?.ok) {
    throw new TelegramError(data?.description ?? `Telegram API HTTP ${response.status}`);
  }
}

export async function sendLeadMessage(lead: LeadPayload): Promise<void> {
  const config = await getTelegramConfig();
  if (!config.token || !config.chatId) {
    throw new TelegramError("Telegram is not configured: bot token or chat id is missing");
  }
  await sendTelegramText(config.token, config.chatId, renderTemplate(config.template, lead));
}

export async function sendTestMessage(): Promise<void> {
  const config = await getTelegramConfig();
  if (!config.token || !config.chatId) {
    throw new TelegramError("Telegram is not configured: bot token or chat id is missing");
  }

  const sample: LeadPayload = {
    name: "Мария Иванова",
    phone: "79652345678",
    contactMethod: "telegram",
    message: "Хочу на растяжку, новичок",
    source: "Тест из админ-панели",
  };

  const text = [
    "🧪 <b>Тестовое сообщение</b>",
    "(проверка настроек, пример данных)",
    "",
    renderTemplate(config.template, sample),
  ].join("\n");

  await sendTelegramText(config.token, config.chatId, text, true);
}
