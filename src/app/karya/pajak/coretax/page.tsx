import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { CoretaxEmbed } from "@/components/pages/coretax-embed";

export const metadata: Metadata = {
  title: "Coretax Invoice Scraper — Karya PUSPITA",
  description: "Ekstraksi faktur pajak PDF ke data barang dan Excel.",
};

export default function CoretaxPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" className="coretax-page" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="coretax-hero"><div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><span>Coretax</span></nav>
          <span className="eyebrow text-rempah">CORETAX · RIPITAX</span>
          <h1 className="display-md">Invoice Scraper</h1>
          <p className="lead muted">Impor banyak Faktur Pajak dari PDF, ZIP, atau folder; ekstrak detail barang, periksa PDF dan item pada satu workspace, lalu unduh rekap Excel atau ZIP faktur dengan nama rapi. Seluruh proses berjalan langsung di browser.</p>
          <p className="coretax-privacy-note"><strong>Catatan privasi:</strong> ini hanya skrip untuk merekap faktur. Dokumen dan hasilnya diproses di browser, tidak dikirim atau disimpan, dan akan hilang saat halaman dimuat ulang.</p>
        </div></section>
        <section className="section-tight"><div className="container coretax-shell">
          <CoretaxEmbed />
        </div></section>
      </main>
      <SiteFooter />
    </>
  );
}
