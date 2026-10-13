import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";
import { CMS_CONFIG, validateNotionConfig } from "./config";

validateNotionConfig();

// Official Notion SDK Client (public API)
export const notion = new Client({
  auth: CMS_CONFIG.NOTION_TOKEN,
  // Prisma owns the CMS TTL; do not layer a fetch cache over fresh Notion queries.
  fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
});

// Unofficial Notion Client for react-notion-x (private API v3 for recordMap)
export const notionX = new NotionAPI();
