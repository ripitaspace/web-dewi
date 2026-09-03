import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, notionX } from "../core/client";
import { CMS_CONFIG } from "../core/config";
import { CMS_CONSTANTS } from "../core/constants";
import { formatDate, getCoverUrl, getFileUrl, getMultiSelect, getText, richTextToHtml } from "../core/utils";
import { cmsCache } from "../core/cache";
import { BlogPost, emptyTentangData, TentangChapter, TentangPageData, TypeBlog } from "../types";


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
    author: getText(authorProp) || "Author",
    category: getText(categoryProp) || "Umum",
    type,
    topics,
    image: getFileUrl(coverProp) || getCoverUrl(page) || CMS_CONSTANTS.GREY_PLACEHOLDER,
  };
};

export const refreshTentangDataCache = async (): Promise<TentangPageData> => {
  if (!CMS_CONFIG.BLOG_DATABASE_ID) return emptyTentangData;

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
      return emptyTentangData;
    }

    const mainPage = tentangPages[0] as PageObjectResponse;
    const mappedHeader = mapNotionPageToBlogPost(mainPage);

    const rawBlocks: any[] = [];
    let cursor: string | undefined = undefined;
    do {
      const blocksResponse: any = await notion.blocks.children.list({
        block_id: mainPage.id,
        page_size: 100,
        start_cursor: cursor,
      });
      rawBlocks.push(...(blocksResponse.results || []));
      cursor = blocksResponse.has_more ? (blocksResponse.next_cursor as string) : undefined;
    } while (cursor);

    const hasH1 = rawBlocks.some(
      (b) => b.type === "heading_1" && b.heading_1?.rich_text?.map((t: any) => t.plain_text).join("").trim()
    );
    const chapterDelimiterType = hasH1 ? "heading_1" : "heading_2";

    const chapters: TentangChapter[] = [];
    let currentChapter: TentangChapter | null = null;
    let chapterIndex = 1;

    const appendBlock = async (block: any, chapter: TentangChapter) => {
      if (block.type === "heading_1") {
        const text = richTextToHtml(block.heading_1?.rich_text);
        if (text) {
          chapter.blocks?.push({ type: "heading_2", text });
          chapter.content += (chapter.content ? "\n\n" : "") + text;
        }
      } else if (block.type === "heading_2") {
        const text = richTextToHtml(block.heading_2?.rich_text);
        if (text) {
          chapter.blocks?.push({ type: "heading_2", text });
          chapter.content += (chapter.content ? "\n\n" : "") + text;
        }
      } else if (block.type === "heading_3") {
        const text = richTextToHtml(block.heading_3?.rich_text);
        if (text) {
          chapter.blocks?.push({ type: "heading_3", text });
          chapter.content += (chapter.content ? "\n\n" : "") + text;
        }
      } else if (block.type === "paragraph") {
        const pText = richTextToHtml(block.paragraph?.rich_text);
        if (pText) {
          if (!chapter.lead) {
            chapter.lead = pText;
          }
          chapter.blocks?.push({ type: "paragraph", text: pText });
          chapter.content += (chapter.content ? "\n\n" : "") + pText;
        }
      } else if (block.type === "quote") {
        const qText = richTextToHtml(block.quote?.rich_text);
        if (qText) {
          if (!chapter.quote) {
            chapter.quote = qText;
          }
          chapter.blocks?.push({ type: "quote", text: qText });
          chapter.content += (chapter.content ? "\n\n" : "") + `"${qText}"`;
        }
      } else if (block.type === "bulleted_list_item") {
        const itemText = richTextToHtml(block.bulleted_list_item?.rich_text);
        if (itemText) {
          chapter.blocks?.push({ type: "bulleted_list_item", text: itemText });
          chapter.content += (chapter.content ? "\n" : "") + `• ${itemText}`;
        }
      } else if (block.type === "numbered_list_item") {
        const itemText = richTextToHtml(block.numbered_list_item?.rich_text);
        if (itemText) {
          chapter.blocks?.push({ type: "numbered_list_item", text: itemText });
          chapter.content += (chapter.content ? "\n" : "") + itemText;
        }
      } else if (block.type === "callout") {
        const cText = richTextToHtml(block.callout?.rich_text);
        const icon = block.callout?.icon?.emoji || "💡";
        if (cText) {
          chapter.blocks?.push({ type: "callout", text: `${icon} ${cText}` });
          chapter.content += (chapter.content ? "\n\n" : "") + `${icon} ${cText}`;
        }
      } else if (block.type === "toggle") {
        const tText = richTextToHtml(block.toggle?.rich_text);
        if (tText) {
          chapter.blocks?.push({ type: "toggle", text: tText });
          chapter.content += (chapter.content ? "\n\n" : "") + tText;
        }
      }

      if (block.has_children) {
        try {
          const childRes = await notion.blocks.children.list({
            block_id: block.id,
            page_size: 100,
          });
          for (const child of childRes.results as any[]) {
            await appendBlock(child, chapter);
          }
        } catch (err) {
          console.warn(`[CMS Blog] Failed to fetch children for block ${block.id}:`, err);
        }
      }
    };

    for (const block of rawBlocks) {
      if (block.type === chapterDelimiterType) {
        const titleText = block[chapterDelimiterType]?.rich_text?.map((t: any) => t.plain_text).join("").trim();
        if (titleText) {
          if (currentChapter) {
            chapters.push(currentChapter);
          }
          const numStr = `Bab ${String(chapterIndex).padStart(2, "0")}`;
          currentChapter = {
            id: block.id || `chapter-${chapterIndex}`,
            number: numStr,
            title: titleText,
            lead: "",
            content: "",
            blocks: [],
          };
          chapterIndex++;
        }
      } else {
        if (!currentChapter) {
          currentChapter = {
            id: `chapter-1`,
            number: "Bab 01",
            title: mappedHeader.title || "Tentang",
            lead: "",
            content: "",
            blocks: [],
          };
        }

        await appendBlock(block, currentChapter);
      }
    }

    if (currentChapter) {
      chapters.push(currentChapter);
    }

    const data: TentangPageData = {
      version: 3,
      pageId: mainPage.id,
      title: mappedHeader.title || "",
      lead: mappedHeader.excerpt || "",
      image: mappedHeader.image && !mappedHeader.image.includes("placeholder") ? mappedHeader.image : "",
      chapters,
    };

    await cmsCache.set("tentang_data", data);
    return data;
  } catch (error) {
    console.error("[CMS Blog] Error refreshing tentang data cache:", error);
    return emptyTentangData;
  }
};

export const getTentangData = cache(async (): Promise<TentangPageData> => {
  try {
    const cached = await cmsCache.get<TentangPageData>("tentang_data");
    if (cached && cached.chapters && cached.chapters.length > 0 && cached.pageId && cached.version === 3) {
      return cached;
    }
    return await refreshTentangDataCache();
  } catch (error) {
    console.error("[CMS Blog] Error getting tentang data:", error);
    return emptyTentangData;
  }
});

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
    // Also refresh tentang data cache in background
    await refreshTentangDataCache();
    return posts;
  } catch (error) {
    console.error("[CMS Blog] Error refreshing blog posts cache:", error);
    return [];
  }
};

export const getBlogPosts = cache(async (options?: { type?: string }): Promise<BlogPost[]> => {
  let posts: BlogPost[] = [];

  if (!CMS_CONFIG.BLOG_DATABASE_ID) {
    posts = [];
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
      posts = [];
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
