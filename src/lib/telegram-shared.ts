export type ContactMethod = "telegram" | "max" | "call";

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  telegram: "Telegram",
  max: "MAX",
  call: "Звонок",
};

export const DEFAULT_NOTIFY_TEMPLATE = [
  "🆕 <b>Заявка с сайта</b>",
  "",
  "👤 <b>{{name}}</b>",
  '📞 <a href="{{phone_link}}">{{phone}}</a>',
  "💬 Предпочитает: <b>{{method}}</b>",
  "{{message_line}}",
  "📍 Источник: {{source}}",
  "🕐 {{datetime}} МСК",
].join("\n");

export interface LeadPayload {
  name: string;
  phone: string;
  contactMethod: ContactMethod;
  message?: string | null;
  source: string;
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

export function maskToken(token: string): string {
  if (token.length <= 8) return "•".repeat(token.length);
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

export function buildTemplateValues(lead: LeadPayload): Record<string, string> {
  const phoneDigits = lead.phone.replace(/\D/g, "");
  const message = lead.message?.trim();
  return {
    name: escapeHtml(lead.name),
    phone: formatPhoneDisplay(lead.phone),
    phone_link: `+${phoneDigits}`,
    method: CONTACT_METHOD_LABELS[lead.contactMethod],
    message_line: message ? `📝 Пожелания: ${escapeHtml(message)}` : "",
    source: escapeHtml(lead.source),
    datetime: new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  };
}

export function renderTemplate(template: string, lead: LeadPayload): string {
  const values = buildTemplateValues(lead);
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in values ? values[key] : match
  );
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}
