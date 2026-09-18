import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing } from '@edudeca/ui';
import { DEFAULT_DISCIPLINES } from '../../utils/mockData';
import { useAppStore } from '../../store/useAppStore';
import { CircularProgressRing } from '../../components/CircularProgressRing';
import { BurgerDrawer } from '../../components/BurgerDrawer';
import { Bell, Menu, Zap, User } from 'lucide-react-native';
import { userService, setCurrentUserId } from '../../services';
import { progressService } from '../../services/progressService';

type DashboardScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation?: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const user = useAppStore((state) => state.user);
  const level = useAppStore((state) => state.level);
  const streak = useAppStore((state) => state.streak);
  const rdmBalance = useAppStore((state) => state.rdmBalance);
  const quizzesCompleted = useAppStore((state) => state.quizzesCompleted);
  const selectedTrack = useAppStore((state) => state.selectedTrack);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const campaignLevel = useAppStore((state) => state.campaignLevel);
  const todayCompleted = useAppStore((state) => state.todayCompleted);
  const freeZoneComplete = useAppStore((state) => state.freeZoneComplete);
  const trialsRemaining = useAppStore((state) => state.trialsRemaining);

  // Sync API state on mount and pull-to-refresh
  const loadUserData = useCallback(async () => {
    try {
      if (user?.id) {
        setCurrentUserId(user.id);
      }
      await progressService.loadProgress();
      const profile = await userService.fetchCurrentUser(user?.id);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (_err) {
      // Graceful offline fallback
    }
  }, [user?.id, setUserProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Filter 10 active disciplines based on selected track (A: Math/AMath, B: Bio/Biotech)
  const activeDisciplines = DEFAULT_DISCIPLINES.filter(
    (d) => !d.track || d.track === selectedTrack
  ).slice(0, 10);

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

  
  const getLevelLimits = (lvl: number) => {
    if (lvl === 1) return { time: 5, strikes: 5 };
    if (lvl === 2) return { time: 10, strikes: 7 };
    return { time: 20, strikes: 10 };
  };
  const limits = getLevelLimits(campaignLevel);
  const zoneTitle =
    level === 0
      ? 'Level 0 Â· Not started'
      : level <= 3
      ? `Level ${level} Â· Free Zone`
      : level <= 6
      ? `Level ${level} Â· Proctored Zone`
      : `Level ${level} Â· Metro Finals`;

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
            {trialsRemaining} attempts left today
          </Text>

          {freeZoneComplete ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startLevelBtn}
              onPress={() => alert("Payment isn't live yet. You'll be notified when Level 4 opens.")}
            >
              <Text style={styles.startLevelBtnText}>
                o" Unlock Level 4 +' Priority Access
              </Text>
            </TouchableOpacity>
          ) : todayCompleted ? (
            <View style={[styles.startLevelBtn, { backgroundColor: colors.border }]}>
              <Text style={[styles.startLevelBtnText, { color: colors.mutedDim }]}>
                o" Come back tomorrow +' Level {campaignLevel + 1} unlocked
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startLevelBtn}
              onPress={() =>
                navigation.navigate('Quiz', {
                  level: campaignLevel,
                })
              }
            >
              <Text style={styles.startLevelBtnText}>
                s Start Level {campaignLevel} Challenge +'
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
            <Text style={styles.sectionHeadSee}>See all â†’</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Column Discipline Grid */}
        <View style={styles.discGrid}>
          {activeDisciplines.map((item, index) => {
            const discColor = (colors as any)[item.color] || colors.teal;
            return (
              <View key={index} style={styles.discCard}>
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
                  Lv {Math.max(1, level > 0 ? level : 1)}
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
    paddingBottom: 90,
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
    fontSize: 15.5,
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
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  badgeStreakText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  badgeRank: {
    backgroundColor: colors.tealAlpha12,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  badgeRankText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  startLevelBtn: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 15,
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
    fontSize: 14.5,
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
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rdmCoinGold: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rdmCoinGoldText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.black,
    color: '#1a1400',
  },
  rdmCoinTeal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rdmCoinTealText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.black,
    color: '#04140E',
  },
  rdmValue: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  rdmLabel: {
    fontSize: 8.5,
    color: colors.mutedDim,
    textTransform: 'uppercase',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionHeadTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionHeadSee: {
    fontSize: 11,
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
    width: '31.5%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discChip: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  discChipText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.extrabold,
  },
  discName: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  discLv: {
    fontSize: 9,
    color: colors.mutedDim,
    marginTop: 2,
  },
});

