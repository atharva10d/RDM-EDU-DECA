const ALIASES: Record<string, string> = {
  chem: "che",
  chemistry: "che",
  math: "mat",
  maths: "mat",
  mathematics: "mat",
  appliedmath: "amat",
  "applied math": "amat",
  "applied mathematics": "amat",
  biology: "bio",
  biotechnology: "biotech",
};

export function canonicalDisciplineId(id: string): string {
  const key = id.trim().toLowerCase();
  return ALIASES[key] ?? key;
}

export function canonicalLineup(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    .map(canonicalDisciplineId);
}

export function pathFromLineup(ids: string[]): "math" | "bio" | null {
  const set = new Set(canonicalLineup(ids));
  if (set.has("mat") || set.has("amat")) return "math";
  if (set.has("bio") || set.has("biotech")) return "bio";
  return null;
}

export function trackFromLineup(ids: string[]): "A" | "B" | null {
  const path = pathFromLineup(ids);
  if (path === "math") return "A";
  if (path === "bio") return "B";
  return null;
}

const CORE_IDS = ["phy", "che", "ent", "eng", "eco", "log", "gk", "fin"];
const PATH_IDS = new Set(["mat", "amat", "bio", "biotech"]);

export function lineupForTrack(track: "A" | "B", existing?: unknown): string[] {
  const pair = track === "A" ? ["mat", "amat"] : ["bio", "biotech"];
  const current = canonicalLineup(existing).filter((id) => !PATH_IDS.has(id));
  const cores = current.length >= 8 ? current.slice(0, 8) : CORE_IDS;
  return [...cores, ...pair];
}

export function lineupAfterPendingTrack(
  pendingTrack: "A" | "B" | null | undefined,
  serverDisciplines: unknown,
): string[] {
  const server = canonicalLineup(serverDisciplines);
  if (pendingTrack !== "A" && pendingTrack !== "B") return server;
  return lineupForTrack(pendingTrack, server);
}

/** Home and quiz must show the track the student just picked, not a stale Bio row. */
export function lineupForHome(args: {
  pendingTrack?: "A" | "B" | null;
  selectedTrack?: "A" | "B" | null;
  disciplines: unknown;
}): string[] {
  const pending =
    args.pendingTrack === "A" || args.pendingTrack === "B" ? args.pendingTrack : null;
  if (pending) return lineupForTrack(pending, args.disciplines);
  const current = canonicalLineup(args.disciplines);
  if (current.length === 10 && trackFromLineup(current)) return current;
  const selected =
    args.selectedTrack === "A" || args.selectedTrack === "B" ? args.selectedTrack : null;
  if (selected) return lineupForTrack(selected, current);
  return current;
}
