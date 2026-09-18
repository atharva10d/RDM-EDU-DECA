import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapReferralMine } from "./mapReferralMine";

describe("mapReferralMine", () => {
  it("reads minted code, share URL, and attributed list", () => {
    const mine = mapReferralMine({
      code: "ABCD12",
      shareUrl: "https://edu-deca.vercel.app/join?ref=ABCD12",
      count: 1,
      entries: [
        {
          id: "att-1",
          refereeUserId: "u2",
          name: "Student",
          initials: "S",
          avatarColor: "#0f0",
          creditedAt: "2026-09-18T00:00:00.000Z",
        },
      ],
    });

    assert.equal(mine.code, "ABCD12");
    assert.equal(mine.shareUrl, "https://edu-deca.vercel.app/join?ref=ABCD12");
    assert.equal(mine.entries.length, 1);
    assert.equal(mine.entries[0]?.name, "Student");
  });

  it("returns empty mine when the payload is missing", () => {
    const mine = mapReferralMine(null);
    assert.equal(mine.code, null);
    assert.equal(mine.shareUrl, null);
    assert.deepEqual(mine.entries, []);
  });
});
