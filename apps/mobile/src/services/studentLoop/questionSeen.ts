import { hashSeed, shuffleWithSeed } from "./shuffle";

export type ChallengeRoundOutcome = "correct" | "wrong" | "skip";
export type ChallengeSummaryReason = "won" | "strikes" | "time" | "below_threshold" | "quit";

export type PoolItem = {
  id: string;
  disciplineId: string;
  level: number;
  published: boolean;
  type?: string | null;
  chapter?: string | null;
  classLevel?: "XI" | "XII" | null;
};

export type SeenCardInput = {
  questionId: string;
  disciplineId: string;
  isCorrect: boolean;
  skipped?: boolean;
};

export type SeenInsert = {
  questionId: string;
  disciplineId: string;
  level: number;
  outcome: ChallengeRoundOutcome;
};

export type PickUnseenRoundArgs = {
  bank: PoolItem[];
  lineupIds: readonly string[];
  seenIds: ReadonlySet<string>;
  level: number;
  seed: number;
  studentClass: "XI" | "XII";
  perDiscipline: number;
};

export type PickUnseenRoundResult =
  | { ok: true; questions: PoolItem[] }
  | { ok: false; missing: string[] };

export function poolGroupKey(item: PoolItem): string | null {
  const typed = typeof item.type === "string" ? item.type.trim() : "";
  if (typed) return typed;
  const chapter = typeof item.chapter === "string" ? item.chapter.trim() : "";
  return chapter || `id:${item.id}`;
}

export function matchesStudentClass(item: PoolItem, studentClass: "XI" | "XII"): boolean {
  if (item.classLevel == null) return true;
  return item.classLevel === studentClass;
}

export function outcomeFromSeenCard(card: SeenCardInput): ChallengeRoundOutcome {
  if (card.isCorrect) return "correct";
  if (card.skipped) return "skip";
  return "wrong";
}

export function seenInsertsFromRun(args: {
  level: number;
  reason: ChallengeSummaryReason;
  results: SeenCardInput[];
}): SeenInsert[] {
  void args.reason;
  const seen = new Set<string>();
  const rows: SeenInsert[] = [];
  for (const card of args.results) {
    if (seen.has(card.questionId)) continue;
    seen.add(card.questionId);
    rows.push({
      questionId: card.questionId,
      disciplineId: card.disciplineId,
      level: args.level,
      outcome: outcomeFromSeenCard(card),
    });
  }
  return rows;
}

export function pickUnseenRound(args: PickUnseenRoundArgs): PickUnseenRoundResult {
  const eligible = args.bank.filter(
    (row) =>
      row.published &&
      row.level === args.level &&
      !args.seenIds.has(row.id) &&
      matchesStudentClass(row, args.studentClass),
  );

  const missing: string[] = [];
  const picked: PoolItem[] = [];

  for (const disciplineId of args.lineupIds) {
    const pool = eligible.filter((row) => row.disciplineId === disciplineId);
    const buckets = new Map<string, PoolItem[]>();
    for (const row of pool) {
      const key = poolGroupKey(row);
      if (key == null) continue;
      const bucket = buckets.get(key) ?? [];
      bucket.push(row);
      buckets.set(key, bucket);
    }

    if (buckets.size < args.perDiscipline) {
      missing.push(disciplineId);
      continue;
    }

    const chosenKeys = shuffleWithSeed(
      [...buckets.keys()],
      hashSeed(`${args.seed}|${disciplineId}|groups`),
    ).slice(0, args.perDiscipline);
    for (const key of chosenKeys) {
      const choice = shuffleWithSeed(
        buckets.get(key) ?? [],
        hashSeed(`${args.seed}|${disciplineId}|${key}`),
      )[0];
      if (choice) picked.push(choice);
    }
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    questions: shuffleWithSeed(picked, args.seed),
  };
}

export function studentClassFromGrade(grade: string | undefined): "XI" | "XII" {
  const raw = (grade || "").toUpperCase();
  if (raw.includes("12") || raw.includes("XII")) return "XII";
  return "XI";
}
