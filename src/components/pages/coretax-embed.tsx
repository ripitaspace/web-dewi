"use client";

import { useRef } from "react";

export function CoretaxEmbed() {
  const frame = useRef<HTMLIFrameElement>(null);

  function applyTheme() {
    const documentInFrame = frame.current?.contentDocument;
    if (!documentInFrame || documentInFrame.getElementById("puspita-coretax-theme")) return;
    const stylesheet = documentInFrame.createElement("link");
    stylesheet.id = "puspita-coretax-theme";
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/tools/coretax/puspita-theme.css";
    documentInFrame.head.appendChild(stylesheet);

    const uxScript = documentInFrame.createElement("script");
    uxScript.id = "puspita-coretax-ux";
    uxScript.src = "/tools/coretax/puspita-ux.js";
    uxScript.async = false;
    documentInFrame.head.appendChild(uxScript);
  }

  return <iframe ref={frame} className="coretax-embed" src="/tools/coretax/RIPITA_Invoice_Scraper.html" title="RIPITA Invoice Scraper" onLoad={applyTheme} />;
}
