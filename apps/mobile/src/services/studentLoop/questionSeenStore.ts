import { supabase } from "../../lib/supabase";
import type { SeenInsert } from "./questionSeen";

export async function listSeenQuestionIds(userId: string, level: number): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("edudeca_question_seen")
    .select("question_id")
    .eq("user_id", userId)
    .eq("level", level);

  if (error || !data) return new Set();

  const ids = new Set<string>();
  for (const row of data) {
    if (typeof row.question_id === "string") ids.add(row.question_id);
  }
  return ids;
}

export async function insertSeenRows(userId: string, rows: SeenInsert[]): Promise<void> {
  if (rows.length === 0) return;

  await supabase.from("edudeca_question_seen").upsert(
    rows.map((row) => ({
      user_id: userId,
      question_id: row.questionId,
      level: row.level,
      discipline_id: row.disciplineId,
      outcome: row.outcome,
    })),
    { onConflict: "user_id,question_id", ignoreDuplicates: true },
  );
}
