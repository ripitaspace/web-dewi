import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), retrieve: vi.fn(), getPage: vi.fn() }));
vi.mock("../core/client", () => ({ notion: { dataSources: { query: mocks.query }, pages: { retrieve: mocks.retrieve } }, notionX: { getPage: mocks.getPage } }));
vi.mock("../core/config", () => ({ CMS_CONFIG: { BLOG_DATABASE_ID: "test-source" } }));
import { getBlogPosts, getBlogPostBySlug } from "./blog.service";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.query.mockResolvedValue({ results: [] });
});
afterEach(() => vi.restoreAllMocks());
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
