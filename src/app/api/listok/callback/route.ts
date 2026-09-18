import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens, resolveRedirectUri } from "@/lib/listok/oauth";
import { saveTokens } from "@/lib/listok/token-store";
import { originFromHeaders } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

function adminRedirect(request: NextRequest, params: Record<string, string>): NextResponse {
  const origin = originFromHeaders(request.headers);
  const url = new URL("/admin/integrations/listok", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("listok_oauth_state")?.value;

  if (error) {
    return adminRedirect(request, { listok: "error", reason: error.slice(0, 200) });
  }

  if (!code || !state || !expectedState || expectedState !== state) {
    return adminRedirect(request, { listok: "error", reason: "state" });
  }

  const redirectUri = resolveRedirectUri(originFromHeaders(request.headers));

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    await saveTokens(tokens);
  } catch (e) {
    const reason = e instanceof Error ? e.message.slice(0, 200) : "token_exchange";
    return adminRedirect(request, { listok: "error", reason });
  }

  const response = adminRedirect(request, { listok: "connected" });
  response.cookies.delete("listok_oauth_state");
  return response;
}
