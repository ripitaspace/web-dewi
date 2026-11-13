"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./pustaka-hero.module.css";
import { BOARD_CONTENT, CANVAS, PUSH_ORIGIN, SCENE_ASSETS, pct, type SceneAsset } from "./scene-manifest";

function LayerImage({ asset, priority }: { asset: SceneAsset; priority?: boolean }) {
  return (
    <Image
      src={asset.src}
      alt=""
      aria-hidden="true"
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes="100vw"
      draggable={false}
      className={styles.layer}
      data-layer={asset.id}
      style={{
        left: asset.anchorX === "left" ? `calc(50% - 50vw + ${(asset.x / CANVAS.width) * 100}cqw)` : pct.x(asset.x),
        top: pct.y(asset.y),
        width: pct.x(asset.width),
        height: pct.y(asset.height),
        zIndex: asset.zIndex,
        transform: `${asset.tilt ? `perspective(1800px) rotateX(${asset.tilt}deg) ` : ""}${asset.flipX ? "scaleX(-1) " : ""}scale(${asset.scale}) rotate(${asset.rotation}deg)`,
        transformOrigin: asset.transformOrigin,
      }}
    />
  );
}

/**
 * Pustaka storybook hero. Only layers whose manifest status is "ready" are drawn.
 * Scroll progress drives the board push (board + hands + text move as one group).
 */
export function PustakaHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const ready = SCENE_ASSETS.filter((a) => a.status === "ready").sort((a, b) => a.zIndex - b.zIndex);
  const scenery = ready.filter((a) => a.group !== "board" && a.group !== "hands");
  const pushed = ready.filter((a) => a.group === "board" || a.group === "hands");

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const push = stage.querySelector<HTMLElement>("[data-push]")!;
      const body = stage.querySelector<HTMLElement>('[data-layer="pus-body"]');
      const back = stage.querySelector<HTMLElement>('[data-layer="background-wall"]');
      const text = stage.querySelector<HTMLElement>("[data-board-text]")!;
      const cover = stage.querySelector<HTMLElement>("[data-cover]")!;

      // Scroll progress is the single source of truth, so it plays forward and backward.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      // 0–20%: rest (idle drift is added separately).
      // 20–70%: the push.
      tl.to(push, { scale: 1.35, rotate: 0, duration: 0.25, ease: "power1.in" }, 0.2)
        .to(push, { scale: 3.2, duration: 0.25, ease: "power2.in" }, 0.45)
        // 70–90%: board fills the screen.
        .to(push, { scale: 9, duration: 0.2, ease: "power2.in" }, 0.7)
        .to(text, { opacity: 0, duration: 0.15 }, 0.72)
        .to(cover, { opacity: 1, duration: 0.12 }, 0.8);
      if (body) tl.to(body, { scale: 1.05, y: 12, duration: 0.5 }, 0.2);
      if (back) tl.to(back, { scale: 1.04, duration: 0.7 }, 0.2);
    });
    return () => media.revert();
  }, []);

  return (
    <div ref={trackRef} className={styles.track}>
      <section className={styles.hero} aria-labelledby="pustaka-title">
        <div ref={stageRef} className={styles.stage} style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}>
          {scenery.map((asset, i) => (
            <LayerImage key={asset.id} asset={asset} priority={i === 0} />
          ))}

          <div
            data-push
            className={styles.push}
            style={{ transformOrigin: `${(PUSH_ORIGIN.x / CANVAS.width) * 100}% ${(PUSH_ORIGIN.y / CANVAS.height) * 100}%` }}
          >
            {pushed.map((asset) => (
              <LayerImage key={asset.id} asset={asset} />
            ))}
            {/* HTML text on the board: never baked into the image. */}
            <div
              data-board-text
              className={styles.boardContent}
              style={{
                left: pct.x(BOARD_CONTENT.x),
                top: pct.y(BOARD_CONTENT.y),
                width: pct.x(BOARD_CONTENT.width),
                height: pct.y(BOARD_CONTENT.height),
                transform: `rotate(${BOARD_CONTENT.rotation}deg)`,
              }}
            >
              <h1 id="pustaka-title" className={styles.title}>Pustaka</h1>
              <p className={styles.status}>On going — sedang dalam pengerjaan</p>
            </div>
          </div>

          {/* Paper tone the board settles into, so the hand-off to the page has no flash or jump. */}
          <div data-cover className={styles.cover} aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
