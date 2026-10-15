"use client";

interface RipitaLoaderBootstrapProps {
  html: string;
}

/**
 * Executes while the document is parsed, then becomes inert during client
 * rendering so React does not attempt to execute the script a second time.
 */
export function RipitaLoaderBootstrap({ html }: RipitaLoaderBootstrapProps) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
