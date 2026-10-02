import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapLeaderboardRows } from "./mapLeaderboard";

describe("mapLeaderboardRows", () => {
  it("maps API rows without full_name and highlights the session user", () => {
    const entries = mapLeaderboardRows(
      {
        rows: [
          {
            rank: 1,
            userId: "u1",
            name: "Student",
            institution: "Ryan International",
            xp: 120,
            campaignLevel: 2,
          },
        ],
      },
      "u1",
    );

    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.name, "Student");
    assert.equal(entries[0]?.institution, "Ryan International");
    assert.equal(entries[0]?.isCurrentUser, true);
    assert.equal(entries[0]?.rawScore, 120);
    assert.equal("full_name" in (entries[0] ?? {}), false);
  });

  it("returns [] for missing or invalid payloads", () => {
    assert.deepEqual(mapLeaderboardRows(null, "u1"), []);
    assert.deepEqual(mapLeaderboardRows({ rows: "nope" }, "u1"), []);
  });
});
