import type { Metadata } from "next";
import { getTentangData } from "@/modules/cms";
import { TentangClient } from "@/components/pages/tentang-client";

export const metadata: Metadata = {
  title: "Tentang — PUSPITA",
  description: "Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk: dari angka menuju sistem.",
};

export const revalidate = 60;

export default async function TentangPage() {
  const tentangData = await getTentangData();
  return <TentangClient data={tentangData} />;
}
