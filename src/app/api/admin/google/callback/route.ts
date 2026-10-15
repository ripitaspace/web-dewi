import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OAUTH_FLOW_COOKIE, setAdminSession } from "@/modules/booking/admin-auth";
import { getPublicBaseUrl } from "@/modules/booking/config";
import { exchangeAuthorizationCode, getGoogleUser } from "@/modules/booking/google";
import { encryptSecret, verifySignedValue } from "@/modules/booking/security";

function adminRedirect(query: string): NextResponse {
  return NextResponse.redirect(`${getPublicBaseUrl()}/admin/calendar${query}`);
}

export async function GET(request: NextRequest) {
  const store = await cookies();
  const signedFlow = verifySignedValue(store.get(OAUTH_FLOW_COOKIE)?.value);
  store.delete(OAUTH_FLOW_COOKIE);
  if (!signedFlow) return adminRedirect("?error=oauth-expired");

  try {
    const flow = JSON.parse(signedFlow) as { state: string; verifier: string; expiresAt: number };
    const state = request.nextUrl.searchParams.get("state");
    const code = request.nextUrl.searchParams.get("code");
    if (!state || !code || state !== flow.state || flow.expiresAt <= Date.now()) {
      return adminRedirect("?error=oauth-invalid");
    }
    const token = await exchangeAuthorizationCode(code, flow.verifier);
    if (!token.access_token) return adminRedirect("?error=oauth-token");
    const profile = await getGoogleUser(token.access_token);
    const email = profile.email.trim().toLowerCase();
    if (email !== process.env.ADMIN_GOOGLE_EMAIL?.trim().toLowerCase()) {
      return adminRedirect("?error=account-not-allowed");
    }
    const existing = await db.calendarConnection.findUnique({ where: { adminEmail: email } });
    const refreshToken = token.refresh_token
      ? encryptSecret(token.refresh_token)
      : existing?.encryptedRefreshToken;
    if (!refreshToken) return adminRedirect("?error=refresh-token");

    await db.calendarConnection.upsert({
      where: { adminEmail: email },
      create: {
        adminEmail: email,
        encryptedRefreshToken: refreshToken,
        grantedScopes: token.scope || "",
      },
      update: {
        encryptedRefreshToken: refreshToken,
        grantedScopes: token.scope || existing?.grantedScopes || "",
      },
    });
    await setAdminSession(email);
    return adminRedirect("?connected=1");
  } catch {
    return adminRedirect("?error=oauth-failed");
  }
}
