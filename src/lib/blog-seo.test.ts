import { describe, expect, it } from "vitest";
import { getBlogSeoOverride } from "./blog-seo";

describe("blog SEO overrides", () => {
  it("targets the Chubb cancellation query with a bounded description and FAQ", () => {
    const seo = getBlogSeoOverride("Cancel-Chubb")!;
    expect(seo.title.toLowerCase()).toContain("batalkan asuransi chubb");
    expect(seo.description.length).toBeLessThanOrEqual(200);
    expect(seo.keywords).toContain("cara batalin asuransi chubb");
    expect(seo.faq.length).toBeGreaterThan(3);
    expect(getBlogSeoOverride("unknown")).toBeUndefined();
  });
});
