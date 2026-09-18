export type ReferralMineEntry = {
  id: string;
  refereeUserId: string;
  name: string;
  initials: string;
  avatarColor: string;
  creditedAt: string;
};

export type ReferralMine = {
  code: string | null;
  shareUrl: string | null;
  entries: ReferralMineEntry[];
};

export function mapReferralMine(payload: unknown): ReferralMine {
  if (!payload || typeof payload !== "object") {
    return { code: null, shareUrl: null, entries: [] };
  }
  const body = payload as Record<string, unknown>;
  const code = typeof body.code === "string" && body.code.trim() ? body.code.trim() : null;
  const shareUrl =
    typeof body.shareUrl === "string" && body.shareUrl.trim() ? body.shareUrl.trim() : null;
  const rawEntries = Array.isArray(body.entries) ? body.entries : [];
  const entries: ReferralMineEntry[] = rawEntries.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const row = raw as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : "";
    const refereeUserId = typeof row.refereeUserId === "string" ? row.refereeUserId : "";
    const name =
      typeof row.name === "string" && row.name.trim() ? row.name.trim() : "Student";
    return [
      {
        id,
        refereeUserId,
        name,
        initials:
          typeof row.initials === "string" && row.initials.trim()
            ? row.initials.trim()
            : name.charAt(0).toUpperCase(),
        avatarColor: typeof row.avatarColor === "string" ? row.avatarColor : "",
        creditedAt: typeof row.creditedAt === "string" ? row.creditedAt : "",
      },
    ];
  });
  return { code, shareUrl, entries };
}
