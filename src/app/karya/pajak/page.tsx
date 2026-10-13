import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

export const metadata: Metadata = {
  title: "Pajak — Karya PUSPITA",
  description: "Mini tools pajak dari PUSPITA dan RIPITA.",
};

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
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
