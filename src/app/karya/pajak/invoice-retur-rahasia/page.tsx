import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { CoretaxEmbed } from "@/components/pages/coretax-embed";

export const metadata: Metadata = {
  title: "Invoice Retur Rahasia — Karya PUSPITA",
  description: "Ruang persiapan Invoice Retur Rahasia untuk membuat invoice retur dengan lebih mudah.",
};

export default function InvoiceReturRahasiaPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" className="coretax-page invoice-retur-page" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="page-hero tool-category-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><Link href="/karya/pajak">Pajak</Link><span>/</span><span>Invoice Retur Rahasia</span></nav>
            <span className="eyebrow text-rempah">INVOICE RETUR · MINI TOOL</span>
            <h1 className="display-lg">Invoice Retur Rahasia</h1>
            <p className="lead muted">Ruang ini sedang disiapkan agar Mbak Lulik nanti dapat membuat invoice retur dengan lebih mudah.</p>
          </div>
        </section>

        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container coretax-shell">
            <CoretaxEmbed variant="invoice-retur" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
