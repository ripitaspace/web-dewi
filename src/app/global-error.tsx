"use client";

import { SystemState } from "@/components/system-state/system-state";
import "./globals.css";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="id"><body><main><SystemState type="500" primaryAction={{ label: "Coba Lagi", onClick: retry }} /></main></body></html>;
}
