export function visibleLeaderboardRows<T extends { userId?: string }>(
  rows: T[],
  currentUserId: string | undefined,
  size = 10,
): T[] {
  const windowSize = Math.max(1, Math.floor(size) || 10);
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const myIndex =
    currentUserId != null && currentUserId !== ""
      ? rows.findIndex((row) => row.userId === currentUserId)
      : -1;

  if (myIndex < 0) {
    return rows.slice(-windowSize);
  }

  const start = Math.max(0, myIndex - (windowSize - 1));
  return rows.slice(start, myIndex + 1);
}
