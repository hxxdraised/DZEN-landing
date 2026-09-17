import { NextResponse } from "next/server";
import { buildAuthorizeUrl, generateState } from "@/lib/listok/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = generateState();
  const response = NextResponse.redirect(buildAuthorizeUrl(state), 302);
  response.cookies.set("listok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/listok",
  });
  return response;
}
