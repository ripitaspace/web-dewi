"use client";

import { SystemState } from "@/components/system-state/system-state";

// Next 16.4 retry re-fetches server content as well as resetting the boundary.
export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main id="main-content"><SystemState type="500" primaryAction={{ label: "Coba Lagi", onClick: retry }} /></main>;
}
