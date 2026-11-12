import { describe, expect, it } from "vitest";
import { absoluteUrl, createPageMetadata } from "./seo";

describe("SEO metadata helpers", () => {
  it("uses the production origin for canonical URLs", () => {
    expect(absoluteUrl("/karya/pajak")).toBe("https://www.puspitacore.com/karya/pajak");
  });

  it("provides canonical and social metadata for public pages", () => {
    expect(createPageMetadata({ title: "Coretax", description: "Ekstrak faktur", path: "/karya/pajak/coretax" })).toMatchObject({
      title: "Coretax",
      alternates: { canonical: "https://www.puspitacore.com/karya/pajak/coretax" },
      openGraph: { type: "website", url: "https://www.puspitacore.com/karya/pajak/coretax" },
      twitter: { card: "summary_large_image" },
    });
  });
});

describe("article description fallback", () => {
  it("builds a clipped description from the first Notion text blocks", async () => {
    const { descriptionFromRecordMap, absoluteImageUrl } = await import("./seo");
    const block = (text: string) => ({ value: { value: { type: "text", properties: { title: [[text]] } } } });
    const result = descriptionFromRecordMap({ block: { a: block("Langkah pertama pembatalan."), b: block("x ".repeat(200)) } });
    expect(result.startsWith("Langkah pertama pembatalan.")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(descriptionFromRecordMap(null)).toBe("");
    expect(absoluteImageUrl("/api/notion-image?url=a")).toBe("https://www.puspitacore.com/api/notion-image?url=a");
  });
});
