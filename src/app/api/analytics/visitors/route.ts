import { createSign } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GA4_REPORT_URL = "https://analyticsdata.googleapis.com/v1beta/properties";

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function createServiceAccountJwt(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = [
    encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    encodeBase64Url(JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })),
  ].join(".");

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  return `${unsignedToken}.${signer.sign(privateKey).toString("base64url")}`;
}

async function getAccessToken(email: string, privateKey: string) {
  const assertion = createServiceAccountJwt(email, privateKey.replace(/\\n/g, "\n"));
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Google OAuth token request failed");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google OAuth returned no access token");
  return data.access_token;
}

export async function GET() {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const serviceAccountEmail = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey = process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!propertyId || !serviceAccountEmail || !serviceAccountPrivateKey) {
    return Response.json({ visitorCount: null }, { headers: { "cache-control": "public, s-maxage=300" } });
  }

  try {
    const accessToken = await getAccessToken(serviceAccountEmail, serviceAccountPrivateKey);
    const reportResponse = await fetch(`${GA4_REPORT_URL}/${encodeURIComponent(propertyId)}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
        metrics: [{ name: "totalUsers" }],
      }),
      cache: "no-store",
    });

    if (!reportResponse.ok) throw new Error("Google Analytics report request failed");
    const report = (await reportResponse.json()) as {
      rows?: Array<{ metricValues?: Array<{ value?: string }> }>;
    };
    const visitorCount = Number(report.rows?.[0]?.metricValues?.[0]?.value);

    return Response.json(
      { visitorCount: Number.isFinite(visitorCount) ? visitorCount : null },
      { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return Response.json({ visitorCount: null }, { headers: { "cache-control": "public, s-maxage=300" } });
  }
}
