import type { Metadata } from "next";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { BulkBupotClient } from "@/components/tools/bulk-bupot-client";

export const metadata: Metadata = {
  title: "Cetak BUPOT — PUSPITA × RIPITA",
  description: "Buat dokumen acuan BUPOT dari ekspor Excel Coretax, langsung di browser.",
};

export default function CetakBupotPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <BulkBupotClient />
      <SiteFooter />
    </>
  );
}
