export function applyServerProgress(progress: {
  campaignLevel?: number;
  todayCompleted?: boolean;
  freeZoneComplete?: boolean;
  disciplines?: string[] | null;
  xp?: number;
  streakDays?: number;
}): {
  campaignLevel: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
  disciplines: string[];
  rdmBalance: number;
  streak: number;
  level: number;
} {
  const campaignLevel = Number(progress.campaignLevel) || 1;
  return {
    campaignLevel,
    todayCompleted: Boolean(progress.todayCompleted),
    freeZoneComplete: Boolean(progress.freeZoneComplete),
    disciplines: Array.isArray(progress.disciplines) ? progress.disciplines : [],
    rdmBalance: Number(progress.xp) || 0,
    streak: Number(progress.streakDays) || 0,
    level: campaignLevel,
  };
}
