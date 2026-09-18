import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { TrackType, UserProfile } from '@edudeca/types';
import { displayReferralCode } from '../services/studentLoop/displayReferralCode';
import {
  APP_PERSIST_NAME,
  APP_PERSIST_VERSION,
  mergeAppPersist,
  migrateAppPersist,
  partializeAppPersist,
} from './persistSlice';

const secureStoreStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (_err) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (_err) {
      // Ignored
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (_err) {
      // Ignored
    }
  },
};

interface AppState {
  signOut: () => void;
  user: UserProfile;
  selectedTrack: TrackType;
  setUser: (userPartial: Partial<UserProfile>) => void;
  setUserProfile: (profile: UserProfile) => void;
  setSelectedTrack: (track: TrackType) => void;
  level: number;
  streak: number;
  rdmBalance: number;
  quizzesCompleted: number;
  updateUserStats: (stats: {
    level?: number;
    rdmBalance?: number;
    streak?: number;
    quizzesCompleted?: number;
  }) => void;
  incrementLevel: () => void;
  addRdm: (amount: number) => void;
  incrementStreak: () => void;
  incrementQuizzesCompleted: () => void;
  campaignLevel: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
  disciplines: string[];
  trialsRemaining: number;
  setProgress: (progress: Partial<AppState>) => void;
  resetState: () => void;
}

const initialProfile: UserProfile = {
  id: '',
  name: 'Student',
  email: '',
  classGrade: 'Class 11',
  scienceStream: true,
  institution: '',
  state: '',
  city: '',
  level4Consent: false,
  selectedTrack: 'A',
  level: 0,
  streak: 0,
  rdmBalance: 0,
  quizzesCompleted: 0,
  referralCode: '',
};

const initialSlice = {
  user: initialProfile,
  selectedTrack: 'A' as TrackType,
  level: 0,
  streak: 0,
  rdmBalance: 0,
  quizzesCompleted: 0,
  campaignLevel: 1,
  todayCompleted: false,
  freeZoneComplete: false,
  disciplines: [] as string[],
  trialsRemaining: 10,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialSlice,

      setProgress: (progress) =>
        set((state) => ({
          ...state,
          ...progress,
        })),

      signOut: () => set({ ...initialSlice }),

      setUser: (userPartial) =>
        set((state) => {
          const user = { ...state.user, ...userPartial };
          user.referralCode = displayReferralCode(user.referralCode) ?? '';
          return {
            user,
            ...(userPartial.level !== undefined ? { level: userPartial.level } : {}),
            ...(userPartial.rdmBalance !== undefined ? { rdmBalance: userPartial.rdmBalance } : {}),
            ...(userPartial.streak !== undefined ? { streak: userPartial.streak } : {}),
            ...(userPartial.quizzesCompleted !== undefined
              ? { quizzesCompleted: userPartial.quizzesCompleted }
              : {}),
            ...(userPartial.selectedTrack ? { selectedTrack: userPartial.selectedTrack } : {}),
          };
        }),

      setUserProfile: (profile) =>
        set((state) => ({
          user: {
            ...state.user,
            ...profile,
            referralCode:
              displayReferralCode(profile.referralCode || state.user.referralCode) ?? '',
          },
          level: profile.level ?? 0,
          rdmBalance: profile.rdmBalance ?? 0,
          streak: profile.streak ?? 0,
          quizzesCompleted: profile.quizzesCompleted ?? 0,
          selectedTrack: profile.selectedTrack || 'A',
        })),

      updateUserStats: (stats) =>
        set((state) => ({
          ...(stats.level !== undefined ? { level: stats.level } : {}),
          ...(stats.rdmBalance !== undefined ? { rdmBalance: stats.rdmBalance } : {}),
          ...(stats.streak !== undefined ? { streak: stats.streak } : {}),
          ...(stats.quizzesCompleted !== undefined
            ? { quizzesCompleted: stats.quizzesCompleted }
            : {}),
          user: {
            ...state.user,
            ...stats,
          },
        })),

      setSelectedTrack: (track) =>
        set((state) => ({
          selectedTrack: track,
          user: { ...state.user, selectedTrack: track },
        })),

      incrementLevel: () =>
        set((state) => {
          const nextLevel = Math.min(10, state.level + 1);
          return {
            level: nextLevel,
            user: { ...state.user, level: nextLevel },
          };
        }),

      addRdm: (amount) =>
        set((state) => {
          const newBal = state.rdmBalance + amount;
          return {
            rdmBalance: newBal,
            user: { ...state.user, rdmBalance: newBal },
          };
        }),

      incrementStreak: () =>
        set((state) => {
          const newStreak = state.streak + 1;
          return {
            streak: newStreak,
            user: { ...state.user, streak: newStreak },
          };
        }),

      incrementQuizzesCompleted: () =>
        set((state) => {
          const count = state.quizzesCompleted + 1;
          return {
            quizzesCompleted: count,
            user: { ...state.user, quizzesCompleted: count },
          };
        }),

      resetState: () => set({ ...initialSlice }),
    }),
    {
      name: APP_PERSIST_NAME,
      version: APP_PERSIST_VERSION,
      storage: createJSONStorage(() => secureStoreStorage),
      partialize: (state) => partializeAppPersist(state),
      migrate: (persisted, version) => migrateAppPersist(persisted, version),
      merge: (persisted, current) => mergeAppPersist(persisted, current),
    }
  )
);
