import { db } from "@/lib/db";
import { SERVICES } from "@/lib/site-data";
import { BOOKING_RULES, normalizeTimeZone } from "./config";
import {
  getCalendarContext,
  listAvailabilityBlocks,
  queryBusyRanges,
  type CalendarContext,
} from "./google";
import { generateAvailableSlots, groupSlotsByDate } from "./slots";
import { localAvailabilityBlocks } from "./local-slots";
import { BookingApiError, type AvailabilityDay, type TimeRange } from "./types";

export type AvailabilitySource = "google" | "local";

export async function getAvailability(input: {
  serviceId: string;
  timeZone?: string;
  excludedBookingId?: string;
  context?: CalendarContext;
  now?: Date;
  rangeStart?: Date;
  rangeEnd?: Date;
}): Promise<{
  timeZone: string;
  dates: AvailabilityDay[];
  context: CalendarContext | null;
  source: AvailabilitySource;
}> {
  const service = SERVICES.find((item) => item.id === input.serviceId);
  if (!service) throw new BookingApiError("VALIDATION_ERROR", "Layanan tidak valid.");

  const now = input.now ?? new Date();
  const maximumRangeEnd = new Date(
    now.getTime() + (BOOKING_RULES.maximumAdvanceDays + 1) * 24 * 60 * 60 * 1000,
  );
  const rangeStart = new Date(Math.max(now.getTime(), input.rangeStart?.getTime() ?? now.getTime()));
  const rangeEnd = new Date(
    Math.min(maximumRangeEnd.getTime(), input.rangeEnd?.getTime() ?? maximumRangeEnd.getTime()),
  );
  if (rangeEnd <= rangeStart) {
    throw new BookingApiError("VALIDATION_ERROR", "Rentang tanggal ketersediaan tidak valid.");
  }
  let context = input.context ?? null;
  let source: AvailabilitySource = context ? "google" : "local";
  if (!context) {
    try {
      context = await getCalendarContext();
      source = "google";
    } catch (error) {
      if (!(error instanceof BookingApiError) || error.code !== "CALENDAR_DISCONNECTED") throw error;
    }
  }
  const excludedBooking = input.excludedBookingId
    ? await db.booking.findUnique({ where: { id: input.excludedBookingId } })
    : null;

  const [availability, busy, reservations] = await Promise.all([
    context
      ? listAvailabilityBlocks(context, rangeStart, rangeEnd)
      : Promise.resolve(localAvailabilityBlocks(rangeStart, rangeEnd)),
    context
      ? queryBusyRanges(context, rangeStart, rangeEnd, excludedBooking?.googleEventId ?? undefined)
      : Promise.resolve([]),
    db.booking.findMany({
      where: {
        id: input.excludedBookingId ? { not: input.excludedBookingId } : undefined,
        blockedStartAt: { lt: rangeEnd },
        blockedEndAt: { gt: rangeStart },
        OR: [
          { status: "CONFIRMED" },
          { status: "PENDING", pendingExpiresAt: { gt: now } },
        ],
      },
      select: { blockedStartAt: true, blockedEndAt: true },
    }),
  ]);

  const reservationRanges: TimeRange[] = reservations.map((booking) => ({
    start: booking.blockedStartAt,
    end: booking.blockedEndAt,
  }));
  const slots = generateAvailableSlots({
    availability,
    busy,
    reservations: reservationRanges,
    durationMinutes: service.durationMinutes,
    now,
  });
  const timeZone = normalizeTimeZone(input.timeZone);
  return { timeZone, dates: groupSlotsByDate(slots, timeZone), context, source };
}

export function findRequestedSlot(
  dates: AvailabilityDay[],
  start: Date,
): { start: Date; end: Date } | null {
  const iso = start.toISOString();
  for (const day of dates) {
    const slot = day.slots.find((item) => item.startUtc === iso);
    if (slot) return { start: new Date(slot.startUtc), end: new Date(slot.endUtc) };
  }
  return null;
}
