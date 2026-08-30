"use client";

import { useState, useMemo } from "react";
import { type BlogPost } from "@/modules/cms/types";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { ModalDialog } from "@/components/shared/modal-dialog";

interface BelajarClientProps {
  posts?: BlogPost[];
}

export function BelajarClient({ posts = [] }: BelajarClientProps) {
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedProduct, setSelectedProduct] = useState<BlogPost | null>(null);

  const types = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
      if (p.topics) p.topics.forEach((t) => set.add(t));
    });
    return ["Semua", ...Array.from(set)];
  }, [posts]);

  const filteredProducts = useMemo(() => {
    if (selectedType === "Semua") return posts;
    return posts.filter((p) => {
      const matchCat = p.category && p.category.toLowerCase() === selectedType.toLowerCase();
      const matchTopic = p.topics && p.topics.some((t) => t.toLowerCase() === selectedType.toLowerCase());
      return matchCat || matchTopic;
    });
  }, [posts, selectedType]);

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
            <div className="art-placeholder art-lg" style={{ marginInline: "auto", overflow: "hidden", padding: 0 }}>
              <img
                src="/images/artworks/kecombrang-gouache.png"
                alt="Bunga Kecombrang Nusantara"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>Kecombrang · Belajar</span>
            </div>
          </div>
        </section>

        {/* Store Catalog Section */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container store-layout">
            <aside className="card store-sidebar">
              <span className="eyebrow text-delima">Filter Topik</span>
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
              {filteredProducts.length > 0 ? (
                <div className="store-grid" id="storeGrid">
                  {filteredProducts.map((item, idx) => {
                    const topicsList = item.topics && item.topics.length > 0
                      ? item.topics
                      : [item.type || "BELAJAR", item.category || "PRODUK"];

                    const productArts = [
                      "/images/artworks/kecombrang-gouache.png",
                      "/images/artworks/system-beetle-gouache.png",
                      "/images/artworks/coral-fish-gouache.png",
                    ];
                    const artSrc = item.image && !item.image.includes("placeholder") ? item.image : productArts[idx % productArts.length];

                    return (
                      <article key={item.id || idx} className="card card-pad card-hover store-card">
                        <div className="art-placeholder art-sm" style={{ overflow: "hidden", padding: 0 }}>
                          <img
                            src={artSrc}
                            alt={item.title}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <strong>?</strong>
                          <span>{item.title}</span>
                        </div>
                        <div className="blog-topic-row" style={{ marginTop: "12px", marginBottom: "8px" }}>
                          {topicsList.map((topic, tIdx) => (
                            <span className="topic-pill" key={tIdx}>
                              {topic.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <h3 style={{ fontSize: "1.45rem", margin: "8px 0 6px" }}>{item.title}</h3>
                        <p className="muted" style={{ fontSize: "0.95rem", flexGrow: 1, marginBottom: "16px" }}>
                          {item.excerpt}
                        </p>
                        <div className="card-actions">
                          <button
                            className="btn btn-primary btn-small"
                            onClick={() => setSelectedProduct(item)}
                            type="button"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state" style={{ textAlign: "center", padding: "60px 20px" }}>
                  <h3>Belum ada materi belajar untuk topik ini.</h3>
                  <p className="muted">Silakan pilih topik lain.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ModalDialog
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        kicker={selectedProduct ? `${(selectedProduct.topics || [selectedProduct.type]).join(" · ").toUpperCase()}` : "Detail"}
        title={selectedProduct?.title || ""}
      >
        {selectedProduct && (
          <div>
            <div className="art-placeholder art-md" style={{ margin: "10px auto 30px", overflow: "hidden", padding: 0 }}>
              <img
                src={selectedProduct.image && !selectedProduct.image.includes("placeholder") ? selectedProduct.image : "/images/artworks/kecombrang-gouache.png"}
                alt="Product cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <strong>?</strong>
              <span>{selectedProduct.title}</span>
            </div>

            <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Deskripsi & Manfaat</h3>
            <p className="lead">{selectedProduct.excerpt}</p>

            {selectedProduct.content ? (
              <div style={{ marginTop: "18px", lineHeight: 1.8 }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--delima)" }}>Materi & Silabus</h3>
                <p>{selectedProduct.content}</p>
              </div>
            ) : null}

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
              * Prototype: checkout dan file delivery dikelola secara otomatis oleh RIPITA Commerce.
            </p>
          </div>
        )}
      </ModalDialog>

      <SiteFooter />
    </>
  );
}
