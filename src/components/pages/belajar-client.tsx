"use client";

import { useState, useMemo } from "react";
import { PRODUCTS, type ProductItem } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

export function BelajarClient() {
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [assessmentStep, setAssessmentStep] = useState<number | null>(null);
  const [assessmentAnswer, setAssessmentAnswer] = useState("");

  const types = useMemo(() => {
    return ["Semua", ...Array.from(new Set(PRODUCTS.map((p) => p.type)))];
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedType === "Semua") return PRODUCTS;
    return PRODUCTS.filter((p) => p.type === selectedType);
  }, [selectedType]);

  const handleOpenProduct = (product: ProductItem) => {
    if (product.type === "Assessment") {
      setAssessmentStep(1);
      setAssessmentAnswer("");
    }
    setSelectedProduct(product);
  };

  return (
    <>
      <SiteHeader currentKey="belajar" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-delima">Belajar & Digital Products</span>
              <h1 className="display-lg">Pengetahuan yang dapat langsung digunakan.</h1>
              <p className="lead muted">
                Katalog ini adalah tampilan storefront PUSPITA. Checkout, pembayaran, file delivery, dan akun pembeli nantinya dijalankan oleh RIPITA Commerce.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span>Store artwork · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Store Catalog Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container store-layout">
            <aside className="card store-sidebar">
              <span className="eyebrow text-delima">Tipe Produk</span>
              <div className="store-filter" id="storeFilters" style={{ marginTop: "12px" }}>
                {types.map((type) => (
                  <button
                    key={type}
                    className={selectedType === type ? "active" : ""}
                    onClick={() => setSelectedType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </aside>

            <div>
              <div className="store-grid" id="storeGrid">
                {filteredProducts.map((item) => (
                  <article key={item.id} className="card card-pad card-hover store-card">
                    <div className="art-placeholder art-sm">
                      <strong>?</strong>
                      <span>{item.type}</span>
                    </div>
                    <div className="card-topline">
                      <span className="badge">{item.type}</span>
                      <span className="badge">{item.format}</span>
                    </div>
                    <h3 style={{ fontSize: "1.45rem", margin: "14px 0 6px" }}>{item.title}</h3>
                    <p className="price" style={{ color: "var(--delima)" }}>
                      {item.price}
                    </p>
                    <p className="muted" style={{ fontSize: "0.95rem", flexGrow: 1, marginBottom: "16px" }}>
                      {item.problem}
                    </p>
                    <div className="card-actions">
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleOpenProduct(item)}
                        type="button"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ModalDialog
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setAssessmentStep(null);
        }}
        kicker={selectedProduct ? `${selectedProduct.type} · ${selectedProduct.price}` : "Detail"}
        title={selectedProduct?.title || ""}
      >
        {selectedProduct && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px" }}>
              <strong>?</strong>
              <span>Product cover · 1200 × 1200 px</span>
            </div>

            {selectedProduct.type === "Assessment" && assessmentStep ? (
              <div style={{ marginTop: "16px" }}>
                <p className="lead">Contoh Simulasi Assessment:</p>
                <div className="form-field" style={{ marginTop: "16px" }}>
                  <label htmlFor="assessmentSelect">
                    Ketika informasi dibutuhkan, tim Anda paling sering…
                  </label>
                  <select
                    id="assessmentSelect"
                    className="field-control"
                    value={assessmentAnswer}
                    onChange={(e) => setAssessmentAnswer(e.target.value)}
                  >
                    <option value="">-- Pilih jawaban --</option>
                    <option value="chat">Mencari di chat atau bertanya ulang berulang kali</option>
                    <option value="spreadsheet">Membuka banyak spreadsheet terpisah tanpa sinkronisasi</option>
                    <option value="connected">Menggunakan sistem yang sudah terhubung dengan rapi</option>
                    <option value="lost">Tidak yakin harus mencari di mana dan siapa penanggung jawabnya</option>
                  </select>
                </div>
                {assessmentAnswer && (
                  <div className="success-box" style={{ marginTop: "20px" }}>
                    <strong>Hasil Analisis Awal:</strong>
                    <p style={{ marginTop: "8px", marginBottom: 0 }}>
                      {assessmentAnswer === "connected"
                        ? "🎉 Sistem Anda sudah memiliki tingkat integrasi yang baik! Tahap berikutnya adalah otomatisasi peringatan dini (early warning)."
                        : "⚠️ Terdeteksi redundansi komunikasi dan fragmentasi data. Disarankan memulai pemetaan alur dokumen dan Master SOP."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Persoalan yang Dibantu</h3>
                <p>{selectedProduct.problem}</p>

                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>
                  Siapa yang Cocok
                </h3>
                <p className="muted">{selectedProduct.audience}</p>

                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>
                  Bentuk Produk & Format
                </h3>
                <p>{selectedProduct.format}</p>

                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>
                  Perkiraan Waktu Penggunaan
                </h3>
                <p className="muted">{selectedProduct.duration}</p>

                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)", marginTop: "20px" }}>
                  Harga
                </h3>
                <p className="lead" style={{ color: "var(--delima)", fontWeight: 800 }}>
                  {selectedProduct.price}
                </p>

                <div className="button-row" style={{ marginTop: "24px" }}>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => alert(`Simulasi checkout untuk: ${selectedProduct.title}`)}
                  >
                    Lanjut ke RIPITA Checkout
                  </button>
                </div>
                <p className="muted" style={{ marginTop: "20px", fontSize: "0.82rem" }}>
                  * Prototype: checkout dan file delivery nantinya dikelola secara otomatis oleh RIPITA Commerce.
                </p>
              </>
            )}
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
