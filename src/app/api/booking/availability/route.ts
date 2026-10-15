import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/modules/booking/availability";
import { jsonError } from "@/modules/booking/http";
import { BookingApiError } from "@/modules/booking/types";

function dateBoundary(value: string | null, endOfDay: boolean): Date | undefined {
  if (!value) return undefined;
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
    : new Date(value);
  if (!Number.isFinite(candidate.getTime())) {
    throw new BookingApiError("VALIDATION_ERROR", "Rentang tanggal ketersediaan tidak valid.");
  }
  return candidate;
}

export async function GET(request: NextRequest) {
  try {
    const serviceId = request.nextUrl.searchParams.get("serviceId") || "";
    const timeZone = request.nextUrl.searchParams.get("timeZone") || undefined;
    const rangeStart = dateBoundary(request.nextUrl.searchParams.get("from"), false);
    const rangeEnd = dateBoundary(request.nextUrl.searchParams.get("to"), true);
    const manageToken = request.headers.get("x-booking-manage-token") || "";
    let excludedBookingId: string | undefined;
    if (manageToken) {
      const { getManagedBooking } = await import("@/modules/booking/booking-service");
      excludedBookingId = (await getManagedBooking(manageToken)).booking.id;
    }
    const availability = await getAvailability({
      serviceId,
      timeZone,
      excludedBookingId,
      rangeStart,
      rangeEnd,
    });
    return NextResponse.json(
      { timeZone: availability.timeZone, dates: availability.dates, source: availability.source },
      { headers: { "cache-control": manageToken ? "private, no-store" : "public, s-maxage=30, stale-while-revalidate=30" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
