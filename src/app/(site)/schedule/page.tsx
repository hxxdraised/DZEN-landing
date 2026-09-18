import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/lead/lead-button";
import { ScheduleView } from "@/components/schedule/schedule-view";
import {
  addDays,
  getWeekSchedule,
  isValidIsoDate,
  mondayOf,
  nowTimeMsk,
  todayMsk,
  type DaySchedule,
} from "@/lib/listok/schedule";
import { contactData } from "@/data/mock";

export const metadata: Metadata = {
  title: "Расписание",
  description:
    "Актуальное расписание занятий студии ДЗЕН: растяжка, йога, пилатес, силовые и танцевальные направления.",
};

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сент",
  "окт",
  "ноя",
  "дек",
];

function formatWeekLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${addDays(weekStart, 6)}T00:00:00Z`);
  const fmt = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

function formatWeekLabelShort(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${addDays(weekStart, 6)}T00:00:00Z`);
  const sd = start.getUTCDate();
  const ed = end.getUTCDate();
  const sm = start.getUTCMonth();
  const em = end.getUTCMonth();
  if (sm === em) return `${sd}–${ed} ${MONTHS_SHORT[sm]}`;
  return `${sd} ${MONTHS_SHORT[sm]} – ${ed} ${MONTHS_SHORT[em]}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const today = todayMsk();
  const weekStart = week && isValidIsoDate(week) ? mondayOf(week) : mondayOf(today);
  const prevWeek = addDays(weekStart, -7);
  const nextWeek = addDays(weekStart, 7);

  let days: DaySchedule[] = [];
  let failed = false;

  try {
    const schedule = await getWeekSchedule(weekStart);
    const now = nowTimeMsk();
    days = schedule.days.map((day) => ({
      ...day,
      classes:
        day.date === today
          ? day.classes.filter((c) => c.endTime > now)
          : day.classes,
    }));
  } catch {
    failed = true;
  }

  const totalClasses = days.reduce((sum, d) => sum + d.classes.length, 0);

  return (
    <section className="container mx-auto px-4 pb-20 pt-32">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Расписание
        </h1>
        <p className="mt-4 text-muted-foreground">
          Живое расписание студии — данные обновляются из системы записи каждые пару минут.
        </p>
        <div className="mt-6 flex justify-center">
          <LeadButton source="Расписание" label="Записаться на занятие" size="lg" />
        </div>
      </div>

      {failed ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-dashed p-10 text-center">
          <h2 className="font-display text-xl font-semibold">Расписание временно недоступно</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Не удалось получить данные из системы записи. Попробуйте обновить страницу чуть позже
            или запишитесь по телефону.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <a href={`tel:${contactData.phone.replace(/\D/g, "")}`}>
                <PhoneIcon className="size-4" />
                {contactData.phone}
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contacts">Контакты</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/schedule?week=${prevWeek}`} prefetch={false} aria-label="Предыдущая неделя">
                <ChevronLeftIcon className="size-4" />
                Назад
              </Link>
            </Button>
            <p className="font-display text-lg font-medium">
              <span className="md:hidden">{formatWeekLabelShort(weekStart)}</span>
              <span className="hidden md:inline">{formatWeekLabel(weekStart)}</span>
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/schedule?week=${nextWeek}`} prefetch={false} aria-label="Следующая неделя">
                Вперёд
                <ChevronRightIcon className="size-4" />
              </Link>
            </Button>
          </div>

          {totalClasses === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed p-10 text-center">
              <h2 className="font-display text-xl font-semibold">Занятий на эту неделю нет</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Возможно, расписание ещё заполняется. Посмотрите другую неделю или запишитесь через
                контакты.
              </p>
              <div className="mt-6 flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/contacts">Связаться со студией</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ScheduleView days={days} today={today} />
          )}
        </>
      )}
    </section>
  );
}
