import Link from "next/link";
import type { Metadata } from "next";
import { RipitaMark } from "@/components/brand/ripita-mark";
import { getBlogPosts } from "@/modules/cms";

export const metadata: Metadata = {
  title: "Arsip Catatan & Tulisan — PUSPITA × RIPITA",
  description: "Kumpulan tulisan, ide, dan catatan editorial dari PUSPITA × RIPITA.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
            <RipitaMark className="brand-logo-mini" data-ripita-logo-target />
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
            {posts.map((post) => {
              const topicsList = post.topics && post.topics.length > 0
                ? post.topics
                : [post.type || post.category || "ARSIP"];
              const hasImage = post.image && post.image !== "/images/placeholder.svg" && !post.image.includes("placeholder") && !post.image.startsWith("data:image/svg+xml");

              return (
                <article className="blog-card" key={post.id}>
                  <div className="blog-card-cover">
                    {hasImage ? (
                    <img src={post.image} alt={post.title} />
                    ) : <strong>?</strong>}
                  </div>
                  <div className="blog-topic-row">
                    {topicsList.map((topic) => (
                      <span className="topic-pill" key={topic}>{topic.toUpperCase()}</span>
                    ))}
                  </div>
                  <h3 className="blog-title">
                    <Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <div className="blog-card-foot">
                    <div className="blog-card-byline">
                      <img className="blog-author-avatar" src="/author-avatar.jpg" alt="" />
                      <span className="blog-author">{post.author || "pus"}</span>
                      <time className="blog-date">{post.date}</time>
                    </div>
                    <Link className="blog-link" href={`/blog/${post.slug || post.id}`}>
                      Baca artikel <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
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
