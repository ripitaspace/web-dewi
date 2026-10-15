import { NextResponse } from "next/server";
import { getAdminEmail } from "@/modules/booking/admin-auth";
import { createCalendar, getStoredConnection } from "@/modules/booking/google";
import { jsonError } from "@/modules/booking/http";
import { BookingApiError } from "@/modules/booking/types";

export async function POST() {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) throw new BookingApiError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const connection = await getStoredConnection(adminEmail);
    if (!connection) throw new BookingApiError("CALENDAR_DISCONNECTED", "Calendar belum tersambung.", 404);
    const [availability, booking] = await Promise.all([
      createCalendar(connection, "PUSPITA — Open for Booking"),
      createCalendar(connection, "PUSPITA — Bookings"),
    ]);
    return NextResponse.json({ availability, booking });
  } catch (error) {
    return jsonError(error);
  }
}
