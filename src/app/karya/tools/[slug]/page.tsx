import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { Pph21ReferenceDownload } from "@/components/tools/pph21-reference-download";
import { MINI_TOOLS } from "@/lib/mini-tools";

interface MiniToolPageProps {
  params: Promise<{ slug: string }>;
}

function getTool(slug: string) {
  return MINI_TOOLS.find((tool) => tool.href === `/karya/tools/${slug}`);
}

export async function generateMetadata({ params }: MiniToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  return tool
    ? { title: `${tool.title} — PUSPITA × RIPITA`, description: tool.description }
    : { title: "Mini Tool Tidak Ditemukan — PUSPITA × RIPITA" };
}

export default async function MiniToolPage({ params }: MiniToolPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) notFound();

  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="page-hero tool-category-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/karya">Karya</Link><span>/</span><span>{tool.category}</span>
            </nav>
            <span className="eyebrow text-rempah">MINI TOOL · {tool.category}</span>
            <h1 className="display-lg">{tool.title}</h1>
            <p className="lead muted">{tool.description}</p>
          </div>
        </section>

        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div className="tool-placeholder card">
              <span className="tool-placeholder__icon" aria-hidden="true">{tool.icon}</span>
              <div>
                <span className="topic-pill">UNDER MAINTENANCE</span>
                <h2>Ruang parser sedang disiapkan.</h2>
                <p>Halaman kerja untuk {tool.title} akan tersedia di sini. Nantinya data tetap diproses langsung di perangkatmu, tanpa login atau penyimpanan transaksi.</p>
                {slug === "pph-21-calculator" && (
                  <div className="button-row" style={{ marginBottom: "12px" }}>
                    <Pph21ReferenceDownload />
                  </div>
                )}
                <Link href="/karya" className="btn primary">← Kembali ke Karya</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
