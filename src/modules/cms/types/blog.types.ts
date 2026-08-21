export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Raw block content for react-notion-x fallback
  date: string;
  author: string;
  category: string;
  image: string;
  recordMap?: any; // For react-notion-x
}
