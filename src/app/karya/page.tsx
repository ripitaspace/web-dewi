import { Suspense } from "react";
import { RouteLoading } from "@/components/system-state/route-loading";
import type { Metadata } from "next";
import { getBlogPosts } from "@/modules/cms";
import { KaryaClient } from "@/components/pages/karya-client";

export const metadata: Metadata = {
  title: "Karya — PUSPITA",
  description: "Karya & studi kasus sistem dari PUSPITA: RIPITAX, Mangde Logistics, Vendor Management, dan lainnya.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function KaryaPageContent() {
  const posts = await getBlogPosts({ type: "karya" });
  return <KaryaClient posts={posts} />;
}

export default function KaryaPage() {
  return <Suspense fallback={<RouteLoading />}><KaryaPageContent /></Suspense>;
}
