import { NextResponse } from "next/server";
import { ListokApiError, ListokNotAuthorizedError, listokRequest } from "@/lib/listok/client";
import { getTokens } from "@/lib/listok/token-store";

export const dynamic = "force-dynamic";

interface ListokOfficesResponse {
  data: Array<{
    office_id: number;
    name: string;
    is_main: number;
    address: string | null;
  }>;
}

export async function GET() {
  const tokens = await getTokens();

  if (!tokens) {
    return NextResponse.json(
      {
        connected: false,
        message: "Токенов нет. Откройте /api/listok/auth и авторизуйтесь под пользователем «Босс».",
      },
      { status: 200 }
    );
  }

  try {
    const offices = await listokRequest<ListokOfficesResponse>("/api/external/v2/offices", {
      params: { page: 1 },
    });

    return NextResponse.json({
      connected: true,
      tokenExpiresAt: tokens.expires_at,
      offices: offices.data.map((o) => ({
        id: o.office_id,
        name: o.name,
        isMain: o.is_main === 1,
        address: o.address,
      })),
    });
  } catch (e) {
    if (e instanceof ListokNotAuthorizedError) {
      return NextResponse.json({ connected: false, message: e.message }, { status: 200 });
    }
    if (e instanceof ListokApiError) {
      return NextResponse.json(
        { connected: false, error: e.message, status: e.status },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { connected: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
