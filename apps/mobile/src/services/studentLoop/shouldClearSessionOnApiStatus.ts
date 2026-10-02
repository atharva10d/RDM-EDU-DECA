/** Website 401 is not proof that Google/Supabase session is dead. */
export function shouldClearSessionOnApiStatus(_status: number): boolean {
  return false;
}
