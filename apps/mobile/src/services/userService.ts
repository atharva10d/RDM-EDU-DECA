import { supabase } from '../lib/supabase';
import { UserProfile } from '@edudeca/types';
import { edudecaApi } from './edudecaApi';

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
      .single();

    if (error) throw new Error(error.message);

    // Also fetch progress from website API
    let progress: any = {};
    try {
      progress = await edudecaApi.getProgress();
    } catch (_err) {
      // Progress might not exist yet for new users
    }

    return {
      id: profile.id,
      name: profile.full_name || profile.name || 'Whiz Student',
      email: profile.email || '',
      classGrade: profile.class_level === 12 ? 'Class 12' : 'Class 11',
      scienceStream: true,
      institution: profile.institution || '',
      state: profile.state || '',
      city: profile.city || '',
      level4Consent: profile.level4_consent ?? true,
      selectedTrack: (profile.selected_track as any) || 'A',
      level: progress.campaign_level ?? profile.level ?? 0,
      streak: progress.streak ?? 0,
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

    // Map our internal field names to Supabase column names
    const updateData: Record<string, any> = {};
    if (profileUpdate.name) updateData.full_name = profileUpdate.name;
    if (profileUpdate.email) updateData.email = profileUpdate.email;
    if (profileUpdate.classGrade) {
      updateData.class_level = profileUpdate.classGrade === 'Class 12' ? 12 : 11;
    }
    if (profileUpdate.institution) updateData.institution = profileUpdate.institution;
    if (profileUpdate.state) updateData.state = profileUpdate.state;
    if (profileUpdate.city) updateData.city = profileUpdate.city;

    if (uid) {
      try {
        await supabase
          .from('edudeca_profiles')
          .upsert({ id: uid, ...updateData }, { onConflict: 'id' });
      } catch (_e) {
        // Ignore if RLS restrictions apply
      }
    }

    return {
      id: uid || 'local_user',
      name: profileUpdate.name || 'Whiz Student',
      email: profileUpdate.email || '',
      classGrade: profileUpdate.classGrade === 'Class 12' ? 'Class 12' : 'Class 11',
      scienceStream: true,
      institution: profileUpdate.institution || '',
      state: profileUpdate.state || '',
      city: profileUpdate.city || '',
      level4Consent: profileUpdate.level4Consent ?? true,
      selectedTrack: profileUpdate.selectedTrack || 'A',
      level: profileUpdate.level ?? 0,
      streak: profileUpdate.streak ?? 0,
      rdmBalance: profileUpdate.rdmBalance ?? 0,
      quizzesCompleted: profileUpdate.quizzesCompleted ?? 0,
    };
  },
};
