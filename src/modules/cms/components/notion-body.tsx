"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NotionRenderer } from "react-notion-x";

// Base styles for react-notion-x
import "react-notion-x/src/styles.css";

export interface NotionBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recordMap: any;
  className?: string;
  darkMode?: boolean;
  mapPageUrl?: (pageId: string) => string;
}

export function NotionBody({
  recordMap,
  className = "",
  darkMode = false,
  mapPageUrl = (pageId) => `/blog/${pageId}`,
}: NotionBodyProps) {
  if (!recordMap) {
    return null;
  }

  return (
    <div className={`notion-content-wrapper ${className}`}>
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={darkMode}
        mapPageUrl={mapPageUrl}
        components={{
          nextLink: Link,
          nextImage: Image,
        }}
      />

      <style jsx global>{`
        .notion-content-wrapper .notion {
          font-family: var(--font-sans, inherit);
          font-size: 1.125rem;
          line-height: 1.75;
          color: inherit;
        }
        .notion-content-wrapper .notion-page {
          padding: 0;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
