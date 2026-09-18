import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import { listLeads } from "@/lib/lead-store";
import {
  CONTACT_METHOD_LABELS,
  formatPhoneDisplay,
  type ContactMethod,
} from "@/lib/telegram-shared";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Заявки · Админ-панель",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { rows, total } = await listLeads(page, PER_PAGE);
  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);
  const clampedPage = Math.min(page, totalPages);

  const hasPrev = clampedPage > 1;
  const hasNext = clampedPage < totalPages;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-semibold">Заявки</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Все заявки с сайта, новые сверху. Всего: {total}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {clampedPage > 1 ? "На этой странице заявок нет" : "Заявок пока нет"}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground/70">
                <th className="px-4 py-3 font-medium">Дата (МСК)</th>
                <th className="px-4 py-3 font-medium">ФИО</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Связь</th>
                <th className="px-4 py-3 font-medium">Пожелания</th>
                <th className="px-4 py-3 font-medium">Источник</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className="border-b last:border-none hover:bg-accent/30">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {formatDateTime(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a
                      href={`tel:+${lead.phone}`}
                      className="tabular-nums text-primary underline-offset-2 hover:underline"
                    >
                      {formatPhoneDisplay(lead.phone)}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {CONTACT_METHOD_LABELS[lead.contactMethod as ContactMethod] ?? lead.contactMethod}
                  </td>
                  <td
                    className="max-w-56 truncate px-4 py-3 text-muted-foreground"
                    title={lead.message ?? undefined}
                  >
                    {lead.message ?? "—"}
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground" title={lead.source}>
                    {lead.source}
                  </td>
                  <td className="px-4 py-3">
                    {lead.telegramDelivered ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2Icon className="size-4" />
                        доставлено
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-destructive"
                        title={lead.telegramError ?? "Не доставлено в Telegram"}
                      >
                        <XCircleIcon className="size-4" />
                        не доставлено
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {clampedPage} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/leads?page=${clampedPage - 1}`}
              aria-disabled={!hasPrev}
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-full border px-4 text-sm transition-colors",
                hasPrev
                  ? "border-border hover:border-primary hover:text-primary"
                  : "pointer-events-none opacity-40"
              )}
            >
              <ChevronLeftIcon className="size-4" />
              Назад
            </Link>
            <Link
              href={`/admin/leads?page=${clampedPage + 1}`}
              aria-disabled={!hasNext}
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-full border px-4 text-sm transition-colors",
                hasNext
                  ? "border-border hover:border-primary hover:text-primary"
                  : "pointer-events-none opacity-40"
              )}
            >
              Вперёд
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
