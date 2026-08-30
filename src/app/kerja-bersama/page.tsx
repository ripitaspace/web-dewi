import type { Metadata } from "next";
import { KerjaBersamaClient } from "@/components/pages/kerja-bersama-client";

export const metadata: Metadata = {
  title: "Kerja Bersama — PUSPITA",
  description: "Mulai percakapan berkonteks: booking sesi konsultasi sistem bisnis, akuntansi, produk teknologi, dan kolaborasi.",
};

export default function KerjaBersamaPage() {
  return <KerjaBersamaClient />;
}
