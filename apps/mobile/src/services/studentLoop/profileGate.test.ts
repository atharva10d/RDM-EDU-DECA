import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isProfileGateComplete } from "./profileGate";

describe("isProfileGateComplete", () => {
  it("requires class, college, state, and city", () => {
    assert.equal(
      isProfileGateComplete({
        classGrade: "Class 11",
        institution: "KV",
        state: "Punjab",
        city: "Ludhiana",
      }),
      true,
    );
    assert.equal(
      isProfileGateComplete({
        classGrade: "Class 11",
        institution: "KV",
        state: "Punjab",
        city: "",
      }),
      false,
    );
  });
});
