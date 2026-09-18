const fs = require('fs');
const path = require('path');
const appJson = require('./app.json');

const workspaceRoot = path.resolve(__dirname, '../..');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let value = t.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }
    out[key] = value;
  }
  return out;
}

function applyEnv(parsed) {
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

applyEnv(parseEnvFile(path.join(workspaceRoot, '.env')));
applyEnv(parseEnvFile(path.join(__dirname, '.env')));

function normalizeApiBase(url) {
  if (!url) return 'https://edu-deca.vercel.app/api';
  const trimmed = String(url).replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

function androidOauthScheme(androidClientId) {
  if (!androidClientId) return null;
  const id = String(androidClientId).replace(/\.apps\.googleusercontent\.com$/, '');
  if (!id) return null;
  return `com.googleusercontent.apps.${id}`;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const edudecaApiUrl = normalizeApiBase(
  process.env.EXPO_PUBLIC_EDUDECA_API_URL || 'https://edu-deca.vercel.app'
);
const googleScheme = androidOauthScheme(googleAndroidClientId);
const schemes = ['edudeca', googleScheme].filter(Boolean);

module.exports = {
  expo: {
    ...appJson.expo,
    scheme: schemes,
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        ...((appJson.expo.extra && appJson.expo.extra.eas) || {}),
        projectId: '985348af-819f-43c5-b1b7-14688331903e',
      },
      supabaseUrl,
      supabaseAnonKey,
      googleWebClientId,
      googleAndroidClientId,
      edudecaApiUrl,
    },
  },
};
