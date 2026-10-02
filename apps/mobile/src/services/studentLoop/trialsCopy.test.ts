import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatTrialsLeft } from "./trialsCopy";
import { challengeLoadFailureMessage } from "./challengeLoadFailure";
import { pickOneQuestionPerDiscipline, parseQuestionOptions } from "./pickChallengeQuestions";

describe("formatTrialsLeft", () => {
  it("shows remaining trials with no today wording", () => {
    assert.equal(formatTrialsLeft(10), "10 trials left");
    assert.equal(formatTrialsLeft(1), "1 trial left");
    assert.equal(formatTrialsLeft(0), "0 trials left");
    assert.equal(formatTrialsLeft(10).toLowerCase().includes("today"), false);
  });
});

describe("challengeLoadFailureMessage", () => {
  it("does not swallow Unauthorized as an empty quiz", () => {
    const message = challengeLoadFailureMessage({ status: 401, message: "Unauthorized" });
    assert.ok(message.length > 0);
    assert.notEqual(message, "");
  });
});

describe("pickOneQuestionPerDiscipline", () => {
  it("returns one mapped question per lineup slot", () => {
    const picked = pickOneQuestionPerDiscipline(
      [
        {
          id: "q-phy",
          discipline_id: "phy",
          stem: "Force is",
          options: ["A", "B", "C", "D"],
          correct_index: 0,
        },
        {
          id: "q-che",
          discipline_id: "che",
          stem: "NaCl is",
          options: '["w","x","y","z"]',
          correct_index: 1,
        },
      ],
      ["phy", "che"],
    );
    assert.equal(picked.length, 2);
    assert.equal(picked[0]?.id, "q-phy");
    assert.equal(picked[1]?.options[0], "w");
  });
});

describe("parseQuestionOptions", () => {
  it("parses json arrays", () => {
    assert.deepEqual(parseQuestionOptions('["a","b"]'), ["a", "b"]);
  });
});
