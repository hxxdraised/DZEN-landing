import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { sendTestMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sessionFromRequest(request)) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  try {
    await sendTestMessage();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Не удалось отправить сообщение" },
      { status: 502 }
    );
  }
}
