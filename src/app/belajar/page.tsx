import type { Metadata } from "next";
import { BelajarClient } from "@/components/pages/belajar-client";

export const metadata: Metadata = {
  title: "Belajar & Produk Digital — PUSPITA",
  description: "Pengetahuan siap pakai: workbook akuntansi, checklist alur kas, kalkulator seller, dan framework bisnis.",
};

export default function BelajarPage() {
  return <BelajarClient />;
}
