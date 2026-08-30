import type { Metadata } from "next";
import { KaryaClient } from "@/components/pages/karya-client";

export const metadata: Metadata = {
  title: "Karya — PUSPITA",
  description: "Karya & studi kasus sistem dari PUSPITA: RIPITAX, Mangde Logistics, Vendor Management, dan lainnya.",
};

export default function KaryaPage() {
  return <KaryaClient />;
}
