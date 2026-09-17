"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DaySchedule, ScheduleClass } from "@/lib/listok/schedule";

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAYS_LONG = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const PX_PER_HOUR = 56;
const GUTTER_WIDTH = 52;

const BUSY_STRIPES =
  "repeating-linear-gradient(45deg, rgba(122,110,104,0.14) 0px, rgba(122,110,104,0.14) 5px, transparent 5px, transparent 11px)";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function spotsLabel(spotsLeft: number | null): { text: string; className: string } {
  if (spotsLeft === null) return { text: "Свободная запись", className: "text-primary" };
  if (spotsLeft === 0) return { text: "Мест нет", className: "text-muted-foreground" };
  return {
    text: `Осталось ${spotsLeft} ${plural(spotsLeft, ["место", "места", "мест"])}`,
    className: "text-primary",
  };
}

function shortSpots(spotsLeft: number | null): string | null {
  if (spotsLeft === null) return null;
  if (spotsLeft === 0) return "нет мест";
  return `${spotsLeft} ${plural(spotsLeft, ["место", "места", "мест"])}`;
}

function safeColor(color: string | null): string | null {
  return color && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : null;
}

function formatMonthDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(d);
}

interface PlacedClass {
  item: ScheduleClass;
  start: number;
  end: number;
  lane: number;
  lanes: number;
}

function placeClasses(classes: ScheduleClass[]): PlacedClass[] {
  const sorted = [...classes].sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime)
  );
  const laneEnds: number[] = [];
  const placed = sorted.map((item) => {
    const start = toMinutes(item.startTime);
    const end = toMinutes(item.endTime);
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      laneEnds.push(end);
      lane = laneEnds.length - 1;
    } else {
      laneEnds[lane] = end;
    }
    return { item, start, end, lane, lanes: 1 };
  });
  const lanes = Math.max(laneEnds.length, 1);
  return placed.map((p) => ({ ...p, lanes }));
}

interface ScheduleViewProps {
  days: DaySchedule[];
  today: string;
}

export function ScheduleView({ days, today }: ScheduleViewProps) {
  const todayIndex = days.findIndex((d) => d.date === today);
  const firstWithClasses = days.findIndex((d) => d.classes.length > 0);
  const [selected, setSelected] = useState(
    todayIndex >= 0 ? todayIndex : firstWithClasses >= 0 ? firstWithClasses : 0
  );

  const selectedDay = days[selected];
  const allClasses = days.flatMap((d) => d.classes);

  return (
    <div>
      <div className="mb-6 grid grid-cols-7 gap-1.5 md:hidden">
        {days.map((day, i) => {
          const isToday = day.date === today;
          const isSelected = i === selected;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1 py-2.5 transition-colors",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-foreground/70 hover:border-primary/40"
              )}
            >
              <span className="text-xs font-medium">{WEEKDAYS_SHORT[i]}</span>
              <span
                className={cn(
                  "text-sm font-semibold leading-none",
                  isToday && !isSelected && "text-primary"
                )}
              >
                {day.dayOfMonth}
              </span>
              <span
                aria-hidden
                className={cn(
                  "size-1 rounded-full",
                  day.classes.length > 0 ? "bg-primary" : "bg-transparent"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="md:hidden">
        <div className="mb-4 flex items-baseline gap-2">
          <h2 className="font-display text-2xl font-semibold">
            {WEEKDAYS_LONG[selected]}, {formatMonthDay(selectedDay.date)}
          </h2>
          {selectedDay.date === today && <span className="text-sm text-primary">сегодня</span>}
        </div>
        {selectedDay.classes.length > 0 ? (
          <ul className="space-y-2">
            {selectedDay.classes.map((c) =>
              c.kind === "busy" ? (
                <BusyRow key={c.eventId} item={c} />
              ) : (
                <MobileClassRow key={c.eventId} item={c} />
              )
            )}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            В этот день занятий нет
          </p>
        )}
      </div>

      <div className="hidden md:block">
        <WeekTimeline days={days} today={today} allClasses={allClasses} />
      </div>

      <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-3.5 rounded border border-border/60"
            style={{ backgroundImage: BUSY_STRIPES }}
          />
          зал занят — аренда или персональная тренировка
        </span>
      </div>
    </div>
  );
}

function WeekTimeline({
  days,
  today,
  allClasses,
}: {
  days: DaySchedule[];
  today: string;
  allClasses: ScheduleClass[];
}) {
  const starts = allClasses.map((c) => toMinutes(c.startTime));
  const ends = allClasses.map((c) => toMinutes(c.endTime));
  const firstHour = starts.length ? Math.floor(Math.min(...starts) / 60) : 8;
  const lastHour = ends.length ? Math.ceil(Math.max(...ends) / 60) : 22;
  const totalMinutes = Math.max((lastHour - firstHour) * 60, 60);
  const height = (totalMinutes / 60) * PX_PER_HOUR;
  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[880px]">
        <div className="shrink-0" style={{ width: GUTTER_WIDTH }}>
          <div className="h-9" />
          <div className="relative" style={{ height }}>
            {hours.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground/70"
                style={{ top: i * PX_PER_HOUR }}
              >
                {String(h).padStart(2, "0")}:00
              </span>
            ))}
          </div>
        </div>

        {days.map((day, i) => {
          const placed = placeClasses(day.classes);
          return (
            <div key={day.date} className="min-w-0 flex-1 border-l border-border/40 pl-0">
              <div
                className={cn(
                  "flex h-9 items-baseline justify-center gap-1.5 pb-2",
                  day.date === today && "text-primary"
                )}
              >
                <span className="text-sm font-semibold">{WEEKDAYS_SHORT[i]}</span>
                <span className={cn("text-sm", day.date === today ? "font-semibold" : "text-muted-foreground")}>
                  {day.dayOfMonth}
                </span>
              </div>
              <div className="relative" style={{ height }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    aria-hidden
                    className="absolute inset-x-0 border-t border-border/40"
                    style={{ top: (h - firstHour) * PX_PER_HOUR }}
                  />
                ))}
                {day.date === today && (
                  <NowLine firstHour={firstHour} />
                )}
                {placed.map((p) => (
                  <TimelineBlock key={p.item.eventId} placed={p} firstHour={firstHour} />
                ))}
                {placed.length === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/40">
                    занятий нет
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NowLine({ firstHour }: { firstHour: number }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const top = ((nowMin - firstHour * 60) / 60) * PX_PER_HOUR;
  if (top < 0) return null;
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 z-10 border-t-2 border-primary/60"
      style={{ top }}
    >
      <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-primary/80" />
    </div>
  );
}

function TimelineBlock({ placed, firstHour }: { placed: PlacedClass; firstHour: number }) {
  const { item, start, end, lane, lanes } = placed;
  const top = ((start - firstHour * 60) / 60) * PX_PER_HOUR;
  const rawHeight = ((end - start) / 60) * PX_PER_HOUR;
  const height = Math.max(rawHeight - 2, 20);

  if (item.kind === "busy") {
    return (
      <div
        aria-hidden
        className="absolute rounded-md border border-border/60"
        style={{
          top,
          height,
          left: `calc(${(lane / lanes) * 100}% + 2px)`,
          width: `calc(${100 / lanes}% - 4px)`,
          backgroundImage: BUSY_STRIPES,
        }}
      />
    );
  }

  const spots = shortSpots(item.spotsLeft);
  const dotColor = safeColor(item.directionColor);
  const full = item.spotsLeft === 0;

  return (
    <div
      className={cn(
        "absolute overflow-hidden rounded-md border bg-card px-1.5 py-1",
        full && "opacity-70"
      )}
      style={{
        top,
        height,
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
      }}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-[11px] font-semibold tabular-nums leading-none">
          {item.startTime}
        </span>
        {spots && (
          <span
            className={cn(
              "text-[10px] leading-none",
              item.spotsLeft === 0 ? "text-muted-foreground" : "text-primary"
            )}
          >
            {spots}
          </span>
        )}
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-tight">{item.groupName}</p>
      <div className="mt-auto flex items-center gap-1 pt-0.5">
        {dotColor && (
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        )}
        {item.teacher && (
          <span className="truncate text-[10px] leading-none text-muted-foreground">
            {item.teacher}
          </span>
        )}
      </div>
    </div>
  );
}

function MobileClassRow({ item }: { item: ScheduleClass }) {
  const spots = spotsLabel(item.spotsLeft);
  const dotColor = safeColor(item.directionColor);

  return (
    <li className="flex gap-3">
      <span className="w-14 shrink-0 pt-3 text-right text-xs font-semibold tabular-nums text-muted-foreground">
        {item.startTime}
      </span>
      <div className="min-w-0 flex-1 rounded-xl border bg-card p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">{item.groupName}</h3>
          <span className={cn("shrink-0 text-xs font-medium", spots.className)}>{spots.text}</span>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {[item.teacher, item.room].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {dotColor && (
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span className="truncate text-xs text-muted-foreground">{item.direction}</span>
        </div>
      </div>
    </li>
  );
}

function BusyRow({ item }: { item: ScheduleClass }) {
  return (
    <li className="flex gap-3" aria-hidden>
      <span className="w-14 shrink-0 pt-3 text-right text-xs font-medium tabular-nums text-muted-foreground/70">
        {item.startTime}
      </span>
      <div
        className="h-9 flex-1 self-center rounded-lg border border-border/50"
        style={{ backgroundImage: BUSY_STRIPES }}
      />
    </li>
  );
}
