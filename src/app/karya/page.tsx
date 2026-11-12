import { Suspense } from "react";
import { RouteLoading } from "@/components/system-state/route-loading";
import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { KaryaClient } from "@/components/pages/karya-client";
import { absoluteUrl, createPageMetadata, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { getIndexableKaryaCards } from "@/lib/karya-card-seo";

export const metadata: Metadata = createPageMetadata({ title: "Tools Bisnis, Pajak, dan Dokumen", description: "Koleksi tools kerja PuspitaCore untuk pajak, bisnis, dokumen, dan perhitungan praktis.", path: "/karya" });

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function KaryaPageContent() {
  const posts = await getBlogPosts({ type: "karya" });
  const tools = getIndexableKaryaCards();
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Tools kerja PuspitaCore",
      numberOfItems: tools.length + posts.length,
      itemListElement: [
        ...tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.title, url: absoluteUrl(tool.href) })),
        ...posts.map((post, index) => ({ "@type": "ListItem", position: tools.length + index + 1, name: post.title, url: absoluteUrl(`/blog/${post.slug}`) })),
      ],
      publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl() },
    }} />
    <KaryaClient posts={posts} />
  </>;
}

export default function KaryaPage() {
  return <Suspense fallback={<RouteLoading />}><KaryaPageContent /></Suspense>;
}
