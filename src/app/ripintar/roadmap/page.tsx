import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "Career Roadmap — RIPINTAR", description: "Peta perjalanan kompetensi dari Rookie sampai Pinnacle.", path: "/ripintar/roadmap" });

export default function RipintarRoadmapPage() { return <RipintarClient initialView="roadmap" />; }
