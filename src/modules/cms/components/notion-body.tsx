"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NotionRenderer } from "react-notion-x";
import { Collection } from "react-notion-x/build/third-party/collection";
import { Code } from "react-notion-x/build/third-party/code";
import { Equation } from "react-notion-x/build/third-party/equation";
import { proxyImageUrl } from "../core/utils";

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
        mapImageUrl={(url) => (url ? proxyImageUrl(url) : "")}
        forceCustomImages
        previewImages
        components={{
          nextLink: Link,
          nextImage: Image,
          Collection,
          Code,
          Equation,
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
        .notion-content-wrapper .notion-collection {
          max-width: 100%;
          overflow-x: auto;
        }
        .notion-content-wrapper .notion-table-view {
          min-width: 640px;
        }
        .notion-content-wrapper .notion-code {
          border: 1px solid var(--line);
          border-radius: 14px;
          max-height: 320px;
          margin: 1.25rem 0;
          overflow-x: auto;
          overflow-y: auto;
          padding: 1.25rem 3.5rem 1.25rem 1.25rem;
        }
        .notion-content-wrapper .notion-code code {
          white-space: pre;
        }
        .notion-content-wrapper .notion-equation {
          overflow-x: auto;
          padding: 0.75rem 0;
        }
        .notion-content-wrapper .notion-asset-wrapper,
        .notion-content-wrapper .notion-image {
          max-width: 100%;
        }
        .notion-content-wrapper img {
          max-width: 100%;
          height: auto;
        }
        .notion-content-wrapper .notion-callout {
          border-radius: 14px;
          margin: 1.25rem 0;
        }
        .notion-content-wrapper .notion-quote {
          border-left-color: var(--delima);
        }
        @media (max-width: 640px) {
          .notion-content-wrapper .notion-code {
            max-height: 220px;
          }
        }
      `}</style>
    </div>
  );
}
