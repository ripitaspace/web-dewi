import type { Metadata } from "next";
import { getTentangData, CMS_CONFIG } from "@/modules/cms";
import { TentangClient } from "@/components/pages/tentang-client";

export const metadata: Metadata = {
  title: "Tentang — PUSPITA",
  description: "Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk: dari angka menuju sistem.",
};

export const revalidate = 60;

export default async function TentangPage() {
  const tentangData = await getTentangData();
  const notionId = tentangData?.pageId || CMS_CONFIG.BLOG_DATABASE_ID;
  return <TentangClient data={tentangData} notionId={notionId} />;
}
