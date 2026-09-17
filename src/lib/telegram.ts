export type ContactMethod = "telegram" | "max" | "call";

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  telegram: "Telegram",
  max: "MAX",
  call: "Звонок",
};

export interface LeadPayload {
  name: string;
  phone: string;
  contactMethod: ContactMethod;
  message?: string | null;
  source: string;
}

export class TelegramError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramError";
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  const p = d.slice(1);
  let out = "+7";
  if (p.length > 0) out += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) out += ")";
  if (p.length > 3) out += ` ${p.slice(3, 6)}`;
  if (p.length >= 6) out += `-${p.slice(6, 8)}`;
  if (p.length >= 8) out += `-${p.slice(8, 10)}`;
  return out;
}

export async function sendLeadMessage(lead: LeadPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new TelegramError("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured");
  }

  const now = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const lines = [
    "🆕 <b>Заявка с сайта</b>",
    "",
    `👤 <b>${escapeHtml(lead.name)}</b>`,
    `📞 <a href="tel:+${lead.phone.replace(/\D/g, "")}">${formatPhoneDisplay(lead.phone)}</a>`,
    `💬 Предпочитает: <b>${CONTACT_METHOD_LABELS[lead.contactMethod]}</b>`,
  ];

  if (lead.message && lead.message.trim()) {
    lines.push(`📝 Пожелания: ${escapeHtml(lead.message.trim())}`);
  }

  lines.push(`📍 Источник: ${escapeHtml(lead.source)}`);
  lines.push(`🕐 ${now} МСК`);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null;

  if (!response.ok || !data?.ok) {
    throw new TelegramError(data?.description ?? `Telegram API HTTP ${response.status}`);
  }
}
