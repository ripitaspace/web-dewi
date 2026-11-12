import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { SptStudio } from '@/components/tools/spt-op/studio';
import { TaxToolSeo } from '@/components/seo/tax-tool-seo';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'SPT Orang Pribadi',
  description: 'Siapkan SPT Orang Pribadi melalui formulir, lampiran, draft lokal, impor, dan cetak.',
  path: '/karya/tools/spt-op',
  image: '/images/artworks/spt-orang-pribadi-cover.png',
});

export default function Page() {
  return (
    <div className="spt-page">
      <SiteHeader currentKey="karya" />
      <main id="main-content" style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="page-hero tool-category-hero spt-site-hero">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/karya">Karya</Link><span>/</span><span>Tax Essentials</span></nav>
            <span className="eyebrow text-rempah">MINI TOOL · TAX ESSENTIALS</span>
            <h1 className="display-lg">SPT Orang Pribadi</h1>
            <p className="lead muted">Siapkan data, susun lampiran, dan tinjau SPT tahunanmu dalam satu ruang kerja.</p>
          </div>
          <Image className="spt-hero-stamp" src="/images/analytics/web-analytics-stamp-blank.png" alt="" width={1122} height={1402} sizes="(max-width: 640px) 92px, 132px" />
        </section>
        <SptStudio />
        <TaxToolSeo toolKey="spt-op" />
      </main>
      <SiteFooter />
    </div>
  );
}
