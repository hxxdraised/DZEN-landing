import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
};

export default function PrivacyPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-6 text-muted-foreground">
        Страница добавлена как шаблон. Финальный юридический текст будет размещен
        после предоставления реквизитов и согласованной редакции политики.
      </p>
    </section>
  );
}
