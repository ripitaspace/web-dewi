import type { Metadata } from "next";
import { RipitaMotionDemo } from "@/components/pages/ripita-motion-demo";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "RIPITA Awakens — Motion Identity", description: "Demo signature loading animation PuspitaCore.", path: "/karya/ripita-motion", robots: { index: false, follow: true } });

export default function RipitaMotionPage() {
  return <RipitaMotionDemo />;
}
