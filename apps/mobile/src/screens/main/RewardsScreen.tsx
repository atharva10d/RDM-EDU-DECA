import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import {
  Gift,
  Trophy,
  Medal,
  School,
  Award,
  Ribbon,
  Flame,
  FlaskConical,
  Triangle,
  Handshake,
  Lock,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react-native';
import { progressService } from '../../services/progressService';

const PRIZES = [
  { title: 'TOP 3 COLLEGES', subtitle: 'Trophies', Icon: Trophy, accent: '#A78BFA', bg: 'rgba(139,92,246,0.18)' },
  { title: 'WINNING STUDENT', subtitle: '₹10 Lakhs', Icon: Medal, accent: '#FBBF24', bg: 'rgba(251,191,36,0.16)' },
  { title: 'WINNING COLLEGE', subtitle: '₹10 Lakhs', Icon: School, accent: '#FBBF24', bg: 'rgba(251,191,36,0.16)' },
  { title: '1ST RUNNER-UP', subtitle: '₹5 Lakhs', Icon: Award, accent: '#22D3EE', bg: 'rgba(34,211,238,0.14)' },
  { title: '2ND RUNNER-UP', subtitle: '₹3 Lakhs', Icon: Medal, accent: '#FB7185', bg: 'rgba(251,113,133,0.16)' },
  { title: 'ALL FINALISTS', subtitle: 'Badges', Icon: Ribbon, accent: '#34D399', bg: 'rgba(52,211,153,0.16)' },
] as const;

export const RewardsScreen: React.FC = () => {
  const xp = useAppStore((state) => state.rdmBalance);
  const streak = useAppStore((state) => state.streak);

  useFocusEffect(
    useCallback(() => {
      void progressService.loadProgress().catch(() => undefined);
    }, []),
  );

  const badges = [
    { id: 'streak', label: `${streak}-day streak`, Icon: Flame, unlocked: streak > 0, accent: '#FBBF24' },
    { id: 'chem', label: 'Chem Level 3', Icon: FlaskConical, unlocked: false, accent: '#34D399' },
    { id: 'maths', label: 'Maths Level 3', Icon: Triangle, unlocked: false, accent: '#22D3EE' },
    { id: 'referrals', label: '3 referrals', Icon: Handshake, unlocked: false, accent: '#FBBF24' },
    { id: 'proctor', label: 'Level 4 proctor', Icon: Lock, unlocked: false, accent: '#A78BFA' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Sleek Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerBadge}>
            <Gift size={12} color={colors.teal} />
            <Text style={styles.headerBadgeText}>EDUDECA REWARDS</Text>
          </View>
          <Text style={styles.screenTitle}>Rewards & Honours</Text>
          <Text style={styles.screenSubtitle}>
            Compete for ₹31 Lakhs in sponsor-backed prizes, trophies & medals.
          </Text>
        </View>

        {/* Executive Metrics Card (Consolidated Streak & Total XP) */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            {/* Streak Metric */}
            <View style={styles.statCol}>
              <View style={styles.statLabelRow}>
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Flame size={14} color="#F59E0B" />
                </View>
                <Text style={styles.statLabel}>STREAK</Text>
              </View>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statUnit}>{streak === 1 ? 'day' : 'days'}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            {/* Total XP Metric */}
            <View style={styles.statCol}>
              <View style={styles.statLabelRow}>
                <View style={[styles.statIconWrap, { backgroundColor: colors.tealAlpha12 }]}>
                  <Zap size={14} color={colors.teal} />
                </View>
                <Text style={styles.statLabel}>TOTAL XP</Text>
              </View>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: colors.teal }]}>
                  {xp.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.statUnit}>XP</Text>
              </View>
            </View>
          </View>

          {/* Integrated Boost Strip */}
          <View style={styles.boostStrip}>
            <View style={styles.boostLeft}>
              <View style={styles.boostDot} />
              <Sparkles size={12} color="#34D399" />
              <Text style={styles.boostText}>Rewards Multiplier Active</Text>
            </View>
            <View style={styles.boostPill}>
              <Text style={styles.boostPillText}>1.5× BOOST</Text>
            </View>
          </View>
        </View>

        {/* National Prizes Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionTrophyWrap}>
              <Trophy size={14} color="#FBBF24" />
            </View>
            <Text style={styles.sectionHeading}>National Prizes & Honors</Text>
          </View>
          <View style={styles.poolChip}>
            <Text style={styles.poolChipText}>₹31L+ POOL</Text>
          </View>
        </View>
        <View style={styles.prizeGrid}>
          {PRIZES.map((prize) => (
            <View key={prize.title} style={styles.prizeCard}>
              <View style={[styles.prizeIcon, { backgroundColor: prize.bg, borderColor: prize.accent }]}>
                <prize.Icon size={26} color={prize.accent} />
              </View>
              <Text style={[styles.prizeTitle, { color: prize.accent }]}>{prize.title}</Text>
              <Text style={styles.prizeSub}>{prize.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.badgeHead}>
          <Text style={styles.section}>Your badges</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeItem, !badge.unlocked && { opacity: 0.5 }]}>
              <View
                style={[
                  styles.badgeIcon,
                  badge.unlocked
                    ? { borderColor: badge.accent, backgroundColor: `${badge.accent}22` }
                    : styles.badgeLocked,
                ]}
              >
                <badge.Icon size={22} color={badge.unlocked ? badge.accent : colors.mutedDim} />
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.referCard}>
          <View style={styles.referIcon}>
            <Gift size={22} color="#22D3EE" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.referTitle}>Refer & Earn Streak Bonuses</Text>
            <Text style={styles.referBody}>
              Invite a classmate — you both get a 2-day streak shield and bonus XP toward Level 4.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.edublastBtn}
          onPress={() => void Linking.openURL('https://www.edublast.in')}
        >
          <Text style={styles.edublastText}>Continue to Edublast.in</Text>
          <ArrowRight size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 },
  topHeader: {
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    backgroundColor: colors.tealAlpha10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
    letterSpacing: 0.8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.mutedDim,
    letterSpacing: 0.8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statUnit: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.muted,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 14,
  },
  boostStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  boostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boostDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
  },
  boostText: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.bold,
    color: '#6EE7B7',
  },
  boostPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  boostPillText: {
    fontSize: 9.5,
    fontWeight: typography.fontWeight.extrabold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTrophyWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 16.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  poolChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  poolChipText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    color: '#FBBF24',
    letterSpacing: 0.6,
  },
  section: {
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 12,
  },
  prizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  prizeCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  prizeIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  prizeTitle: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  prizeSub: {
    fontSize: 15.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: { fontSize: 14, color: colors.teal, marginBottom: 12 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  badgeItem: { flex: 1, minWidth: 64, maxWidth: 88, alignItems: 'center', gap: 6 },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLocked: {
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  referCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    backgroundColor: 'rgba(34,211,238,0.08)',
    padding: 18,
    marginBottom: 16,
  },
  referIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(34,211,238,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  referBody: { fontSize: 13.5, color: colors.muted, marginTop: 4, lineHeight: 20 },
  edublastBtn: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#6D28D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  edublastText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: '#fff',
  },
});
