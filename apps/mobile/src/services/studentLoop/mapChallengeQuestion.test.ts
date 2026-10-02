import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapChallengeQuestion } from "./mapChallengeQuestion";

describe("mapChallengeQuestion", () => {
  it("maps stem/subjectId and keeps id + subjectId", () => {
    const mapped = mapChallengeQuestion({
      id: "q-phy-1",
      subjectId: "phy",
      stem: "SI unit of force?",
      options: ["Newton", "Joule", "Watt", "Pascal"],
      correctIndex: 0,
    });
    assert.equal(mapped.q, "SI unit of force?");
    assert.equal(mapped.id, "q-phy-1");
    assert.equal(mapped.subjectId, "phy");
    assert.equal(mapped.tag, "PHYSICS");
    assert.equal(mapped.correctIndex, 0);
    assert.deepEqual(mapped.options, ["Newton", "Joule", "Watt", "Pascal"]);
  });

  it("expands assertion–reason letter keys without moving the correct index", () => {
    const mapped = mapChallengeQuestion({
      id: "q-log-1",
      subjectId: "log",
      stem: "Assertion: All metals are magnetic. Reason: Iron is magnetic.",
      options: ["C", "D", "B", "A"],
      correctIndex: 1,
    });
    assert.equal(mapped.correctIndex, 1);
    assert.equal(mapped.options[1], "Assertion is false, but Reason is true.");
    assert.equal(mapped.tag, "ANALYTICAL");
  });
});
