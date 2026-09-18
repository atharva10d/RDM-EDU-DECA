import type { ChallengeQuestion } from "../edudecaApi";
import type { AccentColorKey, DisciplineTag } from "@edudeca/types";

const DISCIPLINE_MAP: Record<string, { tag: DisciplineTag; color: AccentColorKey }> = {
  phy: { tag: "PHYSICS", color: "teal" },
  physics: { tag: "PHYSICS", color: "teal" },
  che: { tag: "CHEMISTRY", color: "amber" },
  chemistry: { tag: "CHEMISTRY", color: "amber" },
  mat: { tag: "MATHS", color: "purple" },
  maths: { tag: "MATHS", color: "purple" },
  amat: { tag: "APPLIED MATH", color: "blue" },
  "applied math": { tag: "APPLIED MATH", color: "blue" },
  bio: { tag: "BIOLOGY", color: "pink" },
  biology: { tag: "BIOLOGY", color: "pink" },
  biotech: { tag: "BIOTECHNOLOGY", color: "teal" },
  biotechnology: { tag: "BIOTECHNOLOGY", color: "teal" },
  ent: { tag: "ENTREPRENEURSHIP", color: "gold" },
  entrepreneurship: { tag: "ENTREPRENEURSHIP", color: "gold" },
  eng: { tag: "VERBAL", color: "blue" },
  verbal: { tag: "VERBAL", color: "blue" },
  eco: { tag: "QUANTITATIVE", color: "amber" },
  quantitative: { tag: "QUANTITATIVE", color: "amber" },
  log: { tag: "ANALYTICAL", color: "purple" },
  analytical: { tag: "ANALYTICAL", color: "purple" },
  gk: { tag: "GK", color: "teal" },
  fin: { tag: "FINLIT", color: "gold" },
  finlit: { tag: "FINLIT", color: "gold" },
};

export type MappedChallengeQuestion = {
  id: string;
  subjectId: string;
  tag: DisciplineTag;
  color: AccentColorKey;
  q: string;
  options: string[];
  correctIndex: number;
};

export function mapChallengeQuestion(
  q: ChallengeQuestion,
): MappedChallengeQuestion {
  if (!q.id) {
    throw new Error("Missing question id");
  }
  if (!Array.isArray(q.options) || q.options.length === 0) {
    throw new Error("Invalid options");
  }

  const subjectId = String(q.subjectId || q.discipline || "");
  const key = subjectId.toLowerCase().trim();
  const mapping = DISCIPLINE_MAP[key] || { tag: "PHYSICS" as DisciplineTag, color: "teal" as AccentColorKey };

  return {
    id: q.id,
    subjectId,
    tag: mapping.tag,
    color: mapping.color,
    q: String(q.stem || q.question || ""),
    options: q.options,
    correctIndex: q.correctIndex ?? q.correct_index ?? 0,
  };
}
