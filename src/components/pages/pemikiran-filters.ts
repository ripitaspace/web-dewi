import type { BlogPost } from "../../modules/cms/types/blog.types";

export type ThoughtSort = "newest" | "oldest" | "title";

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id");
}

export function getThoughtTopics(posts: BlogPost[]) {
  const topics = new Map<string, string>();
  for (const post of posts) {
    for (const topic of post.topics) {
      const value = normalize(topic);
      if (value && !topics.has(value)) topics.set(value, topic.trim().replace(/\s+/g, " "));
    }
  }
  return Array.from(topics, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "id", { sensitivity: "base" }));
}

export function filterThoughts(posts: BlogPost[], search: string, topic: string, sort: ThoughtSort) {
  const term = normalize(search);
  const selectedTopic = normalize(topic);
  return posts.filter((post) => {
    const matchesTopic = !selectedTopic || post.topics.some((item) => normalize(item) === selectedTopic);
    const text = normalize([post.title, post.excerpt, ...post.topics].join(" "));
    return matchesTopic && (!term || text.includes(term));
  }).sort((a, b) => {
    const byTitle = a.title.localeCompare(b.title, "id", { sensitivity: "base" });
    if (sort === "title") return byTitle;
    const aTime = Date.parse(a.dateISO || "");
    const bTime = Date.parse(b.dateISO || "");
    // Unknown dates always follow dated articles, in either direction.
    if (!Number.isFinite(aTime)) return Number.isFinite(bTime) ? 1 : byTitle;
    if (!Number.isFinite(bTime)) return -1;
    return (sort === "oldest" ? aTime - bTime : bTime - aTime) || byTitle;
  });
}
