/**
 * EduDeca Website API Client
 *
 * Calls the EduDeca website REST APIs at www.edudeca.com/api/*
 * All requests include the Supabase access_token as Bearer auth.
 */
import { supabase } from '../lib/supabase';

const EDUDECA_API_BASE =
  process.env.EXPO_PUBLIC_EDUDECA_API_URL || 'https://edudeca.com/api';

interface EdudecaApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

async function edudecaFetch<T>(endpoint: string, options: EdudecaApiOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  // Get the current Supabase access token
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  let url = `${EDUDECA_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Append query params
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
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errMsg = data?.error || data?.message || `API Error ${response.status}`;
    throw new Error(errMsg);
  }

  return data as T;
}

// ─── Challenge / Daily Quiz APIs ───────────────────────────────────

export interface ChallengeAvailability {
  available: boolean;
  reason?: string;
  class_level?: number;
  [key: string]: any;
}

export interface ChallengeQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  discipline: string;
  class?: string;
  [key: string]: any;
}

export interface ChallengeCompletePayload {
  level: number;
  score: number;
  total: number;
  timeTaken: number;
  answers?: Record<string, number>;
  [key: string]: any;
}

export interface ChallengeCompleteResponse {
  success: boolean;
  xp_earned?: number;
  new_level?: number;
  leveled_up?: boolean;
  [key: string]: any;
}

export interface ProgressResponse {
  campaign_level: number;
  xp: number;
  streak: number;
  disciplines?: Record<string, any>;
  last_challenge_date?: string;
  [key: string]: any;
}

export interface TrialResponse {
  trials_remaining?: number;
  gate_level?: number;
  [key: string]: any;
}

export interface MockAttempt {
  id: string;
  score: number;
  total: number;
  completed_at: string;
  [key: string]: any;
}

// ─── Exported API Functions ────────────────────────────────────────

export const edudecaApi = {
  /**
   * GET /api/progress — Student's current progress (level, XP, streak)
   */
  getProgress: () =>
    edudecaFetch<ProgressResponse>('/progress'),

  /**
   * GET /api/challenge/availability — Is the daily challenge available?
   */
  getChallengeAvailability: () =>
    edudecaFetch<ChallengeAvailability>('/challenge/availability'),

  /**
   * GET /api/challenge/questions?level=N — Get shuffled, non-repeating questions
   */
  getChallengeQuestions: (level: number) =>
    edudecaFetch<{ questions: ChallengeQuestion[] }>('/challenge/questions', {
      params: { level },
    }),

  /**
   * POST /api/challenge/complete — Submit challenge results
   */
  completeChallenge: (payload: ChallengeCompletePayload) =>
    edudecaFetch<ChallengeCompleteResponse>('/challenge/complete', {
      method: 'POST',
      body: payload,
    }),

  /**
   * GET /api/challenge/trials — Level gate / trial status
   */
  getTrials: () =>
    edudecaFetch<TrialResponse>('/challenge/trials'),

  /**
   * GET /api/mock-attempts — Past mock exam results
   */
  getMockAttempts: () =>
    edudecaFetch<{ attempts: MockAttempt[] }>('/mock-attempts'),
};
