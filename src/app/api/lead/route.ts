import { NextResponse, type NextRequest } from "next/server";
import { insertLead, markLeadDelivery } from "@/lib/lead-store";
import { sendLeadMessage, type ContactMethod } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const CONTACT_METHODS: ContactMethod[] = ["telegram", "max", "call"];
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 3;

const hits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

interface LeadRequestBody {
  name?: unknown;
  phone?: unknown;
  contactMethod?: unknown;
  message?: unknown;
  source?: unknown;
  consent?: unknown;
  company?: unknown;
}

export async function POST(request: NextRequest) {
  let body: LeadRequestBody;
  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneDigits = typeof body.phone === "string" ? body.phone.replace(/\D/g, "") : "";
  const contactMethod = body.contactMethod as ContactMethod;
  const message =
    typeof body.message === "string" && body.message.trim() ? body.message.trim().slice(0, 1000) : null;
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 120) : "";
  const consent = body.consent === true;

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Укажите ФИО (2–80 символов)" }, { status: 400 });
  }
  if (phoneDigits.length !== 11 || !phoneDigits.startsWith("7")) {
    return NextResponse.json({ error: "Укажите телефон полностью" }, { status: 400 });
  }
  if (!CONTACT_METHODS.includes(contactMethod)) {
    return NextResponse.json({ error: "Выберите способ связи" }, { status: 400 });
  }
  if (!source) {
    return NextResponse.json({ error: "Не указан источник заявки" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "Необходимо согласие на обработку данных" }, { status: 400 });
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Слишком много заявок. Попробуйте через минуту или позвоните нам." },
      { status: 429 }
    );
  }

  let leadId: number;
  try {
    leadId = await insertLead({
      name,
      phone: phoneDigits,
      contactMethod,
      message,
      source,
      consent,
      ip,
    });
  } catch {
    return NextResponse.json(
      { error: "Не удалось сохранить заявку. Позвоните нам, пожалуйста." },
      { status: 500 }
    );
  }

  try {
    await sendLeadMessage({ name, phone: phoneDigits, contactMethod, message, source });
    await markLeadDelivery(leadId, true);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const error = e instanceof Error ? e.message : "unknown";
    await markLeadDelivery(leadId, false, error).catch(() => undefined);
    return NextResponse.json(
      { error: "Заявка сохранена, но не доставлена в мессенджер. Позвоните нам, пожалуйста." },
      { status: 502 }
    );
  }
}
