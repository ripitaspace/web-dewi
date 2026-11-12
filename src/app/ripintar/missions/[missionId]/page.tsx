import type { Metadata } from "next";
import { RipintarClient } from "@/components/ripintar/ripintar-client";
import { missionById } from "@/modules/ripintar/content";
import { createPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ missionId: string }> }): Promise<Metadata> {
  const { missionId } = await params;
  const mission = missionById[missionId];
  return createPageMetadata({ title: `${mission?.title || "Misi"} — RIPINTAR`, description: mission?.objective || "Penugasan praktik Ripintar.", path: `/ripintar/missions/${missionId}` });
}

export default async function RipintarMissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  if (!missionById[missionId]) notFound();
  return <RipintarClient initialView="workspace" initialMissionId={missionId} />;
}
