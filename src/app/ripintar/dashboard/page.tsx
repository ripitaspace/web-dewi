import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Dasbor — RIPINTAR", description: "Lihat rank, bintang, dan penugasan Ripintar berikutnya.", path: "/ripintar/dashboard" });

export default function RipintarDashboardPage() { return <RipintarClient initialView="dashboard" />; }
