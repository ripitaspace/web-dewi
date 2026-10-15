import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  enforceRateLimit,
  validateCreateBooking,
  type CreateBookingInput,
} from "@/modules/booking/booking-service";
import { clientIp, jsonError } from "@/modules/booking/http";
import { verifyTurnstile } from "@/modules/booking/turnstile";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  let rateHashes: { ipHash: string; emailHash: string } | null = null;
  try {
    const body = (await request.json()) as CreateBookingInput & { turnstileToken?: string };
    const normalized = validateCreateBooking(body);
    const ip = clientIp(request);
    rateHashes = await enforceRateLimit(ip, normalized.email);
    await verifyTurnstile(body.turnstileToken || "", ip);
    const result = await createBooking(normalized);
    await db.bookingAttempt.create({ data: { ...rateHashes, outcome: "CONFIRMED" } });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (rateHashes) {
      await db.bookingAttempt
        .create({ data: { ...rateHashes, outcome: "FAILED" } })
        .catch(() => undefined);
    }
    return jsonError(error);
  }
}
