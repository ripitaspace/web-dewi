import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), retrieve: vi.fn(), getPage: vi.fn() }));
vi.mock("../core/client", () => ({ notion: { dataSources: { query: mocks.query }, pages: { retrieve: mocks.retrieve } }, notionX: { getPage: mocks.getPage } }));
vi.mock("../core/config", () => ({ CMS_CONFIG: { BLOG_DATABASE_ID: "test-source" } }));
import { getBlogPosts, getBlogPostBySlug, mapNotionPageToBlogPost } from "./blog.service";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.query.mockResolvedValue({ results: [] });
});
afterEach(() => vi.restoreAllMocks());
describe("blog dates", () => {
  function page(published: string | null, created = "2026-08-31T10:00:00Z") {
    return { id: "article", created_time: created, properties: {
      "Published Date": { type: "date", date: published ? { start: published } : null },
    } } as unknown as PageObjectResponse;
  }

  it("preserves the publication instant separately from the display date", () => {
    const result = mapNotionPageToBlogPost(page("2026-10-16T10:01:00+07:00"));
    expect(result.dateISO).toBe("2026-10-16T03:01:00.000Z");
    expect(result.date).toContain("16 Okt 2026");
  });
  it.each([null, "invalid"])("falls back to creation for missing or invalid publication dates: %s", published => {
    const result = mapNotionPageToBlogPost(page(published));
    expect(result.dateISO).toBe("2026-08-31T10:00:00.000Z");
    expect(result.date).toContain("31 Agt 2026");
  });
  it("returns no date when both sources are invalid", () => {
    const result = mapNotionPageToBlogPost(page("invalid", "invalid"));
    expect(result.dateISO).toBeNull();
    expect(result.date).toBe("");
  });
});
describe("CMS state semantics", () => {
  it("returns empty only when the query succeeds with no results", async () => {
    expect(await getBlogPosts()).toEqual([]);
  });
  it("propagates list failures to the error boundary instead of empty", async () => {
    mocks.query.mockRejectedValue(new Error("upstream failed"));
    await expect(getBlogPosts()).rejects.toThrow("Artikel belum dapat dimuat");
  });
  it("returns not found for a genuinely missing slug", async () => {
    expect(await getBlogPostBySlug("missing-article")).toBeNull();
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it("does not turn an upstream outage into 404", async () => {
    mocks.query.mockRejectedValue(new Error("upstream failed"));
    await expect(getBlogPostBySlug("article")).rejects.toThrow("Artikel belum dapat dimuat");
  });
  it("distinguishes missing UUIDs from failed UUID lookups", async () => {
    const id = "12345678-1234-1234-1234-123456789abc";
    mocks.retrieve.mockRejectedValue({ code: "object_not_found" });
    expect(await getBlogPostBySlug(id)).toBeNull();
    mocks.retrieve.mockRejectedValue({ code: "service_unavailable" });
    await expect(getBlogPostBySlug(id)).rejects.toThrow("Artikel belum dapat dimuat");
  });
});
