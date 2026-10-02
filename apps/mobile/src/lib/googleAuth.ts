import Constants from 'expo-constants';
import { NativeModules } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { env } from './env';
import { googleSignInMode } from './googleSignInMode';
import { supabase } from './supabase';

type NativeGoogle = {
  hasPlayServices: (opts?: { showPlayServicesUpdateDialog?: boolean }) => Promise<unknown>;
  signIn: () => Promise<{ data?: { idToken?: string }; idToken?: string }>;
  signOut?: () => Promise<void>;
  configure?: (opts: { webClientId: string; offlineAccess: boolean }) => void;
};

let GoogleSignin: NativeGoogle | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const gModule = require('@react-native-google-signin/google-signin') as {
    GoogleSignin?: NativeGoogle;
  };
  GoogleSignin = gModule.GoogleSignin ?? null;
} catch {
  GoogleSignin = null;
}

function canUseNativeGoogle(): boolean {
  const native = NativeModules as { RNGoogleSignin?: unknown };
  return (
    googleSignInMode({
      appOwnership: Constants.appOwnership,
      hasNativeModule: Boolean(
        native.RNGoogleSignin && typeof GoogleSignin?.hasPlayServices === 'function'
      ),
    }) === 'native'
  );
}

if (canUseNativeGoogle() && env.googleWebClientId) {
  GoogleSignin?.configure?.({
    webClientId: env.googleWebClientId,
    offlineAccess: false,
  });
}

async function sessionFromIdToken(idToken: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  if (!data.session) throw new Error('Google sign-in did not create a session');
  return data.session;
}

async function signOutNativeGoogle(): Promise<void> {
  try {
    await GoogleSignin?.signOut?.();
  } catch {
    // Cached Google user may already be signed out.
  }
}

async function signInWithGoogleNative(): Promise<Session> {
  if (!canUseNativeGoogle() || !GoogleSignin) {
    throw new Error('Native Google Sign-In is unavailable');
  }
  await signOutNativeGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken || response.idToken;
  if (!idToken) throw new Error('No ID token returned from Google');
  return sessionFromIdToken(idToken);
}

export async function signInWithGoogle(): Promise<Session> {
  if (!canUseNativeGoogle()) {
    throw new Error('Google Sign-In requires the EduDeca development APK, not Expo Go.');
  }
  return signInWithGoogleNative();
}

export async function signOutGoogleAndSupabase(): Promise<void> {
  await signOutNativeGoogle();
  try {
    await supabase.auth.signOut();
  } catch {
    // Local store reset still proceeds after this helper.
  }
}
