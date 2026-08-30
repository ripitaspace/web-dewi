import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, notionX } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { CMS_CONSTANTS } from "../core/constants";
import { formatDate, getCoverUrl, getFileUrl, getMultiSelect, getText } from "../core/utils";
import { cmsCache } from "../core/cache";
import { BlogPost, fallbackTentangData, TentangChapter, TentangPageData, TypeBlog } from "../types";

export const fallbackBlogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "mengapa-bisnis-tumbuh-sistem-rapuh",
    title: "Mengapa bisnis bisa tumbuh tetapi sistemnya semakin rapuh?",
    excerpt: "Pertumbuhan volume tanpa standarisasi arsitektur kerja hanya akan melipatgandakan friksi dan biaya tak terlihat.",
    content: "Ketika transaksi meningkat drastis, ketergantungan pada koordinasi manual seringkali menjadi hambatan utama...",
    date: "28 Agustus 2026",
    author: "Rio Carisandy",
    category: "Bisnis & Sistem",
    type: "pemikiran",
    topics: ["ESSAY", "BUSINESS SYSTEMS"],
    image: "/images/artworks/system-beetle-gouache.png",
  },
  {
    id: "2",
    slug: "laba-dan-kas-menceritakan-hal-berbeda",
    title: "Laba dan kas sedang menceritakan dua hal yang berbeda",
    excerpt: "Laporan laba rugi adalah opini akuntansi, sedangkan arus kas adalah realitas likuiditas operasional.",
    content: "Banyak perusahaan mencatat keuntungan di atas kertas namun mengalami krisis modal kerja karena siklus piutang...",
    date: "20 Agustus 2026",
    author: "Rio Carisandy",
    category: "Keuangan & Akuntansi",
    type: "pemikiran",
    topics: ["FRAMEWORK", "ACCOUNTING"],
    image: "/images/artworks/coral-fish-gouache.png",
  },
  {
    id: "3",
    slug: "arsitektur-logistik-kepulauan",
    title: "Membangun Sistem Logistik yang Menghubungkan 17.000 Pulau",
    excerpt: "Studi kasus perancangan routing digital dan integrasi transaksi pelabuhan nasional.",
    content: "Kompleksitas distribusi kepulauan membutuhkan pemodelan node dan transit hub yang adaptif terhadap cuaca dan jadwal kapal...",
    date: "14 Agustus 2026",
    author: "Rio Carisandy",
    category: "Studi Kasus",
    type: "karya",
    topics: ["CASE STUDY", "SUPPLY CHAIN"],
    image: "/images/artworks/sea-turtle-gouache.png",
  },
  {
    id: "4",
    slug: "modul-revaluasi-keuangan-mandiri",
    title: "Toolkit Keuangan Mini & Diagnosis Unit Ekonomi",
    excerpt: "Template interaktif untuk menguji margin kontribusi, titik impas, dan proyeksi arus kas bisnis bertumbuh.",
    content: "Alat bantu terstruktur untuk pemilik bisnis dan manajer operasional dalam mengambil keputusan alokasi modal...",
    date: "05 Agustus 2026",
    author: "Rio Carisandy",
    category: "Digital Product",
    type: "belajar",
    topics: ["TEMPLATE", "FINANCIAL MODEL"],
    image: "/images/artworks/kecombrang-gouache.png",
  },
];

function getProp(props: Record<string, any>, candidateNames: string[]) {
  if (!props) return undefined;
  const keys = Object.keys(props);
  for (const name of candidateNames) {
    const matchedKey = keys.find((k) => k.trim().toLowerCase() === name.trim().toLowerCase());
    if (matchedKey && props[matchedKey]) {
      return props[matchedKey];
    }
  }
  return undefined;
}

export const mapNotionPageToBlogPost = (page: PageObjectResponse): BlogPost => {
  const props = page.properties as Record<string, any>;

  const typeProp = getProp(props, ["Type", "Tipe", "Pilar", "Section"]);
  const rawType = (getText(typeProp) || "pemikiran").toLowerCase().trim();

  let type: "pemikiran" | "karya" | "belajar" | "tentang" | string = "pemikiran";
  if (rawType.includes("tentang") || rawType.includes("about")) {
    type = "tentang";
  } else if (rawType.includes("karya") || rawType.includes("work") || rawType.includes("case")) {
    type = "karya";
  } else if (rawType.includes("belajar") || rawType.includes("learn") || rawType.includes("product")) {
    type = "belajar";
  } else {
    type = "pemikiran";
  }

  const topicsProp = getProp(props, ["Topics", "Topic", "Topik", "Tags", "Tag", "Keywords"]);
  let topics = getMultiSelect(topicsProp);
  if (topics.length === 0) {
    const cat = getText(getProp(props, ["Category", "Kategori"]));
    topics = cat ? [cat] : ["ESSAY"];
  }

  const titleProp = getProp(props, ["Title", "Name", "Judul"]);
  const excerptProp = getProp(props, ["Excerpt", "Ringkasan", "Description", "Deskripsi"]);
  const dateProp = getProp(props, ["Published Date", "Date", "Tanggal", "Created Date"]);
  const authorProp = getProp(props, ["Author", "Penulis"]);
  const categoryProp = getProp(props, ["Category", "Kategori"]);
  const coverProp = getProp(props, ["Cover Image", "Cover", "Image", "Gambar"]);

  return {
    id: page.id,
    slug: getText(getProp(props, ["Slug", "slug"])) || page.id,
    title: getText(titleProp) || "Tanpa Judul",
    excerpt: getText(excerptProp) || "",
    content: "",
    date: formatDate(getText(dateProp) || page.created_time),
    author: getText(authorProp) || "Rio Carisandy",
    category: getText(categoryProp) || "Umum",
    type,
    topics,
    image: getFileUrl(coverProp) || getCoverUrl(page) || CMS_CONSTANTS.GREY_PLACEHOLDER,
  };
};

export const refreshTentangDataCache = async (): Promise<TentangPageData> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) return fallbackTentangData;

  try {
    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.BLOG_DATABASE_ID,
      filter: {
        property: "Status",
        status: {
          equals: "Published",
        },
      },
    });

    const tentangPages = response.results.filter((page: any) => {
      const mapped = mapNotionPageToBlogPost(page as TypeBlog);
      return mapped.type === "tentang";
    });

    if (tentangPages.length === 0) {
      return fallbackTentangData;
    }

    const mainPage = tentangPages[0] as PageObjectResponse;
    const mappedHeader = mapNotionPageToBlogPost(mainPage);

    const blocksResponse = await notion.blocks.children.list({
      block_id: mainPage.id,
      page_size: 100,
    });

    const chapters: TentangChapter[] = [];
    let currentChapter: TentangChapter | null = null;
    let chapterIndex = 1;

    for (const block of blocksResponse.results as any[]) {
      if (block.type === "heading_1") {
        const h1Text = block.heading_1.rich_text.map((t: any) => t.plain_text).join("").trim();
        if (h1Text) {
          if (currentChapter) {
            chapters.push(currentChapter);
          }
          const numStr = `Bab ${String(chapterIndex).padStart(2, "0")}`;
          currentChapter = {
            id: block.id || `chapter-${chapterIndex}`,
            number: numStr,
            title: h1Text,
            lead: "",
            content: "",
          };
          chapterIndex++;
        }
      } else if (currentChapter) {
        if (block.type === "paragraph") {
          const pText = block.paragraph.rich_text.map((t: any) => t.plain_text).join("").trim();
          if (pText) {
            if (!currentChapter.lead) {
              currentChapter.lead = pText;
            }
            currentChapter.content += (currentChapter.content ? "\n\n" : "") + pText;
          }
        } else if (block.type === "quote") {
          const qText = block.quote.rich_text.map((t: any) => t.plain_text).join("").trim();
          if (qText) {
            currentChapter.quote = qText;
            currentChapter.content += (currentChapter.content ? "\n\n" : "") + `"${qText}"`;
          }
        } else if (block.type === "bulleted_list_item") {
          const itemText = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join("").trim();
          if (itemText) {
            currentChapter.content += (currentChapter.content ? "\n" : "") + `• ${itemText}`;
          }
        }
      }
    }

    if (currentChapter) {
      chapters.push(currentChapter);
    }

    const data: TentangPageData = {
      title: mappedHeader.title || fallbackTentangData.title,
      lead: mappedHeader.excerpt || fallbackTentangData.lead,
      image: mappedHeader.image && !mappedHeader.image.includes("placeholder") ? mappedHeader.image : fallbackTentangData.image,
      chapters: chapters.length > 0 ? chapters : fallbackTentangData.chapters,
    };

    await cmsCache.set("tentang_data", data);
    return data;
  } catch (error) {
    console.error("[CMS Blog] Error refreshing tentang data cache:", error);
    return fallbackTentangData;
  }
};

export const getTentangData = cache(async (): Promise<TentangPageData> => {
  try {
    const cached = await cmsCache.get<TentangPageData>("tentang_data");
    if (cached && cached.chapters && cached.chapters.length > 0) {
      return cached;
    }
    return await refreshTentangDataCache();
  } catch (error) {
    console.error("[CMS Blog] Error getting tentang data:", error);
    return fallbackTentangData;
  }
});

export const refreshBlogPostsCache = async (): Promise<BlogPost[]> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) return fallbackBlogPosts;

  try {
    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.BLOG_DATABASE_ID,
      filter: {
        property: "Status",
        status: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Published Date",
          direction: "descending",
        },
      ],
    });

    const posts = response.results.map((page: any) =>
      mapNotionPageToBlogPost(page as TypeBlog)
    );

    await cmsCache.set("blog_posts", posts);
    // Also refresh tentang data cache in background
    await refreshTentangDataCache();
    return posts.length > 0 ? posts : fallbackBlogPosts;
  } catch (error) {
    console.error("[CMS Blog] Error refreshing blog posts cache:", error);
    return fallbackBlogPosts;
  }
};

export const getBlogPosts = cache(async (options?: { type?: string }): Promise<BlogPost[]> => {
  let posts: BlogPost[] = [];

  if (!CMS_CONFIG.BLOG_DATABASE_ID) {
    posts = fallbackBlogPosts;
  } else {
    try {
      const cached = await cmsCache.get<BlogPost[]>("blog_posts");
      if (cached && cached.length > 0) {
        posts = cached.map((p) => ({
          ...p,
          type: p.type || "pemikiran",
          topics: Array.isArray(p.topics) ? p.topics : [p.category || "UMUM"].filter(Boolean),
        }));
      } else {
        posts = await refreshBlogPostsCache();
      }
    } catch (error) {
      console.error("[CMS Blog] Error fetching blog posts:", error);
      posts = fallbackBlogPosts;
    }
  }

  if (options?.type) {
    const targetType = options.type.toLowerCase().trim();
    return posts.filter((p) => {
      const postType = (p.type || "pemikiran").toLowerCase().trim();
      return postType === targetType;
    });
  }

  return posts;
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) {
    return null;
  }

  const cacheKey = `post_${slug}`;

  try {
    const cached = await cmsCache.get<BlogPost>(cacheKey);
    if (cached) {
      return cached;
    }

    let page: PageObjectResponse | null = null;

    const response = await notion.dataSources.query({
      data_source_id: CMS_CONFIG.BLOG_DATABASE_ID,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    if (response.results.length > 0) {
      page = response.results[0] as PageObjectResponse;
    } else {
      try {
        page = (await notion.pages.retrieve({ page_id: slug })) as PageObjectResponse;
      } catch {
        page = null;
      }
    }

    if (!page) {
      return null;
    }

    const blogPost = mapNotionPageToBlogPost(page);

    try {
      const recordMap = await notionX.getPage(page.id);
      blogPost.recordMap = recordMap;
    } catch (recordErr) {
      console.warn(`[CMS Blog] Could not fetch recordMap for page ${page.id}:`, recordErr);
    }

    await cmsCache.set(cacheKey, blogPost);
    return blogPost;
  } catch (error) {
    console.error(`[CMS Blog] Error fetching blog post with slug ${slug}:`, error);
    return null;
  }
});
