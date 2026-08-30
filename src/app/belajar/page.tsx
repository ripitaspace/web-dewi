import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { BelajarClient } from "@/components/pages/belajar-client";

export const metadata: Metadata = {
  title: "Belajar — PUSPITA",
  description: "Pengetahuan, template, playbook, dan produk digital yang dapat langsung digunakan.",
};

export const revalidate = 60;

export default async function BelajarPage() {
  const posts = await getBlogPosts({ type: "belajar" });
  return <BelajarClient posts={posts} />;
}
