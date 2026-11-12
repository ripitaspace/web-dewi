import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { InvoiceExtensionInfo } from "@/components/tools/invoice-extension-info";
import { CompileDocumentClient } from "@/components/tools/compile-document-client";
import { MakalahGeneratorClient } from "@/components/tools/makalah-generator-client";
import { QuotationGeneratorClient } from "@/components/tools/quotation-generator-client";
import { BeaCukaiCalculatorClient } from "@/components/tools/bea-cukai-calculator-client";
import { Pph21PayrollStudio } from "@/components/tools/pph21-payroll-studio";
import { MINI_TOOLS } from "@/lib/mini-tools";
import { createPageMetadata } from "@/lib/seo";
import { getTaxToolSeo, hasTaxToolSeo, TaxToolSeo } from "@/components/seo/tax-tool-seo";
import { getKaryaCardSeo } from "@/lib/karya-card-seo";
import { KaryaToolSeo } from "@/components/seo/karya-tool-seo";

interface MiniToolPageProps {
  params: Promise<{ slug: string }>;
}

function getTool(slug: string) {
  return MINI_TOOLS.find((tool) => tool.href === `/karya/tools/${slug}`);
}

export async function generateMetadata({ params }: MiniToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  const taxToolSeo = tool && hasTaxToolSeo(slug) ? getTaxToolSeo(slug) : undefined;
  const cardSeo = tool ? getKaryaCardSeo(tool.href) : undefined;

  return tool
    ? createPageMetadata({
      title: taxToolSeo?.metadataTitle || taxToolSeo?.title || cardSeo?.title || tool.title,
      description: taxToolSeo?.description || cardSeo?.description || tool.description,
      path: tool.href,
      robots: tool.status === "maintenance" ? { index: false, follow: true } : undefined,
    })
    : { title: "Mini Tool Tidak Ditemukan" };
}

export default async function MiniToolPage({ params }: MiniToolPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  const taxToolSeo = tool && hasTaxToolSeo(slug) ? getTaxToolSeo(slug) : undefined;
  const cardSeo = tool ? getKaryaCardSeo(tool.href) : undefined;

  if (!tool) notFound();

  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className={`page-hero tool-category-hero${slug === "pph-21-calculator" ? " payroll-hero" : ""}`}>
          <div className={slug === "pph-21-calculator" ? "payroll-container" : "container"}>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/karya">Karya</Link><span>/</span><span>{tool.category}</span>
            </nav>
            <span className="eyebrow text-rempah">MINI TOOL · {tool.category}</span>
            <h1 className="display-lg">{taxToolSeo?.heading || taxToolSeo?.title || cardSeo?.h1 || tool.title}</h1>
            <p className="lead muted">{taxToolSeo?.description || cardSeo?.description || tool.description}</p>
          </div>
        </section>

        <section className={`section-tight${slug === "pph-21-calculator" ? " payroll-workspace" : ""}`} style={{ borderTop: "1px solid var(--line)" }}>
          <div className={slug === "pph-21-calculator" ? "payroll-container" : "container"}>
            {slug === "kalkulator-bea-cukai" ? <BeaCukaiCalculatorClient /> : slug === "pph-21-calculator" ? <Pph21PayrollStudio /> : slug === "extension-download-faktur-otomatis" || slug === "download-faktur-laptop-kentang" || slug === "download-bukti-potong-otomatis" ? <InvoiceExtensionInfo laptopKentang={slug === "download-faktur-laptop-kentang"} kind={slug === "download-bukti-potong-otomatis" ? "withholding-slip" : "invoice"} /> : slug === "compile-dokumen" ? <CompileDocumentClient /> : slug === "makalah-generator" ? <MakalahGeneratorClient /> : slug === "quotation-generator" ? <QuotationGeneratorClient /> : (
            <div className="tool-placeholder card">
              <span className="tool-placeholder__icon" aria-hidden="true">{tool.icon}</span>
              <div>
                <span className="topic-pill">UNDER MAINTENANCE</span>
                <h2>Ruang parser sedang disiapkan.</h2>
                <p>Halaman kerja untuk {tool.title} akan tersedia di sini. Nantinya data tetap diproses langsung di perangkatmu, tanpa login atau penyimpanan transaksi.</p>
                <Link href="/karya" className="btn primary">← Kembali ke Karya</Link>
              </div>
            </div>
            )}
          </div>
        </section>
        {tool.status === "available" && hasTaxToolSeo(slug) ? <TaxToolSeo toolKey={slug} /> : null}
        {tool.status === "available" && !hasTaxToolSeo(slug) && cardSeo ? <KaryaToolSeo seo={cardSeo} /> : null}
      </main>
      <SiteFooter />
    </>
  );
}
