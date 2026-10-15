import { NextRequest, NextResponse } from "next/server";
import {
  cancelBooking,
  getManagedBooking,
  rescheduleBooking,
} from "@/modules/booking/booking-service";
import { jsonError } from "@/modules/booking/http";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    return NextResponse.json((await getManagedBooking(token)).public);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as { startUtc?: string; timeZone?: string };
    const result = await rescheduleBooking(token, body.startUtc || "", body.timeZone);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    await cancelBooking(token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}
