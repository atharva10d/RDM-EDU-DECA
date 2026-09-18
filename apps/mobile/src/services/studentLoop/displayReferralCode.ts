export function displayReferralCode(
  code: string | null | undefined,
): string | null {
  const trimmed = typeof code === "string" ? code.trim() : "";
  if (!trimmed) return null;
  if (trimmed.toUpperCase() === "EDUD1000") return null;
  return trimmed;
}
