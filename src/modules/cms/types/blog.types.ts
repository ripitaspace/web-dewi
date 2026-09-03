export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Raw block content for react-notion-x fallback
  date: string;
  author: string;
  category: string;
  type: "pemikiran" | "karya" | "belajar" | "tentang" | string;
  topics: string[];
  image: string;
  recordMap?: any; // For react-notion-x
}

export interface TentangBlock {
  type:
    | "paragraph"
    | "heading_2"
    | "heading_3"
    | "quote"
    | "bulleted_list_item"
    | "numbered_list_item"
    | "toggle"
    | "callout";
  text: string;
}

export interface TentangChapter {
  id: string;
  number: string;
  title: string;
  lead: string;
  quote?: string;
  note?: string;
  content: string;
  blocks?: TentangBlock[];
}

export interface TentangPageData {
  version?: number;
  pageId?: string;
  title: string;
  lead: string;
  image: string;
  chapters: TentangChapter[];
}

export const emptyTentangData: TentangPageData = {
  title: "",
  lead: "",
  image: "",
  chapters: [],
};

