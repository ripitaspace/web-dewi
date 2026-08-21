import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";

export const metadata: Metadata = {
  title: "Arsip Catatan & Tulisan — PUSPITA × RIPITA",
  description: "Kumpulan tulisan, ide, dan catatan editorial dari PUSPITA × RIPITA.",
};

export const revalidate = 60; // ISR revalidate every 60s

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="blog-detail-root">
      {/* Top Navbar */}
      <header className="blog-detail-nav">
        <div className="blog-nav-inner">
          <Link href="/" className="blog-back-btn">
            <span className="arrow">←</span>
            <span>Kembali ke Beranda</span>
          </Link>
          <Link href="/" className="brand-mini">
            <span className="brand-mark-mini">P</span>
            <strong>PUSPITA × RIPITA</strong>
          </Link>
        </div>
      </header>

      <main className="blog-detail-container" style={{ maxWidth: "1080px" }}>
        <header className="blog-index-header" style={{ marginBottom: "50px", textAlign: "center" }}>
          <span className="article-badge" style={{ marginBottom: "16px" }}>Notion CMS</span>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--delima)", margin: "0 0 16px" }}>
            Arsip Catatan & Tulisan
          </h1>
          <p style={{ maxWidth: "560px", margin: "0 auto", color: "rgba(30, 27, 24, 0.72)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Eksplorasi gagasan seputar akuntansi, konstruksi, pemikiran editorial, dan visualisasi sistem.
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="blog-grid" style={{ marginTop: "30px" }}>
            {posts.map((post) => (
              <article className="blog-card" key={post.id}>
                <div className="blog-card-meta">
                  <span className="blog-badge">{post.category || "Arsip"}</span>
                  <time className="blog-date">{post.date}</time>
                </div>
                <h3 className="blog-title">
                  <Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                </h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-card-foot">
                  <span className="blog-author">Oleh {post.author || "Admin"}</span>
                  <Link className="blog-link" href={`/blog/${post.slug || post.id}`}>
                    Baca artikel <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "20px", border: "1px solid var(--line)" }}>
            <p style={{ fontSize: "1.1rem", color: "rgba(30, 27, 24, 0.6)" }}>
              Belum ada artikel yang dipublikasikan.
            </p>
            <Link href="/" className="btn primary" style={{ marginTop: "20px" }}>
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
