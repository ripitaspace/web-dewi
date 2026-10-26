import { Suspense } from "react";
import { RouteLoading } from "@/components/system-state/route-loading";
import type { Metadata } from "next";
import { BelajarClient } from "@/components/pages/belajar-client";
import { getModulesForDomain, getPublishedDomains, getPublishedModuleCards } from "@/modules/learning/registry";

export const metadata: Metadata = {
  title: "Belajar — PUSPITA",
  description: "Modul interaktif dan latihan yang dapat langsung dipraktikkan.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function BelajarPageContent() {
  const domains = getPublishedDomains().map((domain) => ({
    href: `/belajar/${domain.slug}`,
    title: domain.title,
    description: domain.description,
    icon: domain.icon,
    moduleCount: getModulesForDomain(domain.id).length,
  }));
  return <BelajarClient modules={getPublishedModuleCards()} domains={domains} />;
}

export default function BelajarPage() {
  return <Suspense fallback={<RouteLoading />}><BelajarPageContent /></Suspense>;
}
