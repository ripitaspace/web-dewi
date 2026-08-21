import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { CMS_CONSTANTS } from "../core/constants";
import { getCoverUrl, getFileUrl, getNumber, getText } from "../core/utils";
import { cmsCache } from "../core/cache";
import { Product } from "../types";

export const fallbackProducts: Product[] = [
  {
    id: "uditch",
    slug: "u-ditch",
    title: "U-Ditch Beton",
    description: "Saluran air beton bertulang dengan bentuk penampang huruf U yang siap pasang. Cocok untuk drainase perkotaan dan jalan raya.",
    category: "Materials",
    features: [
      "Tulangan U-50",
      "Pemasangan cepat dan mudah",
      "Tersedia berbagai ukuran",
    ],
    specifications: {
      "Mutu Beton": "K-350",
      "Panjang": "1200 mm",
      "Lebar": "300 - 2000 mm",
      "Metode Produksi": "Wet Cast / Dry Cast",
    },
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery: [CMS_CONSTANTS.GREY_PLACEHOLDER, CMS_CONSTANTS.GREY_PLACEHOLDER],
    price: 450000,
    status: "Visible",
    displayOrder: 1,
  },
  {
    id: "box-culvert",
    slug: "box-culvert",
    title: "Box Culvert",
    description: "Beton pracetak berbentuk kotak untuk saluran drainase dan jembatan. Mampu menahan beban lalu lintas berat.",
    category: "Materials",
    features: [
      "Kuat tekan tinggi",
      "Kedap air",
      "Sistem sambungan male-female",
      "Standar SNI",
    ],
    specifications: {
      "Mutu Beton": "K-400",
      "Ukuran": "Custom sesuai pesanan",
      "Beban Gandar": "20 - 50 Ton",
    },
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery: [CMS_CONSTANTS.GREY_PLACEHOLDER, CMS_CONSTANTS.GREY_PLACEHOLDER],
    price: 1250000,
    status: "Visible",
    displayOrder: 2,
  },
  {
    id: "readymix-k300",
    slug: "readymix-k300",
    title: "Readymix K-300",
    description: "Beton cor siap pakai dengan mutu K-300, ideal untuk struktur lantai, balok, dan kolom bangunan bertingkat.",
    category: "Materials",
    features: [
      "Konsistensi mutu terjamin",
      "Pengiriman dengan truck mixer",
      "Cocok untuk pembetonan struktural",
    ],
    specifications: {
      "Slump": "12 +/- 2 cm",
      "Setting Time": "4 - 6 Jam",
      "Agregat Max": "25 mm",
    },
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery: [CMS_CONSTANTS.GREY_PLACEHOLDER, CMS_CONSTANTS.GREY_PLACEHOLDER],
    price: 850000,
    status: "Visible",
    displayOrder: 3,
  },
  {
    id: "paving-bata",
    slug: "paving-bata",
    title: "Paving Block Bata",
    description: "Paving block model bata dengan ketebalan 6cm, 8cm, dan 10cm. Pilihan ekonomis dan estetis untuk perkerasan jalan.",
    category: "Materials",
    features: [
      "Kuat tekan K-200 s/d K-400",
      "Warna variatif (Merah, Hitam, Abu)",
      "Anti slip",
    ],
    specifications: {
      "Dimensi": "21 x 10.5 cm",
      "Ketebalan": "6 cm / 8 cm",
      "Isi per m2": "44 pcs",
    },
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery: [CMS_CONSTANTS.GREY_PLACEHOLDER, CMS_CONSTANTS.GREY_PLACEHOLDER],
    price: 95000,
    status: "Visible",
    displayOrder: 4,
  },
  {
    id: "pagar-panel",
    slug: "pagar-panel",
    title: "Pagar Panel Beton",
    description: "Sistem pagar beton pracetak yang kokoh, rapi, dan cepat pemasangannya. Solusi tepat untuk pembatasan area.",
    category: "Materials",
    features: [
      "Sistem knock-down",
      "Dapat dipindah / diganti",
      "Bebas perawatan",
      "Tahan cuaca ekstrim",
    ],
    specifications: {
      "Dimensi Panel": "240 x 40 x 5 cm",
      "Dimensi Tiang": "16 x 16 x (Tinggi) cm",
      "Mutu Beton": "K-225 / K-300",
    },
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
    gallery: [CMS_CONSTANTS.GREY_PLACEHOLDER, CMS_CONSTANTS.GREY_PLACEHOLDER],
    price: 350000,
    status: "Visible",
    displayOrder: 5,
  },
];

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
