import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Meja Kerja — RIPINTAR", description: "Selesaikan penugasan praktik Ripintar yang sedang tersedia.", path: "/ripintar/workspace" });

export default function RipintarWorkspacePage() { return <RipintarClient initialView="workspace" />; }
