import { getListokConfig, refreshAccessToken } from "@/lib/listok/oauth";
import { getTokens, saveTokens } from "@/lib/listok/token-store";

export class ListokApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Listok API error ${status}: ${body.slice(0, 500)}`);
    this.name = "ListokApiError";
    this.status = status;
    this.body = body;
  }
}

export class ListokNotAuthorizedError extends Error {
  constructor() {
    super("Listok is not authorized: no tokens. Visit /api/listok/auth");
    this.name = "ListokNotAuthorizedError";
  }
}

let refreshInFlight: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const tokens = await getTokens();
  if (!tokens) throw new ListokNotAuthorizedError();
  const response = await refreshAccessToken(tokens.refresh_token);
  await saveTokens(response);
}

async function ensureAccessToken(forceRefresh = false): Promise<string> {
  const tokens = await getTokens();
  if (!tokens) throw new ListokNotAuthorizedError();

  const expiresSoon =
    forceRefresh ||
    (tokens.expires_at !== null && tokens.expires_at < Date.now() + 60_000);

  if (expiresSoon) {
    refreshInFlight ??= refreshTokens().finally(() => {
      refreshInFlight = null;
    });
    await refreshInFlight;
  }

  const current = await getTokens();
  if (!current) throw new ListokNotAuthorizedError();
  return current.access_token;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export async function listokRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { baseUrl } = await getListokConfig();

  const buildUrl = (accessToken: string) => {
    const url = new URL(`${baseUrl}${path}`);
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return {
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-Date-Format": "Y-m-d H:i",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      } as HeadersInit,
    };
  };

  const doFetch = async (accessToken: string) => {
    const { url, headers } = buildUrl(accessToken);
    return fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });
  };

  let accessToken = await ensureAccessToken();
  let response = await doFetch(accessToken);

  if (response.status === 401) {
    accessToken = await ensureAccessToken(true);
    response = await doFetch(accessToken);
  }

  const text = await response.text();

  if (!response.ok) {
    throw new ListokApiError(response.status, text);
  }

  return (text ? JSON.parse(text) : null) as T;
}
