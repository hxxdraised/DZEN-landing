interface HeaderReader {
  get(name: string): string | null;
}

export function originFromHeaders(headers: HeaderReader): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return "";
  const proto =
    headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
