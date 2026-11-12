import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getBlogPosts: vi.fn() }));
vi.mock("@/modules/cms", () => ({ getBlogPosts: mocks.getBlogPosts }));
import sitemap from "./sitemap";

describe("sitemap metadata route", () => {
  it("includes available public tax tools and excludes maintenance routes", async () => {
    mocks.getBlogPosts.mockResolvedValue([{ slug: "catatan-pajak", dateISO: "2026-11-10T00:00:00.000Z" }]);
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://www.puspitacore.com/karya/pajak/coretax");
    expect(urls).toContain("https://www.puspitacore.com/karya/tools/pph-21-calculator");
    expect(urls).toContain("https://www.puspitacore.com/karya/tools/quotation-generator");
    expect(urls).toContain("https://www.puspitacore.com/karya/tools/kalkulator-bea-cukai");
    expect(urls).toContain("https://www.puspitacore.com/karya/tools/compile-dokumen");
    expect(urls).toContain("https://www.puspitacore.com/karya/tools/makalah-generator");
    expect(urls).toContain("https://www.puspitacore.com/blog/catatan-pajak");
    expect(urls).not.toContain("https://www.puspitacore.com/karya/pajak/invoice-retur-rahasia");
    expect(urls).not.toContain("https://www.puspitacore.com/karya/tools/invoice-generator");
    expect(new Set(urls).size).toBe(urls.length);
  });
});
