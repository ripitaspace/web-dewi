import type { Metadata } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.puspitacore.com";

export const SITE_URL = configuredSiteUrl.replace(/\/$/, "");
export const SITE_NAME = "PuspitaCore";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  robots?: Metadata["robots"];
};

/** Builds the shared canonical and social metadata used by public pages. */
export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  robots,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "id_ID",
      type,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots,
  };
}

const MAX_DESCRIPTION_LENGTH = 160;

function clipDescription(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_DESCRIPTION_LENGTH) return clean;
  const cut = clean.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Plain text of the first paragraphs of a Notion recordMap, used when a post has no Excerpt. */
export function descriptionFromRecordMap(recordMap: unknown): string {
  const blocks = (recordMap as { block?: Record<string, any> } | null | undefined)?.block;
  if (!blocks) return "";
  const parts: string[] = [];
  for (const entry of Object.values(blocks)) {
    const value = entry?.value?.value ?? entry?.value;
    if (value?.type !== "text") continue;
    const title = value.properties?.title;
    if (!Array.isArray(title)) continue;
    const text = title.map((chunk: unknown) => (Array.isArray(chunk) ? String(chunk[0] ?? "") : "")).join("").trim();
    if (text) parts.push(text);
    if (parts.join(" ").length >= MAX_DESCRIPTION_LENGTH) break;
  }
  return clipDescription(parts.join(" "));
}

/** Resolves a possibly relative image path to an absolute URL for crawlers. */
export function absoluteImageUrl(image: string) {
  return /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
}
