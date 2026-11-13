/**
 * Scene manifest for the Pustaka storybook hero.
 *
 * All coordinates live on the 2560 × 1440 canvas and are rendered as
 * percentages, so the scene scales uniformly. Change a layer here, not in the
 * component.
 *
 * A layer with status "ready" is drawn from its own transparent PNG/WebP.
 * A layer with status "needed" has no real asset yet: it is NOT rendered, and
 * is listed in ASSETS.md as visual work still to do. We never ship a fake
 * "transparent" file that is really a rectangular crop of the master.
 */

export const CANVAS = { width: 2560, height: 1440 } as const;

/**
 * The 16:9 canvas is scaled to COVER the viewport, so the edges can be cropped.
 * Pus and the board live in a centred 3:2 safe area; the sides are background only.
 */
export const SAFE_AREA = { x: 200, width: 2160, height: 1440 } as const;

/** The first cut-outs were made on the old 1536 × 1024 master; this maps them into the safe area. */
const MASTER_SCALE = SAFE_AREA.width / 1536;
export const fromMaster = {
  x: (v: number) => Math.round(SAFE_AREA.x + v * MASTER_SCALE),
  y: (v: number) => Math.round(v * MASTER_SCALE),
  size: (v: number) => Math.round(v * MASTER_SCALE),
};
/**
 * Pus (body, board, hands, arms) is scaled separately so she can be sized without moving the set.
 * Anchored at the bottom centre of the canvas; change PUS_SCALE to resize her.
 */
export const PUS_SCALE = 1.1;
const PUS_ANCHOR = { masterX: 768, masterY: 1009, canvasX: 1280, canvasY: 1405 };
export const fromPus = {
  x: (v: number) => Math.round(PUS_ANCHOR.canvasX + (v - PUS_ANCHOR.masterX) * PUS_SCALE),
  y: (v: number) => Math.round(PUS_ANCHOR.canvasY + (v - PUS_ANCHOR.masterY) * PUS_SCALE),
  size: (v: number) => Math.round(v * PUS_SCALE),
};
const mp = (x: number, y: number, w: number, h: number): [number, number, number, number] => [
  fromPus.x(x), fromPus.y(y), fromPus.size(w), fromPus.size(h),
];
const m = (x: number, y: number, w: number, h: number): [number, number, number, number] => [
  fromMaster.x(x), fromMaster.y(y), fromMaster.size(w), fromMaster.size(h),
];

export type AssetStatus = "ready" | "needed";

export type SceneAsset = {
  id: string;
  group: "background" | "character" | "hands" | "board" | "furniture" | "decorations" | "foreground";
  src: string;
  /** Top-left of the layer on the 1536 × 1024 canvas. */
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  /** "left": x is measured from the left edge of the SCREEN (not the canvas), so the layer hugs it at any aspect ratio. */
  anchorX?: "left";
  /** Lay the layer back like a floor plane (degrees about the X axis, hinge at the transform origin). */
  tilt?: number;
  /** Mirror the layer horizontally. */
  flipX?: boolean;
  zIndex: number;
  transformOrigin: string;
  status: AssetStatus;
  /** What still has to be painted/segmented, for "needed" layers. */
  note?: string;
};

const layer = (
  id: string,
  group: SceneAsset["group"],
  box: [x: number, y: number, width: number, height: number],
  zIndex: number,
  extra: Partial<SceneAsset> = {},
): SceneAsset => ({
  id,
  group,
  src: `/illustrations/pustaka/${group}/${id}.webp`,
  x: box[0],
  y: box[1],
  width: box[2],
  height: box[3],
  scale: 1,
  rotation: 0,
  zIndex,
  transformOrigin: "50% 50%",
  status: "needed",
  ...extra,
});

export const SCENE_ASSETS: SceneAsset[] = [
  // READY: real transparent layers (see ASSETS.md for quality notes).
  layer("background-wall", "background", [0, 0, 2560, 1440], 1, { status: "ready", note: "Generated 1672×941, upscaled to 2560×1440. Paper-and-plaster texture only." }),
  layer("background-window", "background", [210, -80, 800, 1112], 2, { status: "ready", anchorX: "left", note: "Arched window with candi view (generated, chroma-keyed). Behind Pus." }),
  layer("bookshelf-right", "background", [1780, -300, 977, 1500], 3, { status: "ready", flipX: true, src: "/illustrations/pustaka/background/bookshelf-right-3q.webp", note: "Three-quarter bookcase with statue (generated, chroma-keyed). Right side, behind Pus." }),
  layer("hanging-vines", "background", [1650, 0, 431, 1000], 4, { status: "ready", transformOrigin: "50% 0%", note: "Hanging vine (generated, chroma-keyed). Pivot at the top for sway." }),
  layer("curtain-left", "background", [-30, -20, 541, 1300], 5, { status: "ready", anchorX: "left", src: "/illustrations/pustaka/background/curtain-left-batik.webp", transformOrigin: "50% 0%", note: "Batik curtain with tassel (generated, chroma-keyed). Pivot at the top for sway." }),
  layer("floor-rug", "background", [420, 840, 1720, 600], 7, { status: "ready", tilt: 52, transformOrigin: "50% 100%", src: "/illustrations/pustaka/background/floor-rug-runner.webp", note: "Runner rug under Pus (generated 2000×611, chroma-keyed)." }),
  layer("tea-cup", "decorations", [180, 890, 170, 125], 9, { status: "ready", anchorX: "left", src: "/illustrations/pustaka/decorations/tea-cup-floral.webp", note: "Cup on saucer (generated). Steam was green-tinted and cropped off." }),
  layer("flower-vase", "decorations", [300, 725, 240, 227], 6, { status: "ready", anchorX: "left", src: "/illustrations/pustaka/decorations/flower-vase-lily.webp", note: "Vase of lilies (generated). Placed on the window sill." }),
  layer("book-stack-left", "furniture", [70, 980, 440, 396], 8, { status: "ready", anchorX: "left", src: "/illustrations/pustaka/furniture/book-stack-batik.webp", note: "Six books with batik cloth (generated)." }),
  layer("pus-body", "character", mp(362, 55, 821, 954), 14, { status: "ready", note: "Head, hair, torso, crossed legs. Board area is transparent; arms behind the board were never painted." }),
  layer("board-surface", "board", mp(362, 366, 832, 396), 15, { status: "ready", note: "Whole board, ornament included. Text-free." }),
  layer("pus-left-hands", "hands", mp(345, 513, 70, 105), 20, { status: "ready", transformOrigin: "100% 50%" }),
  layer("pus-right-hands", "hands", mp(1138, 473, 69, 104), 20, { status: "ready", transformOrigin: "0% 50%" }),

  // NEEDED: to be generated one by one (docs/pustaka-asset-prompts.md). Boxes are placeholders in master coordinates.
  layer("book-stack-right", "furniture", m(1190, 640, 346, 230), 9),
  layer("writing-tools", "decorations", m(1430, 620, 106, 230), 12),
  layer("open-book", "decorations", m(1170, 825, 330, 199), 12),
  layer("foreground-plants", "foreground", m(1360, 840, 176, 184), 30),
  layer("sleeping-cat", "decorations", m(1200, 515, 336, 150), 11, { transformOrigin: "30% 80%", note: "Book under the cat must be whole." }),
  layer("pus-left-arm", "character", mp(345, 480, 120, 260), 13, { transformOrigin: "80% 10%", note: "Arm behind the board. Never visible in the painting: must be painted." }),
  layer("pus-right-arm", "character", mp(1130, 470, 120, 280), 13, { transformOrigin: "20% 10%", note: "Arm behind the board. Never visible in the painting: must be painted." }),
];

/** Where the HTML text sits, as a rectangle on the board (canvas coordinates). */
export const BOARD_CONTENT = {
  x: fromPus.x(420),
  y: fromPus.y(420),
  width: fromPus.size(700),
  height: fromPus.size(290),
  rotation: -2.2,
} as const;

/** Per-asset scroll motion. Used from Phase 4; kept here so tuning stays in one file. */
export const MOTION_CONFIG = {
  board: { scale: [1, 1.3, 2.5, 5], rotate: [-2.2, -1, 0, 0] },
  leftArm: { scale: [1, 1.1, 1.5, 2] },
  rightArm: { scale: [1, 1.1, 1.5, 2] },
  curtain: { rotate: [0, 1, -1, 0] },
  cat: { idleAnimation: true },
} as const;

/** Board centre on the canvas: the push grows from here so the hands stay glued to its edges. */
export const PUSH_ORIGIN = { x: fromPus.x(777), y: fromPus.y(563) } as const;

export const pct = {
  x: (value: number) => `${(value / CANVAS.width) * 100}%`,
  y: (value: number) => `${(value / CANVAS.height) * 100}%`,
};
