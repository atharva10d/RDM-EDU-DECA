import Constants from 'expo-constants';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  edudecaApiUrl?: string;
  googleWebClientId?: string;
  googleAndroidClientId?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeApiBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

const supabaseUrl = firstNonEmpty(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  extra.supabaseUrl
);
const supabaseAnonKey = firstNonEmpty(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  extra.supabaseAnonKey
);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in RDM-EDU-DECA/.env and restart Expo.'
  );
}

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  googleWebClientId: firstNonEmpty(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    extra.googleWebClientId
  ),
  googleAndroidClientId: firstNonEmpty(
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    extra.googleAndroidClientId
  ),
  edudecaApiUrl: normalizeApiBase(
    firstNonEmpty(
      process.env.EXPO_PUBLIC_EDUDECA_API_URL,
      extra.edudecaApiUrl,
      'https://edu-deca.vercel.app'
    )!
  ),
};
