import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";
import { CMS_CONFIG, validateNotionConfig } from "./config";

validateNotionConfig();

// Official Notion SDK Client (public API)
export const notion = new Client({
  auth: CMS_CONFIG.NOTION_TOKEN,
});

// Unofficial Notion Client for react-notion-x (private API v3 for recordMap)
export const notionX = new NotionAPI();
