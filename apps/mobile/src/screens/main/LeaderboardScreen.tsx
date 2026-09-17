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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Card } from '@edudeca/ui';
import { ArrowLeft, Trophy, Globe } from 'lucide-react-native';
import { LeaderboardEntry } from '@edudeca/types';
import { leaderboardService } from '../../services';
import { useAppStore } from '../../store/useAppStore';

type LeaderboardScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Leaderboard'
>;

interface LeaderboardScreenProps {
  navigation?: any;
}

const RANK_ICONS = ['👑', '🥈', '🥉'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const user = useAppStore((state) => state.user);
  const [viewMode, setViewMode] = useState<'level' | 'national'>('level');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      let data: LeaderboardEntry[] = [];
      if (viewMode === 'level') {
        data = await leaderboardService.fetchLeaderboardByLevel(selectedLevel, 50, user?.id);
      } else {
        data = await leaderboardService.fetchGlobalLeaderboard(50, user?.id);
      }

      setRankings(data || []);
    } catch (_err) {
      setRankings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [viewMode, selectedLevel, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchRankings();
    }, [fetchRankings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  const myEntry = rankings.find(
    (r) => r.isCurrentUser || (user?.id && r.userId === user.id) || (user?.name && r.name === user.name)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 Live Leaderboard</Text>
        </View>

        <Text style={styles.headerSub}>
          Real-time national rankings updated live with every quiz played.
        </Text>

        {/* View Mode Toggle: Level vs National Standings */}
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeBtn, viewMode === 'level' && styles.modeBtnActive]}
            onPress={() => setViewMode('level')}
          >
            <Trophy size={13} color={viewMode === 'level' ? '#04140E' : colors.muted} />
            <Text style={[styles.modeBtnText, viewMode === 'level' && styles.modeBtnTextActive]}>
              Level Challenge
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeBtn, viewMode === 'national' && styles.modeBtnActive]}
            onPress={() => setViewMode('national')}
          >
            <Globe size={13} color={viewMode === 'national' ? '#04140E' : colors.muted} />
            <Text style={[styles.modeBtnText, viewMode === 'national' && styles.modeBtnTextActive]}>
              National Standings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Horizontal Scrollable Tabs (Only in Level mode) */}
        {viewMode === 'level' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
              const isActive = lvl === selectedLevel;
              return (
                <TouchableOpacity
                  key={lvl}
                  activeOpacity={0.8}
                  style={[styles.lvlTab, isActive && styles.lvlTabActive]}
                  onPress={() => setSelectedLevel(lvl)}
                >
                  <Text
                    style={[
                      styles.lvlTabText,
                      isActive && styles.lvlTabTextActive,
                    ]}
                  >
                    Level {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {/* Your Standing Spotlight Card */}
        {myEntry ? (
          <View style={styles.mySpotlightCard}>
            <View style={styles.mySpotlightLeft}>
              <View style={styles.myRankBadge}>
                <Text style={styles.myRankText}>#{myEntry.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mySpotlightName}>
                  {user?.name || myEntry.name} (You)
                </Text>
                <Text style={styles.mySpotlightSub} numberOfLines={1}>
                  {user?.institution || myEntry.institution || 'Viswa Vignan'}
                </Text>
              </View>
            </View>
            <View style={styles.mySpotlightScore}>
              <Text style={styles.mySpotlightScoreVal}>{myEntry.score}</Text>
              <Text style={styles.mySpotlightScoreSub}>{myEntry.time}</Text>
            </View>
          </View>
        ) : null}

        {/* Leaderboard Card */}
        <Card style={styles.lbCard}>
          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.teal} style={{ marginBottom: 8 }} />
              <Text style={styles.loadingText}>
                Fetching live real-time rankings...
              </Text>
            </View>
          ) : rankings.length === 0 ? (
            <Text style={styles.emptyText}>
              No ranking records found yet.
            </Text>
          ) : (
            rankings.map((row, index) => {
              const isMe = row.isCurrentUser || (user?.id && row.userId === user.id) || (user?.name && row.name === user.name);
              return (
                <View
                  key={row.userId || index}
                  style={[
                    styles.lbRow,
                    isMe && styles.lbRowMe,
                    index === rankings.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.lbRankIcon, index < 3 && styles.lbRankTop]}>
                    {index < 3 ? RANK_ICONS[index] : `#${row.rank || index + 1}`}
                  </Text>

                  <View
                    style={[
                      styles.lbAvatar,
                      {
                        backgroundColor:
                          (colors as any)[row.color] || row.color || colors.teal,
                      },
                    ]}
                  >
                    <Text style={styles.lbAvatarText}>
                      {row.name ? row.name.charAt(0).toUpperCase() : 'W'}
                    </Text>
                  </View>

                  <View style={styles.lbInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.lbName, isMe && styles.lbNameMe]} numberOfLines={1}>
                        {row.name}
                      </Text>
                      {isMe ? (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>YOU</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.lbInst} numberOfLines={1}>
                      {row.institution || 'Top Whiz Institute'}
                    </Text>
                    <Text style={styles.lbTime}>⏱ {row.time}</Text>
                  </View>

                  <View style={[styles.lbScoreBadge, isMe && styles.lbScoreBadgeMe]}>
                    <Text style={[styles.lbScoreText, isMe && styles.lbScoreTextMe]}>
                      {row.score}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>
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
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 14,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 7,
    paddingBottom: 6,
    marginBottom: 16,
  },
  lvlTab: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  lvlTabActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldAlpha10,
  },
  lvlTabText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  lvlTabTextActive: {
    color: colors.gold,
  },
  lbCard: {
    padding: spacing.base,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: 12,
    color: colors.mutedDim,
    textAlign: 'center',
    paddingVertical: 12,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lbRankIcon: {
    fontSize: 16,
    width: 28,
    textAlign: 'center',
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  lbAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  lbInfo: {
    flex: 1,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  modeBtnText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  modeBtnTextActive: {
    color: '#04140E',
  },
  mySpotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1.5,
    borderColor: colors.tealAlpha35,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 16,
  },
  mySpotlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  myRankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140E',
  },
  mySpotlightName: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  mySpotlightSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  mySpotlightScore: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  mySpotlightScoreVal: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  mySpotlightScoreSub: {
    fontSize: 10,
    color: colors.mutedDim,
    marginTop: 1,
  },
  lbRowMe: {
    backgroundColor: colors.tealAlpha10,
    marginHorizontal: -spacing.base,
    paddingHorizontal: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  lbRankTop: {
    fontSize: 18,
  },
  lbNameMe: {
    color: colors.teal,
  },
  youBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140E',
  },
  lbInst: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  lbName: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  lbTime: {
    fontSize: 9.5,
    color: colors.mutedDim,
    marginTop: 2,
  },
  lbScoreBadge: {
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
  },
  lbScoreText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  lbScoreBadgeMe: {
    backgroundColor: colors.teal,
  },
  lbScoreTextMe: {
    color: '#04140E',
  },
});
