import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({ getPost: vi.fn() }));
vi.mock("@/modules/cms", () => ({
  getBlogPostBySlug: mocks.getPost,
  NotionBody: ({ recordMap }: { recordMap: { body: string } }) => createElement("div", null, recordMap.body),
}));
vi.mock("@/components/brand/ripita-mark", () => ({ RipitaMark: () => null }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); },
  redirect: () => { throw new Error("Unexpected article redirect"); },
}));
import BlogPostPage, { generateMetadata } from "./page";

const post = {
  id: "article-id", slug: "example-article", title: "Contoh Pemikiran", excerpt: "Ringkasan artikel",
  author: "Puspita", category: "Catatan", date: "16 Okt 2026", dateISO: "2026-10-16T03:00:00.000Z",
  image: "", recordMap: { body: "Isi lengkap dari Notion, bukan hanya ringkasan." },
};
const props = { params: Promise.resolve({ slug: post.slug }) };
beforeEach(() => { vi.resetAllMocks(); mocks.getPost.mockResolvedValue(post); });

describe("article detail route", () => {
  it("opens the requested article and renders its body instead of redirecting to the archive", async () => {
    const html = renderToStaticMarkup(await BlogPostPage(props));
    expect(mocks.getPost).toHaveBeenCalledWith(post.slug);
    expect(html).toContain(post.title);
    expect(html).toContain(post.recordMap.body);
    expect(html).toContain('href="/pemikiran"');
    expect(html).toContain(`dateTime="${post.dateISO}"`);
  });
  it("uses article-specific metadata and a machine-readable publication date", async () => {
    expect(await generateMetadata(props)).toMatchObject({
      title: `${post.title} — PUSPITA × RIPITA`,
      openGraph: { type: "article", publishedTime: post.dateISO },
    });
  });
  it("returns not found for a missing article", async () => {
    mocks.getPost.mockResolvedValue(null);
    await expect(BlogPostPage(props)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
  it("preserves CMS failures for the error boundary instead of redirecting or showing empty content", async () => {
    mocks.getPost.mockRejectedValue(new Error("Artikel belum dapat dimuat"));
    await expect(BlogPostPage(props)).rejects.toThrow("Artikel belum dapat dimuat");
  });
});
