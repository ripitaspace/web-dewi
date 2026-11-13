/**
 * Scene manifest for the Pustaka storybook hero.
 *
 * All coordinates live on the master canvas (1536 × 1024) and are rendered as
 * percentages, so the scene scales uniformly. Change a layer here, not in the
 * component.
 *
 * A layer with status "ready" is drawn from its own transparent PNG/WebP.
 * A layer with status "needed" has no real asset yet: it is NOT rendered, and
 * is listed in ASSETS.md as visual work still to do. We never ship a fake
 * "transparent" file that is really a rectangular crop of the master.
 */

export const CANVAS = { width: 1536, height: 1024 } as const;

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
  // READY: real transparent layers, cut from the master (see ASSETS.md for quality notes).
  layer("background-base", "background", [0, 0, 1536, 1024], 1, { status: "ready", note: "Everything except Pus, board and hands. The area behind Pus is smeared (cv2 inpaint): hidden while Pus stays seated, repaint before moving Pus."  }),
  layer("pus-body", "character", [362, 55, 821, 954], 14, { status: "ready", note: "Head, hair, torso, crossed legs. Board area is transparent; arms behind the board were never painted."  }),
  layer("board-surface", "board", [362, 366, 832, 396], 15, { status: "ready", rotation: 0, note: "Whole board, ornament included (frame not separable from surface). Text-free."  }),
  layer("pus-left-hands", "hands", [345, 513, 70, 105], 20, { status: "ready", transformOrigin: "100% 50%"  }),
  layer("pus-right-hands", "hands", [1138, 473, 69, 104], 20, { status: "ready", transformOrigin: "0% 50%"  }),

  // NEEDED: still baked into background-base. Cutting each one also needs the area beneath it repainted.
  layer("curtain-left", "background", [0, 0, 230, 560], 4),
  layer("hanging-vines", "background", [975, 0, 260, 440], 6),
  layer("flower-vase", "decorations", [0, 190, 360, 360], 8),
  layer("sleeping-cat", "decorations", [1200, 515, 336, 150], 11, { transformOrigin: "30% 80%", note: "Book under the cat must be whole." }),
  layer("writing-tools", "decorations", [1430, 620, 106, 230], 12),
  layer("open-book", "decorations", [1170, 825, 330, 199], 12),
  layer("tea-cup", "decorations", [30, 755, 130, 110], 10),
  layer("foreground-plants", "foreground", [1360, 840, 176, 184], 30),
  layer("pus-left-arm", "character", [345, 480, 120, 260], 13, { transformOrigin: "80% 10%", note: "Arm behind the board. Never visible in the painting: must be painted." }),
  layer("pus-right-arm", "character", [1130, 470, 120, 280], 13, { transformOrigin: "20% 10%", note: "Arm behind the board. Never visible in the painting: must be painted." }),
];

/** Where the HTML text sits, as a rectangle on the board (canvas coordinates). */
export const BOARD_CONTENT = {
  x: 420,
  y: 420,
  width: 700,
  height: 290,
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

export const pct = {
  x: (value: number) => `${(value / CANVAS.width) * 100}%`,
  y: (value: number) => `${(value / CANVAS.height) * 100}%`,
};
