import { BOOKING_RULES, normalizeTimeZone } from "./config";
import type { AvailabilityDay, TimeRange } from "./types";

const MINUTE_MS = 60_000;

export function rangesOverlap(left: TimeRange, right: TimeRange): boolean {
  return left.start < right.end && left.end > right.start;
}

function roundUp(date: Date, stepMinutes: number): Date {
  const stepMs = stepMinutes * MINUTE_MS;
  return new Date(Math.ceil(date.getTime() / stepMs) * stepMs);
}

export function generateAvailableSlots(input: {
  availability: TimeRange[];
  busy: TimeRange[];
  reservations?: TimeRange[];
  durationMinutes: number;
  now?: Date;
  minimumNoticeHours?: number;
  maximumAdvanceDays?: number;
  bufferMinutes?: number;
  stepMinutes?: number;
}): TimeRange[] {
  const now = input.now ?? new Date();
  const minimum = new Date(
    now.getTime() +
      (input.minimumNoticeHours ?? BOOKING_RULES.minimumNoticeHours) * 60 * MINUTE_MS,
  );
  const maximum = new Date(
    now.getTime() +
      (input.maximumAdvanceDays ?? BOOKING_RULES.maximumAdvanceDays) * 24 * 60 * MINUTE_MS,
  );
  const bufferMs = (input.bufferMinutes ?? BOOKING_RULES.bufferMinutes) * MINUTE_MS;
  const stepMinutes = input.stepMinutes ?? BOOKING_RULES.stepMinutes;
  const durationMs = input.durationMinutes * MINUTE_MS;
  const unavailable = [...input.busy, ...(input.reservations ?? [])];
  const unique = new Map<string, TimeRange>();

  for (const openBlock of input.availability) {
    let start = roundUp(
      new Date(Math.max(openBlock.start.getTime() + bufferMs, minimum.getTime())),
      stepMinutes,
    );

    while (start < openBlock.end && start < maximum) {
      const end = new Date(start.getTime() + durationMs);
      const blocked = {
        start: new Date(start.getTime() - bufferMs),
        end: new Date(end.getTime() + bufferMs),
      };

      if (
        end <= maximum &&
        blocked.start >= openBlock.start &&
        blocked.end <= openBlock.end &&
        !unavailable.some((range) => rangesOverlap(blocked, range))
      ) {
        unique.set(start.toISOString(), { start: new Date(start), end });
      }

      start = new Date(start.getTime() + stepMinutes * MINUTE_MS);
    }
  }

  return [...unique.values()].sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function dateKey(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function groupSlotsByDate(slots: TimeRange[], timeZone: string): AvailabilityDay[] {
  const groups = new Map<string, AvailabilityDay["slots"]>();
  for (const slot of slots) {
    const key = dateKey(slot.start, timeZone);
    const current = groups.get(key) ?? [];
    current.push({ startUtc: slot.start.toISOString(), endUtc: slot.end.toISOString() });
    groups.set(key, current);
  }
  return [...groups.entries()].map(([date, groupedSlots]) => ({ date, slots: groupedSlots }));
}
