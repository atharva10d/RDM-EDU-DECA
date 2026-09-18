import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { displayReferralCode } from "./displayReferralCode";

describe("displayReferralCode", () => {
  it("never shows the dummy EDUD1000 code", () => {
    assert.equal(displayReferralCode("EDUD1000"), null);
    assert.equal(displayReferralCode("edud1000"), null);
    assert.equal(displayReferralCode(""), null);
    assert.equal(displayReferralCode(undefined), null);
  });

  it("keeps the minted EduDeca code", () => {
    assert.equal(displayReferralCode("ED-267K2M9Q4A"), "ED-267K2M9Q4A");
  });
});
