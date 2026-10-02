import { LeaderboardEntry } from "@edudeca/types";

export type LeaderboardApiRow = {
  rank?: number;
  userId?: string;
  name?: string;
  institution?: string | null;
  xp?: number;
  campaignLevel?: number;
};

export function mapLeaderboardRows(
  payload: unknown,
  currentUserId?: string,
): LeaderboardEntry[] {
  if (!payload || typeof payload !== "object") return [];
  const rows = (payload as { rows?: unknown }).rows;
  if (!Array.isArray(rows)) return [];

  return rows.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as LeaderboardApiRow;
    const userId = typeof row.userId === "string" ? row.userId : "";
    const xp = Number(row.xp) || 0;
    const campaignLevel = Number(row.campaignLevel) || 1;
    const institution =
      typeof row.institution === "string" && row.institution.trim()
        ? row.institution.trim()
        : undefined;
    return [
      {
        rank: Number(row.rank) || index + 1,
        userId,
        name: "Student",
        institution,
        score: `${xp} XP`,
        time: `Lv ${campaignLevel}`,
        rawScore: xp,
        rawTime: 0,
        level: campaignLevel,
        rdmBalance: xp,
        isCurrentUser: Boolean(currentUserId && userId === currentUserId),
        color: "teal",
      },
    ];
  });
}
