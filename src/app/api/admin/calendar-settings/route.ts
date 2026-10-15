import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminEmail } from "@/modules/booking/admin-auth";
import { DEFAULT_OWNER_TIME_ZONE, normalizeTimeZone } from "@/modules/booking/config";
import {
  getCalendarContext,
  getStoredConnection,
  listCalendars,
  startCalendarWatch,
} from "@/modules/booking/google";
import { jsonError } from "@/modules/booking/http";
import { syncBookingCalendar } from "@/modules/booking/sync";
import { BookingApiError } from "@/modules/booking/types";

async function requireConnection() {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) throw new BookingApiError("UNAUTHORIZED", "Login admin diperlukan.", 401);
  const connection = await getStoredConnection(adminEmail);
  if (!connection) throw new BookingApiError("CALENDAR_DISCONNECTED", "Calendar belum tersambung.", 404);
  return connection;
}

export async function GET() {
  try {
    const connection = await requireConnection();
    const [calendars, settings] = await Promise.all([
      listCalendars(connection),
      db.bookingSettings.findUnique({ where: { connectionId: connection.id } }),
    ]);
    return NextResponse.json({
      connected: true,
      adminEmail: connection.adminEmail,
      calendars,
      settings: settings
        ? {
            availabilityCalendarId: settings.availabilityCalendarId,
            bookingCalendarId: settings.bookingCalendarId,
            busyCalendarIds: JSON.parse(settings.busyCalendarIds) as string[],
            ownerTimeZone: settings.ownerTimeZone,
          }
        : null,
      watch: {
        active: Boolean(connection.watchChannelId),
        expiresAt: connection.watchExpiresAt?.toISOString() || null,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const connection = await requireConnection();
    const body = (await request.json()) as {
      availabilityCalendarId?: string;
      bookingCalendarId?: string;
      busyCalendarIds?: string[];
      ownerTimeZone?: string;
    };
    const calendars = await listCalendars(connection);
    const byId = new Map(calendars.map((calendar) => [calendar.id, calendar]));
    const availabilityCalendarId = body.availabilityCalendarId?.trim() || "";
    const bookingCalendarId = body.bookingCalendarId?.trim() || "";
    if (!byId.has(availabilityCalendarId) || !byId.has(bookingCalendarId)) {
      throw new BookingApiError("VALIDATION_ERROR", "Pilih kalender yang dapat diakses.");
    }
    const bookingCalendar = byId.get(bookingCalendarId)!;
    if (!['owner', 'writer'].includes(bookingCalendar.accessRole)) {
      throw new BookingApiError("VALIDATION_ERROR", "Kalender tujuan harus memiliki akses tulis.");
    }
    const busyCalendarIds = [...new Set([...(body.busyCalendarIds || []), bookingCalendarId])]
      .filter((id) => byId.has(id) && id !== availabilityCalendarId)
      .slice(0, 50);
    await db.bookingSettings.upsert({
      where: { connectionId: connection.id },
      create: {
        connectionId: connection.id,
        availabilityCalendarId,
        bookingCalendarId,
        busyCalendarIds: JSON.stringify(busyCalendarIds),
        ownerTimeZone: normalizeTimeZone(body.ownerTimeZone || DEFAULT_OWNER_TIME_ZONE),
      },
      update: {
        availabilityCalendarId,
        bookingCalendarId,
        busyCalendarIds: JSON.stringify(busyCalendarIds),
        ownerTimeZone: normalizeTimeZone(body.ownerTimeZone || DEFAULT_OWNER_TIME_ZONE),
      },
    });
    await db.calendarConnection.update({
      where: { id: connection.id },
      data: { syncToken: null },
    });
    const context = await getCalendarContext();
    await syncBookingCalendar(true);
    await startCalendarWatch(context);
    return NextResponse.json({ saved: true });
  } catch (error) {
    return jsonError(error);
  }
}
