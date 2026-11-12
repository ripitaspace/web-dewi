import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { getKaryaCardSeo, type KaryaCardSeo } from "@/lib/karya-card-seo";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export function KaryaToolSeo({ seo }: { seo: KaryaCardSeo }) {
  if (!seo.guideTitle || !seo.steps || !seo.faqs) return null;

  return (
    <section className="tax-tool-seo section-tight" aria-labelledby="karya-tool-guide-title">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "SoftwareApplication", name: seo.h1, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: seo.description, publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: seo.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
      ]} />
      <div className="container tax-tool-seo__grid">
        <div><span className="eyebrow text-rempah">PANDUAN SINGKAT</span><h2 id="karya-tool-guide-title">{seo.guideTitle}</h2><p>{seo.description}</p><ol>{seo.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
        <div className="tax-tool-seo__aside"><h3>Pertanyaan umum</h3>{seo.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}<nav aria-label="Tool terkait"><strong>Tool terkait</strong><ul>{seo.relatedHrefs?.map((href) => <li key={href}><Link href={href}>{getKaryaCardSeo(href)?.title || (href === "/belajar" ? "Modul belajar PuspitaCore" : "PuspitaCore")}</Link></li>)}</ul></nav></div>
      </div>
    </section>
  );
}
