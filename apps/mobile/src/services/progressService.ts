import { edudecaApi } from './edudecaApi';
import { useAppStore } from '../store/useAppStore';

export const progressService = {
  /**
   * Fetch latest progress and trials, sync to Zustand store
   */
  loadProgress: async () => {
    try {
      // Parallel fetch for speed
      const [progress, trials] = await Promise.all([
        edudecaApi.getProgress().catch(() => null),
        edudecaApi.getTrials().catch(() => null)
      ]);

      if (progress) {
        useAppStore.getState().setProgress({
          campaignLevel: progress.campaign_level || 1,
          todayCompleted: !!progress.todayCompleted,
          freeZoneComplete: !!progress.freeZoneComplete,
          disciplines: progress.disciplines || [],
        });
      }

      if (trials) {
        useAppStore.getState().setProgress({
          trialsRemaining: trials.trials_remaining ?? 10,
        });
      }
    } catch (err) {
      console.log('Failed to load progress', err);
    }
  },

  /**
   * Save discipline lineup and update local store
   */
  saveDisciplines: async (disciplines: string[]) => {
    await edudecaApi.patchProgress({ disciplines });
    useAppStore.getState().setProgress({ disciplines });
  }
};
