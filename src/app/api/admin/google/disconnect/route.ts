import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearAdminSession, getAdminEmail } from "@/modules/booking/admin-auth";
import { getStoredConnection, revokeGoogleConnection } from "@/modules/booking/google";
import { jsonError } from "@/modules/booking/http";
import { BookingApiError } from "@/modules/booking/types";

export async function POST() {
  try {
    const adminEmail = await getAdminEmail();
    if (!adminEmail) throw new BookingApiError("UNAUTHORIZED", "Login admin diperlukan.", 401);
    const connection = await getStoredConnection(adminEmail);
    if (connection) {
      await revokeGoogleConnection(connection);
      await db.calendarConnection.delete({ where: { id: connection.id } });
    }
    await clearAdminSession();
    return NextResponse.json({ disconnected: true });
  } catch (error) {
    return jsonError(error);
  }
}
