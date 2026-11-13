import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/site-header";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Pustaka", description: "Pustaka PuspitaCore.", path: "/pustaka" });

export default function PustakaPage() {
  return (
    <>
      <SiteHeader currentKey="pustaka" />
      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        <section className="page-hero">
          <div className="container" style={{ textAlign: "center", padding: "6rem 0" }}>
            <h1 className="display-lg">Pustaka</h1>
            <p className="lead muted">On going — sedang dalam pengerjaan.</p>
          </div>
        </section>
      </main>
    </>
  );
}
