import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, notionX } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { CMS_CONSTANTS } from "../core/constants";
import { formatDate, getCoverUrl, getFileUrl, getText } from "../core/utils";
import { cmsCache } from "../core/cache";
import { BlogPost, TypeBlog } from "../types";

export const fallbackBlogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "tips-memilih-beton",
    title: "Tips Memilih Mutu Beton yang Tepat untuk Rumah Tinggal",
    excerpt: "Panduan lengkap memilih jenis beton readymix sesuai dengan kebutuhan struktur bangunan rumah Anda.",
    content: "Mutu beton sangat menentukan kekuatan struktur rumah Anda. Untuk lantai biasanya cukup menggunakan K-225, namun untuk kolom dan balok struktural sangat disarankan menggunakan K-300 agar lebih kokoh dan tahan lama.",
    date: "10 Oktober 2025",
    author: "Admin",
    category: "Tips Konstruksi",
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
  },
  {
    id: "2",
    slug: "keunggulan-precast",
    title: "Keunggulan Menggunakan Beton Precast untuk Saluran Air",
    excerpt: "Mengapa U-Ditch dan Box Culvert menjadi pilihan utama kontraktor modern untuk efisiensi waktu dan biaya.",
    content: "Beton precast diproduksi di pabrik dengan pengawasan ketat, memastikan mutu yang konsisten dibandingkan cor di tempat. Pemasangannya pun jauh lebih cepat, mengurangi gangguan lalu lintas dan risiko kerusakan akibat cuaca.",
    date: "25 September 2025",
    author: "Tim Teknis",
    category: "Inovasi",
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
  },
  {
    id: "3",
    slug: "proyek-tol-2025",
    title: "Dipercaya Suplai Proyek Infrastruktur Nasional",
    excerpt: "Kami bangga menjadi bagian dari pembangunan infrastruktur nasional dengan menyuplai beton berkualitas tinggi.",
    content: "Kepercayaan mitra kepada kami merupakan bukti nyata kualitas produk kami memenuhi standar nasional. Kami terus berkomitmen memberikan yang terbaik untuk infrastruktur Indonesia.",
    date: "15 September 2025",
    author: "Humas",
    category: "Berita Perusahaan",
    image: CMS_CONSTANTS.GREY_PLACEHOLDER,
  },
];

export const mapNotionPageToBlogPost = (page: PageObjectResponse): BlogPost => {
  const props = page.properties;

  return {
    id: page.id,
    slug: getText(props.Slug) || page.id,
    title: getText(props.Title),
    excerpt: getText(props.Excerpt),
    content: "",
    date: formatDate(getText(props.Date) || page.created_time),
    author: getText(props.Author) || "Admin",
    category: getText(props.Category) || "Uncategorized",
    image: getFileUrl((props as any)["Cover Image"]) || getCoverUrl(page) || CMS_CONSTANTS.GREY_PLACEHOLDER,
  };
};

export const refreshBlogPostsCache = async (): Promise<BlogPost[]> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) return [];

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
    return posts;
  } catch (error) {
    console.error("[CMS Blog] Error refreshing blog posts cache:", error);
    return [];
  }
};

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) return [];

  try {
    const cached = await cmsCache.get<BlogPost[]>("blog_posts");
    if (cached && cached.length > 0) {
      return cached;
    }

    const fetched = await refreshBlogPostsCache();
    return fetched;
  } catch (error) {
    console.error("[CMS Blog] Error fetching blog posts:", error);
    return [];
  }
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
