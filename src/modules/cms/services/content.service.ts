import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { getText } from "../core/utils";
import { LandingContent } from "../types";

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  heroTitle: "",
  heroSubtitle: "",
  nomorHP: "",
  email: "",
  alamat: "",
  linkedin: "",
  facebook: "",
  instagram: "",
};

let cachedLandingContent: LandingContent | null = null;
let lastFetchedTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache in-memory

export const getLandingContent = cache(async (): Promise<LandingContent> => {
  const now = Date.now();
  if (cachedLandingContent && now - lastFetchedTime < CACHE_TTL) {
    return cachedLandingContent;
  }

  if (!CMS_CONFIG.CONTENT_DATABASE_ID) {
    return DEFAULT_LANDING_CONTENT;
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.CONTENT_DATABASE_ID,
    });

    const contentMap: Record<string, string> = {};
    for (const page of response.results) {
      const p = page as PageObjectResponse;
      const name = getText(p.properties.Name);
      const content = getText(p.properties.Content);
      if (name) {
        contentMap[name] = content;
      }
    }

    const content: LandingContent = {
      heroTitle: contentMap["Hero Title"] || DEFAULT_LANDING_CONTENT.heroTitle,
      heroSubtitle: contentMap["Hero Subtitle"] || DEFAULT_LANDING_CONTENT.heroSubtitle,
      nomorHP: contentMap["Nomor HP"] || DEFAULT_LANDING_CONTENT.nomorHP,
      email: contentMap["Email"] || DEFAULT_LANDING_CONTENT.email,
      alamat: contentMap["Alamat"] || DEFAULT_LANDING_CONTENT.alamat,
      linkedin: contentMap["Linkedin"] || DEFAULT_LANDING_CONTENT.linkedin,
      facebook: contentMap["Facebook"] || DEFAULT_LANDING_CONTENT.facebook,
      instagram: contentMap["Instagram"] || DEFAULT_LANDING_CONTENT.instagram,
    };

    cachedLandingContent = content;
    lastFetchedTime = now;
    return content;
  } catch (error) {
    console.error("[CMS Content] Error fetching landing page content from Notion:", error);
    return DEFAULT_LANDING_CONTENT;
  }
});
