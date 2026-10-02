import type { ChallengeQuestion } from "../edudecaApi";

export function parseQuestionOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String);
  } catch {
    return [];
  }
}

export type ChallengeQuestionRow = {
  id: string;
  discipline_id: string;
  stem: string;
  options: unknown;
  correct_index: number;
};

export function pickOneQuestionPerDiscipline(
  rows: ChallengeQuestionRow[],
  lineup: string[],
): ChallengeQuestion[] {
  const questions: ChallengeQuestion[] = [];
  for (const disciplineId of lineup) {
    const row = rows.find((item) => item.discipline_id === disciplineId);
    if (!row) continue;
    const options = parseQuestionOptions(row.options);
    if (options.length < 2) continue;
    questions.push({
      id: row.id,
      subjectId: row.discipline_id,
      stem: row.stem,
      options,
      correctIndex: row.correct_index,
    });
  }
  return questions;
}
