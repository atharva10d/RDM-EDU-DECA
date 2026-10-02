import { supabase } from '../lib/supabase';
import { UserProfile } from '@edudeca/types';
import { edudecaApi } from './edudecaApi';
import {
  assertProfileWriteSucceeded,
  honestProfileText,
  level4ConsentFromProfile,
  toEdudecaProfileRow,
} from './studentLoop/profileColumns';

export const userService = {
  /**
   * Fetches the authenticated user profile from edudeca_profiles + progress
   */
  fetchCurrentUser: async (userId?: string): Promise<UserProfile> => {
    // Get current user ID from session if not provided
    let uid = userId;
    if (!uid) {
      const { data: sessionData } = await supabase.auth.getSession();
      uid = sessionData.session?.user?.id;
    }

    if (!uid) throw new Error('Not authenticated');

    // Fetch profile from Supabase
    const { data: profile, error } = await supabase
      .from('edudeca_profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!profile) throw new Error('Profile not found');

    // Also fetch progress from website API
    let progress: any = {};
    try {
      progress = await edudecaApi.getProgress();
    } catch (_err) {
      // Progress might not exist yet for new users
    }

    return {
      id: profile.id,
      name: honestProfileText(profile.full_name || profile.name).replace(/^—$/, '') || 'Student',
      email: profile.email || '',
      classGrade: profile.class_level === 12 ? 'Class 12' : 'Class 11',
      scienceStream: true,
      institution: profile.institution_name || '',
      state: profile.state || '',
      city: profile.city || '',
      level4Consent: level4ConsentFromProfile(profile),
      selectedTrack: (profile.selected_track as any) || 'A',
      level: progress.campaignLevel ?? progress.campaign_level ?? profile.level ?? 0,
      streak: progress.streakDays ?? progress.streak ?? 0,
      rdmBalance: progress.xp ?? 0,
      quizzesCompleted: progress.quizzes_completed ?? 0,
    };
  },

  /**
   * Updates user profile in edudeca_profiles
   */
  updateUserProfile: async (
    profileUpdate: Partial<UserProfile>,
    userId?: string
  ): Promise<UserProfile> => {
    let uid = userId;
    if (!uid) {
      const { data: sessionData } = await supabase.auth.getSession();
      uid = sessionData.session?.user?.id;
    }

    if (uid) {
      const { error } = await supabase
        .from('edudeca_profiles')
        .upsert({ id: uid, ...toEdudecaProfileRow(profileUpdate) }, { onConflict: 'id' });
      assertProfileWriteSucceeded(error);
    }

    return {
      id: uid || 'local_user',
      name: profileUpdate.name || 'Student',
      email: profileUpdate.email || '',
      classGrade: profileUpdate.classGrade === 'Class 12' ? 'Class 12' : 'Class 11',
      scienceStream: true,
      institution: profileUpdate.institution || '',
      state: profileUpdate.state || '',
      city: profileUpdate.city || '',
      level4Consent: profileUpdate.level4Consent === true,
      selectedTrack: profileUpdate.selectedTrack || 'A',
      level: profileUpdate.level ?? 0,
      streak: profileUpdate.streak ?? 0,
      rdmBalance: profileUpdate.rdmBalance ?? 0,
      quizzesCompleted: profileUpdate.quizzesCompleted ?? 0,
    };
  },
};
