import { notFound } from "next/navigation";
import { SystemStateShowcase } from "@/components/system-state/showcase";

export const metadata = { title: "System states · Development", robots: { index: false, follow: false } };
export default function SystemStatesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SystemStateShowcase />;
}
