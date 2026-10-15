import type { Metadata } from "next";
import { RipitaMotionDemo } from "@/components/pages/ripita-motion-demo";

export const metadata: Metadata = {
  title: "RIPITA Awakens — Motion Identity",
  description: "Demo signature loading animation PUSPITA × RIPITA.",
};

export default function RipitaMotionPage() {
  return <RipitaMotionDemo />;
}
