import type { TrackType } from '@edudeca/types';
import { displayReferralCode } from '../services/studentLoop/displayReferralCode';
import { canonicalLineup } from '../services/studentLoop/lineupPath';

export const APP_PERSIST_NAME = 'edudeca-user-storage';
export const APP_PERSIST_VERSION = 2;
export const PLACEHOLDER_USER_ID = 'user_dev_01';

export type PersistedUserSlice = {
  id: string;
  email: string;
  classGrade: string;
  institution: string;
  state: string;
  city: string;
  selectedTrack: TrackType;
  referralCode: string;
};

export type PersistedAppSlice = {
  user: PersistedUserSlice;
  selectedTrack: TrackType;
  pendingPathTrack: TrackType | null;
  disciplines: string[];
  campaignLevel: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
  trialsRemaining: number;
  streak: number;
  rdmBalance: number;
  level: number;
};

export type PersistableSnapshot = {
  user?: Partial<PersistedUserSlice> & {
    name?: string;
    level4Consent?: boolean;
    referralCode?: string;
    id?: string;
  };
  selectedTrack?: TrackType;
  pendingPathTrack?: TrackType | null;
  disciplines?: string[];
  campaignLevel?: number;
  todayCompleted?: boolean;
  freeZoneComplete?: boolean;
  trialsRemaining?: number;
  streak?: number;
  rdmBalance?: number;
  level?: number;
  [extra: string]: unknown;
};

const DEFAULT_SLICE: PersistedAppSlice = {
  user: {
    id: '',
    email: '',
    classGrade: 'Class 11',
    institution: '',
    state: '',
    city: '',
    selectedTrack: 'A',
    referralCode: '',
  },
  selectedTrack: 'A',
  pendingPathTrack: null,
  disciplines: [],
  campaignLevel: 1,
  todayCompleted: false,
  freeZoneComplete: false,
  trialsRemaining: 10,
  streak: 0,
  rdmBalance: 0,
  level: 0,
};

function persistUserId(id: string | null | undefined): string {
  const trimmed = typeof id === 'string' ? id.trim() : '';
  if (!trimmed || trimmed === PLACEHOLDER_USER_ID || trimmed === 'local_user') return '';
  return trimmed;
}

function persistReferral(code: string | null | undefined): string {
  return displayReferralCode(code) ?? '';
}

function asTrack(value: unknown): TrackType {
  if (value === 'A' || value === 'B' || value === null) return value;
  return 'A';
}

function asPendingTrack(value: unknown): TrackType | null {
  if (value === 'A' || value === 'B') return value;
  return null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function partializeAppPersist<T extends object>(state: T): PersistedAppSlice {
  const snapshot = state as PersistableSnapshot;
  const user = snapshot.user ?? {};
  return {
    user: {
      id: persistUserId(user.id),
      email: asString(user.email),
      classGrade: asString(user.classGrade, 'Class 11'),
      institution: asString(user.institution),
      state: asString(user.state),
      city: asString(user.city),
      selectedTrack: asTrack(user.selectedTrack ?? snapshot.selectedTrack),
      referralCode: persistReferral(user.referralCode),
    },
    selectedTrack: asTrack(snapshot.selectedTrack),
    pendingPathTrack: asPendingTrack(snapshot.pendingPathTrack),
    disciplines: Array.isArray(snapshot.disciplines)
      ? canonicalLineup(snapshot.disciplines)
      : [],
    campaignLevel: asNumber(snapshot.campaignLevel, 1),
    todayCompleted: asBoolean(snapshot.todayCompleted, false),
    freeZoneComplete: asBoolean(snapshot.freeZoneComplete, false),
    trialsRemaining: asNumber(snapshot.trialsRemaining, 10),
    streak: asNumber(snapshot.streak, 0),
    rdmBalance: asNumber(snapshot.rdmBalance, 0),
    level: asNumber(snapshot.level, 0),
  };
}

export function migrateAppPersist(persisted: unknown, _version: number): PersistedAppSlice {
  if (!persisted || typeof persisted !== 'object') return DEFAULT_SLICE;
  return partializeAppPersist(persisted as PersistableSnapshot);
}

export function mergeAppPersist<T extends { user: object }>(
  persisted: unknown,
  current: T,
): T {
  const slice = migrateAppPersist(persisted, APP_PERSIST_VERSION);
  return {
    ...current,
    ...slice,
    user: {
      ...current.user,
      ...slice.user,
    },
  } as T;
}
