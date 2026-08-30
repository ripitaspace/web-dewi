import type { Metadata } from "next";
import { PemikiranClient } from "@/components/pages/pemikiran-client";

export const metadata: Metadata = {
  title: "Pemikiran — PUSPITA",
  description: "Arsip pemikiran, esai, framework, diagram, dan catatan lapangan dari PUSPITA.",
};

export default function PemikiranPage() {
  return <PemikiranClient />;
}
