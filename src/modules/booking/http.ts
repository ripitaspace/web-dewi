import { NextResponse } from "next/server";
import { BookingApiError } from "./types";

export function jsonError(error: unknown): NextResponse {
  if (error instanceof BookingApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  console.error("[Booking] Unexpected server error", error instanceof Error ? error.message : error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Terjadi gangguan. Silakan coba lagi." } },
    { status: 500 },
  );
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
