import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots metadata route", () => {
  it("allows public pages while keeping private routes out of crawl", () => {
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/dev/", "/booking/manage/"],
    });
    expect(result.sitemap).toBe("https://www.puspitacore.com/sitemap.xml");
  });
});
