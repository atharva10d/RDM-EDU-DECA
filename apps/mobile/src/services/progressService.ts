import { edudecaApi, unwrapProgress, type ProgressResponse } from './edudecaApi';
import { useAppStore } from '../store/useAppStore';
import { applyServerProgress, mergeLoadedProgress } from './studentLoop/applyServerProgress';
import { mapProgressTableRow } from './studentLoop/mapProgressTableRow';
import { canonicalLineup, trackFromLineup, lineupForHome } from './studentLoop/lineupPath';
import { progressAfterChallenge } from './studentLoop/progressAfterChallenge';
import { seenInsertsFromRun, type ChallengeSummaryReason } from './studentLoop/questionSeen';
import { insertSeenRows } from './studentLoop/questionSeenStore';
import { supabase } from '../lib/supabase';

async function loadProgressFromSupabase(): Promise<ProgressResponse | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('edudeca_user_progress')
    .select(
      'campaign_level, xp, streak_days, free_zone_complete, last_challenge_date, disciplines',
    )
    .eq('user_id', uid)
    .maybeSingle();

  if (error || !data) return null;
  return unwrapProgress(mapProgressTableRow(data));
}

async function hydrateProgress(progress: ProgressResponse, extra: { trialsRemaining?: number } = {}) {
  const applied = mergeLoadedProgress(useAppStore.getState().campaignLevel, {
    ...applyServerProgress(progress),
    ...extra,
  });
  const pending = useAppStore.getState().pendingPathTrack;
  const lineup = lineupForHome({
    pendingTrack: pending,
    selectedTrack: applied.selectedTrack,
    disciplines: applied.disciplines,
  });
  const selectedTrack =
    pending === 'A' || pending === 'B'
      ? pending
      : trackFromLineup(lineup) ?? applied.selectedTrack;
  useAppStore.getState().setProgress({
    ...applied,
    disciplines: lineup,
    ...(selectedTrack ? { selectedTrack } : {}),
  });
  if (pending !== 'A' && pending !== 'B') return;
  if (trackFromLineup(applied.disciplines) === pending) {
    useAppStore.getState().setPendingPathTrack(null);
    return;
  }
  try {
    await progressService.saveDisciplines(lineup);
  } catch {
    // Keep pending so Home stays on the picked track until the server catches up.
  }
}

export const progressService = {
  /**
   * Fetch latest progress and trials, sync to Zustand store
   */
  loadProgress: async () => {
    try {
      const [progress, trials] = await Promise.all([
        edudecaApi.getProgress(),
        edudecaApi.getTrials(),
      ]);
      await hydrateProgress(
        progress,
        typeof trials.remaining === 'number' ? { trialsRemaining: trials.remaining } : {},
      );
    } catch (err) {
      const fallback = await loadProgressFromSupabase();
      if (!fallback) throw err;
      await hydrateProgress(fallback);
    }
  },

  /**
   * Save discipline lineup and update local store
   */
  saveDisciplines: async (disciplines: string[]) => {
    const lineup = canonicalLineup(disciplines);
    const selectedTrack = trackFromLineup(lineup);
    try {
      await edudecaApi.patchProgress({ disciplines: lineup });
    } catch (err) {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) throw err;
      const { error } = await supabase
        .from('edudeca_user_progress')
        .update({ disciplines: lineup })
        .eq('user_id', uid);
      if (error) throw err;
    }
    useAppStore.getState().setProgress({
      disciplines: lineup,
      ...(selectedTrack ? { selectedTrack } : {}),
    });
  },

  persistChallengeOutcome: async (
    reason: 'won' | 'strikes' | 'time' | 'quit' | 'below_threshold',
    campaignLevelAtStart?: number,
  ) => {
    const state = useAppStore.getState();
    const next = progressAfterChallenge(
      {
        campaignLevel: campaignLevelAtStart ?? state.campaignLevel,
        todayCompleted: state.todayCompleted,
        freeZoneComplete: state.freeZoneComplete,
      },
      reason,
    );
    useAppStore.getState().setProgress(next);

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid || reason !== 'won') return next;

    try {
      await supabase
        .from('edudeca_user_progress')
        .update({
          campaign_level: next.campaignLevel,
          free_zone_complete: next.freeZoneComplete,
        })
        .eq('user_id', uid);
    } catch {
      // Local campaign level still advanced so Home can show Level 2.
    }

    return next;
  },

  persistSeenFromResults: async (args: {
    level: number;
    reason: ChallengeSummaryReason;
    results: Array<{ questionId: string; subjectId: string; isCorrect: boolean; skipped?: boolean }>;
  }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) return;
    const rows = seenInsertsFromRun({
      level: args.level,
      reason: args.reason,
      results: args.results.map((row) => ({
        questionId: row.questionId,
        disciplineId: row.subjectId,
        isCorrect: row.isCorrect,
        skipped: row.skipped === true,
      })),
    });
    try {
      await insertSeenRows(uid, rows);
    } catch {
      // Next load still excludes ids that did persist.
    }
  },
};
