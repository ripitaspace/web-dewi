import { NextRequest, NextResponse } from "next/server";
import { getStoredConnection } from "@/modules/booking/google";
import { decryptSecret } from "@/modules/booking/security";
import { syncBookingCalendar } from "@/modules/booking/sync";

export async function POST(request: NextRequest) {
  const connection = await getStoredConnection();
  if (!connection?.watchChannelId || !connection.watchResourceId || !connection.encryptedWatchToken) {
    return new NextResponse(null, { status: 404 });
  }
  const valid =
    request.headers.get("x-goog-channel-id") === connection.watchChannelId &&
    request.headers.get("x-goog-resource-id") === connection.watchResourceId &&
    request.headers.get("x-goog-channel-token") === decryptSecret(connection.encryptedWatchToken);
  if (!valid) return new NextResponse(null, { status: 403 });

  try {
    await syncBookingCalendar(false);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 503 });
  }
}
