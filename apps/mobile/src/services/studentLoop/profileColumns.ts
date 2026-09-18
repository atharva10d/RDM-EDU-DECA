export function toEdudecaProfileRow(input: {
  name?: string;
  email?: string;
  classGrade?: string;
  institution?: string;
  state?: string;
  city?: string;
}): {
  email?: string;
  class_level?: 11 | 12;
  institution_name?: string;
  state?: string;
  city?: string;
} {
  const row: {
    email?: string;
    class_level?: 11 | 12;
    institution_name?: string;
    state?: string;
    city?: string;
  } = {};
  if (input.email !== undefined) row.email = input.email;
  if (input.classGrade) {
    row.class_level = input.classGrade.includes("12") ? 12 : 11;
  }
  if (input.institution?.trim()) row.institution_name = input.institution.trim();
  if (input.state?.trim()) row.state = input.state.trim();
  if (input.city?.trim()) row.city = input.city.trim();
  return row;
}

export function assertProfileWriteSucceeded(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export function level4ConsentFromProfile(
  profile: { level4_consent?: unknown } | null | undefined,
): boolean {
  return profile?.level4_consent === true;
}

const DUMMY_PROFILE_LABELS = new Set(
  ["viswa vignan", "all india", "whiz student"].map((s) => s),
);

export function honestProfileText(value: string | null | undefined): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return "—";
  if (DUMMY_PROFILE_LABELS.has(trimmed.toLowerCase())) return "—";
  return trimmed;
}

