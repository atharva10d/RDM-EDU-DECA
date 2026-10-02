import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { googleSignInMode } from "./googleSignInMode";

describe("googleSignInMode", () => {
  it("is native only on a dev-client/APK with RNGoogleSignin", () => {
    assert.equal(
      googleSignInMode({ appOwnership: null, hasNativeModule: true }),
      "native",
    );
  });

  it("is unsupported in Expo Go", () => {
    assert.equal(
      googleSignInMode({ appOwnership: "expo", hasNativeModule: true }),
      "unsupported",
    );
  });

  it("is unsupported without the native module", () => {
    assert.equal(
      googleSignInMode({ appOwnership: null, hasNativeModule: false }),
      "unsupported",
    );
  });
});
