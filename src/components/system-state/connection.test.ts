import { afterEach, describe, expect, it, vi } from "vitest";
import { probeConnection } from "./connection";

afterEach(() => vi.unstubAllGlobals());
const probe = () => probeConnection(new AbortController().signal);
function setup(online = true) {
  vi.stubGlobal("navigator", { onLine: online });
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
describe("verified connection status", () => {
  it("does not claim recovery just because navigator is online", async () => {
    setup().mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await probe()).toBe("unreachable");
  });
  it("distinguishes an HTTP server failure from offline", async () => {
    setup().mockResolvedValue(new Response(null, { status: 503 }));
    expect(await probe()).toBe("server-error");
  });
  it("requires the origin's service marker, not captive-portal success", async () => {
    setup().mockResolvedValue(Response.json({ ok: true }));
    expect(await probe()).toBe("unreachable");
  });
  it("accepts only a successful uncached health probe", async () => {
    const fetcher = setup().mockResolvedValue(Response.json({ ok: true, service: "puspitacore" }));
    expect(await probe()).toBe("online");
    expect(fetcher).toHaveBeenCalledWith("/api/health", expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }));
  });
  it("avoids a request when the browser explicitly reports offline", async () => {
    const fetcher = setup(false);
    expect(await probe()).toBe("offline");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("handles timeout aborts without falsely marking the connection online", async () => {
    setup().mockRejectedValue(new DOMException("Aborted", "AbortError"));
    expect(await probe()).toBe("unreachable");
  });
});
