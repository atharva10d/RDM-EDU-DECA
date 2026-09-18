/**
 * EduDeca website REST client — same routes as EduDeca Next.js (`/api/*`).
 * Auth: Supabase access token as `Authorization: Bearer`.
 */
import { env } from '../lib/env';
import { supabase } from '../lib/supabase';

const EDUDECA_API_BASE = env.edudecaApiUrl;

interface EdudecaApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export class EdudecaApiError extends Error {
  status: number;
  code?: string;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'EdudecaApiError';
    this.status = status;
    this.payload = payload;
    if (payload && typeof payload === 'object' && 'code' in payload) {
      const code = (payload as { code?: unknown }).code;
      if (typeof code === 'string') this.code = code;
    }
  }
}

async function edudecaFetch<T>(endpoint: string, options: EdudecaApiOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  let url = `${EDUDECA_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errMsg =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : null) ||
      (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : null) ||
      `API Error ${response.status}`;
    if (response.status === 401) {
      await supabase.auth.signOut();
    }
    throw new EdudecaApiError(errMsg, response.status, data);
  }

  return data as T;
}

export interface ChallengeAvailability {
  ready: number[] | null;
  error?: string;
  code?: string;
  available?: boolean;
  reason?: string;
  class_level?: number;
  [key: string]: unknown;
}

export interface ChallengeQuestion {
  id: string;
  subjectId?: string;
  stem?: string;
  options: string[];
  correctIndex?: number;
  question?: string;
  correct_index?: number;
  discipline?: string;
  class?: string;
  [key: string]: unknown;
}

export interface ChallengeCompletePayload {
  reason: 'won' | 'strikes' | 'time' | 'below_threshold' | 'quit';
  correct: number;
  total: number;
  results: Array<{
    questionId: string;
    subjectId: string;
    isCorrect: boolean;
    skipped?: boolean;
  }>;
  campaignLevelAtStart: number;
  strikes?: number;
}

export interface ChallengeCompleteResponse {
  saved?: boolean;
  progress?: EduDecaProgressDto;
  trials?: TrialResponse;
  xp_earned?: number;
  new_level?: number;
  leveled_up?: boolean;
  [key: string]: unknown;
}

export interface EduDecaProgressDto {
  campaignLevel: number;
  xp: number;
  streakDays: number;
  todayCompleted: boolean;
  freeZoneComplete: boolean;
  disciplines?: string[] | null;
  lastChallengeDate?: string | null;
}

export interface ProgressResponse extends EduDecaProgressDto {
  campaign_level?: number;
  streak?: number;
  [key: string]: unknown;
}

export interface TrialResponse {
  remaining?: number | null;
  trials_remaining?: number;
  level?: number;
  gate?: string;
  unlimited?: boolean;
  failCount?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface MockAttempt {
  id: string;
  score: number;
  total: number;
  completed_at: string;
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

export function unwrapProgress(data: unknown): ProgressResponse {
  const root = asRecord(data) ?? {};
  const inner = asRecord(root.progress) ?? root;
  const campaignLevel = Number(inner.campaignLevel ?? inner.campaign_level ?? 1) || 1;
  const xp = Number(inner.xp ?? 0) || 0;
  const streakDays = Number(inner.streakDays ?? inner.streak ?? 0) || 0;
  return {
    ...inner,
    campaignLevel,
    campaign_level: campaignLevel,
    xp,
    streakDays,
    streak: streakDays,
    todayCompleted: Boolean(inner.todayCompleted),
    freeZoneComplete: Boolean(inner.freeZoneComplete),
    disciplines: Array.isArray(inner.disciplines) ? (inner.disciplines as string[]) : [],
    lastChallengeDate:
      typeof inner.lastChallengeDate === 'string'
        ? inner.lastChallengeDate
        : typeof inner.last_challenge_date === 'string'
          ? inner.last_challenge_date
          : null,
  };
}

export const edudecaApi = {
  getProgress: async () => unwrapProgress(await edudecaFetch<unknown>('/progress')),

  patchProgress: async (payload: { disciplines: string[] }) =>
    unwrapProgress(
      await edudecaFetch<unknown>('/progress', {
        method: 'PATCH',
        body: payload,
      })
    ),

  getChallengeAvailability: () => edudecaFetch<ChallengeAvailability>('/challenge/availability'),

  getChallengeQuestions: (level: number) =>
    edudecaFetch<{ questions: ChallengeQuestion[] }>('/challenge/questions', {
      params: { level },
    }),

  completeChallenge: (payload: ChallengeCompletePayload) =>
    edudecaFetch<ChallengeCompleteResponse>('/challenge/complete', {
      method: 'POST',
      body: payload,
    }),

  getTrials: () => edudecaFetch<TrialResponse>('/challenge/trials'),

  getMockAttempts: () => edudecaFetch<{ attempts: MockAttempt[] }>('/mock-attempts'),

  getLeaderboard: () => edudecaFetch<{ rows: unknown[] }>('/leaderboard'),

  getReferralMine: () => edudecaFetch<unknown>('/referral/mine'),

  claimReferral: (ref: string) =>
    edudecaFetch<unknown>('/referral/claim', {
      method: 'POST',
      body: { ref },
    }),
};
