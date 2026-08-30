import type { Metadata } from "next";
import { RipitaClient } from "@/components/pages/ripita-client";

export const metadata: Metadata = {
  title: "RIPITA — Ekosistem & Peta Arsitektur",
  description: "Pengetahuan menjadi alat, produk, dan transaksi: Finance, Tax Tech, Logistics, Vendor Management, dan Education.",
};

export default function RipitaPage() {
  return <RipitaClient />;
}
