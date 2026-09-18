import { randomBytes } from "crypto";
import { getSettings } from "@/lib/settings";

export const SETTING_LISTOK_CLIENT_ID = "listok.client_id";
export const SETTING_LISTOK_CLIENT_SECRET = "listok.client_secret";

export interface ListokConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class ListokConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ListokConfigError";
  }
}

export async function getListokConfig(): Promise<ListokConfig> {
  const values = await getSettings([SETTING_LISTOK_CLIENT_ID, SETTING_LISTOK_CLIENT_SECRET]);
  const clientId = values[SETTING_LISTOK_CLIENT_ID] ?? "";
  const clientSecret = values[SETTING_LISTOK_CLIENT_SECRET] ?? "";

  const baseUrl = process.env.LISTOK_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ListokConfigError("LISTOK_BASE_URL is not configured");
  }

  return {
    baseUrl,
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
  };
}

export async function requireListokCredentials(): Promise<ListokConfig> {
  const config = await getListokConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new ListokConfigError(
      "Listok credentials are not configured: заполните ID интеграции и секретный ключ в админ-панели"
    );
  }
  return config;
}

export function resolveRedirectUri(origin: string): string {
  return process.env.LISTOK_REDIRECT_URI || `${origin}/api/listok/callback`;
}

export function generateState(): string {
  return randomBytes(16).toString("hex");
}

export interface ListokTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export async function buildAuthorizeUrl(
  state: string,
  redirectUri: string
): Promise<string> {
  const { baseUrl, clientId } = await requireListokCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "",
    state,
  });
  return `${baseUrl}/oauth/authorize?${params.toString()}`;
}

async function requestToken(
  body: Record<string, string>,
  redirectUri?: string
): Promise<ListokTokenResponse> {
  const { baseUrl, clientId, clientSecret } = await requireListokCredentials();

  const payload: Record<string, string> = {
    client_id: clientId,
    client_secret: clientSecret,
  };
  if (redirectUri) payload.redirect_uri = redirectUri;

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({ ...body, ...payload }),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Listok OAuth error ${response.status}: ${text}`);
  }

  return JSON.parse(text) as ListokTokenResponse;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<ListokTokenResponse> {
  return requestToken(
    {
      grant_type: "authorization_code",
      code,
    },
    redirectUri
  );
}

export async function refreshAccessToken(refreshToken: string): Promise<ListokTokenResponse> {
  return requestToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "",
  });
}
