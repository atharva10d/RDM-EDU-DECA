import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldReuseSupabaseSession } from "./reuseSupabaseSession";
import { shouldClearSessionOnApiStatus } from "./shouldClearSessionOnApiStatus";
import { mapProgressTableRow } from "./mapProgressTableRow";

describe("shouldReuseSupabaseSession", () => {
  it("reuses a live access token on app resume instead of forcing another Google prompt", () => {
    assert.equal(
      shouldReuseSupabaseSession({
        access_token: "jwt",
        expires_at: 2_000_000_000,
      }),
      true,
    );
  });

  it("does not reuse a live session when the student is choosing a Google account", () => {
    assert.equal(
      shouldReuseSupabaseSession(
        {
          access_token: "jwt",
          expires_at: 2_000_000_000,
        },
        Date.now() / 1000,
        "choose_account",
      ),
      false,
    );
  });

  it("does not reuse an expired or empty session", () => {
    assert.equal(shouldReuseSupabaseSession(null), false);
    assert.equal(
      shouldReuseSupabaseSession({ access_token: "jwt", expires_at: 1 }, 100),
      false,
    );
  });
});

describe("shouldClearSessionOnApiStatus", () => {
  it("does not sign out of Google when the website API returns 401", () => {
    assert.equal(shouldClearSessionOnApiStatus(401), false);
    assert.equal(shouldClearSessionOnApiStatus(403), false);
  });
});

describe("mapProgressTableRow", () => {
  it("maps a stored 10-discipline row so a returning student skips path pick", () => {
    const mapped = mapProgressTableRow({
      campaign_level: 1,
      xp: 40,
      streak_days: 2,
      free_zone_complete: false,
      last_challenge_date: null,
      disciplines: ["phy", "che", "bio", "biotech", "ent", "eng", "eco", "log", "gk", "fin"],
    });
    assert.equal(mapped.campaignLevel, 1);
    assert.equal(mapped.disciplines?.length, 10);
  });
});
