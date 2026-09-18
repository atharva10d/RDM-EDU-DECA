import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, Button, StatChip } from '@edudeca/ui';
import { TICKER_ITEMS } from '../../utils/mockData';
import { Bell, Zap } from 'lucide-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [statesCount, setStatesCount] = useState(0);

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
              <Zap size={15} color="#04140E" strokeWidth={3} />
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

        {/* Animated Stat Row */}
        <View style={styles.statRow}>
          <StatChip
            value={studentsCount.toLocaleString('en-IN')}
            label="Students"
          />
          <StatChip
            value={schoolsCount.toLocaleString('en-IN')}
            label="Schools"
          />
          <StatChip
            value={statesCount.toLocaleString('en-IN')}
            label="States"
          />
        </View>

        {/* Ticker Marquee Wrap */}
        <View style={styles.tickerWrap}>
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

        {/* Journey Mini Cards */}
        <View style={styles.journeyMini}>
          <View style={styles.jmini}>
            <View style={[styles.jminiNum, { backgroundColor: colors.teal }]}>
              <Text style={styles.jminiNumText}>1</Text>
            </View>
            <View style={styles.jminiTxt}>
              <Text style={styles.jminiTitle}>Free Play</Text>
              <Text style={styles.jminiSub}>Practice & build your streak</Text>
            </View>
          </View>

          <View style={styles.jmini}>
            <View style={[styles.jminiNum, { backgroundColor: colors.blue }]}>
              <Text style={styles.jminiNumText}>2</Text>
            </View>
            <View style={styles.jminiTxt}>
              <Text style={styles.jminiTitle}>Proctored Rounds</Text>
              <Text style={styles.jminiSub}>Unlock your official rank</Text>
            </View>
          </View>

          <View style={styles.jmini}>
            <View style={[styles.jminiNum, { backgroundColor: colors.gold }]}>
              <Text style={styles.jminiNumText}>3</Text>
            </View>
            <View style={styles.jminiTxt}>
              <Text style={styles.jminiTitle}>Metro Finals</Text>
              <Text style={styles.jminiSub}>Compete for the title, live</Text>
            </View>
          </View>
        </View>

        {/* Call to Action Button */}
        <Button
          title="⚡ Start Free Challenge →"
          onPress={() => navigation.navigate('PickPath')}
          variant="primary"
          style={styles.ctaButton}
        />

        {/* Sign In Link */}
        <View style={styles.signinLinkRow}>
          <Text style={styles.signinLinkText}>
            Already competing?{' '}
            <Text
              style={styles.signinLinkAction}
              onPress={() => navigation.navigate('SignIn')}
            >
              Sign in
            </Text>
          </Text>
        </View>
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
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  bellButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pingDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    zIndex: 2,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldAlpha10,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
    marginBottom: 12,
  },
  eyebrowText: {
    fontSize: typography.fontSize.xs + 0.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
  },
  heroH1: {
    fontSize: typography.fontSize.hero,
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 30,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  heroAccent: {
    color: colors.teal,
  },
  heroSub: {
    fontSize: typography.fontSize.sm + 1,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 18,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  tickerWrap: {
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm + 2,
    paddingVertical: 9,
    marginBottom: 18,
  },
  tickerTrack: {
    flexDirection: 'row',
    gap: 26,
    width: 2000,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.teal,
  },
  tickerText: {
    fontSize: 11,
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
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  jminiNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jminiNumText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140E',
  },
  jminiTxt: {
    flex: 1,
  },
  jminiTitle: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  jminiSub: {
    fontSize: 10,
    color: colors.mutedDim,
  },
  ctaButton: {
    marginTop: 4,
    marginBottom: 14,
  },
  signinLinkRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  signinLinkText: {
    fontSize: 12,
    color: colors.mutedDim,
  },
  signinLinkAction: {
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
});
