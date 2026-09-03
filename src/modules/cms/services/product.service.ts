import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { CMS_CONSTANTS } from "../core/constants";
import { getCoverUrl, getFileUrl, getNumber, getText } from "../core/utils";
import { cmsCache } from "../core/cache";
import { Product } from "../types";




export const mapNotionPageToProduct = (page: PageObjectResponse): Product => {
  const props = page.properties;

  const featuresRaw = props.Features;
  let features: string[] = [];
  if (featuresRaw?.type === "multi_select") {
    features = featuresRaw.multi_select.map((s) => s.name);
  } else if (featuresRaw?.type === "rich_text") {
    features = getText(featuresRaw).split("\n").filter(Boolean);
  }

  const specsRaw = getText(props.Specifications);
  let specifications: Record<string, string> = {};
  if (specsRaw) {
    try {
      if (specsRaw.trim().startsWith("{")) {
        specifications = JSON.parse(specsRaw);
      } else {
        specsRaw.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          const value = valueParts.join(":").trim();
          const trimmedKey = key?.trim();
          if (trimmedKey && value) specifications[trimmedKey] = value;
        });
      }
    } catch {
      console.warn("[CMS Product] Could not parse specifications for product:", page.id);
    }
  }

  const galleryRaw = props.Gallery;
  let gallery: string[] = [];
  if (galleryRaw?.type === "files") {
    gallery = galleryRaw.files
      .map((f: any) => {
        if (f.type === "external") return f.external.url;
        if (f.type === "file") return f.file.url;
        return "";
      })
      .filter(Boolean);
  }

  return {
    id: page.id,
    slug: getText(props.Slug) || page.id,
    title: getText(props["Product Name"]) || getText(props.Title),
    description: getText(props["Short Description"]) || getText(props.Description),
    category: (getText(props.Category) as Product["category"]) || "Materials",
    features,
    specifications,
    image: getFileUrl(props["Main Image"]) || getFileUrl(props.Image) || getCoverUrl(page) || CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery,
    price: getNumber(props.Price),
    status: (getText(props.Status) as Product["status"]) || "Visible",
    displayOrder: getNumber(props["Display Order"]),
  };
};

export const refreshProductsCache = async (): Promise<Product[]> => {
  if (!CMS_CONFIG.PRODUCT_DATABASE_ID) return [];

  try {
    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.PRODUCT_DATABASE_ID,
      sorts: [
        {
          property: "Display Order",
          direction: "ascending",
        },
      ],
    });

    const productsList = response.results.map((page: any) =>
      mapNotionPageToProduct(page as PageObjectResponse)
    );

    await cmsCache.set("products", productsList);
    return productsList;
  } catch (error) {
    console.error("[CMS Product] Error refreshing products cache:", error);
    return [];
  }
};

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!CMS_CONFIG.PRODUCT_DATABASE_ID) return [];

  try {
    const cached = await cmsCache.get<Product[]>("products");
    if (cached && cached.length > 0) {
      return cached;
    }

    const fetched = await refreshProductsCache();
    return fetched;
  } catch (error) {
    console.error("[CMS Product] Error fetching products:", error);
    return [];
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!CMS_CONFIG.PRODUCT_DATABASE_ID) {
    return null;
  }

  const cacheKey = `product_${slug}`;

  try {
    const cached = await cmsCache.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.PRODUCT_DATABASE_ID,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    const page = response.results[0] as PageObjectResponse;
    if (!page) {
      return null;
    }

    const product = mapNotionPageToProduct(page);
    await cmsCache.set(cacheKey, product);
    return product;
  } catch (error) {
    console.error(`[CMS Product] Error fetching product with slug ${slug}:`, error);
    return null;
  }
});
