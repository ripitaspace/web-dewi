export const CMS_CONFIG = {
  NOTION_TOKEN: process.env.NOTION_TOKEN || "",
  BLOG_DATABASE_ID: process.env.NOTION_BLOG_DB_ID || "",
  PRODUCT_DATABASE_ID: process.env.NOTION_PRODUCT_DB_ID || "",
  CONTENT_DATABASE_ID: process.env.NOTION_CONTENT_DB_ID || "",
};

export function validateNotionConfig() {
  if (typeof window === "undefined" && !CMS_CONFIG.NOTION_TOKEN) {
    console.warn("[CMS] Missing NOTION_TOKEN environment variable");
  }
}
