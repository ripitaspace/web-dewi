import { NextResponse } from "next/server";
import { cmsCache } from "../core/cache";
import { refreshBlogPostsCache } from "../services/blog.service";
import { refreshProductsCache } from "../services/product.service";

export async function handleGetCacheStatus() {
  try {
    const caches = await cmsCache.listKeys();
    return NextResponse.json({ success: true, caches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cache metadata" },
      { status: 500 }
    );
  }
}

export async function handlePostRenewCache(request: Request) {
  try {
    const { key } = await request.json().catch(() => ({ key: "all" }));
    const results: Record<string, any> = {};

    if (key === "all" || key === "blog_posts") {
      console.log("[CMS Cache] Refreshing blog posts cache...");
      const posts = await refreshBlogPostsCache();
      results.blog_posts = { count: posts.length };
    }

    if (key === "all" || key === "products") {
      console.log("[CMS Cache] Refreshing products cache...");
      const products = await refreshProductsCache();
      results.products = { count: products.length };
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[CMS Cache] Error renewing cache:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to renew cache" },
      { status: 500 }
    );
  }
}
