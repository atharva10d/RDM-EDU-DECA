export function formatTrialsLeft(remaining: number): string {
  const count = Math.max(0, Math.floor(Number(remaining) || 0));
  return count === 1 ? "1 trial left" : `${count} trials left`;
}
