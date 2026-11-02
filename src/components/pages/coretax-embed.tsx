"use client";

import { useEffect, useRef, useState } from "react";

type CoretaxWorkspaceVariant = "coretax" | "invoice-retur";

interface CoretaxEmbedProps {
  variant?: CoretaxWorkspaceVariant;
}

export function CoretaxEmbed({ variant = "coretax" }: CoretaxEmbedProps) {
  const [workspaceHeight, setWorkspaceHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isInvoiceRetur = variant === "invoice-retur";

  useEffect(() => {
    function receiveWorkspaceHeight(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "coretax-workspace-height" || !Number.isFinite(data.height)) return;

      const nextHeight = Math.min(50000, Math.max(900, Math.ceil(data.height)));
      setWorkspaceHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
    }

    window.addEventListener("message", receiveWorkspaceHeight);
    iframeRef.current?.contentWindow?.postMessage({ type: "request-coretax-workspace-height" }, window.location.origin);
    return () => window.removeEventListener("message", receiveWorkspaceHeight);
  }, []);

  function requestWorkspaceHeight() {
    iframeRef.current?.contentWindow?.postMessage({ type: "request-coretax-workspace-height" }, window.location.origin);
  }

  return (
    <iframe
      ref={iframeRef}
      className="coretax-embed"
      src={isInvoiceRetur ? "/tools/invoice-retur/invoice-retur-workspace.html?v=8" : "/tools/coretax/coretax-workspace.html"}
      title={isInvoiceRetur ? "RIPITA Invoice Retur Scrapper" : "RIPITA Invoice Scraper"}
      style={workspaceHeight ? { height: `${workspaceHeight}px` } : undefined}
      onLoad={requestWorkspaceHeight}
    />
  );
}
