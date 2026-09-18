const fs = require('fs');
const path = require('path');

const root = 'C:\\Studies\\RDM Intenship\\edu-deca-final';
const apiPath = path.join(root, 'apps/mobile/src/services/edudecaApi.ts');
const storePath = path.join(root, 'apps/mobile/src/store/useAppStore.ts');
const progSvcPath = path.join(root, 'apps/mobile/src/services/progressService.ts');

// 1. Update edudecaApi.ts
let apiCode = fs.readFileSync(apiPath, 'utf8');
apiCode = apiCode.replace(/method\?: 'GET' \| 'POST' \| 'PUT' \| 'DELETE';/, "method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';");
if (!apiCode.includes('patchProgress:')) {
  apiCode = apiCode.replace(
    /getProgress: \(\) =>\s+edudecaFetch<ProgressResponse>\('\/progress'\),/,
    "getProgress: () =>\n    edudecaFetch<ProgressResponse>('/progress'),\n\n  /**\n   * PATCH /api/progress - Save discipline lineup\n   */\n  patchProgress: (payload: { disciplines: string[] }) =>\n    edudecaFetch<any>('/progress', {\n      method: 'PATCH',\n      body: payload,\n    }),"
  );
}
fs.writeFileSync(apiPath, apiCode);
console.log('Updated edudecaApi.ts');

// 2. Update useAppStore.ts
let storeCode = fs.readFileSync(storePath, 'utf8');
if (!storeCode.includes('campaignLevel: number;')) {
  // Update AppState interface
  storeCode = storeCode.replace(
    /  \/\/ Reset\n  resetState: \(\) => void;\n}/,
    "  // Daily Challenge Progress State\n  campaignLevel: number;\n  todayCompleted: boolean;\n  freeZoneComplete: boolean;\n  disciplines: string[];\n  trialsRemaining: number;\n  setProgress: (progress: Partial<AppState>) => void;\n\n  // Reset\n  resetState: () => void;\n}"
  );
  
  // Update initial state
  storeCode = storeCode.replace(
    /      referredContacts: \[\],\n\n      loginDevOrGuest:/,
    "      referredContacts: [],\n      campaignLevel: 1,\n      todayCompleted: false,\n      freeZoneComplete: false,\n      disciplines: [],\n      trialsRemaining: 10,\n\n      setProgress: (progress) =>\n        set((state) => ({\n          ...state,\n          ...progress,\n        })),\n\n      loginDevOrGuest:"
  );

  // Update signOut
  storeCode = storeCode.replace(
    /          quizzesCompleted: 0,\n          referredContacts: \[\],\n        }\),/,
    "          quizzesCompleted: 0,\n          referredContacts: [],\n          campaignLevel: 1,\n          todayCompleted: false,\n          freeZoneComplete: false,\n          disciplines: [],\n          trialsRemaining: 10,\n        }),"
  );

  // Update resetState
  storeCode = storeCode.replace(
    /          quizzesCompleted: 0,\n          referredContacts: \[\],\n        }\),\n    \}\),/,
    "          quizzesCompleted: 0,\n          referredContacts: [],\n          campaignLevel: 1,\n          todayCompleted: false,\n          freeZoneComplete: false,\n          disciplines: [],\n          trialsRemaining: 10,\n        }),\n    }),"
  );
}
fs.writeFileSync(storePath, storeCode);
console.log('Updated useAppStore.ts');

// 3. Create progressService.ts
const progSvcCode = \import { edudecaApi } from './edudecaApi';
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
\;
fs.writeFileSync(progSvcPath, progSvcCode);
console.log('Created progressService.ts');
