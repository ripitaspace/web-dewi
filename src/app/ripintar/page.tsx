import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "RIPINTAR — Simulasi Karier Akuntansi", description: "Ruang praktik lokal untuk membangun keterampilan kerja digital dan akuntansi secara bertahap.", path: "/ripintar" });

export default function RipintarPage() {
  return <RipintarClient />;
}
