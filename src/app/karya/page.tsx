import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { KaryaClient } from "@/components/pages/karya-client";

export const metadata: Metadata = {
  title: "Karya — PUSPITA",
  description: "Karya & studi kasus sistem dari PUSPITA: RIPITAX, Mangde Logistics, Vendor Management, dan lainnya.",
};

export const revalidate = 60;

export default async function KaryaPage() {
  const posts = await getBlogPosts({ type: "karya" });
  return <KaryaClient posts={posts} />;
}
