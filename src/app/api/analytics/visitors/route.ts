export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UMAMI_API_ENDPOINT = "https://api.umami.is/v1";
const DEFAULT_WEBSITE_ID = "f6ba3346-085a-4deb-b34b-0ee40de870b8";

type UmamiStatsResponse = {
  visitors?: { value?: number } | number;
};

function getVisitorCount(stats: UmamiStatsResponse): number | null {
  const value = typeof stats.visitors === "number" ? stats.visitors : stats.visitors?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Returns Umami's unique-visitor total from the earliest available tracking data
 * through the current request time. The Umami API key never reaches the browser.
 */
export async function GET() {
  const apiKey = process.env.UMAMI_API_KEY;
  const websiteId = process.env.UMAMI_WEBSITE_ID || DEFAULT_WEBSITE_ID;
  const apiEndpoint = (process.env.UMAMI_API_ENDPOINT || UMAMI_API_ENDPOINT).replace(/\/$/, "");

  if (!apiKey) {
    return Response.json({ visitorCount: null }, { headers: { "cache-control": "public, s-maxage=300" } });
  }

  const params = new URLSearchParams({
    startAt: "0",
    endAt: String(Date.now()),
  });

  try {
    const response = await fetch(
      `${apiEndpoint}/websites/${encodeURIComponent(websiteId)}/stats?${params}`,
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) throw new Error("Umami analytics request failed");
    const visitorCount = getVisitorCount((await response.json()) as UmamiStatsResponse);

    return Response.json(
      { visitorCount },
      { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return Response.json({ visitorCount: null }, { headers: { "cache-control": "public, s-maxage=300" } });
  }
}
