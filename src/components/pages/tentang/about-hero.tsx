"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import kinetic from "./about-hero.module.css";
import Link from "next/link";
import styles from "./about.module.css";

const headline = "Bukan biografi. Ini cerita tentang bagaimana cara berpikirku terbentuk.";
const phrases = ["Bukan biografi.", "Ini cerita tentang", "bagaimana cara berpikirku", "terbentuk."];
const interactiveWords = new Set(["Bukan", "biografi.", "cerita", "berpikirku", "terbentuk."]);

export function AboutHero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    // matchMedia owns the timelines and reverts them on breakpoint changes/unmount.
    // Once started, a resize settles the heading instead of replaying the entrance.
    let started = false;
    const media = gsap.matchMedia();
    media.add({
      mobile: "(max-width: 620px)",
      tablet: "(min-width: 621px) and (max-width: 1023px)",
      desktop: "(min-width: 1024px)",
      reduced: "(prefers-reduced-motion: reduce)",
      hover: "(hover: hover) and (pointer: fine)",
    }, (context) => {
      const { mobile, tablet, reduced, hover } = context.conditions!;
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", title);
      const masks = gsap.utils.toArray<HTMLElement>("[data-mask]", title);
      const scene = (index: number) => title.querySelectorAll(`[data-scene="${index}"] [data-char]`);
      const strike = title.querySelector("[data-strike]");
      const fish = title.querySelector<HTMLElement>("[data-fish]")!;
      const thinkingWord = fish.parentElement!;
      const links = title.querySelectorAll("[data-system] path");
      const nodes = title.querySelectorAll("[data-system] circle");
      let ready = false;
      let observer: IntersectionObserver | undefined;
      const cleanups: (() => void)[] = [];
      const settle = () => {
        ready = true;
        title.dataset.motionState = "ready";
      };

      if (reduced) {
        started = true;
        settle();
        return () => { delete title.dataset.motionState; };
      }

      const entrance = gsap.timeline({ paused: true, onComplete: settle });
      if (!started) {
        title.dataset.motionState = "waiting";
        gsap.set(chars, { opacity: 0 });
        gsap.set(strike, { scaleX: 0 });
        gsap.set(masks, { clipPath: "inset(-.2em -.15em -.2em -.15em)" });
        if (mobile) {
          entrance.fromTo(chars, { yPercent: 40 }, {
            yPercent: 0, opacity: 1, duration: .38, stagger: .016, ease: "power2.out",
          }, 0).to(strike, { scaleX: 1, duration: .3 }, 1.15);
        } else {
          const intensity = tablet ? .5 : 1;
          // 01 / 0–1.4s: masked rise, then a hand-drawn terracotta strike.
          entrance.fromTo(scene(0), {
            yPercent: 125, rotation: (i: number) => (i % 3 - 1) * 5 * intensity,
          }, {
            yPercent: 0, rotation: 0, opacity: 1, duration: .75,
            stagger: { amount: .35 }, ease: "power3.out",
          }, 0).to(strike, { scaleX: 1, duration: .35, ease: "power2.inOut" }, 1.05);

          // 02 / 1.15–2.35s: letters unfold with a restrained perspective flip.
          entrance.fromTo(scene(1), {
            yPercent: 65, rotationX: (i: number) => (i % 3 === 0 ? -85 : -30) * intensity,
          }, {
            yPercent: 0, rotationX: 0, opacity: 1, duration: .8,
            stagger: { amount: .4 }, ease: "power3.out",
          }, 1.15);

          // 03 / 2.1–3.9s: scattered thoughts find their positions.
          entrance.fromTo(scene(2), {
            x: (i: number) => ((i * 7) % 5 - 2) * 6 * intensity,
            yPercent: (i: number) => (i % 2 ? -32 : 55) * intensity,
            rotation: (i: number) => (i % 5 - 2) * 8 * intensity,
          }, {
            x: 0, yPercent: 0, rotation: 0, opacity: 1, duration: 1.05,
            stagger: { amount: .75 }, ease: "back.out(1.15)",
          }, 2.1);
          entrance.fromTo(fish, { x: () => thinkingWord.offsetWidth * .62, rotation: -8 }, {
            x: 0, rotation: 3, duration: 1.45, ease: "power1.inOut",
          }, 2.55).to(fish, { opacity: .9, duration: .2 }, 2.55)
            .to(fish, { opacity: 0, duration: .3 }, 3.7);

          // 04 / 3.75–4.95s: a soft landing resolves into connected nodes.
          entrance.fromTo(scene(3), { yPercent: -38, scaleY: 1.12 }, {
            yPercent: 0, scaleY: 1, opacity: 1, duration: .8,
            stagger: { amount: .4 }, ease: "back.out(1.6)",
          }, 3.75).fromTo(links, { strokeDashoffset: 1 }, {
            strokeDashoffset: 0, duration: .75, ease: "power2.inOut",
          }, 4.35).fromTo(nodes, { scale: 0, opacity: 0 }, {
            scale: 1, opacity: 1, duration: .35, stagger: .12, ease: "back.out(1.8)",
          }, 4.65);
        }
        entrance.set(chars, { clearProps: "transform,opacity" })
          .set(masks, { clearProps: "clipPath" });

        observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          title.dataset.motionState = "entering";
          entrance.play();
          observer?.disconnect();
        }, { threshold: .1 });
        observer.observe(title);
      } else {
        settle();
      }

      // Reuse five paused timelines: no per-letter listeners or accumulating tweens.
      if (hover && !mobile) {
        title.querySelectorAll<HTMLElement>("[data-interaction]").forEach((word) => {
          const letters = word.querySelectorAll("[data-char]");
          const interaction = gsap.timeline({ paused: true });
          switch (word.dataset.interaction) {
            case "Bukan":
              interaction.to(letters, { yPercent: -9, duration: .3, stagger: .035, ease: "power2.out" });
              break;
            case "biografi.":
              interaction.to(strike, { scaleX: .94, rotation: -2, duration: .35, ease: "power2.out" });
              break;
            case "cerita":
              interaction.to(letters, {
                keyframes: [
                  { color: "#781b34", yPercent: -11, duration: .18, ease: "sine.out" },
                  { color: "#d34e5e", yPercent: 0, duration: .16, ease: "sine.inOut" },
                  { color: "#1e1b18", duration: .38, ease: "power1.out" },
                ],
                stagger: .055,
              });
              break;
            case "berpikirku":
              interaction.fromTo(fish, { x: () => thinkingWord.offsetWidth * .62, rotation: -5 }, {
                x: 0, rotation: 3, duration: 1, ease: "power1.inOut", immediateRender: false,
              }).to(fish, { opacity: .9, duration: .2 }, 0)
                .to(fish, { opacity: 0, duration: .25 }, .75);
              break;
            case "terbentuk.":
              interaction.to(nodes, {
                keyframes: [
                  { y: -3, scale: 1.2, duration: .3, ease: "sine.out" },
                  { y: 0, scale: 1, duration: .4, ease: "sine.inOut" },
                ],
                stagger: .12,
              }, 0);
              break;
          }
          const enter = () => { if (ready) interaction.restart(); };
          const leave = () => {
            // Let the shine finish returning to black, even after a quick hover.
            if (ready && word.dataset.interaction !== "terbentuk.") interaction.reverse();
          };
          word.addEventListener("pointerenter", enter);
          word.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            word.removeEventListener("pointerenter", enter);
            word.removeEventListener("pointerleave", leave);
          });
        });
      }
      return () => {
        observer?.disconnect();
        cleanups.forEach((cleanup) => cleanup());
        delete title.dataset.motionState;
      };
    }, title);
    return () => media.revert();
  }, []);

  useLayoutEffect(() => {
    const heroArt = heroArtRef.current;
    if (!heroArt || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = [
      { element: heroArt.querySelector<HTMLElement>("[data-parallax-layer=portrait]"), x: 10, y: -28 },
      { element: heroArt.querySelector<HTMLElement>("[data-parallax-layer=flora]"), x: -22, y: -72 },
      { element: heroArt.querySelector<HTMLElement>("[data-parallax-layer=stamp]"), x: 28, y: -46 },
    ];
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const bounds = heroArt.getBoundingClientRect();
      const distance = Math.max(window.innerHeight, bounds.height);
      const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) / distance));
      const intensity = window.innerWidth <= 620 ? 0.72 : 1;

      layers.forEach(({ element, x, y }) => {
        if (!element) return;
        element.style.setProperty("--parallax-x", `${progress * x * intensity}px`);
        element.style.setProperty("--parallax-y", `${progress * y * intensity}px`);
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>PUSPITA / A PERSONAL JOURNAL OF THINKING</p>
          <h1 id="about-title" ref={titleRef} aria-label={headline}>
            <span aria-hidden="true">
              {phrases.map((phrase, sceneIndex) => (
                <Fragment key={phrase}>
                  {sceneIndex > 0 && " "}
                  <span data-scene={sceneIndex}>
                    {phrase.split(" ").map((word, wordIndex) => (
                      <Fragment key={word}>
                        {wordIndex > 0 && " "}
                        <span className={kinetic.word} data-interaction={interactiveWords.has(word) ? word : undefined}>
                          <span className={kinetic.mask} data-mask>
                            {Array.from(word).map((letter, index) => (
                              <span className={kinetic.letter} data-char key={index}>{letter}</span>
                            ))}
                          </span>
                          {word === "biografi." && (
                            <svg className={kinetic.strike} data-strike viewBox="0 0 200 12" preserveAspectRatio="none" focusable="false">
                              <path d="M3 8 Q65 2 103 6 T197 4" />
                            </svg>
                          )}
                          {word === "berpikirku" && (
                            <span className={kinetic.fish} data-fish>
                              {/* Existing PuspitaCore gouache artwork, anchored to the word. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/images/artworks/coral-fish-gouache.png" alt="" width="1024" height="1024" />
                            </span>
                          )}
                          {word === "terbentuk." && (
                            <svg className={kinetic.system} data-system viewBox="0 0 200 16" preserveAspectRatio="xMidYMid meet" focusable="false">
                              <path d="M5 11 L65 4" pathLength="1" strokeDasharray="1" />
                              <path d="M65 4 L130 12" pathLength="1" strokeDasharray="1" />
                              <path d="M130 12 L195 5" pathLength="1" strokeDasharray="1" />
                              <circle cx="5" cy="11" r="3.5" /><circle cx="65" cy="4" r="3.5" />
                              <circle cx="130" cy="12" r="3.5" /><circle cx="195" cy="5" r="3.5" />
                            </svg>
                          )}
                        </span>
                      </Fragment>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>
          <p className={styles.heroStatement}><mark>Aku melihat pola, lalu membangun sesuatu darinya.</mark></p>
          <p className={styles.intro}>Aku tertarik pada hubungan di balik angka, manusia, keputusan, dan proses. Dari rasa penasaran itu, aku belajar memahami bagaimana sesuatu bekerja—dan bagaimana membuatnya bekerja lebih baik.</p>
          <p className={styles.keywords}>Observe <span>·</span> Understand <span>·</span> Build</p>
          <div className="button-row">
            <a className="btn btn-primary" href="#cara-melihat">Mulai Membaca <span aria-hidden="true">↓</span></a>
            <Link className="btn btn-secondary" href="/karya">Jelajahi Karya <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div ref={heroArtRef} className={styles.heroArt}>
          <div className={`${styles.artLayer} ${styles.portraitLayer}`} data-parallax-layer="portrait">
            <img className={styles.portrait} src="/images/artworks/puspita-kebaya-portrait.png" alt="Potret Puspita mengenakan kebaya" />
          </div>
          <div className={`${styles.artLayer} ${styles.floraLayer}`} data-parallax-layer="flora">
            <img className={styles.flora} src="/images/artworks/about-portrait-floral-overlay.png" alt="" aria-hidden="true" />
          </div>
          <div className={`${styles.artLayer} ${styles.stampLayer}`} data-parallax-layer="stamp">
            <img className={styles.stamp} src="/images/artworks/from-curiosity-to-systems-stamps.png" alt="Stempel From Curiosity to Systems" />
          </div>
        </div>
      </div>
      <div className={`container ${styles.heroRule}`} aria-hidden="true"><span>01</span><i /><span>make thinking visible</span></div>
    </section>
  );
}
