import { listokRequest } from "@/lib/listok/client";

export interface ScheduleClass {
  eventId: number;
  date: string;
  startTime: string;
  endTime: string;
  groupName: string;
  direction: string;
  directionColor: string | null;
  teacher: string | null;
  room: string | null;
  maxLimit: number;
  spotsLeft: number | null;
  kind: "group" | "busy";
}

export interface DaySchedule {
  date: string;
  dayOfMonth: number;
  classes: ScheduleClass[];
}

export interface WeekSchedule {
  weekStart: string;
  days: DaySchedule[];
}

interface RawEvent {
  event_id: number;
  date: string;
  start_time: string;
  end_time: string;
  display_online: number;
  group_name: string;
  group_type_name: string;
  teacher_name: string | null;
  second_teacher_name: string | null;
  room_name: string | null;
  max_attendance_limit: number;
  places_left?: number | null;
  group?: {
    duration?: number | null;
    private_group?: number;
  } | null;
}

interface RawGroupType {
  group_type_id: number;
  name: string;
  color: string | null;
}

interface Paginated<T> {
  data?: T[];
  meta?: { pagination?: { total_pages?: number } };
}

interface CacheEntry {
  value: unknown;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && hit.expires > now) return hit.value as T;
  const value = await loader();
  cache.set(key, { value, expires: now + ttlMs });
  return value;
}

async function fetchAllPages<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
  const first = await listokRequest<Paginated<T>>(path, { params: { ...params, page: 1 } });
  const items: T[] = [...(first.data ?? [])];
  const totalPages = first.meta?.pagination?.total_pages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await listokRequest<Paginated<T>>(path, { params: { ...params, page } });
    items.push(...(next.data ?? []));
  }
  return items;
}

const EVENTS_TTL_MS = 120_000;
const DIRECTIONS_TTL_MS = 3_600_000;

async function getDirectionColors(): Promise<Map<string, string | null>> {
  const types = await cached("grouptypes", DIRECTIONS_TTL_MS, () =>
    fetchAllPages<RawGroupType>("/api/external/v2/grouptypes", {})
  );
  return new Map(types.map((t) => [t.name.trim(), t.color]));
}

const BUSY_DIRECTION_RE = /субаренд|аренд|индивидуальн|персональн/i;

function isBusySlot(direction: string, groupName: string): boolean {
  return BUSY_DIRECTION_RE.test(direction) || BUSY_DIRECTION_RE.test(groupName);
}

export async function getWeekSchedule(weekStart: string): Promise<WeekSchedule> {
  const from = weekStart;
  const to = addDays(weekStart, 6);

  const [rawEvents, colors] = await Promise.all([
    cached(`events:${from}:${to}`, EVENTS_TTL_MS, () =>
      listokRequest<Paginated<RawEvent>>("/api/external/v2/events", {
        params: { from, to, includes: "listings,queue" },
      }).then((r) => r.data ?? [])
    ),
    getDirectionColors(),
  ]);

  const byDate = new Map<string, ScheduleClass[]>();
  for (let i = 0; i < 7; i += 1) byDate.set(addDays(weekStart, i), []);

  for (const ev of rawEvents) {
    if (ev.display_online !== 1) continue;
    if (ev.group && (ev.group.private_group ?? 0) === 1) continue;

    const direction = (ev.group_type_name ?? "").trim();
    const groupName = (ev.group_name ?? "").trim();
    const maxLimit = Number(ev.max_attendance_limit ?? 0);

    if (isBusySlot(direction, groupName)) {
      const bucket = byDate.get(ev.date);
      if (bucket) {
        bucket.push({
          eventId: ev.event_id,
          date: ev.date,
          startTime: ev.start_time,
          endTime: ev.end_time,
          groupName: "",
          direction: "",
          directionColor: null,
          teacher: null,
          room: null,
          maxLimit: 0,
          spotsLeft: null,
          kind: "busy",
        });
      }
      continue;
    }

    const spotsLeft =
      maxLimit === 0
        ? null
        : typeof ev.places_left === "number"
          ? ev.places_left
          : null;

    const scheduleClass: ScheduleClass = {
      eventId: ev.event_id,
      date: ev.date,
      startTime: ev.start_time,
      endTime: ev.end_time,
      groupName,
      direction,
      directionColor: colors.get(direction) ?? null,
      teacher: ev.teacher_name?.trim() || null,
      room: ev.room_name?.trim() || null,
      maxLimit,
      spotsLeft,
      kind: "group",
    };

    const bucket = byDate.get(ev.date);
    if (bucket) bucket.push(scheduleClass);
  }

  const days: DaySchedule[] = [...byDate.entries()]
    .map(([date, classes]) => ({
      date,
      dayOfMonth: Number(date.slice(8, 10)),
      classes: classes.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { weekStart, days };
}

export function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const dow = d.getUTCDay();
  const shift = dow === 0 ? -6 : 1 - dow;
  return addDays(isoDate, shift);
}

export function todayMsk(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(new Date());
}

export function nowTimeMsk(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}
