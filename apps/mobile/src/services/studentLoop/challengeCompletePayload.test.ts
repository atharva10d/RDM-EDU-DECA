import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildChallengeCompletePayload } from "./challengeCompletePayload";

describe("buildChallengeCompletePayload", () => {
  it("requires reason and campaignLevelAtStart 1–10", () => {
    assert.throws(() =>
      buildChallengeCompletePayload({
        reason: "won",
        correct: 8,
        total: 10,
        campaignLevelAtStart: 0,
        results: [],
      }),
    );
  });

  it("passes through web-shaped results", () => {
    const body = buildChallengeCompletePayload({
      reason: "strikes",
      correct: 2,
      total: 10,
      campaignLevelAtStart: 1,
      strikes: 5,
      results: [
        {
          questionId: "q-1",
          subjectId: "phy",
          isCorrect: true,
          skipped: false,
        },
      ],
    });
    assert.equal(body.reason, "strikes");
    assert.equal(body.campaignLevelAtStart, 1);
    assert.equal(body.results[0].questionId, "q-1");
  });
});
