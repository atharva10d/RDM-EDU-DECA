export type ChallengeReason =
  | "won"
  | "strikes"
  | "time"
  | "below_threshold"
  | "quit";

export type ChallengeCompletePayload = {
  reason: ChallengeReason;
  correct: number;
  total: number;
  campaignLevelAtStart: number;
  results: Array<{
    questionId: string;
    subjectId: string;
    isCorrect: boolean;
    skipped?: boolean;
  }>;
  strikes?: number;
};

const REASONS: ChallengeReason[] = [
  "won",
  "strikes",
  "time",
  "below_threshold",
  "quit",
];

export function buildChallengeCompletePayload(
  input: ChallengeCompletePayload,
): ChallengeCompletePayload {
  if (!REASONS.includes(input.reason)) {
    throw new Error("Invalid reason");
  }
  const level = Number(input.campaignLevelAtStart);
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new Error("Invalid level");
  }
  return {
    reason: input.reason,
    correct: input.correct,
    total: input.total,
    campaignLevelAtStart: level,
    results: input.results,
    ...(typeof input.strikes === "number" ? { strikes: input.strikes } : {}),
  };
}
