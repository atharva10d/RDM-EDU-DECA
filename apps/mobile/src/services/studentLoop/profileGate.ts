export function isProfileGateComplete(user: {
  classGrade?: string;
  institution?: string;
  state?: string;
  city?: string;
}): boolean {
  return Boolean(
    user.classGrade?.trim() &&
      user.institution?.trim() &&
      user.state?.trim() &&
      user.city?.trim(),
  );
}
