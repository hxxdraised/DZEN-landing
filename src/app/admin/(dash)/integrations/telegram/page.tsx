import { TelegramSettingsForm } from "@/components/admin/telegram-settings-form";

export const metadata = {
  title: "Telegram · Админ-панель",
  robots: { index: false, follow: false },
};

export default function AdminTelegramPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Telegram-уведомления</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Заявки с сайта отправляются ботом в канал
      </p>
      <TelegramSettingsForm />
    </div>
  );
}
