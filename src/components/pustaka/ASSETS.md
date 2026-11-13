# Pustaka hero: asset status

Canvas 1536 × 1024. Source of truth: `scene-manifest.ts`. Layers live in `public/illustrations/pustaka/<group>/`.
Master painting kept at `public/illustrations/pustaka/master.webp` (reference only, not rendered).

## Ready (real transparent WebP, cut from the master)
| Layer | Method | Quality notes |
|---|---|---|
| `background/background-base` | master minus Pus/board/hands, `cv2.inpaint` | Everything else is merged here. The area behind Pus is a smear: fine while Pus stays seated, must be repainted before Pus can move. |
| `character/pus-body` | polygon + GrabCut | Clean on hair and legs; the board area is transparent (torso behind the board was never painted). A few wall specks near the hair edge. |
| `board/board-surface` | polygon | Whole board with ornament; frame is not separable from the surface. Deckled edge is straightened. |
| `hands/pus-left-hands`, `pus-right-hands` | GrabCut + colour clean-up | Good silhouettes; tiny paper slivers remain between fingers. |

Recomposing these over each other reproduces the master (mean pixel difference 0.4 / 255).

## Needed (still baked into `background-base`)
Each also needs the area beneath it repainted, otherwise a gap shows when it moves:
`curtain-left`, `hanging-vines`, `flower-vase`, `sleeping-cat` (book beneath), `writing-tools`, `open-book`, `tea-cup`, `foreground-plants`.

## Needed: must be painted, not cut
- `pus-left-arm`, `pus-right-arm`: they are hidden behind the board in the painting. Right now the hands move with the board with no arms attached, so mid-push they look detached. Hair strands for independent hair motion also don't exist.

## Motion (Phase 4)
`pustaka-hero.tsx`: GSAP ScrollTrigger scrub over a 400vh track. Board + hands + text scale as one group from the board centre (1 → 1.35 → 3.2 → 7), Pus body and background drift slightly, text fades, a paper-coloured cover fades in, then the page content follows. Tune in the timeline. `prefers-reduced-motion` skips the animation.

## Not done
- Phase 5 environment motion (curtain, vines, cat, hair): needs the layers above.
- Tablet/mobile reframing (currently uniform scaling with letterbox), lazy-loading and performance pass.
