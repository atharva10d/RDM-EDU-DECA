export type AuthSessionIntent = "resume" | "choose_account";

export function shouldReuseSupabaseSession(
  session: { access_token?: string; expires_at?: number } | null,
  nowSec = Date.now() / 1000,
  intent: AuthSessionIntent = "resume",
): boolean {
  if (intent === "choose_account") return false;
  if (!session?.access_token) return false;
  if (typeof session.expires_at === "number" && session.expires_at <= nowSec + 30) {
    return false;
  }
  return true;
}
