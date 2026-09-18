import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthorizeUrl,
  generateState,
  requireListokCredentials,
  resolveRedirectUri,
} from "@/lib/listok/oauth";
import { originFromHeaders } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = originFromHeaders(request.headers);
  const redirectUri = resolveRedirectUri(origin);

  try {
    await requireListokCredentials();
  } catch {
    const url = new URL("/admin/integrations/listok", origin);
    url.searchParams.set("listok", "error");
    url.searchParams.set("reason", "no_credentials");
    return NextResponse.redirect(url);
  }

  const state = generateState();
  const authorizeUrl = await buildAuthorizeUrl(state, redirectUri);
  const response = NextResponse.redirect(authorizeUrl, 302);
  response.cookies.set("listok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/listok",
  });
  return response;
}
