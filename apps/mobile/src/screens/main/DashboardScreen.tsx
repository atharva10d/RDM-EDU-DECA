import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing } from '@edudeca/ui';
import { DEFAULT_DISCIPLINES } from '../../utils/mockData';
import { useAppStore } from '../../store/useAppStore';
import { CircularProgressRing } from '../../components/CircularProgressRing';
import { BurgerDrawer } from '../../components/BurgerDrawer';
import { Bell, Menu, Zap, User } from 'lucide-react-native';
import { userService } from '../../services';
import { progressService } from '../../services/progressService';
import {
  challengeMaxStrikes,
  challengeSessionDurationSec,
} from '../../services/studentLoop/challengeSpec';
import { formatTrialsLeft } from '../../services/studentLoop/trialsCopy';
import { lineupForHome } from '../../services/studentLoop/lineupPath';

type DashboardScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation?: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const user = useAppStore((state) => state.user);
  const streak = useAppStore((state) => state.streak);
  const rdmBalance = useAppStore((state) => state.rdmBalance);
  const quizzesCompleted = useAppStore((state) => state.quizzesCompleted);
  const selectedTrack = useAppStore((state) => state.selectedTrack);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const campaignLevel = useAppStore((state) => state.campaignLevel);
  const freeZoneComplete = useAppStore((state) => state.freeZoneComplete);
  const trialsRemaining = useAppStore((state) => state.trialsRemaining);
  const storedLineup = useAppStore((state) => state.disciplines);
  const pendingPathTrack = useAppStore((state) => state.pendingPathTrack);

  // Sync API state on mount, returning to Home, and pull-to-refresh
  const loadUserData = useCallback(async () => {
    try {
      await progressService.loadProgress();
      const profile = await userService.fetchCurrentUser(user?.id);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (_err) {
      // Graceful offline fallback
    }
  }, [user?.id, setUserProfile]);

  useFocusEffect(
    useCallback(() => {
      void loadUserData();
    }, [loadUserData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.floor((windowWidth - 36 - 16) / 3);

  const DISCIPLINE_LABELS: Record<string, { name: string; tag: string; color: string }> = {
    phy: { name: 'Physics', tag: 'PHY', color: 'teal' },
    che: { name: 'Chemistry', tag: 'CHEM', color: 'amber' },
    ent: { name: 'Entrepreneurship', tag: 'ENT', color: 'gold' },
    eng: { name: 'English', tag: 'VERB', color: 'blue' },
    eco: { name: 'Economics', tag: 'QUANT', color: 'amber' },
    log: { name: 'Logical Reasoning', tag: 'ANLYT', color: 'purple' },
    gk: { name: 'GK', tag: 'GK', color: 'gold' },
    fin: { name: 'Financial Literacy', tag: 'FIN', color: 'pink' },
    mat: { name: 'Mathematics', tag: 'MATH', color: 'teal' },
    amat: { name: 'Applied Mathematics', tag: 'AMATH', color: 'teal' },
    bio: { name: 'Biology', tag: 'BIO', color: 'teal' },
    biotech: { name: 'Biotechnology', tag: 'BTC', color: 'purple' },
  };

  const lineupIds = lineupForHome({
    pendingTrack: pendingPathTrack,
    selectedTrack: selectedTrack === 'B' || user?.selectedTrack === 'B' ? 'B' : 'A',
    disciplines: storedLineup,
  });
  const effectiveTrack =
    pendingPathTrack === 'B' || selectedTrack === 'B' || user?.selectedTrack === 'B'
      ? 'B'
      : 'A';

  const activeDisciplines = (() => {
    if (lineupIds.length === 10) {
      return lineupIds.map((id) => {
        const meta = DISCIPLINE_LABELS[id] || { name: id, tag: id.toUpperCase(), color: 'teal' };
        return { id, name: meta.name, tag: meta.tag, color: meta.color };
      });
    }
    const list = DEFAULT_DISCIPLINES.filter(
      (d) => !d.track || d.track === effectiveTrack
    );
    if (list.length >= 10) return list.slice(0, 10);
    const existing = new Set(list.map((d) => d.id));
    for (const d of DEFAULT_DISCIPLINES) {
      if (list.length >= 10) break;
      if (!existing.has(d.id)) {
        list.push(d);
        existing.add(d.id);
      }
    }
    return list.slice(0, 10);
  })();

  const handleDrawerNavigate = (route: string) => {
    if (route === 'Dashboard') {
      // already here
    } else if (route === 'PickPath') {
      navigation.navigate('PickPath');
    } else if (route === 'LevelPath') {
      navigation.navigate('LevelPath');
    } else if (route === 'Leaderboard') {
      navigation.navigate('Leaderboard');
    } else if (route === 'Refer') {
      navigation.navigate('Refer');
    } else if (route === 'Rewards') {
      navigation.navigate('Rewards');
    } else if (route === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  
  const getLevelLimits = (lvl: number) => ({
    time: challengeSessionDurationSec(lvl) / 60,
    strikes: challengeMaxStrikes(lvl),
  });
  const limits = getLevelLimits(campaignLevel);
  const zoneTitle =
    campaignLevel <= 3
      ? `Level ${campaignLevel} · Free Zone`
      : campaignLevel <= 6
      ? `Level ${campaignLevel} · Proctored Zone`
      : `Level ${campaignLevel} · Metro Finals`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
        {/* Brand Header with Profile, Bell & Burger Drawer Button */}
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Zap size={15} color="#04140E" strokeWidth={3} />
            </View>
            <Text style={styles.brandText}>
              Edu<Text style={{ color: colors.teal }}>Deca</Text>
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <User size={16} color={colors.text} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.iconButton}>
              <View style={styles.pingDot} />
              <Bell size={16} color={colors.text} strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconButton}
              onPress={() => setDrawerVisible(true)}
            >
              <Menu size={16} color={colors.text} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Level Card with SVG Circular Progress Ring */}
        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <CircularProgressRing level={campaignLevel} size={76} strokeWidth={7} />
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{zoneTitle}</Text>
              <View style={styles.levelBadges}>
                            <View style={styles.badgeStreak}>
                  <Text style={styles.badgeStreakText}>
                    {limits.time} Min Timer
                  </Text>
                </View>
                <View style={styles.badgeRank}>
                  <Text style={styles.badgeRankText}>
                    {limits.strikes} Strikes Max
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center', marginVertical: 8, fontFamily: typography.fontFamily.medium }}>
            {formatTrialsLeft(trialsRemaining)}
          </Text>

          {freeZoneComplete ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startLevelBtn}
              onPress={() => alert("Payment isn't live yet. You'll be notified when Level 4 opens.")}
            >
              <Text style={styles.startLevelBtnText}>
                Unlock Level 4 · Priority Access
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startLevelBtn}
              onPress={() => {
                const level = Math.max(1, campaignLevel || 1);
                const parent = navigation.getParent?.();
                if (parent) {
                  parent.navigate('DashboardTab', {
                    screen: 'Quiz',
                    params: { level },
                  });
                  return;
                }
                navigation.navigate('Quiz', { level });
              }}
            >
              <Text style={styles.startLevelBtnText}>
                Start Level {campaignLevel} Challenge
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 10 Disciplines Section Head */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionHeadTitle}>Your 10 disciplines</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LevelPath')}
          >
            <Text style={styles.sectionHeadSee}>See all →</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Column Discipline Grid */}
        <View style={styles.discGrid}>
          {activeDisciplines.map((item, index) => {
            const discColor = (colors as any)[item.color] || colors.teal;
            return (
              <View key={item.id || String(index)} style={[styles.discCard, { width: cardWidth }]}>
                <View
                  style={[
                    styles.discChip,
                    { backgroundColor: 'rgba(255,255,255,0.08)' },
                  ]}
                >
                  <Text style={[styles.discChipText, { color: discColor }]}>
                    {item.tag}
                  </Text>
                </View>
                <Text style={styles.discName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.discLv}>
                  Lv {Math.max(1, campaignLevel)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Burger Drawer Modal */}
      <BurgerDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleDrawerNavigate}
      />
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
    paddingBottom: 28,
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
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
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
  levelCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 19,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  levelBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeStreak: {
    backgroundColor: colors.goldAlpha12,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
  badgeStreakText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  badgeRank: {
    backgroundColor: colors.tealAlpha12,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
  badgeRankText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  startLevelBtn: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 16,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startLevelBtnText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: '#062017',
  },
  rdmChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rdmChip: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rdmCoinGold: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rdmCoinGoldText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.black,
    color: '#1a1400',
  },
  rdmCoinTeal: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rdmCoinTealText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.black,
    color: '#04140E',
  },
  rdmValue: {
    fontSize: 16.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  rdmLabel: {
    fontSize: 11.5,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionHeadTitle: {
    fontSize: 17,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionHeadSee: {
    fontSize: 13.5,
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
  discGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  discCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discChip: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 6,
  },
  discChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
  },
  discName: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  discLv: {
    fontSize: 11,
    color: colors.mutedDim,
    marginTop: 2,
  },
});

