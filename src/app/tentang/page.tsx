import type { Metadata } from "next";
import { TentangClient } from "@/components/pages/tentang-client";

export const metadata: Metadata = {
  title: "Tentang — PUSPITA",
  description: "Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk: dari angka menuju sistem.",
};

export default function TentangPage() {
  return <TentangClient />;
}
