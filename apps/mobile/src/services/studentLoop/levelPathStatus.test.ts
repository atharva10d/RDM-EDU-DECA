import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canStartLevel, levelPathStatus } from "./levelPathStatus";

describe("levelPathStatus", () => {
  it("marks completed / current / locked around campaign Level 2", () => {
    assert.equal(levelPathStatus(1, 2), "completed");
    assert.equal(levelPathStatus(2, 2), "current");
    assert.equal(levelPathStatus(3, 2), "locked");
  });

  it("keeps unpaid Level 4+ locked even if it matches campaign", () => {
    assert.equal(levelPathStatus(4, 4, false), "locked");
    assert.equal(canStartLevel(4, 4, false), false);
    assert.equal(levelPathStatus(4, 4, true), "current");
  });

  it("only the current free-zone level can start", () => {
    assert.equal(canStartLevel(1, 2), false);
    assert.equal(canStartLevel(2, 2), true);
    assert.equal(canStartLevel(3, 2), false);
  });
});
