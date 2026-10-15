import type { Metadata } from "next";
import { SystemState } from "@/components/system-state/system-state";

export const metadata: Metadata = { title: "Halaman tidak ditemukan — PuspitaCore", robots: { index: false, follow: true } };
export default function NotFound() {
  return <main id="main-content"><SystemState type="404" /></main>;
}
