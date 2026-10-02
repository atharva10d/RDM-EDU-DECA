export function isMainAuthenticated(input: {
  hasSession: boolean;
  disciplineCount: number;
  profileComplete: boolean;
  isGuest: boolean;
}): boolean {
  if (input.isGuest) return false;
  return input.hasSession && input.disciplineCount === 10 && input.profileComplete;
}
