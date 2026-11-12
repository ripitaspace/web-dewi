import type { Metadata } from "next";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { BulkBupotClient } from "@/components/tools/bulk-bupot-client";
import { TaxToolSeo } from "@/components/seo/tax-tool-seo";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cetak BUPOT",
  description: "Buat dokumen acuan BUPOT dari ekspor Excel Coretax, langsung di browser.",
  path: "/karya/tools/cetak-bupot",
});

export default function CetakBupotPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <BulkBupotClient />
      <TaxToolSeo toolKey="cetak-bupot" />
      <SiteFooter />
    </>
  );
}
