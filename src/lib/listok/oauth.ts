import { randomBytes } from "crypto";

export interface ListokTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export function listokConfig() {
  const baseUrl = process.env.LISTOK_BASE_URL?.replace(/\/+$/, "");
  const clientId = process.env.LISTOK_CLIENT_ID;
  const clientSecret = process.env.LISTOK_CLIENT_SECRET;
  const redirectUri = process.env.LISTOK_REDIRECT_URI;

  if (!baseUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing LISTOK_BASE_URL, LISTOK_CLIENT_ID, LISTOK_CLIENT_SECRET or LISTOK_REDIRECT_URI"
    );
  }

  return { baseUrl, clientId, clientSecret, redirectUri };
}

export function generateState(): string {
  return randomBytes(16).toString("hex");
}

export function buildAuthorizeUrl(state: string): string {
  const { baseUrl, clientId, redirectUri } = listokConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "",
    state,
  });
  return `${baseUrl}/oauth/authorize?${params.toString()}`;
}

async function requestToken(body: Record<string, string>): Promise<ListokTokenResponse> {
  const { baseUrl } = listokConfig();

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Listok OAuth error ${response.status}: ${text}`);
  }

  return JSON.parse(text) as ListokTokenResponse;
}

export async function exchangeCodeForTokens(code: string): Promise<ListokTokenResponse> {
  const { clientId, clientSecret, redirectUri } = listokConfig();
  return requestToken({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<ListokTokenResponse> {
  const { clientId, clientSecret } = listokConfig();
  return requestToken({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    scope: "",
  });
}
