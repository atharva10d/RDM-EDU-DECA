import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { displayChallengeOptions } from "./displayChallengeOptions";

describe("displayChallengeOptions", () => {
  it("turns shuffled A/B/C/D keys into assertion–reason statements", () => {
    const stem =
      "Assertion: All metals are magnetic. Reason: Iron is magnetic.";
    const shown = displayChallengeOptions(stem, ["C", "D", "B", "A"]);
    assert.equal(shown[0], "Assertion is true, but Reason is false.");
    assert.equal(shown[1], "Assertion is false, but Reason is true.");
    assert.equal(
      shown[2],
      "Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.",
    );
    assert.equal(
      shown[3],
      "Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
    );
  });

  it("leaves ordinary MCQ wording alone", () => {
    const options = ["Newton", "Joule", "Watt", "Pascal"];
    assert.deepEqual(displayChallengeOptions("SI unit of force?", options), options);
  });
});
