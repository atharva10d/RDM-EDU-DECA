import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { visibleLeaderboardRows } from "./visibleLeaderboardRows";

function row(rank: number, userId: string) {
  return { rank, userId };
}

describe("visibleLeaderboardRows", () => {
  it("keeps my rank and the 10 ranks ending at me", () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i + 1, `u${i + 1}`));
    const visible = visibleLeaderboardRows(rows, "u15", 10);
    assert.equal(visible.length, 10);
    assert.equal(visible[0]?.userId, "u6");
    assert.equal(visible[9]?.userId, "u15");
  });

  it("does not pad above rank 1 when I am near the top", () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i + 1, `u${i + 1}`));
    const visible = visibleLeaderboardRows(rows, "u3", 10);
    assert.deepEqual(
      visible.map((r) => r.userId),
      ["u1", "u2", "u3"],
    );
  });

  it("falls back to the last 10 when I am not on the board", () => {
    const rows = Array.from({ length: 20 }, (_, i) => row(i + 1, `u${i + 1}`));
    const visible = visibleLeaderboardRows(rows, "missing", 10);
    assert.equal(visible.length, 10);
    assert.equal(visible[0]?.userId, "u11");
    assert.equal(visible[9]?.userId, "u20");
  });
});
