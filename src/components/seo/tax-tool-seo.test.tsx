import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getTaxToolSeo, TaxToolSeo } from "./tax-tool-seo";

describe("Coretax download page SEO content", () => {
  it("keeps unique search intent and self paths for standard and Laptop Kentang modes", () => {
    const standard = getTaxToolSeo("extension-download-faktur-otomatis");
    const laptop = getTaxToolSeo("download-faktur-laptop-kentang");

    expect(standard.title).toBe("Download Faktur Pajak Coretax Otomatis");
    expect(laptop.title).toBe("Download Faktur Coretax untuk Laptop Lemot");
    expect(laptop.heading).toBe("Download Faktur Coretax di Laptop Lemot");
    expect(standard.path).not.toBe(laptop.path);
    expect(standard.description).not.toBe(laptop.description);
  });

  it("renders crawlable cross-links without unsupported performance claims", () => {
    const standardHtml = renderToStaticMarkup(<TaxToolSeo toolKey="extension-download-faktur-otomatis" />);
    const laptopHtml = renderToStaticMarkup(<TaxToolSeo toolKey="download-faktur-laptop-kentang" />);

    expect(standardHtml).toContain('href="/karya/tools/download-faktur-laptop-kentang"');
    expect(standardHtml).toContain("Laptop terasa lambat saat membuka Coretax?");
    expect(laptopHtml).toContain('href="/karya/tools/extension-download-faktur-otomatis"');
    expect(laptopHtml).toContain("Menggunakan PC dengan performa normal?");
    expect(laptopHtml).not.toMatch(/lebih cepat|menghemat RAM|lebih stabil/i);
  });
});
