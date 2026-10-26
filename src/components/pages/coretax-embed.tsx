"use client";

import { useEffect, useState } from "react";

export function CoretaxEmbed() {
  const [workspaceHeight, setWorkspaceHeight] = useState<number | null>(null);

  useEffect(() => {
    function receiveWorkspaceHeight(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "coretax-workspace-height" || !Number.isFinite(data.height)) return;

      const nextHeight = Math.min(50000, Math.max(900, Math.ceil(data.height)));
      setWorkspaceHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
    }

    window.addEventListener("message", receiveWorkspaceHeight);
    return () => window.removeEventListener("message", receiveWorkspaceHeight);
  }, []);

  return (
    <iframe
      className="coretax-embed"
      src="/tools/coretax/coretax-workspace.html"
      title="RIPITA Invoice Scraper"
      style={workspaceHeight ? { height: `${workspaceHeight}px` } : undefined}
    />
  );
}
