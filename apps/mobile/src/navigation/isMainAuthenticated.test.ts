import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isMainAuthenticated } from "./isMainAuthenticated";

describe("isMainAuthenticated", () => {
  it("opens Main only with a real session, 10 disciplines, and a complete profile", () => {
    assert.equal(
      isMainAuthenticated({
        hasSession: true,
        disciplineCount: 10,
        profileComplete: true,
        isGuest: false,
      }),
      true,
    );
  });

  it("rejects guest even if profile is filled", () => {
    assert.equal(
      isMainAuthenticated({
        hasSession: false,
        disciplineCount: 10,
        profileComplete: true,
        isGuest: true,
      }),
      false,
    );
  });

  it("rejects profile-only with no session", () => {
    assert.equal(
      isMainAuthenticated({
        hasSession: false,
        disciplineCount: 0,
        profileComplete: true,
        isGuest: false,
      }),
      false,
    );
  });

  it("keeps Auth when lineup is short", () => {
    assert.equal(
      isMainAuthenticated({
        hasSession: true,
        disciplineCount: 9,
        profileComplete: true,
        isGuest: false,
      }),
      false,
    );
  });
});
