import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canonicalDisciplineId,
  canonicalLineup,
  lineupForTrack,
  lineupAfterPendingTrack,
  lineupForHome,
  pathFromLineup,
  trackFromLineup,
} from "./lineupPath";
import { progressAfterChallenge } from "./progressAfterChallenge";

describe("lineupPath", () => {
  it("maps Math aliases onto bank ids and track A", () => {
    assert.equal(canonicalDisciplineId("math"), "mat");
    assert.equal(canonicalDisciplineId("appliedmath"), "amat");
    assert.equal(canonicalDisciplineId("chem"), "che");
    assert.equal(
      pathFromLineup(["phy", "che", "mat", "amat", "ent", "eng", "eco", "log", "gk", "fin"]),
      "math",
    );
    assert.equal(trackFromLineup(["mat", "amat"]), "A");
  });

  it("detects a Bio lineup even if the UI track defaulted to Math", () => {
    const lineup = canonicalLineup([
      "phy",
      "che",
      "bio",
      "biotech",
      "ent",
      "eng",
      "eco",
      "log",
      "gk",
      "fin",
    ]);
    assert.equal(pathFromLineup(lineup), "bio");
    assert.equal(trackFromLineup(lineup), "B");
  });

  it("writes Mathematics bank ids when the student picks track A", () => {
    const next = lineupForTrack("A", [
      "phy",
      "che",
      "bio",
      "biotech",
      "ent",
      "eng",
      "eco",
      "log",
      "gk",
      "fin",
    ]);
    assert.equal(pathFromLineup(next), "math");
    assert.ok(next.includes("mat"));
    assert.ok(next.includes("amat"));
    assert.equal(next.includes("bio"), false);
  });

  it("keeps Applied Mathematics after login when the server still has Bio", () => {
    const bio = [
      "phy",
      "che",
      "bio",
      "biotech",
      "ent",
      "eng",
      "eco",
      "log",
      "gk",
      "fin",
    ];
    const next = lineupAfterPendingTrack("A", bio);
    assert.equal(pathFromLineup(next), "math");
    assert.ok(next.includes("amat"));
    assert.equal(next.includes("bio"), false);
  });

  it("Home shows Math and Applied Math after Track A even if the server still has Bio", () => {
    const bio = [
      "phy",
      "che",
      "bio",
      "biotech",
      "ent",
      "eng",
      "eco",
      "log",
      "gk",
      "fin",
    ];
    const home = lineupForHome({
      pendingTrack: "A",
      selectedTrack: "A",
      disciplines: bio,
    });
    assert.equal(pathFromLineup(home), "math");
    assert.ok(home.includes("mat"));
    assert.ok(home.includes("amat"));
    assert.equal(home.includes("bio"), false);
  });

  it("does not overwrite a Bio lineup when the student did not pick a path this session", () => {
    const bio = [
      "phy",
      "che",
      "bio",
      "biotech",
      "ent",
      "eng",
      "eco",
      "log",
      "gk",
      "fin",
    ];
    assert.deepEqual(lineupAfterPendingTrack(null, bio), canonicalLineup(bio));
  });
});

describe("progressAfterChallenge", () => {
  it("advances to Level 2 on a Level 1 win without waiting for an app restart", () => {
    const next = progressAfterChallenge(
      { campaignLevel: 1, todayCompleted: false, freeZoneComplete: false },
      "won",
    );
    assert.equal(next.campaignLevel, 2);
    assert.equal(next.level, 2);
    assert.equal(next.todayCompleted, false);
  });

  it("keeps Level 1 after a fail", () => {
    const next = progressAfterChallenge(
      { campaignLevel: 1, todayCompleted: false, freeZoneComplete: false },
      "strikes",
    );
    assert.equal(next.campaignLevel, 1);
  });
});
