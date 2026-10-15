import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { bookingEnvironmentReady, getPublicBaseUrl } from "@/modules/booking/config";
import { OAUTH_FLOW_COOKIE } from "@/modules/booking/admin-auth";
import { buildGoogleAuthorizationUrl } from "@/modules/booking/google";
import { randomToken, sha256Base64Url, signValue } from "@/modules/booking/security";

export async function GET() {
  if (!bookingEnvironmentReady()) {
    return NextResponse.redirect(
      new URL("/admin/calendar?error=missing-config", getPublicBaseUrl()),
    );
  }
  const state = randomToken(24);
  const verifier = randomToken(48);
  const flowCookie = signValue(
    JSON.stringify({ state, verifier, expiresAt: Date.now() + 10 * 60 * 1000 }),
  );
  const store = await cookies();
  store.set(OAUTH_FLOW_COOKIE, flowCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return NextResponse.redirect(buildGoogleAuthorizationUrl(state, sha256Base64Url(verifier)));
}
