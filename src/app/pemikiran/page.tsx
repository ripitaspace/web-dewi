import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { PemikiranClient } from "@/components/pages/pemikiran-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Pemikiran", description: "Arsip esai, framework, diagram, dan catatan lapangan dari PuspitaCore.", path: "/pemikiran" });

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PemikiranPage() {
  const posts = await getBlogPosts({ type: "pemikiran" });
  return <PemikiranClient posts={posts} />;
}
