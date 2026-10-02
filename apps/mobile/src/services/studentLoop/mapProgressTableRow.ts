export function mapProgressTableRow(row: {
  campaign_level?: number | null;
  xp?: number | null;
  streak_days?: number | null;
  free_zone_complete?: boolean | null;
  last_challenge_date?: string | null;
  disciplines?: string[] | null;
}): {
  campaignLevel: number;
  xp: number;
  streakDays: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
  disciplines: string[];
  lastChallengeDate: string | null;
} {
  const lastChallengeDate =
    typeof row.last_challenge_date === "string" ? row.last_challenge_date.slice(0, 10) : null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    campaignLevel: Number(row.campaign_level) || 1,
    xp: Number(row.xp) || 0,
    streakDays: Number(row.streak_days) || 0,
    todayCompleted: lastChallengeDate === today,
    freeZoneComplete: Boolean(row.free_zone_complete),
    disciplines: Array.isArray(row.disciplines) ? row.disciplines.map(String) : [],
    lastChallengeDate,
  };
}
