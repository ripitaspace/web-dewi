import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { CatalogExplorer } from "@/components/learning/catalog-explorer";
import { LearningPlayer } from "@/components/learning/learning-player";
import { getLearningModule } from "@/modules/learning/catalog";
import {
  breadcrumbs,
  getChildTopics,
  getModuleRegistration,
  getModulesForDomain,
  getModulesForTopic,
  getPublishedDomains,
  legacyCatalogRedirect,
  learningTopics,
  moduleCard,
  resolveCatalogRoute,
  topicPath,
} from "@/modules/learning/registry";

type Props = { params: Promise<{ domain: string; topic?: string[] }> };

export function generateStaticParams() {
  return getPublishedDomains().flatMap((domain) => [
    { domain: domain.slug, topic: [] },
    ...learningTopics
      .filter((topic) => topic.domainId === domain.id && topic.status === "published")
      .map((topic) => ({ domain: domain.slug, topic: topicPath(topic) })),
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, topic = [] } = await params;
  const route = resolveCatalogRoute(domain, topic);
  return route ? { title: `${route.topic?.title || route.domain.title} — Belajar PUSPITA`, description: route.topic?.description || route.domain.description } : { title: "Bidang belajar tidak ditemukan — PUSPITA" };
}

export default async function LearningCatalogRoute({ params }: Props) {
  const { domain: domainSlug, topic: segments = [] } = await params;
  const legacyDestination = legacyCatalogRedirect(domainSlug, segments);
  if (legacyDestination) redirect(legacyDestination);
  const route = resolveCatalogRoute(domainSlug, segments);
  if (!route) notFound();
  const { domain, topic } = route;
  if (domain.id === "audit" && topic?.id === "audit-sme") {
    const module = getLearningModule("audit-sme");
    const registration = getModuleRegistration("audit-sme");
    if (!module || !registration) notFound();
    return <LearningPlayer key={module.id} module={module} slug="audit-sme" publicCode={registration.publicCode} />;
  }
  const children = getChildTopics(domain.id, topic?.id || null).map((entry) => ({ href: `/belajar/${domain.slug}/${topicPath(entry).join("/")}`, title: entry.title, description: entry.description, moduleCount: getModulesForTopic(entry.id, { descendants: true }).length }));
  const modules = (topic ? getModulesForTopic(topic.id) : getModulesForDomain(domain.id)).map(moduleCard);
  return <><SiteHeader currentKey="belajar" /><CatalogExplorer title={topic?.title || domain.title} description={topic?.description || domain.description} crumbs={breadcrumbs(domain, topic)} topics={children} modules={modules} /><SiteFooter /></>;
}
