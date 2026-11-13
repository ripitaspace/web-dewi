import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/site-header";
import { PustakaHero } from "@/components/pustaka/pustaka-hero";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Pustaka", description: "Pustaka PuspitaCore.", path: "/pustaka" });

export default function PustakaPage() {
  return (
    <>
      <SiteHeader currentKey="pustaka" />
      <main id="main-content">
        <PustakaHero />
        <section className="section" style={{ background: "#f6e6d0", minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center" }}>
          <div className="container">
            <h2 className="display-lg">Koleksi Pustaka</h2>
            <p className="lead muted">On going — koleksi buku dan tulisan sedang disiapkan.</p>
          </div>
        </section>
      </main>
    </>
  );
}
