import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Tools Pajak", description: "Koleksi tools pajak PuspitaCore untuk mengurangi pekerjaan berulang dan menjaga dokumen tetap rapi.", path: "/karya/pajak" });

export default function PajakPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="page-hero tool-category-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><span>Pajak</span></nav>
            <span className="eyebrow text-rempah">Karya · Pajak</span>
            <h1 className="display-lg">Pajak, dibaca sebagai alur kerja.</h1>
            <p className="lead muted">Koleksi mini tools untuk mengurangi pekerjaan berulang dan menjaga data dokumen pajak tetap rapi.</p>
          </div>
        </section>
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <Link href="/karya/pajak/coretax" className="tax-tool-card card card-hover">
              <div className="tax-tool-icon" aria-hidden="true">
                <img src="/images/artworks/coretax-ripita-icon.png" alt="" />
              </div>
              <div><span className="topic-pill">CORETAX · MINI TOOL</span><h2>Invoice Scraper</h2><p>Ubah batch Faktur Pajak PDF menjadi data barang yang bisa diperiksa dan diekspor ke Excel.</p></div>
              <span className="btn primary">Buka Coretax →</span>
            </Link>
            <Link href="/karya/pajak/invoice-retur-rahasia" className="tax-tool-card card card-hover">
              <div className="tax-tool-icon" aria-hidden="true">
                <img src="/images/artworks/invoice-retur-rahasia.png" alt="" />
              </div>
              <div><span className="topic-pill">INVOICE RETUR · MINI TOOL</span><h2>Invoice Retur Rahasia</h2><p>Ruang sederhana untuk membantu Mbak Lulik membuat invoice retur dengan lebih mudah.</p></div>
              <span className="btn primary">Lihat tool →</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
