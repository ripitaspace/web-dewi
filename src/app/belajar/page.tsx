import { Suspense } from "react";
import { RouteLoading } from "@/components/system-state/route-loading";
import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { BelajarClient } from "@/components/pages/belajar-client";
import { learningCatalog } from "@/modules/learning/catalog";

export const metadata: Metadata = {
  title: "Belajar — PUSPITA",
  description: "Modul interaktif, latihan, dan catatan belajar yang dapat langsung dipraktikkan.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function BelajarPageContent() {
  const posts = await getBlogPosts({ type: "belajar" });
  return <BelajarClient posts={posts} modules={learningCatalog} />;
}

export default function BelajarPage() {
  return <Suspense fallback={<RouteLoading />}><BelajarPageContent /></Suspense>;
}
