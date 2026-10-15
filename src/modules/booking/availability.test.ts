import { describe, expect, it } from "vitest";
import { localAvailabilityBlocks } from "./local-slots";

describe("localAvailabilityBlocks", () => {
  it("creates weekday availability from 09:00 through 17:00 WIB", () => {
    const blocks = localAvailabilityBlocks(
      new Date("2026-10-18T00:00:00.000Z"),
      new Date("2026-10-21T00:00:00.000Z"),
    );

    expect(blocks.map((block) => [block.start.toISOString(), block.end.toISOString()])).toEqual([
      ["2026-10-19T02:00:00.000Z", "2026-10-19T10:00:00.000Z"],
      ["2026-10-20T02:00:00.000Z", "2026-10-20T10:00:00.000Z"],
    ]);
  });
});
