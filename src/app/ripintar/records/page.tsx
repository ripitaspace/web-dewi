import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Catatan Kompetensi — RIPINTAR", description: "Lihat kompetensi, assessment, dan catatan kerja lokalmu.", path: "/ripintar/records" });

export default function RipintarRecordsPage() { return <RipintarClient initialView="records" />; }
