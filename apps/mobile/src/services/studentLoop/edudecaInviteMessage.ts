export function edudecaInviteMessage(shareUrl: string, code: string | null): string {
  const codeLine = code ? `\nMy code: ${code}` : "";
  return `Hey! Join me on EduDeca — India's National Academic Decathlon. Compete across 10 disciplines and climb the national leaderboard.${codeLine}\n\n${shareUrl}`;
}
