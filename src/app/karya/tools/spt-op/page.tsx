import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { SptStudio } from '@/components/tools/spt-op/studio';

export const metadata: Metadata = {
  title: 'SPT Orang Pribadi — PUSPITACORE',
  description: 'Siapkan SPT Orang Pribadi melalui formulir, lampiran, draft lokal, impor, dan cetak.',
  openGraph: {
    title: 'SPT Orang Pribadi — PUSPITACORE',
    description: 'Persiapkan SPT Tahunan dengan Lebih Mudah dan Terstruktur.',
    url: '/karya/tools/spt-op',
    type: 'website',
    images: [{
      url: '/images/artworks/spt-orang-pribadi-cover.png',
      width: 1774,
      height: 887,
      alt: 'Ilustrasi editorial SPT Orang Pribadi dengan formulir, bandeng, udang, kalkulator, dan laptop.',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/artworks/spt-orang-pribadi-cover.png'],
  },
};

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
      </main>
      <SiteFooter />
    </div>
  );
}
