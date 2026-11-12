import type { Metadata } from "next";
import { KerjaBersamaClient } from "@/components/pages/kerja-bersama-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Kerja Bersama", description: "Mulai percakapan tentang sistem bisnis, akuntansi, produk teknologi, dan kolaborasi.", path: "/kerja-bersama" });

export default function KerjaBersamaPage() {
  return <KerjaBersamaClient />;
}
