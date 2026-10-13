"use client";

import { useRef } from "react";

export function RenameCoretax() {
  const frame = useRef<HTMLIFrameElement>(null);
  return <main id="main-content" className="coretax-page" style={{ paddingTop: "var(--nav-height)" }}>
    <section className="coretax-hero"><div className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/karya">Karya</a><span>/</span><a href="/karya/pajak">Pajak</a><span>/</span><span>Rename Coretax</span></nav>
      <span className="eyebrow text-rempah">CORETAX · MINI TOOL</span><h1 className="display-md">Rename Coretax</h1>
      <p className="lead muted">Tarik batch Faktur Pajak Coretax, periksa nama berdasarkan penjual dan pembeli, lalu unduh PDF yang sudah rapi dalam satu ZIP.</p>
    </div></section>
    <section className="section-tight"><div className="container coretax-shell">
      <iframe ref={frame} className="coretax-embed rename-coretax-embed" src="/tools/coretax/Rename_Coretax.html" title="Rename Coretax" />
    </div></section>
  </main>;
}
