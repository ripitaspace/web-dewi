import type { TimeRange } from "./types";

const LOCAL_TIME_ZONE = "Asia/Jakarta";

function jakartaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LOCAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

/** Default local schedule: Monday–Friday, 09:00–17:00 WIB. */
export function localAvailabilityBlocks(rangeStart: Date, rangeEnd: Date): TimeRange[] {
  const blocks: TimeRange[] = [];
  const seen = new Set<string>();
  const cursor = new Date(rangeStart.getTime() - 24 * 60 * 60 * 1000);
  const limit = new Date(rangeEnd.getTime() + 24 * 60 * 60 * 1000);

  while (cursor <= limit) {
    const date = jakartaDateKey(cursor);
    if (!seen.has(date)) {
      seen.add(date);
      const weekday = new Date(`${date}T12:00:00+07:00`).getDay();
      if (weekday >= 1 && weekday <= 5) {
        const start = new Date(`${date}T09:00:00+07:00`);
        const end = new Date(`${date}T17:00:00+07:00`);
        if (end > rangeStart && start < rangeEnd) blocks.push({ start, end });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return blocks;
}
