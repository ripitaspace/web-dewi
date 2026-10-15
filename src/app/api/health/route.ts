export const dynamic = "force-dynamic";

// Reachability only, intentionally independent of Notion/booking dependencies.
export function GET() {
  return Response.json({ ok: true, service: "puspitacore" }, {
    headers: { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" },
  });
}
