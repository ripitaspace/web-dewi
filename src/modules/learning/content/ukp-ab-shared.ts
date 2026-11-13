import type { UkpSummary } from "./ukp-c-builder";

/** Picks Tingkat C summaries for a Tingkat A/B module, renaming keys to the new module's sub-topic labels. */
export function pickSummaries(source: Record<string, UkpSummary>, map: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(map).map(([key, from]) => {
      const summary = source[from];
      if (!summary) throw new Error(`Missing Tingkat C summary "${from}"`);
      return [key, summary] as const;
    }),
  );
}
