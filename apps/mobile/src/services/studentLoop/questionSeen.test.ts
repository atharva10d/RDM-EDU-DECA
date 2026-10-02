import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  pickUnseenRound,
  seenInsertsFromRun,
  type PoolItem,
} from "./questionSeen";

function item(id: string, disciplineId: string, extra?: Partial<PoolItem>): PoolItem {
  return {
    id,
    disciplineId,
    level: extra?.level ?? 1,
    published: extra?.published ?? true,
    type: extra && "type" in extra ? extra.type : "TYPE 1 — X",
    chapter: extra?.chapter,
    classLevel: extra?.classLevel,
  };
}

const LINEUP = [
  "phy",
  "che",
  "mat",
  "amat",
  "ent",
  "eng",
  "eco",
  "log",
  "gk",
  "fin",
] as const;

function fullBank(): PoolItem[] {
  return LINEUP.flatMap((disc) => [
    item(`${disc}-a`, disc),
    item(`${disc}-b`, disc),
    item(`${disc}-c`, disc),
  ]);
}

describe("seenInsertsFromRun", () => {
  it("records correct, wrong, and skip so none of those cards return", () => {
    const rows = seenInsertsFromRun({
      level: 1,
      reason: "strikes",
      results: [
        { questionId: "phy-a", disciplineId: "phy", isCorrect: true },
        { questionId: "log-a", disciplineId: "log", isCorrect: false },
        { questionId: "gk-a", disciplineId: "gk", isCorrect: false, skipped: true },
      ],
    });
    assert.deepEqual(
      rows.map((r) => [r.questionId, r.outcome]),
      [
        ["phy-a", "correct"],
        ["log-a", "wrong"],
        ["gk-a", "skip"],
      ],
    );
  });
});

describe("pickUnseenRound", () => {
  it("does not repeat a question this student already saw", () => {
    const round = pickUnseenRound({
      bank: fullBank(),
      lineupIds: LINEUP,
      seenIds: new Set(["phy-a", "phy-b"]),
      level: 1,
      seed: 1,
      studentClass: "XI",
      perDiscipline: 1,
    });
    assert.equal(round.ok, true);
    if (!round.ok) return;
    const phy = round.questions.find((q) => q.disciplineId === "phy");
    assert.equal(phy?.id, "phy-c");
  });

  it("picks two unseen groups per discipline on Level 2", () => {
    const bank = LINEUP.flatMap((disc) => [
      item(`${disc}-t1`, disc, { type: "TYPE 1", level: 2 }),
      item(`${disc}-t2`, disc, { type: "TYPE 2", level: 2 }),
      item(`${disc}-t3`, disc, { type: "TYPE 3", level: 2 }),
    ]);
    const round = pickUnseenRound({
      bank,
      lineupIds: LINEUP,
      seenIds: new Set(["phy-t1"]),
      level: 2,
      seed: 4,
      studentClass: "XI",
      perDiscipline: 2,
    });
    assert.equal(round.ok, true);
    if (!round.ok) return;
    assert.equal(round.questions.length, 20);
    const phy = round.questions.filter((q) => q.disciplineId === "phy");
    assert.equal(phy.length, 2);
    assert.equal(phy.some((q) => q.id === "phy-t1"), false);
  });
});
