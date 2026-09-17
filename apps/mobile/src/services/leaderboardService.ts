import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '@edudeca/types';

export const leaderboardService = {
  /**
   * Fetches leaderboard rankings for a specific level from edudeca_user_progress.
   * Ranks students by XP descending.
   */
  fetchLeaderboardByLevel: async (
    level: number,
    limit: number = 50,
    _userId?: string
  ): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('edudeca_user_progress')
      .select(`
        user_id,
        campaign_level,
        xp,
        streak
      `)
      .gte('campaign_level', level)
      .order('xp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.log('[Leaderboard] Fetch notice:', error?.message);
      return [];
    }

    // Fetch profile names for the user IDs
    const userIds = data.map((row: any) => row.user_id);
    const { data: profiles } = await supabase
      .from('edudeca_profiles')
      .select('id, full_name, institution')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    return data.map((row: any, idx: number) => {
      const profile = profileMap.get(row.user_id) || {};
      const xpVal = row.xp || 0;
      return {
        rank: idx + 1,
        userId: row.user_id,
        name: (profile as any).full_name || 'Whiz Student',
        institution: (profile as any).institution || 'EduDeca Student',
        score: `${xpVal} pts`,
        total: 10,
        time: '0s',
        rawScore: xpVal,
        rawTime: 0,
        level: row.campaign_level || 1,
        rdmBalance: xpVal,
        isCurrentUser: false, // Will be set by the screen
        color: 'teal',
      };
    });
  },

  /**
   * Fetches global leaderboard ranked by total XP across all levels.
   */
  fetchGlobalLeaderboard: async (
    limit: number = 50,
    _userId?: string
  ): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('edudeca_user_progress')
      .select(`
        user_id,
        campaign_level,
        xp,
        streak
      `)
      .order('xp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.log('[Leaderboard] Global fetch notice:', error?.message);
      return [];
    }

    // Fetch profile names
    const userIds = data.map((row: any) => row.user_id);
    const { data: profiles } = await supabase
      .from('edudeca_profiles')
      .select('id, full_name, institution')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    return data.map((row: any, idx: number) => {
      const profile = profileMap.get(row.user_id) || {};
      const xpVal = row.xp || 0;
      return {
        rank: idx + 1,
        userId: row.user_id,
        name: (profile as any).full_name || 'Whiz Student',
        institution: (profile as any).institution || 'EduDeca Student',
        score: `${xpVal} pts`,
        total: 10,
        time: '0s',
        rawScore: xpVal,
        rawTime: 0,
        level: row.campaign_level || 1,
        rdmBalance: xpVal,
        isCurrentUser: false,
        color: 'teal',
      };
    });
  },
};
