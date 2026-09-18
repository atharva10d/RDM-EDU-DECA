export type LevelPathNodeStatus = "completed" | "current" | "locked";

export function levelPathStatus(
  nodeNumber: number,
  campaignLevel: number,
  isProctoredPaid = false,
): LevelPathNodeStatus {
  const n = Math.floor(nodeNumber) || 0;
  const campaign = Math.max(1, Math.floor(campaignLevel) || 1);

  if (n < campaign) return "completed";
  if (n === campaign) {
    if (n >= 4 && !isProctoredPaid) return "locked";
    return "current";
  }
  return "locked";
}

export function canStartLevel(
  nodeNumber: number,
  campaignLevel: number,
  isProctoredPaid = false,
): boolean {
  return levelPathStatus(nodeNumber, campaignLevel, isProctoredPaid) === "current";
}
