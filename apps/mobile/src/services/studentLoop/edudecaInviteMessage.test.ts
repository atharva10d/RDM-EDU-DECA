import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { edudecaInviteMessage } from "./edudecaInviteMessage";

describe("edudecaInviteMessage", () => {
  it("matches web share copy with the minted code and URL", () => {
    const text = edudecaInviteMessage(
      "https://edu-deca.vercel.app/join?ref=ED-267K2M9Q4A",
      "ED-267K2M9Q4A",
    );
    assert.equal(
      text.includes("My code: ED-267K2M9Q4A"),
      true,
    );
    assert.equal(text.includes("EDUD1000"), false);
    assert.equal(text.includes("https://edu-deca.vercel.app/join?ref=ED-267K2M9Q4A"), true);
  });
});
