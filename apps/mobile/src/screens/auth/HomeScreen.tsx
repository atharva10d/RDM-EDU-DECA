import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, Button } from '@edudeca/ui';
import { TICKER_ITEMS } from '../../utils/mockData';
import { Bell, Zap, ChevronRight, ShieldCheck, Trophy } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { signInWithGoogle } from '../../lib/googleAuth';
import { userService } from '../../services/userService';
import { progressService } from '../../services/progressService';
import { useAppStore } from '../../store/useAppStore';
import { isProfileGateComplete } from '../../services/studentLoop/profileGate';
import { shouldReuseSupabaseSession } from '../../services/studentLoop/reuseSupabaseSession';
import { supabase } from '../../lib/supabase';

type HomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [statesCount, setStatesCount] = useState(0);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Animated stat counters on mount
  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setStudentsCount(Math.round(easeProgress * 12847));
      setSchoolsCount(Math.round(easeProgress * 410));
      setStatesCount(Math.round(easeProgress * 28));

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Marquee animation
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: -400,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => loopAnimation());
    };

    loopAnimation();
  }, [scrollAnim]);

  // Already Registered Sign In Flow
  const handleAlreadyRegisteredSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      const existing = (await supabase.auth.getSession()).data.session;
      const session = shouldReuseSupabaseSession(existing, Date.now() / 1000, 'choose_account')
        ? existing
        : await signInWithGoogle();
      if (!session?.user) {
        throw new Error('Google Sign-In did not complete.');
      }

      const uid = session.user.id;
      const email = session.user.email || '';
      const name =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        '';

      // 1. Fetch user profile from Supabase database
      const profile = await userService.fetchCurrentUser(uid);

      if (profile && isProfileGateComplete(profile)) {
        // User is already registered with completed profile
        useAppStore.getState().setUserProfile(profile);
        try {
          await progressService.loadProgress();
        } catch {
          // best-effort progress hydrate
        }

        const store = useAppStore.getState();
        if (!store.disciplines || store.disciplines.length < 10) {
          navigation.navigate('PickDisciplines');
        }
        // If 10 disciplines exist, RootNavigator automatically switches to Main
      } else {
        // User not registered or profile incomplete -> redirect to Sign In / Sign Up form
        useAppStore.getState().setUser({
          id: uid,
          email,
          ...(name ? { name } : {}),
        });
        navigation.navigate('SignIn');
      }
    } catch (err: any) {
      if (err?.code === 'SIGN_IN_CANCELLED' || err?.code === '12501') {
        return;
      }
      // If native Google module is not loaded (e.g. Expo Go), redirect smoothly to SignIn screen
      if (err?.message?.includes('Expo Go') || err?.message?.includes('unavailable')) {
        navigation.navigate('SignIn');
        return;
      }
      Alert.alert('Sign In', err?.message || 'Could not sign in with selected account.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Zap size={16} color="#04140E" strokeWidth={3} />
            </View>
            <Text style={styles.brandText}>
              Edu<Text style={{ color: colors.teal }}>Deca</Text>
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.bellButton}>
            <View style={styles.pingDot} />
            <Bell size={16} color={colors.text} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Eyebrow Badge */}
        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowText}>🇮🇳 India's Whiz360 Challenge</Text>
        </View>

        {/* Hero Title */}
        <Text style={styles.heroH1}>
          10 disciplines.{'\n'}One <Text style={styles.heroAccent}>champion</Text> title.
        </Text>
        <Text style={styles.heroSub}>
          Play free every day, prove yourself in proctored rounds, and earn your seat at the Metro Finals.
        </Text>

        {/* Institutional Stat Row */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: colors.teal }]} />
            <Text style={styles.statNum}>{studentsCount.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: '#FBBF24' }]} />
            <Text style={styles.statNum}>{schoolsCount.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Schools</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.statNum}>{statesCount.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>States</Text>
          </View>
        </View>

        {/* Live Ticker Wrap */}
        <View style={styles.tickerWrap}>
          <View style={styles.tickerBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.tickerBadgeText}>LIVE</Text>
          </View>
          <View style={styles.tickerTrackContainer}>
            <Animated.View
              style={[
                styles.tickerTrack,
                { transform: [{ translateX: scrollAnim }] },
              ]}
            >
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                <View key={idx} style={styles.tickerItem}>
                  <View style={styles.tickerDot} />
                  <Text style={styles.tickerText}>{item}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>

        {/* Tournament Stages */}
        <View style={styles.journeyMini}>
          <View style={styles.jmini}>
            <View
              style={[
                styles.jminiIconWrap,
                {
                  backgroundColor: colors.tealAlpha12,
                  borderColor: colors.tealAlpha35,
                },
              ]}
            >
              <Zap size={16} color={colors.teal} />
            </View>
            <View style={styles.jminiTxt}>
              <View style={styles.jminiTitleRow}>
                <Text style={styles.jminiTitle}>Free Play</Text>
                <View
                  style={[
                    styles.tierPill,
                    {
                      backgroundColor: colors.tealAlpha10,
                      borderColor: colors.tealAlpha35,
                    },
                  ]}
                >
                  <Text style={[styles.tierPillText, { color: colors.teal }]}>
                    Lv 1–3
                  </Text>
                </View>
              </View>
              <Text style={styles.jminiSub}>
                Daily 10-discipline sprint & streak building
              </Text>
            </View>
            <ChevronRight size={16} color={colors.mutedDim} />
          </View>

          <View style={styles.jmini}>
            <View
              style={[
                styles.jminiIconWrap,
                {
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  borderColor: 'rgba(59, 130, 246, 0.35)',
                },
              ]}
            >
              <ShieldCheck size={16} color="#60A5FA" />
            </View>
            <View style={styles.jminiTxt}>
              <View style={styles.jminiTitleRow}>
                <Text style={styles.jminiTitle}>Proctored Rounds</Text>
                <View
                  style={[
                    styles.tierPill,
                    {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderColor: 'rgba(59, 130, 246, 0.25)',
                    },
                  ]}
                >
                  <Text style={[styles.tierPillText, { color: '#60A5FA' }]}>
                    Lv 4–6
                  </Text>
                </View>
              </View>
              <Text style={styles.jminiSub}>
                Unlock official national percentile & college rank
              </Text>
            </View>
            <ChevronRight size={16} color={colors.mutedDim} />
          </View>

          <View style={styles.jmini}>
            <View
              style={[
                styles.jminiIconWrap,
                {
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  borderColor: 'rgba(251, 191, 36, 0.35)',
                },
              ]}
            >
              <Trophy size={16} color="#FBBF24" />
            </View>
            <View style={styles.jminiTxt}>
              <View style={styles.jminiTitleRow}>
                <Text style={styles.jminiTitle}>Metro Finals</Text>
                <View
                  style={[
                    styles.tierPill,
                    {
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      borderColor: 'rgba(251, 191, 36, 0.25)',
                    },
                  ]}
                >
                  <Text style={[styles.tierPillText, { color: '#FBBF24' }]}>
                    Lv 7–10
                  </Text>
                </View>
              </View>
              <Text style={styles.jminiSub}>
                Compete live on stage · ₹10 Lakh grand prizes
              </Text>
            </View>
            <ChevronRight size={16} color={colors.mutedDim} />
          </View>
        </View>

        {/* Primary Action Button */}
        <Button
          title="⚡ Start Free Challenge →"
          onPress={() => navigation.navigate('PickPath')}
          variant="primary"
          style={styles.ctaButton}
        />

        {/* Dedicated Sign-In Button (Already Registered) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.signInButton}
          onPress={handleAlreadyRegisteredSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Svg width={18} height={18} viewBox="0 0 48 48">
                <Path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <Path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <Path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <Path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </Svg>
              <Text style={styles.signInButtonText}>
                Already Registered? Sign In
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 36,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  bellButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pingDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    zIndex: 2,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.28)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 12,
  },
  eyebrowText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  heroH1: {
    fontSize: 30,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 38,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroAccent: {
    color: colors.teal,
  },
  heroSub: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
    marginBottom: 18,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    position: 'relative',
  },
  statDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statNum: {
    fontSize: 18.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.6,
  },
  tickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  tickerBadgeText: {
    fontSize: 9.5,
    fontWeight: typography.fontWeight.extrabold,
    color: '#34D399',
    letterSpacing: 0.6,
  },
  tickerTrackContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerTrack: {
    flexDirection: 'row',
    gap: 24,
    width: 2000,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.teal,
  },
  tickerText: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  journeyMini: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 18,
  },
  jmini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  jminiIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jminiTxt: {
    flex: 1,
  },
  jminiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jminiTitle: {
    fontSize: 14.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  tierPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.4,
  },
  jminiSub: {
    fontSize: 12,
    color: colors.mutedDim,
    lineHeight: 16,
  },
  ctaButton: {
    marginTop: 2,
    marginBottom: 10,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.md + 2,
    minHeight: 50,
    paddingVertical: 13,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 14,
  },
  signInButtonText: {
    fontSize: 14.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: 0.2,
  },
});
