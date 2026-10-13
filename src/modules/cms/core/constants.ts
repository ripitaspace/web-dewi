export const CMS_CONSTANTS = {
  // Editorial changes (Type, Status, title) should follow the page refresh cadence.
  BLOG_LIST_CACHE_TTL_MS: 60 * 1000,
  GREY_PLACEHOLDER:
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%2327272a'/%3E%3C/svg%3E",
  // Notion file URLs are signed and usually expire after about one hour.
  // Refresh CMS records before that so cached image URLs stay usable.
  DEFAULT_CACHE_TTL_MS: 45 * 60 * 1000, // 45 minutes in milliseconds
};
