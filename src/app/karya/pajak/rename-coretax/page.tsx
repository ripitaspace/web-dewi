import type { Metadata } from "next";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { RenameCoretax } from "@/components/pages/rename-coretax";

export const metadata: Metadata = {
  title: "Rename Coretax — Karya PUSPITA",
  description: "Siapkan nama file faktur Coretax secara massal.",
};

export default function RenameCoretaxPage() {
  return <><SiteHeader currentKey="karya" /><RenameCoretax /><SiteFooter /></>;
}
