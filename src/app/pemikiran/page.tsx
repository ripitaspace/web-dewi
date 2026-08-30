import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { PemikiranClient } from "@/components/pages/pemikiran-client";

export const metadata: Metadata = {
  title: "Pemikiran — PUSPITA",
  description: "Arsip pemikiran, esai, framework, diagram, dan catatan lapangan dari PUSPITA.",
};

export const revalidate = 60;

export default async function PemikiranPage() {
  const posts = await getBlogPosts({ type: "pemikiran" });
  return <PemikiranClient posts={posts} />;
}
