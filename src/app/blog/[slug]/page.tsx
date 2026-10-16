import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { RipitaMark } from "@/components/brand/ripita-mark";
import { getBlogPostBySlug, NotionBody } from "@/modules/cms";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      publishedTime: post.dateISO || undefined,
      authors: [post.author],
      images: post.image ? [post.image] : undefined,
    },
  };
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
          <Link href="/pemikiran" className="blog-back-btn">
            <span className="arrow">←</span>
            <span>Kembali ke Pemikiran</span>
          </Link>
          <Link href="/" className="brand-mini">
            <RipitaMark className="brand-logo-mini" data-ripita-logo-target />
            <strong>PUSPITA × RIPITA</strong>
          </Link>
        </div>
      </header>

      <main id="main-content" className="blog-detail-container">
        <article className="blog-article">
          {/* Article Header */}
          <header className="article-header">
            <div className="article-meta-top">
              <span className="article-badge">{post.category || "Artikel"}</span>
              <time className="article-date" dateTime={post.dateISO || undefined}>{post.date}</time>
            </div>

            <h1 className="article-title">{post.title}</h1>

            {post.excerpt && (
              <p className="article-lead">{post.excerpt}</p>
            )}

            <div className="article-author-bar">
              <div className="author-avatar">
                <img src="/author-avatar.jpg" alt={post.author || "pus"} />
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

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="article-footer-card">
              <div className="footer-card-copy">
                <h3>PUSPITA × RIPITA</h3>
                <p>Rupa Indonesia · Akal Masa Depan</p>
              </div>
              <Link href="/pemikiran" className="btn primary">
                Baca pemikiran lainnya →
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
