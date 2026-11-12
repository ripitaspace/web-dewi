import { getBlogPosts } from "@/modules/cms";
import { LandingClient } from "@/components/landing-client";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

const homeMetadata = createPageMetadata({
  title: "PuspitaCore",
  description: "Tools pajak, sistem kerja, dan pembelajaran dari PuspitaCore untuk membantu pekerjaan terasa lebih tertata.",
  path: "/",
});

export const metadata: Metadata = { ...homeMetadata, title: { absolute: "PuspitaCore" } };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const posts = await getBlogPosts();
  const top3Posts = posts.slice(0, 3);

  return <LandingClient blogPosts={top3Posts} />;
}
