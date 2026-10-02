import { canonicalLineup, trackFromLineup } from "./lineupPath";

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
  selectedTrack?: "A" | "B";
} {
  const campaignLevel = Number(progress.campaignLevel) || 1;
  const disciplines = canonicalLineup(progress.disciplines);
  const selectedTrack = trackFromLineup(disciplines) ?? undefined;
  return {
    campaignLevel,
    todayCompleted: Boolean(progress.todayCompleted),
    freeZoneComplete: Boolean(progress.freeZoneComplete),
    disciplines,
    rdmBalance: Number(progress.xp) || 0,
    streak: Number(progress.streakDays) || 0,
    level: campaignLevel,
    ...(selectedTrack ? { selectedTrack } : {}),
  };
}

export function mergeLoadedProgress<T extends { campaignLevel: number; level: number }>(
  localCampaignLevel: number,
  server: T,
): T {
  const campaignLevel = Math.max(
    Math.max(1, Number(localCampaignLevel) || 1),
    Math.max(1, Number(server.campaignLevel) || 1),
  );
  return {
    ...server,
    campaignLevel,
    level: campaignLevel,
  };
}
