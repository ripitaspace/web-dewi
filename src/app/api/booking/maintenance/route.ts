import { NextRequest, NextResponse } from "next/server";
import { maintainBookingSystem } from "@/modules/booking/sync";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await maintainBookingSystem());
  } catch {
    return NextResponse.json({ error: "maintenance_failed" }, { status: 503 });
  }
}
