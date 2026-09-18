export function toEdudecaProfileRow(input: {
  classGrade?: string;
  institution?: string;
  state?: string;
  city?: string;
}): {
  class_level?: 11 | 12;
  institution_name?: string;
  state?: string;
  city?: string;
} {
  const row: {
    class_level?: 11 | 12;
    institution_name?: string;
    state?: string;
    city?: string;
  } = {};
  if (input.classGrade) {
    row.class_level = input.classGrade.includes("12") ? 12 : 11;
  }
  if (input.institution?.trim()) row.institution_name = input.institution.trim();
  if (input.state?.trim()) row.state = input.state.trim();
  if (input.city?.trim()) row.city = input.city.trim();
  return row;
}
