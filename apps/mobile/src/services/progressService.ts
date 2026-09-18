import { edudecaApi } from './edudecaApi';
import { useAppStore } from '../store/useAppStore';
import { applyServerProgress } from './studentLoop/applyServerProgress';

export const progressService = {
  /**
   * Fetch latest progress and trials, sync to Zustand store
   */
  loadProgress: async () => {
    const [progress, trials] = await Promise.all([
      edudecaApi.getProgress(),
      edudecaApi.getTrials(),
    ]);

    useAppStore.getState().setProgress({
      ...applyServerProgress(progress),
      ...(typeof trials.remaining === 'number'
        ? { trialsRemaining: trials.remaining }
        : {}),
    });
  },

  /**
   * Save discipline lineup and update local store
   */
  saveDisciplines: async (disciplines: string[]) => {
    await edudecaApi.patchProgress({ disciplines });
    useAppStore.getState().setProgress({ disciplines });
  }
};
