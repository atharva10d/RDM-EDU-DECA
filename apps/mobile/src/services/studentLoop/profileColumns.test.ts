import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertProfileWriteSucceeded,
  toEdudecaProfileRow,
} from "./profileColumns";

describe("toEdudecaProfileRow", () => {
  it("writes identity, class, institution, and location fields", () => {
    const row = toEdudecaProfileRow({
      name: "Ada Lovelace",
      email: "ada@example.com",
      classGrade: "Class 12",
      institution: "Ryan International",
      state: "Punjab",
      city: "Ludhiana",
    });
    assert.equal(row.full_name, "Ada Lovelace");
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
