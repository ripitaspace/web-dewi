import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPostBySlug, NotionBody } from "@/modules/cms";
import { getBlogSeoOverride } from "@/lib/blog-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteImageUrl, absoluteUrl, createPageMetadata, descriptionFromRecordMap, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";

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

  const seo = getBlogSeoOverride(slug);
  const title = seo?.title ?? post.title;
  const description =
    seo?.description || post.excerpt || descriptionFromRecordMap(post.recordMap) || "Artikel dan pemikiran dari PuspitaCore";
  const image = absoluteImageUrl(
    post.image && !post.image.startsWith("data:") ? post.image : DEFAULT_OG_IMAGE,
  );

  return {
    ...createPageMetadata({ title, description, path: `/blog/${slug}`, image, type: "article" }),
    keywords: seo?.keywords,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/blog/${slug}`),
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.dateISO || undefined,
      authors: [post.author],
      images: [{ url: image }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }
  const isCaseStudy = post.type === "karya";
  const seo = getBlogSeoOverride(slug);
  const title = seo?.title ?? post.title;
  const description = seo?.description || post.excerpt || descriptionFromRecordMap(post.recordMap);

  return (
    <div className="blog-detail-root">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl() },
          { "@type": "ListItem", position: 2, name: isCaseStudy ? "Karya" : "Pemikiran", item: absoluteUrl(isCaseStudy ? "/karya" : "/pemikiran") },
          { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(`/blog/${slug}`) },
        ],
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": isCaseStudy ? "CreativeWork" : "Article",
        headline: title,
        keywords: seo?.keywords.join(", "),
        description: description || undefined,
        image: post.image && !post.image.startsWith("data:") ? [absoluteImageUrl(post.image)] : [absoluteUrl(DEFAULT_OG_IMAGE)],
        datePublished: post.dateISO || undefined,
        dateModified: post.dateISO || undefined,
        author: { "@type": "Person", name: post.author || SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
        mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
        inLanguage: "id-ID",
      }} />
      {seo && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seo.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }} />
      )}
      {/* Top Navbar */}
      <header className="blog-detail-nav">
        <div className="blog-nav-inner">
          <Link href={isCaseStudy ? "/karya" : "/pemikiran"} className="blog-back-btn">
            <span className="arrow">←</span>
            <span>{isCaseStudy ? "Kembali ke Karya" : "Kembali ke Pemikiran"}</span>
          </Link>
          <Link href="/" className="brand-mini">
            <img className="brand-logo-mini" src="/images/brand/puspita-ripita-mark.png" alt="" data-ripita-logo-target />
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

            <h1 className="article-title">{title}</h1>

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
                  alt={title}
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

          {seo && (
            <section className="article-faq" aria-labelledby="article-faq-title">
              <h2 id="article-faq-title">Pertanyaan yang sering diajukan</h2>
              {seo.faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
          )}

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="article-footer-card">
              <div className="footer-card-copy">
                <h3>PUSPITA × RIPITA</h3>
                <p>Rupa Indonesia · Akal Masa Depan</p>
              </div>
              <Link href={isCaseStudy ? "/karya" : "/pemikiran"} className="btn primary">
                {isCaseStudy ? "Lihat karya lainnya →" : "Baca pemikiran lainnya →"}
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
