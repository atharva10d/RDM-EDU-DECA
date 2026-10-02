import { supabase } from "../../lib/supabase";
import { useAppStore } from "../../store/useAppStore";
import type { ChallengeQuestion } from "../edudecaApi";
import { challengeGroupsPerDiscipline } from "./challengeSpec";
import { canonicalLineup } from "./lineupPath";
import { parseQuestionOptions } from "./pickChallengeQuestions";
import { pickUnseenRound, studentClassFromGrade } from "./questionSeen";
import { listSeenQuestionIds } from "./questionSeenStore";
import { attemptSeed, shuffleChallengeOptions } from "./shuffle";

type QuestionRow = {
  id: string;
  discipline_id: string;
  stem: string;
  options: unknown;
  correct_index: number;
  level: number;
  published?: boolean | null;
  type?: string | null;
  chapter?: string | null;
  class_level?: string | null;
};

export async function loadChallengeQuestionsFromSupabase(
  level: number,
): Promise<ChallengeQuestion[]> {
  const lineup = canonicalLineup(useAppStore.getState().disciplines);
  if (lineup.length === 0) return [];

  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from("edudeca_discipline_questions")
    .select("id, discipline_id, stem, options, correct_index, level, published, type, chapter, class_level")
    .eq("level", level)
    .eq("published", true)
    .in("discipline_id", lineup);

  if (error || !data) return [];

  const rows = data as QuestionRow[];
  const seenIds = await listSeenQuestionIds(uid, level);
  const studentClass = studentClassFromGrade(useAppStore.getState().user.classGrade);
  const seed = attemptSeed(level, uid, lineup.join(","));
  const picked = pickUnseenRound({
    bank: rows.map((row) => ({
      id: row.id,
      disciplineId: row.discipline_id,
      level: row.level,
      published: row.published !== false,
      type: row.type,
      chapter: row.chapter,
      classLevel: row.class_level === "XI" || row.class_level === "XII" ? row.class_level : null,
    })),
    lineupIds: lineup,
    seenIds,
    level,
    seed,
    studentClass,
    perDiscipline: challengeGroupsPerDiscipline(level),
  });

  if (!picked.ok) return [];

  const byId = new Map(rows.map((row) => [row.id, row]));
  const questions: ChallengeQuestion[] = [];
  picked.questions.forEach((item, idx) => {
    const row = byId.get(item.id);
    if (!row) return;
    const options = parseQuestionOptions(row.options);
    if (options.length < 2) return;
    questions.push(
      shuffleChallengeOptions(
        {
          id: row.id,
          subjectId: row.discipline_id,
          stem: row.stem,
          options,
          correctIndex: row.correct_index,
        },
        seed + idx * 31,
      ),
    );
  });
  return questions;
}
