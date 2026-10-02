import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { applyServerProgress, mergeLoadedProgress } from "./applyServerProgress";

describe("applyServerProgress", () => {
  it("copies server campaign fields and does not invent a next level", () => {
    const next = applyServerProgress({
      campaignLevel: 2,
      todayCompleted: true,
      freeZoneComplete: false,
      disciplines: ["phy", "che"],
      xp: 80,
      streakDays: 3,
    });
    assert.equal(next.campaignLevel, 2);
    assert.equal(next.todayCompleted, true);
    assert.equal(next.rdmBalance, 80);
    assert.equal(next.streak, 3);
    assert.deepEqual(next.disciplines, ["phy", "che"]);
    assert.equal(next.selectedTrack, undefined);
  });

  it("sets track B when the saved lineup is Bio, not the Math default", () => {
    const next = applyServerProgress({
      disciplines: ["phy", "che", "bio", "biotech", "ent", "eng", "eco", "log", "gk", "fin"],
    });
    assert.equal(next.selectedTrack, "B");
  });

  it("maps Math UI aliases onto bank ids and track A", () => {
    const next = applyServerProgress({
      disciplines: ["phy", "chem", "math", "appliedmath", "ent", "eng", "eco", "log", "gk", "fin"],
    });
    assert.equal(next.selectedTrack, "A");
    assert.ok(next.disciplines.includes("mat"));
    assert.ok(next.disciplines.includes("amat"));
  });
});

describe("mergeLoadedProgress", () => {
  it("does not roll Home back to Level 1 after a Level 1 win", () => {
    const server = applyServerProgress({ campaignLevel: 1, disciplines: ["phy"] });
    const next = mergeLoadedProgress(2, server);
    assert.equal(next.campaignLevel, 2);
    assert.equal(next.level, 2);
  });
});
