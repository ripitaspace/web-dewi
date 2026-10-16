"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MINI_TOOLS } from "@/lib/mini-tools";
import styles from "./site-footer.module.css";

export function SurpriseLink() {
  const pathname = usePathname();
  const router = useRouter();
  const destinations = MINI_TOOLS.filter((tool) => tool.status === "available" && tool.href !== pathname);

  if (!destinations.length) {
    return <Link className={styles.surprise} href="/karya">Jelajahi karya <span aria-hidden="true">↗</span></Link>;
  }

  return <>
    <button className={styles.surprise} type="button" onClick={() => {
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      router.push(destination.href);
    }}>Temukan sesuatu secara acak <span aria-hidden="true">↗</span></button>
    <noscript><Link href="/karya">Jelajahi semua karya</Link></noscript>
  </>;
}
