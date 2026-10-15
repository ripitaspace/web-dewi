import { describe, expect, it } from "vitest";
import { generateAvailableSlots, groupSlotsByDate, rangesOverlap } from "./slots";

const at = (value: string) => new Date(value);

describe("generateAvailableSlots", () => {
  it("applies duration, 30-minute buffers, and 30-minute steps", () => {
    const slots = generateAvailableSlots({
      availability: [{ start: at("2026-10-20T01:00:00Z"), end: at("2026-10-20T05:00:00Z") }],
      busy: [],
      durationMinutes: 60,
      now: at("2026-10-18T00:00:00Z"),
    });

    expect(slots.map((slot) => slot.start.toISOString())).toEqual([
      "2026-10-20T01:30:00.000Z",
      "2026-10-20T02:00:00.000Z",
      "2026-10-20T02:30:00.000Z",
      "2026-10-20T03:00:00.000Z",
      "2026-10-20T03:30:00.000Z",
    ]);
  });

  it("removes slots whose buffered range overlaps busy time", () => {
    const slots = generateAvailableSlots({
      availability: [{ start: at("2026-10-20T01:00:00Z"), end: at("2026-10-20T05:00:00Z") }],
      busy: [{ start: at("2026-10-20T02:30:00Z"), end: at("2026-10-20T03:00:00Z") }],
      durationMinutes: 30,
      now: at("2026-10-18T00:00:00Z"),
    });

    expect(slots.some((slot) => slot.start.toISOString() === "2026-10-20T02:00:00.000Z")).toBe(false);
    expect(slots.some((slot) => slot.start.toISOString() === "2026-10-20T03:00:00.000Z")).toBe(false);
  });

  it("supports service durations that are not multiples of the slot step", () => {
    const slots = generateAvailableSlots({
      availability: [{ start: at("2026-10-20T01:00:00Z"), end: at("2026-10-20T04:00:00Z") }],
      busy: [],
      durationMinutes: 45,
      now: at("2026-10-18T00:00:00Z"),
    });

    expect(slots.map((slot) => [slot.start.toISOString(), slot.end.toISOString()])).toEqual([
      ["2026-10-20T01:30:00.000Z", "2026-10-20T02:15:00.000Z"],
      ["2026-10-20T02:00:00.000Z", "2026-10-20T02:45:00.000Z"],
      ["2026-10-20T02:30:00.000Z", "2026-10-20T03:15:00.000Z"],
    ]);
  });

  it("enforces minimum notice and maximum advance window", () => {
    const slots = generateAvailableSlots({
      availability: [{ start: at("2026-10-15T01:00:00Z"), end: at("2026-12-20T05:00:00Z") }],
      busy: [],
      durationMinutes: 30,
      now: at("2026-10-15T00:00:00Z"),
    });

    expect(slots[0].start.getTime()).toBeGreaterThanOrEqual(at("2026-10-16T00:00:00Z").getTime());
    expect(slots.at(-1)!.end.getTime()).toBeLessThanOrEqual(at("2026-12-14T00:00:00Z").getTime());
  });
});

describe("range utilities", () => {
  it("treats touching ranges as non-overlapping", () => {
    expect(
      rangesOverlap(
        { start: at("2026-10-20T01:00:00Z"), end: at("2026-10-20T02:00:00Z") },
        { start: at("2026-10-20T02:00:00Z"), end: at("2026-10-20T03:00:00Z") },
      ),
    ).toBe(false);
  });

  it("groups UTC slots using the visitor time zone", () => {
    const days = groupSlotsByDate(
      [{ start: at("2026-10-20T17:30:00Z"), end: at("2026-10-20T18:00:00Z") }],
      "Asia/Jakarta",
    );
    expect(days[0].date).toBe("2026-10-21");
  });
});
