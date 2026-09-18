import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildChallengeCompletePayload } from "./challengeCompletePayload";
import { mapChallengeQuestion } from "./mapChallengeQuestion";

describe("quiz results keep server ids", () => {
  it("complete payload uses mapped id and subjectId", () => {
    const q = mapChallengeQuestion({
      id: "abc",
      subjectId: "che",
      stem: "Atomic number of carbon?",
      options: ["4", "6", "8", "12"],
      correctIndex: 1,
    });
    const body = buildChallengeCompletePayload({
      reason: "won",
      correct: 1,
      total: 1,
      campaignLevelAtStart: 1,
      results: [
        {
          questionId: q.id,
          subjectId: q.subjectId,
          isCorrect: true,
          skipped: false,
        },
      ],
    });
    assert.equal(body.results[0].questionId, "abc");
    assert.equal(body.results[0].subjectId, "che");
  });
});
