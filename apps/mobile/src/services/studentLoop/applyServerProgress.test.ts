import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { applyServerProgress } from "./applyServerProgress";

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
  });
});
