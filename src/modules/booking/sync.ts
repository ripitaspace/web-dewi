import { db } from "@/lib/db";
import { BOOKING_RULES } from "./config";
import {
  getCalendarContext,
  listGoogleBookingChanges,
  startCalendarWatch,
} from "./google";
import { BookingApiError } from "./types";

export async function syncBookingCalendar(forceFull = false): Promise<{
  processed: number;
  cancelled: number;
}> {
  const context = await getCalendarContext();
  const result = await listGoogleBookingChanges(
    context,
    forceFull ? null : context.connection.syncToken,
  );
  const seen = new Set<string>();
  let processed = 0;
  let cancelled = 0;
  const bufferMs = BOOKING_RULES.bufferMinutes * 60_000;

  for (const event of result.events) {
    const bookingId = event.extendedProperties?.private?.bookingId;
    if (!bookingId) continue;
    seen.add(bookingId);
    const existing = await db.booking.findUnique({ where: { id: bookingId } });
    if (!existing) continue;

    if (event.status === "cancelled" || !event.start?.dateTime || !event.end?.dateTime) {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", pendingExpiresAt: null, syncWarning: null },
      });
      cancelled += 1;
      continue;
    }

    const startAt = new Date(event.start.dateTime);
    const endAt = new Date(event.end.dateTime);
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) {
      continue;
    }
    const blockedStartAt = new Date(startAt.getTime() - bufferMs);
    const blockedEndAt = new Date(endAt.getTime() + bufferMs);
    const conflict = await db.booking.findFirst({
      where: {
        id: { not: bookingId },
        status: "CONFIRMED",
        blockedStartAt: { lt: blockedEndAt },
        blockedEndAt: { gt: blockedStartAt },
      },
      select: { id: true },
    });
    const meetUrl =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
      existing.meetUrl;
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        startAt,
        endAt,
        blockedStartAt,
        blockedEndAt,
        meetUrl,
        pendingExpiresAt: null,
        syncWarning: conflict
          ? "Jadwal ini bertumpuk dengan booking lain setelah diedit di Google Calendar."
          : null,
      },
    });
    processed += 1;
  }

  if (result.fullSync) {
    const active = await db.booking.findMany({
      where: { status: "CONFIRMED", googleEventId: { not: null }, endAt: { gt: new Date() } },
      select: { id: true },
    });
    const missing = active.filter((booking) => !seen.has(booking.id)).map((booking) => booking.id);
    if (missing.length) {
      const update = await db.booking.updateMany({
        where: { id: { in: missing } },
        data: { status: "CANCELLED", syncWarning: null },
      });
      cancelled += update.count;
    }
  }

  await db.calendarConnection.update({
    where: { id: context.connection.id },
    data: { syncToken: result.nextSyncToken },
  });
  return { processed, cancelled };
}

export async function maintainBookingSystem(): Promise<{
  cleaned: number;
  synced: number;
  cancelled: number;
  watchRenewed: boolean;
}> {
  const now = new Date();
  const cleanup = await db.booking.updateMany({
    where: { status: "PENDING", pendingExpiresAt: { lt: now } },
    data: { status: "FAILED", pendingExpiresAt: null },
  });
  await db.bookingAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  let context;
  try {
    context = await getCalendarContext();
  } catch (error) {
    if (error instanceof BookingApiError && error.code === "CALENDAR_DISCONNECTED") {
      return { cleaned: cleanup.count, synced: 0, cancelled: 0, watchRenewed: false };
    }
    throw error;
  }
  const sync = await syncBookingCalendar(false);
  const shouldRenew =
    !context.connection.watchExpiresAt ||
    context.connection.watchExpiresAt.getTime() < Date.now() + 48 * 60 * 60 * 1000;
  if (shouldRenew) {
    const refreshedContext = await getCalendarContext();
    await startCalendarWatch(refreshedContext);
  }
  return {
    cleaned: cleanup.count,
    synced: sync.processed,
    cancelled: sync.cancelled,
    watchRenewed: shouldRenew,
  };
}
