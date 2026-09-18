import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, typography } from '@edudeca/ui';
import { ArrowLeft, Trophy, Crown, Medal, Sparkles, Megaphone, Share2 } from 'lucide-react-native';
import { LeaderboardEntry } from '@edudeca/types';
import { leaderboardService } from '../../services';
import { useAppStore } from '../../store/useAppStore';
import { visibleLeaderboardRows } from '../../services/studentLoop/visibleLeaderboardRows';

interface LeaderboardScreenProps {
  navigation?: { goBack: () => void };
}

const AVATAR_COLORS = ['#FB7185', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#22D3EE'];

function avatarColor(index: number, isMe: boolean): string {
  if (isMe) return '#8B5CF6';
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const user = useAppStore((state) => state.user);
  const [tab, setTab] = useState<'students' | 'colleges'>('students');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaderboardService.fetchXpLeaderboard(user?.id);
      setRankings(data || []);
    } catch (_err) {
      setRankings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void fetchRankings();
    }, [fetchRankings]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void fetchRankings();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
            colors={[colors.teal]}
          />
        }
      >
        {/* Premium Header Block */}
        <View style={styles.premiumHeaderBlock}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerBadgeRow}>
              <View
                style={[
                  styles.headerBadge,
                  {
                    backgroundColor: 'rgba(251,191,36,0.12)',
                    borderColor: 'rgba(251,191,36,0.35)',
                  },
                ]}
              >
                <Crown size={11} color="#FBBF24" />
                <Text style={[styles.headerBadgeText, { color: '#FBBF24' }]}>
                  ALL-INDIA RANKINGS
                </Text>
              </View>
            </View>
            <Text style={styles.headerBlockTitle}>Leaderboard</Text>
            <Text style={styles.headerBlockSubtitle} numberOfLines={1}>
              Individual rank feeds straight into your college rank.
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.tab, tab === 'students' && styles.tabOn]}
            onPress={() => setTab('students')}
          >
            <Text style={[styles.tabText, tab === 'students' && styles.tabTextOn]}>Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.tab, tab === 'colleges' && styles.tabOn]}
            onPress={() => setTab('colleges')}
          >
            <Text style={[styles.tabText, tab === 'colleges' && styles.tabTextOn]}>Colleges</Text>
          </TouchableOpacity>
        </View>

        {tab === 'colleges' ? (
          <Text style={styles.empty}>College ranks coming soon.</Text>
        ) : loading && !refreshing ? (
          <ActivityIndicator color={colors.teal} style={{ marginVertical: 28 }} />
        ) : rankings.length === 0 ? (
          <Text style={styles.empty}>No ranking records found yet.</Text>
        ) : (
          visibleLeaderboardRows(rankings, user?.id, 10).map((row, index) => {
            const isMe =
              row.isCurrentUser || Boolean(user?.id && row.userId === user.id);
            const rank = row.rank || index + 1;
            return (
              <View key={row.userId || String(index)} style={[styles.row, isMe && styles.rowMe]}>
                {isMe ? <View style={styles.youBar} /> : null}
                <View style={styles.rankSlot}>
                  {rank === 1 ? (
                    <Crown size={18} color="#FBBF24" fill="rgba(251,191,36,0.35)" />
                  ) : rank === 2 ? (
                    <Trophy size={18} color="#CBD5E1" fill="rgba(203,213,225,0.3)" />
                  ) : rank === 3 ? (
                    <Medal size={18} color="#F59E0B" fill="rgba(245,158,11,0.3)" />
                  ) : (
                    <Text style={[styles.rankNum, isMe && { color: '#FBBF24' }]}>{rank}</Text>
                  )}
                </View>
                <View style={[styles.avatar, { backgroundColor: avatarColor(index, isMe) }]}>
                  <Text style={styles.avatarText}>
                    {(row.name || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {row.name || 'Student'}
                    </Text>
                    {isMe ? (
                      <View style={styles.youPill}>
                        <Sparkles size={10} color="#FBBF24" />
                        <Text style={styles.youPillText}>You</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.school} numberOfLines={1}>
                    {row.institution || ''}
                  </Text>
                </View>
                <View style={styles.xpPill}>
                  <Text style={styles.xpText}>
                    {(row.rawScore ?? 0).toLocaleString('en-IN')} XP
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.viralCard}>
          <View style={styles.viralIcon}>
            <Megaphone size={22} color="#FBBF24" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.viralTitleRow}>
              <Text style={styles.viralTitle}>Referral Virality Engine</Text>
              <View style={styles.xpBadge}>
                <Share2 size={10} color="#FBBF24" />
                <Text style={styles.xpBadgeText}>+500 XP / Referral</Text>
              </View>
            </View>
            <Text style={styles.viralBody}>
              Every friend you bring in adds XP to both your profile and your college's total — the
              leaderboard is the growth engine.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 28 },
  premiumHeaderBlock: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.8,
  },
  headerBlockTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerBlockSubtitle: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999 },
  tabOn: { backgroundColor: colors.teal },
  tabText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  tabTextOn: { color: '#04140E' },
  empty: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(19,23,34,0.7)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rowMe: {
    borderColor: 'rgba(251,191,36,0.55)',
    backgroundColor: 'rgba(245,158,11,0.12)',
  },
  youBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F59E0B',
  },
  rankSlot: { width: 28, alignItems: 'center' },
  rankNum: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: typography.fontWeight.extrabold,
    fontSize: 14,
  },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  youPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251,191,36,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.4)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  youPillText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: '#FCD34D',
  },
  school: { fontSize: 13, color: colors.muted, marginTop: 2 },
  xpPill: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  xpText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
    fontVariant: ['tabular-nums'],
  },
  viralCard: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.28)',
    backgroundColor: 'rgba(245,158,11,0.08)',
    padding: 18,
  },
  viralIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viralTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  viralTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FCD34D',
  },
  viralBody: { fontSize: 13.5, color: colors.muted, marginTop: 6, lineHeight: 20 },
});
