import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Расписание",
};

export default function SchedulePage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Расписание
      </h1>
      <p className="mt-4 text-muted-foreground">
        Раздел подготовлен под интеграцию виджета CRM Listok. До подключения виджета
        запись доступна через контакты студии.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link href="/contacts">Записаться через контакты</Link>
        </Button>
      </div>
    </section>
  );
}
