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
