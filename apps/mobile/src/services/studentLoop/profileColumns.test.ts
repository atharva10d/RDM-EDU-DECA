import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertProfileWriteSucceeded,
  honestProfileText,
  level4ConsentFromProfile,
  toEdudecaProfileRow,
} from "./profileColumns";

describe("toEdudecaProfileRow", () => {
  it("writes class, institution, location, and email — never full_name", () => {
    const row = toEdudecaProfileRow({
      name: "Ada Lovelace",
      email: "ada@example.com",
      classGrade: "Class 12",
      institution: "Ryan International",
      state: "Punjab",
      city: "Ludhiana",
    });
    assert.equal("full_name" in row, false);
    assert.equal(row.email, "ada@example.com");
    assert.equal(row.class_level, 12);
    assert.equal(row.institution_name, "Ryan International");
    assert.equal(row.state, "Punjab");
    assert.equal(row.city, "Ludhiana");
  });
});

describe("assertProfileWriteSucceeded", () => {
  it("throws the Supabase error message", () => {
    assert.throws(
      () => assertProfileWriteSucceeded({ message: "profile write failed" }),
      new Error("profile write failed"),
    );
  });

  it("accepts a successful Supabase result", () => {
    assert.doesNotThrow(() => assertProfileWriteSucceeded(null));
  });
});

describe("level4ConsentFromProfile", () => {
  it("is false when the column is missing — never granted by default", () => {
    assert.equal(level4ConsentFromProfile(null), false);
    assert.equal(level4ConsentFromProfile({}), false);
    assert.equal(level4ConsentFromProfile({ level4_consent: null }), false);
  });

  it("is true only when the column is exactly true", () => {
    assert.equal(level4ConsentFromProfile({ level4_consent: true }), true);
  });
});

describe("honestProfileText", () => {
  it("does not show dummy college or location labels", () => {
    assert.equal(honestProfileText("Viswa Vignan"), "—");
    assert.equal(honestProfileText("All India"), "—");
    assert.equal(honestProfileText("Whiz Student"), "—");
    assert.equal(honestProfileText("Ryan International"), "Ryan International");
  });
});
