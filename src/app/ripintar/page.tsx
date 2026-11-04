import type { Metadata } from "next";
import { RipitaClient } from "@/components/pages/ripita-client";

export const metadata: Metadata = {
  title: "RIPINTAR — Buku Digital & Pembahasan Mendalam",
  description: "Ruang buku digital untuk membahas materi secara utuh, dengan konteks, contoh penerapan, dan coding lengkap.",
};

export default function RipintarPage() {
  return <RipitaClient />;
}
