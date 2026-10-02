import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, type AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from '@edudeca/ui';
import { progressService } from './services/progressService';
import { userService } from './services/userService';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const applySessionUser = (s: Session) => {
      const googleEmail = s.user.email;
      const googleName = s.user.user_metadata?.full_name || s.user.user_metadata?.name;
      useAppStore.getState().setUser({
        ...(googleEmail ? { email: googleEmail } : {}),
        ...(googleName ? { name: googleName } : {}),
        id: s.user.id,
      });
    };

    const hydrateSignedIn = async (s: Session) => {
      applySessionUser(s);
      try {
        const profile = await userService.fetchCurrentUser(s.user.id);
        useAppStore.getState().setUserProfile(profile);
      } catch {
        // Profile row may not exist yet for a new account.
      }
      try {
        await progressService.loadProgress();
      } catch {
        // Progress hydrate is best-effort; the session still stands.
      }
    };

    // 1. Fetch initial session with error catch. A null getSession must not wipe persisted store.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const s = data?.session ?? null;
        setSession(s);
        if (s?.user) {
          void hydrateSignedIn(s);
        }
        setIsReady(true);
      })
      .catch((_err) => {
        setIsReady(true);
      });

    // 2. Safety timeout: never stay blocked on loading for more than 500ms
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    // 3. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        useAppStore.getState().resetState();
        return;
      }
      setSession(s);
      if (s?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED')) {
        void hydrateSignedIn(s);
      } else if (s?.user && event === 'TOKEN_REFRESHED') {
        applySessionUser(s);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (status !== 'active') return;
      const current = useAppStore.getState();
      if (!current.user.id) return;
      void progressService.loadProgress().catch(() => undefined);
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator session={session} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg || '#0B0E14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

