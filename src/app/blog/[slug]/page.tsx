import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogPostBySlug, getBlogPosts, NotionBody } from "@/modules/cms";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // ISR revalidate every 60s

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  return {
    title: `${post.title} — PUSPITA × RIPITA`,
    description: post.excerpt || "Artikel dan pemikiran dari PUSPITA × RIPITA",
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((post) => ({
      slug: post.slug || post.id,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

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

      <main className="blog-detail-container">
        <article className="blog-article">
          {/* Article Header */}
          <header className="article-header">
            <div className="article-meta-top">
              <span className="article-badge">{post.category || "Artikel"}</span>
              <time className="article-date">{post.date}</time>
            </div>

            <h1 className="article-title">{post.title}</h1>

            {post.excerpt && (
              <p className="article-lead">{post.excerpt}</p>
            )}

            <div className="article-author-bar">
              <div className="author-avatar">
                {post.author ? post.author.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="author-info">
                <strong>{post.author || "Admin"}</strong>
                <span>Penulis</span>
              </div>
            </div>

            {post.image && !post.image.includes("data:image/svg") && (
              <div className="article-cover">
                <img
                  src={post.image}
                  alt={post.title}
                  className="article-cover-img"
                />
              </div>
            )}
          </header>

          {/* Article Notion Body */}
          <div className="article-body">
            {post.recordMap ? (
              <NotionBody recordMap={post.recordMap} />
            ) : post.content ? (
              <div className="article-plain-content">
                <p>{post.content}</p>
              </div>
            ) : (
              <div className="article-empty">
                <p>Belum ada isi konten pada artikel ini.</p>
              </div>
            )}
          </div>

          {/* Dev Debug Button (DEV environment only) */}
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                marginTop: "32px",
                marginBottom: "32px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.03)",
                border: "1px dashed var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                <strong style={{ color: "var(--foreground)" }}>🛠️ DEV DEBUG</strong> · Notion Page ID:{" "}
                <code style={{ fontSize: "0.8rem", background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                  {post.id}
                </code>
              </div>
              <a
                href={`https://www.notion.so/${post.id.replace(/-/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-small"
                style={{ textDecoration: "none", fontSize: "0.82rem" }}
              >
                Buka di Notion ↗
              </a>
            </div>
          )}

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="article-footer-card">
              <div className="footer-card-copy">
                <h3>PUSPITA × RIPITA</h3>
                <p>Rupa Indonesia · Akal Masa Depan</p>
              </div>
              <Link href="/" className="btn primary">
                Eksplorasi Landing Page →
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
