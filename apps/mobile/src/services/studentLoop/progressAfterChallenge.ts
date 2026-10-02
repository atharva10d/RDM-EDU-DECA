export function progressAfterChallenge(
  current: {
    campaignLevel: number;
    todayCompleted: boolean;
    freeZoneComplete: boolean;
  },
  reason: "won" | "strikes" | "time" | "quit" | "below_threshold",
): {
  campaignLevel: number;
  level: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
} {
  if (reason !== "won") {
    return {
      campaignLevel: current.campaignLevel,
      level: current.campaignLevel,
      todayCompleted: current.todayCompleted,
      freeZoneComplete: current.freeZoneComplete,
    };
  }

  let campaignLevel = current.campaignLevel;
  let freeZoneComplete = current.freeZoneComplete;
  if (campaignLevel < 3) {
    campaignLevel += 1;
  } else if (campaignLevel === 3) {
    freeZoneComplete = true;
  }

  return {
    campaignLevel,
    level: campaignLevel,
    todayCompleted: false,
    freeZoneComplete,
  };
}
