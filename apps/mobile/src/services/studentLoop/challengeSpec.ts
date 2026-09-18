export function challengeMaxStrikes(campaignLevel: number): number {
  const level = Math.max(1, Math.floor(campaignLevel) || 1);
  if (level <= 1) return 5;
  if (level === 2) return 7;
  return 10;
}

export function challengeQuestionCount(campaignLevel: number): number {
  const level = Math.max(1, Math.floor(campaignLevel) || 1);
  if (level <= 1) return 10;
  if (level === 2) return 20;
  return 30;
}

export function challengeSessionDurationSec(campaignLevel: number): number {
  const level = Math.max(1, Math.floor(campaignLevel) || 1);
  if (level <= 1) return 5 * 60;
  if (level === 2) return 10 * 60;
  return 20 * 60;
}
