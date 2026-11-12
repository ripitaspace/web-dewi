import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CoretaxSeoContent } from "./coretax-seo-content";

describe("Coretax SEO content", () => {
  it("renders crawlable guidance, FAQ, and links to distinct related tools", () => {
    const html = renderToStaticMarkup(<CoretaxSeoContent />);
    expect(html).toContain("Dari Faktur Pajak PDF ke rekap Excel");
    expect(html).toContain("Apakah file ZIP didukung?");
    expect(html).toContain('href="/karya/tools/extension-download-faktur-otomatis"');
    expect(html).toContain('href="/karya/tools/download-faktur-laptop-kentang"');
    expect(html).toContain("Dokumen tetap di perangkat Anda");
  });
});
