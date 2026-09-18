import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toEdudecaProfileRow } from "./profileColumns";

describe("toEdudecaProfileRow", () => {
  it("writes class_level 11/12 and institution_name", () => {
    const row = toEdudecaProfileRow({
      classGrade: "Class 12",
      institution: "Ryan International",
      state: "Punjab",
      city: "Ludhiana",
    });
    assert.equal(row.class_level, 12);
    assert.equal(row.institution_name, "Ryan International");
    assert.equal(row.state, "Punjab");
    assert.equal(row.city, "Ludhiana");
  });
});
