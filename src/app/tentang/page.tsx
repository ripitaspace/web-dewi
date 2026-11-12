import type { Metadata } from "next";
import { TentangClient } from "@/components/pages/tentang-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Tentang", description: "Cerita PuspitaCore: dari angka menuju sistem dan cara berpikir yang lebih tertata.", path: "/tentang" });

export default function TentangPage() {
  return <TentangClient />;
}
