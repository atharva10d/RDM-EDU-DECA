import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  challengeMaxStrikes,
  challengeQuestionCount,
  challengeSessionDurationSec,
  challengeGroupsPerDiscipline,
} from "./challengeSpec";

describe("challengeSpec", () => {
  it("uses 10 questions, 5 strikes, 5 minutes on Level 1", () => {
    assert.equal(challengeQuestionCount(1), 10);
    assert.equal(challengeMaxStrikes(1), 5);
    assert.equal(challengeSessionDurationSec(1), 5 * 60);
    assert.equal(challengeGroupsPerDiscipline(1), 1);
  });

  it("uses 20 questions, 7 strikes, 10 minutes on Level 2", () => {
    assert.equal(challengeQuestionCount(2), 20);
    assert.equal(challengeMaxStrikes(2), 7);
    assert.equal(challengeSessionDurationSec(2), 10 * 60);
    assert.equal(challengeGroupsPerDiscipline(2), 2);
  });

  it("uses 30 questions, 10 strikes, 20 minutes on Level 3+", () => {
    assert.equal(challengeQuestionCount(3), 30);
    assert.equal(challengeMaxStrikes(3), 10);
    assert.equal(challengeSessionDurationSec(3), 20 * 60);
    assert.equal(challengeGroupsPerDiscipline(3), 3);
    assert.equal(challengeQuestionCount(10), 30);
    assert.equal(challengeMaxStrikes(10), 10);
    assert.equal(challengeSessionDurationSec(10), 20 * 60);
  });
});
