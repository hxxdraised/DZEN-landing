import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/listok/oauth";
import { saveTokens } from "@/lib/listok/token-store";

export const dynamic = "force-dynamic";

function htmlPage(title: string, message: string, ok: boolean): NextResponse {
  const color = ok ? "#2e7d32" : "#b3261e";
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f5f2ef; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
  .card { background: #fff; border-radius: 16px; padding: 40px 48px; max-width: 460px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
  h1 { font-size: 20px; color: ${color}; }
  p { color: #555; line-height: 1.5; }
  code { background: #f0ece9; padding: 2px 6px; border-radius: 6px; font-size: 13px; }
</style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get("listok_oauth_state")?.value;

  if (error) {
    return htmlPage(
      "Авторизация не выполнена",
      `Listok вернул ошибку: <code>${error}</code>. Проверьте, что Redirect URI в OAuth-клиенте CRM совпадает с LISTOK_REDIRECT_URI.`,
      false
    );
  }

  if (!code || !state) {
    return htmlPage("Некорректный запрос", "В ответе отсутствует code или state.", false);
  }

  if (!expectedState || expectedState !== state) {
    return htmlPage(
      "Ошибка проверки state",
      "CSRF state не совпадает. Начните авторизацию заново: <code>/api/listok/auth</code>.",
      false
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(tokens);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return htmlPage("Не удалось обменять код на токен", `<code>${message}</code>`, false);
  }

  const response = htmlPage(
    "Авторизация Listok выполнена",
    "Токены сохранены в базу. Проверить подключение: <code>/api/listok/status</code>. Дальше — страница расписания.",
    true
  );
  response.cookies.delete("listok_oauth_state");
  return response;
}
