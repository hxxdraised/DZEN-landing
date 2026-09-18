import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth";
import { clearTokens } from "@/lib/listok/token-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sessionFromRequest(request)) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  await clearTokens();
  return NextResponse.json({ ok: true });
}
