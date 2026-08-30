import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type PropertyValue = PageObjectResponse["properties"][string];

export function getText(property: PropertyValue | undefined): string {
  if (!property) return "";
  if (property.type === "title") {
    return property.title.map((t) => t.plain_text).join("");
  }
  if (property.type === "rich_text") {
    return property.rich_text.map((t) => t.plain_text).join("");
  }
  if (property.type === "select") {
    return property.select?.name || "";
  }
  if (property.type === "multi_select") {
    return property.multi_select.map((s) => s.name).join(", ");
  }
  if (property.type === "date") {
    return property.date?.start || "";
  }
  return "";
}

export function getMultiSelect(property: PropertyValue | undefined): string[] {
  if (!property) return [];
  if (property.type === "multi_select") {
    return property.multi_select.map((s) => s.name.trim()).filter(Boolean);
  }
  if (property.type === "select" && property.select?.name) {
    return [property.select.name.trim()];
  }
  if (property.type === "rich_text") {
    const text = property.rich_text.map((t) => t.plain_text).join("");
    return text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function getNumber(property: PropertyValue | undefined): number {
  if (!property || property.type !== "number") return 0;
  return property.number || 0;
}

export function proxyImageUrl(url: string): string {
  if (!url) return "";
  // Check if it's a Notion-hosted image (usually on S3)
  if (url.includes("s3.us-west-2.amazonaws.com") || url.includes("secure.notion-static.com")) {
    return `/api/notion-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function getFileUrl(property: any): string {
  if (!property || property.type !== "files" || !property.files.length) return "";
  const file = property.files[0];
  let url = "";
  if (file.type === "external") {
    url = file.external.url;
  } else if (file.type === "file") {
    url = file.file.url;
    return url;
  }
  return proxyImageUrl(url);
}

export function getCoverUrl(page: PageObjectResponse): string {
  if (!page.cover) return "";
  let url = "";
  if (page.cover.type === "external") {
    url = page.cover.external.url;
  } else if (page.cover.type === "file") {
    url = page.cover.file.url;
  }
  return proxyImageUrl(url);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";

  const isoPattern = /^\d{4}-\d{2}-\d{2}/;
  if (!isoPattern.test(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function parseTitle(titleStr: string): { main: string; highlight: string } {
  if (!titleStr) return { main: "", highlight: "" };
  if (titleStr.includes("|")) {
    const parts = titleStr.split("|");
    return {
      main: parts[0].trim(),
      highlight: parts.slice(1).join("|").trim(),
    };
  }
  const words = titleStr.split(" ");
  if (words.length > 1) {
    const highlight = words.pop() || "";
    const main = words.join(" ");
    return { main, highlight };
  }
  return { main: titleStr, highlight: "" };
}
