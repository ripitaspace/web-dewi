import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { CoretaxEmbed } from "@/components/pages/coretax-embed";
import { CoretaxSeoContent } from "@/components/seo/coretax-seo-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Rekap Faktur Pajak Coretax PDF ke Excel",
  description: "Rekap banyak Faktur Pajak Coretax dari PDF, ZIP, atau folder menjadi Excel. Ekstrak detail transaksi dan barang langsung di browser, tanpa upload ke server.",
  path: "/karya/pajak/coretax",
  image: "/images/artworks/coretax-ripita-icon.png",
});

export default function CoretaxPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" className="coretax-page" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="coretax-hero"><div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><Link href="/karya/pajak">Pajak</Link><span>/</span><span>Coretax</span></nav>
          <span className="eyebrow text-rempah">CORETAX · RIPITAX</span>
          <h1 className="display-md">Rekap Faktur Pajak Coretax ke Excel</h1>
          <p className="lead muted">Coretax Invoice Scraper mengekstrak informasi Faktur Pajak dari PDF, ZIP, atau folder. Periksa hasilnya, rekap detail barang, dan rapikan dokumen dalam satu workspace.</p>
          <div className="button-row coretax-hero__actions"><a className="btn primary" href="#coretax-workspace">Buka workspace rekap</a><Link className="btn" href="/karya/tools/extension-download-faktur-otomatis">Butuh unduh dokumen dulu?</Link></div>
          <p className="coretax-privacy-note"><strong>Catatan privasi:</strong> dokumen dan hasil diproses di browser, tidak dikirim atau disimpan oleh PuspitaCore, dan akan hilang saat halaman dimuat ulang.</p>
        </div></section>
        <section id="coretax-workspace" className="section-tight" aria-label="Workspace Coretax Invoice Scraper"><div className="container coretax-shell">
          <CoretaxEmbed />
        </div></section>
        <CoretaxSeoContent />
      </main>
      <SiteFooter />
    </>
  );
}
