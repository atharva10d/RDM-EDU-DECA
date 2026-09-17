import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from '@edudeca/ui';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncUserSession = (s: Session | null) => {
      setSession(s);
      if (s?.user) {
        const googleEmail = s.user.email;
        const googleName = s.user.user_metadata?.full_name || s.user.user_metadata?.name;
        useAppStore.getState().setUser({
          ...(googleEmail ? { email: googleEmail } : {}),
          ...(googleName ? { name: googleName } : {}),
          id: s.user.id,
        });
      }
    };

    // 1. Fetch initial session with error catch
    supabase.auth
      .getSession()
      .then(({ data }) => {
        syncUserSession(data?.session ?? null);
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
    } = supabase.auth.onAuthStateChange((_event, s) => {
      syncUserSession(s);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
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

