export function toEdudecaProfileRow(input: {
  name?: string;
  email?: string;
  classGrade?: string;
  institution?: string;
  state?: string;
  city?: string;
}): {
  full_name?: string;
  email?: string;
  class_level?: 11 | 12;
  institution_name?: string;
  state?: string;
  city?: string;
} {
  const row: {
    full_name?: string;
    email?: string;
    class_level?: 11 | 12;
    institution_name?: string;
    state?: string;
    city?: string;
  } = {};
  if (input.name !== undefined) row.full_name = input.name;
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
