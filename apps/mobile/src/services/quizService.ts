import { edudecaApi } from './edudecaApi';
import {
  Question,
  QuizSubmissionPayload,
  QuizSubmissionResponse,
  IQuizAttempt,
} from '@edudeca/types';
import { supabase } from '../lib/supabase';
import { mapChallengeQuestion } from './studentLoop/mapChallengeQuestion';

export const quizService = {
  /**
   * Fetches challenge questions for a round.
   */
  fetchChallengeQuestions: async (level: number): Promise<Question[]> => {
    const response = await edudecaApi.getChallengeQuestions(level);
    const questions = response.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions available for this level. Please try again later.');
    }
    return questions.map(mapChallengeQuestion);
  },

  /**
   * Checks if the daily challenge is available for this student.
   */
  checkAvailability: async () => edudecaApi.getChallengeAvailability(),

  /**
   * Legacy submission does not carry the required per-question results.
   */
  submitQuizAttempt: async (
    _payload: QuizSubmissionPayload,
    _userId?: string
  ): Promise<QuizSubmissionResponse> => {
    throw new Error('Use completeChallenge with per-question results');
  },

  /**
   * Fetches past quiz attempts from edudeca_daily_attempts table.
   */
  fetchQuizHistory: async (
    level?: number,
    _userId?: string
  ): Promise<IQuizAttempt[]> => {
    let query = supabase
      .from('edudeca_daily_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      console.log('[QuizService] History fetch notice:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      level: row.level,
      score: row.score,
      total: row.total || 10,
      totalQuestions: row.total || 10,
      accuracy: row.accuracy || Math.round((row.score / (row.total || 10)) * 100),
      timeTaken: row.time_taken || 0,
      earnedRdm: row.xp_earned || 0,
      passed: row.passed ?? (row.score / (row.total || 10)) >= 0.7,
      completedAt: row.completed_at || row.created_at,
    }));
  },

  /**
   * Get level trial/gate status from the website API.
   */
  getTrials: async () => {
    return edudecaApi.getTrials();
  },
};
