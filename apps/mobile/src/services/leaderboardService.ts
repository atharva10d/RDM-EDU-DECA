import { LeaderboardEntry } from '@edudeca/types';
import { edudecaApi } from './edudecaApi';
import { mapLeaderboardRows } from './studentLoop/mapLeaderboard';

async function fetchLiveLeaderboard(currentUserId?: string): Promise<LeaderboardEntry[]> {
  const payload = await edudecaApi.getLeaderboard();
  return mapLeaderboardRows(payload, currentUserId);
}

export const leaderboardService = {
  fetchLeaderboardByLevel: async (
    level: number,
    _limit: number = 50,
    userId?: string,
  ): Promise<LeaderboardEntry[]> => {
    const rows = await fetchLiveLeaderboard(userId);
    return rows.filter((row) => (row.level ?? 1) === level);
  },

  fetchGlobalLeaderboard: async (
    _limit: number = 50,
    _userId?: string,
  ): Promise<LeaderboardEntry[]> => {
    return [];
  },

  fetchXpLeaderboard: fetchLiveLeaderboard,
};
