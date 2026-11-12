import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/modules/cms";
import { getPublishedDomains, learningTopics, topicPath } from "@/modules/learning/registry";
import { absoluteUrl } from "@/lib/seo";
import { getIndexableKaryaCards } from "@/lib/karya-card-seo";

const staticPages: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/karya", changeFrequency: "weekly", priority: 0.9 },
  { path: "/karya/pajak", changeFrequency: "weekly", priority: 0.9 },
  { path: "/karya/pajak/coretax", changeFrequency: "weekly", priority: 0.9 },
  { path: "/karya/tools/spt-op", changeFrequency: "weekly", priority: 0.9 },
  { path: "/karya/tools/cetak-bupot", changeFrequency: "weekly", priority: 0.85 },
  { path: "/pemikiran", changeFrequency: "weekly", priority: 0.8 },
  { path: "/belajar", changeFrequency: "weekly", priority: 0.8 },
  { path: "/tentang", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kerja-bersama", changeFrequency: "monthly", priority: 0.6 },
  { path: "/ripintar", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privasi", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const staticPaths = new Set(staticPages.map((page) => page.path));
  for (const tool of getIndexableKaryaCards().filter((tool) => !staticPaths.has(tool.href))) {
    entries.push({ url: absoluteUrl(tool.href), lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  for (const domain of getPublishedDomains()) {
    entries.push({ url: absoluteUrl(`/belajar/${domain.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }

  for (const topic of learningTopics.filter((topic) => topic.status === "published")) {
    const domain = getPublishedDomains().find((candidate) => candidate.id === topic.domainId);
    if (domain) entries.push({ url: absoluteUrl(`/belajar/${domain.slug}/${topicPath(topic).join("/")}`), lastModified: now, changeFrequency: "monthly", priority: 0.5 });
  }

  try {
    const posts = await getBlogPosts();
    for (const post of posts) {
      entries.push({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: post.dateISO ? new Date(post.dateISO) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("[SEO] Sitemap could not refresh CMS articles", error);
  }

  return entries;
}
