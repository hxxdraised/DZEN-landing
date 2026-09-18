import { headers } from "next/headers";
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon } from "lucide-react";
import { getTokens } from "@/lib/listok/token-store";
import { ListokApiError, listokRequest } from "@/lib/listok/client";
import {
  ListokConfigError,
  getListokConfig,
  resolveRedirectUri,
} from "@/lib/listok/oauth";
import { maskToken } from "@/lib/telegram-shared";
import { originFromHeaders } from "@/lib/request-origin";
import { ListokActions } from "@/components/admin/listok-actions";
import { ListokCredentialsForm } from "@/components/admin/listok-credentials-form";

interface ListokOffice {
  office_id: number;
  name: string;
  address: string | null;
}

export default async function AdminListokPage({
  searchParams,
}: {
  searchParams: Promise<{ listok?: string; reason?: string }>;
}) {
  const { listok: result, reason } = await searchParams;
  const tokens = await getTokens().catch(() => null);

  const config = await getListokConfig().catch(() => null);
  const origin = originFromHeaders(await headers());
  const redirectUri = resolveRedirectUri(origin);

  let alive = false;
  let offices: ListokOffice[] = [];
  let apiError: string | null = null;

  if (tokens) {
    try {
      const response = await listokRequest<{ data: ListokOffice[] }>(
        "/api/external/v2/offices",
        { params: { page: 1 } }
      );
      offices = response.data;
      alive = true;
    } catch (e) {
      apiError =
        e instanceof ListokApiError || e instanceof ListokConfigError || e instanceof Error
          ? e.message
          : "Неизвестная ошибка";
    }
  }

  const expires = tokens?.expires_at
    ? new Date(tokens.expires_at).toLocaleString("ru-RU")
    : null;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Интеграция Listok CRM</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Расписание занятий на сайте и OAuth-доступ к API CRM
      </p>

      {result === "connected" && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
          Авторизация выполнена, токены сохранены.
        </div>
      )}
      {result === "error" && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {reason === "no_credentials"
              ? "Сначала сохраните ID интеграции и секретный ключ ниже, затем подключайте."
              : `Не удалось авторизоваться${reason ? `: ${reason}` : ""}. Проверьте, что ссылка перенаправления в CRM совпадает с указанной ниже.`}
          </span>
        </div>
      )}

      <div className="grid max-w-2xl gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3">
            {tokens && alive ? (
              <CheckCircle2Icon className="size-6 text-primary" />
            ) : (
              <XCircleIcon className="size-6 text-muted-foreground/50" />
            )}
            <h2 className="text-lg font-semibold">
              {tokens ? (alive ? "Подключено" : "Токены есть, API не отвечает") : "Не подключено"}
            </h2>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Access-токен истекает</dt>
              <dd>{expires ?? "—"}</dd>
            </div>
            {offices.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Филиалы CRM</dt>
                <dd className="text-right">{offices.map((o) => o.name).join(", ")}</dd>
              </div>
            )}
          </dl>

          {apiError && (
            <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {apiError}
            </p>
          )}
        </div>

        <ListokActions connected={Boolean(tokens)} />

        <ListokCredentialsForm
          clientIdMasked={config?.clientId ? maskToken(config.clientId) : null}
          redirectUri={redirectUri}
          baseUrl={config?.baseUrl ?? null}
        />

        <p className="text-xs leading-relaxed text-muted-foreground">
          Подключение открывает страницу авторизации Listok. Входить нужно под пользователем с
          максимальным уровнем доступа.
        </p>
      </div>
    </div>
  );
}
