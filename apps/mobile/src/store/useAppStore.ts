import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { TrackType, UserProfile, ReferredContact } from '@edudeca/types';

// Custom Expo SecureStore adapter for Zustand persistence in Expo Go & native builds
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
  // Auth state
  isGuestOrDevAuthenticated: boolean;
  loginDevOrGuest: (userPartial?: Partial<UserProfile>) => void;
  signOut: () => void;

  // User & Profile
  user: UserProfile;
  selectedTrack: TrackType;
  setUser: (userPartial: Partial<UserProfile>) => void;
  setUserProfile: (profile: UserProfile) => void;
  setSelectedTrack: (track: TrackType) => void;

  // Gamification Metrics
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

  // Referral State
  referredContacts: ReferredContact[];
  setReferredContacts: (contacts: ReferredContact[]) => void;
  addReferredContact: (contact: ReferredContact) => void;

  // Reset
  resetState: () => void;
}

const initialProfile: UserProfile = {
  id: 'user_dev_01',
  name: 'Student Whiz',
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
  referralCode: 'EDUD1000',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isGuestOrDevAuthenticated: false,
      user: initialProfile,
      selectedTrack: 'A',
      level: 0,
      streak: 0,
      rdmBalance: 0,
      quizzesCompleted: 0,
      referredContacts: [],

      loginDevOrGuest: (userPartial) =>
        set((state) => ({
          isGuestOrDevAuthenticated: true,
          user: { ...state.user, ...(userPartial || {}) },
          ...(userPartial?.level !== undefined ? { level: userPartial.level } : {}),
          ...(userPartial?.rdmBalance !== undefined ? { rdmBalance: userPartial.rdmBalance } : {}),
          ...(userPartial?.streak !== undefined ? { streak: userPartial.streak } : {}),
          ...(userPartial?.quizzesCompleted !== undefined
            ? { quizzesCompleted: userPartial.quizzesCompleted }
            : {}),
        })),

      signOut: () =>
        set({
          isGuestOrDevAuthenticated: false,
          user: initialProfile,
          selectedTrack: 'A',
          level: 0,
          streak: 0,
          rdmBalance: 0,
          quizzesCompleted: 0,
          referredContacts: [],
        }),

      setUser: (userPartial) =>
        set((state) => ({
          user: { ...state.user, ...userPartial },
          ...(userPartial.level !== undefined ? { level: userPartial.level } : {}),
          ...(userPartial.rdmBalance !== undefined ? { rdmBalance: userPartial.rdmBalance } : {}),
          ...(userPartial.streak !== undefined ? { streak: userPartial.streak } : {}),
          ...(userPartial.quizzesCompleted !== undefined
            ? { quizzesCompleted: userPartial.quizzesCompleted }
            : {}),
          ...(userPartial.selectedTrack ? { selectedTrack: userPartial.selectedTrack } : {}),
        })),

      setUserProfile: (profile) =>
        set({
          user: profile,
          level: profile.level ?? 0,
          rdmBalance: profile.rdmBalance ?? 0,
          streak: profile.streak ?? 0,
          quizzesCompleted: profile.quizzesCompleted ?? 0,
          selectedTrack: profile.selectedTrack || 'A',
        }),

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

      setReferredContacts: (contacts) =>
        set({
          referredContacts: contacts,
        }),

      addReferredContact: (contact) =>
        set((state) => ({
          referredContacts: [contact, ...state.referredContacts],
        })),

      resetState: () =>
        set({
          isGuestOrDevAuthenticated: false,
          user: initialProfile,
          selectedTrack: 'A',
          level: 0,
          streak: 0,
          rdmBalance: 0,
          quizzesCompleted: 0,
          referredContacts: [],
        }),
    }),
    {
      name: 'edudeca-user-storage',
      storage: createJSONStorage(() => secureStoreStorage),
    }
  )
);
