import Link from "next/link";
import { CheckCircle2Icon, XCircleIcon, ChevronRightIcon } from "lucide-react";
import { getTokens } from "@/lib/listok/token-store";
import { getTelegramConfig } from "@/lib/telegram";

export default async function AdminDashboardPage() {
  const [listokTokens, telegramConfig] = await Promise.all([
    getTokens().catch(() => null),
    getTelegramConfig().catch(() => null),
  ]);

  const cards = [
    {
      href: "/admin/integrations/listok",
      title: "Listok CRM",
      ok: Boolean(listokTokens),
      status: listokTokens
        ? `Подключено${listokTokens.expires_at ? ` · токен до ${new Date(listokTokens.expires_at).toLocaleDateString("ru-RU")}` : ""}`
        : "Не подключено — требуется авторизация",
    },
    {
      href: "/admin/integrations/telegram",
      title: "Telegram-уведомления",
      ok: Boolean(telegramConfig?.token && telegramConfig?.chatId),
      status:
        telegramConfig?.token && telegramConfig?.chatId
          ? "Настроено"
          : "Не настроено — укажите токен бота и chat_id",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Дашборд</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Статус интеграций и настройки сайта
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {card.ok ? (
                  <CheckCircle2Icon className="size-6 text-primary" />
                ) : (
                  <XCircleIcon className="size-6 text-muted-foreground/50" />
                )}
                <h2 className="text-lg font-semibold">{card.title}</h2>
              </div>
              <ChevronRightIcon className="size-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{card.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
