import { db } from "@/lib/db";
import { CMS_CONSTANTS } from "./constants";

export interface CacheStore {
  get<T>(key: string, maxAgeMs?: number): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  listKeys(): Promise<{ key: string; updatedAt: Date }[]>;
}

export const cmsCache: CacheStore = {
  async get<T>(key: string, maxAgeMs = CMS_CONSTANTS.DEFAULT_CACHE_TTL_MS): Promise<T | null> {
    try {
      const cached = await db.notionCache.findUnique({
        where: { key },
      });
      if (!cached) return null;

      // Check if cache has exceeded TTL (e.g. > 3 days)
      const ageMs = Date.now() - new Date(cached.updatedAt).getTime();
      if (maxAgeMs > 0 && ageMs > maxAgeMs) {
        console.log(`[CMS Cache] Cache for "${key}" is older than ${Math.round(ageMs / (1000 * 60 * 60 * 24))} days. Triggering auto-refresh...`);
        return null;
      }

      return JSON.parse(cached.data) as T;
    } catch (err) {
      console.warn(`[CMS Cache] Failed to read cache for key "${key}":`, err);
      return null;
    }
  },

  async set<T>(key: string, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      await db.notionCache.upsert({
        where: { key },
        create: { key, data: serialized },
        update: { data: serialized },
      });
    } catch (err) {
      console.warn(`[CMS Cache] Failed to write cache for key "${key}":`, err);
    }
  },

  async listKeys(): Promise<{ key: string; updatedAt: Date }[]> {
    try {
      return await db.notionCache.findMany({
        select: {
          key: true,
          updatedAt: true,
        },
        orderBy: {
          key: "asc",
        },
      });
    } catch (err) {
      console.warn("[CMS Cache] Failed to list keys:", err);
      return [];
    }
  },
};
