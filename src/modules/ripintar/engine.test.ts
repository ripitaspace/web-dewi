import { describe, expect, it } from "vitest";
import { missionById, missions } from "./content";
import { canOpenMission, createInitialState, statusFor, submitMission, validateMission } from "./engine";

describe("Ripintar progression", () => {
  it("starts only the first Rookie mission", () => {
    const state = createInitialState();
    expect(statusFor(state, "rookie-01")).toBe("AVAILABLE");
    expect(statusFor(state, "rookie-02")).toBe("LOCKED");
    expect(canOpenMission(state, missionById["rookie-02"]!)).toBe(false);
  });
  it("does not award a star for incorrect work", () => {
    const outcome = submitMission(createInitialState(), "rookie-01", { steps: ["double", "single", "context"] });
    expect(outcome.evaluation.passed).toBe(false);
    expect(outcome.state.stars).toEqual([]);
    expect(statusFor(outcome.state, "rookie-02")).toBe("LOCKED");
  });
  it("unlocks the next mission and awards exactly one star after mastery", () => {
    const first = submitMission(createInitialState(), "rookie-01", { steps: ["single", "double", "context"] });
    const practice = submitMission(first.state, "rookie-01", { steps: ["single", "double", "context"] });
    expect(first.state.stars).toEqual(["rookie-01"]);
    expect(practice.state.stars).toEqual(["rookie-01"]);
    expect(statusFor(first.state, "rookie-02")).toBe("AVAILABLE");
  });
  it("uses actual typing criteria and rejects paste", () => {
    const mission = missionById["rookie-06"]!;
    expect(validateMission(mission, { completed: true, pasted: false, wpm: 15, accuracy: 95 }).passed).toBe(true);
    expect(validateMission(mission, { completed: true, pasted: true, wpm: 40, accuracy: 100 }).passed).toBe(false);
  });
  it("ships ten ranks with nine core missions and one promotion challenge each", () => {
    for (const rank of ["rookie", "scout", "apprentice", "craftsman", "specialist", "expert", "master", "grandmaster", "legend", "pinnacle"]) {
      const entries = missions.filter((mission) => mission.rankId === rank);
      expect(entries).toHaveLength(10);
      expect(entries.filter((mission) => !mission.isPromotion)).toHaveLength(9);
      expect(entries.filter((mission) => mission.isPromotion)).toHaveLength(1);
    }
  });
});
