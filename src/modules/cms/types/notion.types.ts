import { type PageObjectResponse } from "@notionhq/client";

export type TypeBlog = PageObjectResponse & {
  properties: Properties;
};

interface Properties {
  Category: Category;
  "Published Date": PublishedDate;
  Slug: Slug;
  "Cover Image": CoverImage;
  Status: Status;
  Title: Title;
}

interface Category {
  id: string;
  type: string;
  select: any;
}

interface PublishedDate {
  id: string;
  type: string;
  date: Date;
}

interface Date {
  start: string;
  end: any;
  time_zone: any;
}

interface Slug {
  id: string;
  type: string;
  rich_text: RichText[];
}

interface RichText {
  type: string;
  text: Text;
  annotations: Annotations;
  plain_text: string;
  href: any;
}

interface Text {
  content: string;
  link: any;
}

interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

interface CoverImage {
  id: string;
  type: string;
  files: File[];
}

interface File {
  name: string;
  type: string;
  file: File2;
}

interface File2 {
  url: string;
  expiry_time: string;
}

interface Status {
  id: string;
  type: string;
  status: Status2;
}

interface Status2 {
  id: string;
  name: string;
  color: string;
}

interface Title {
  id: string;
  type: string;
  title: Title2[];
}

interface Title2 {
  type: string;
  text: Text2;
  annotations: Annotations2;
  plain_text: string;
  href: any;
}

interface Text2 {
  content: string;
  link: any;
}

interface Annotations2 {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}
