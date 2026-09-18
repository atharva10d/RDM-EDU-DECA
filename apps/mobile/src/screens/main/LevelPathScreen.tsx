import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Card } from '@edudeca/ui';
import { LEVEL_PATH_DATA } from '../../utils/mockData';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { canStartLevel, levelPathStatus } from '../../services/studentLoop/levelPathStatus';

type LevelPathScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'LevelPath'
>;

interface LevelPathScreenProps {
  navigation?: any;
}

export const LevelPathScreen: React.FC<LevelPathScreenProps> = ({ navigation }) => {
  const campaignLevel = useAppStore((state) => state.campaignLevel);
  const rdmBalance = useAppStore((state) => state.rdmBalance);
  const streak = useAppStore((state) => state.streak);

  const currentLevel = Math.max(1, campaignLevel);

  const tierColors: Record<string, string> = {
    free: colors.teal,
    paid: colors.purple,
    finals: colors.pink,
  };

  const tierTags: Record<string, string> = {
    free: 'FREE',
    paid: '₹999',
    finals: '🏆 FINALS',
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
          <View>
            <Text style={styles.headerTitle}>Level Path</Text>
            <Text style={styles.headerSub}>
              Free play → proctored rounds → national finals
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Level</Text>
            <Text style={styles.statVal}>
              Level {currentLevel} · {currentLevel <= 3 ? 'Free Zone' : currentLevel <= 6 ? 'Proctored' : 'Finals'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total XP</Text>
            <Text style={[styles.statVal, { color: colors.teal }]}>
              {rdmBalance.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statVal}>
              {Math.max(1, streak)} day{streak > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Stage Overview Cards */}
        <View style={styles.stageRow}>
          <View style={[styles.stageCard, styles.stageFree]}>
            <View>
              <Text style={styles.stageTitle}>Levels 1–3</Text>
              <Text style={styles.stageSub}>Free app-based participation</Text>
            </View>
            <View style={styles.tagFree}>
              <Text style={styles.tagFreeText}>FREE</Text>
            </View>
          </View>

          <View style={[styles.stageCard, styles.stagePaid]}>
            <View>
              <Text style={styles.stageTitle}>Levels 4–6</Text>
              <Text style={styles.stageSub}>Paid, college-proctored</Text>
            </View>
            <View style={styles.tagPaid}>
              <Text style={styles.tagPaidText}>₹999</Text>
            </View>
          </View>

          <View style={[styles.stageCard, styles.stageFinals]}>
            <View>
              <Text style={styles.stageTitle}>Levels 7–10</Text>
              <Text style={styles.stageSub}>Metro test-center finals</Text>
            </View>
            <View style={styles.tagFinals}>
              <Text style={styles.tagFinalsText}>FINALS</Text>
            </View>
          </View>
        </View>

        {/* Level Path Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineTrack} />

          {LEVEL_PATH_DATA.map((node) => {
            const status = levelPathStatus(node.n, campaignLevel, false);
            const isCurrent = status === 'current';
            const isLocked = status === 'locked';
            const nodeColor = tierColors[node.tier] || colors.teal;
            const statusLabel = isCurrent
              ? ' — You are here'
              : isLocked
              ? ''
              : ' — Complete';

            const onPressNode = () => {
              if (!canStartLevel(node.n, campaignLevel, false)) {
                Alert.alert(
                  isLocked ? 'Level locked' : 'Already complete',
                  isLocked
                    ? 'Only your current campaign level can start.'
                    : 'This level is already done.',
                );
                return;
              }
              navigation?.navigate('Quiz', { level: campaignLevel });
            };

            return (
              <TouchableOpacity
                key={node.n}
                style={styles.timelineNode}
                activeOpacity={0.85}
                onPress={onPressNode}
              >
                {/* Node Number Circle */}
                <View
                  style={[
                    styles.nodeCircle,
                    { backgroundColor: nodeColor },
                  ]}
                >
                  <Text style={styles.nodeCircleText}>{node.n}</Text>
                </View>

                {/* Node Content Body */}
                <View
                  style={[
                    styles.nodeBody,
                    isCurrent && styles.nodeBodyCurrent,
                  ]}
                >
                  <View style={styles.nodeTitleRow}>
                    <Text style={styles.nodeTitle}>
                      {node.title}
                      <Text
                        style={{
                          color: isCurrent ? colors.gold : colors.mutedDim,
                          fontWeight: '500',
                          fontSize: 12,
                        }}
                      >
                        {statusLabel}
                      </Text>
                    </Text>

                    {isLocked && <Lock size={12} color={colors.mutedDim} />}

                    <View
                      style={[
                        styles.tierBadge,
                        {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                      ]}
                    >
                      <Text style={[styles.tierBadgeText, { color: nodeColor }]}>
                        {tierTags[node.tier]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.nodeSub}>{node.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerSub: {
    fontSize: 12.5,
    color: colors.mutedDim,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  statLabel: {
    fontSize: 11.5,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: typography.fontWeight.bold,
  },
  statVal: {
    fontSize: 16.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginTop: 3,
  },
  stageRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  stageFree: {
    backgroundColor: colors.tealAlpha10,
    borderColor: colors.tealAlpha35,
  },
  stagePaid: {
    backgroundColor: colors.purpleAlpha08,
    borderColor: colors.purpleAlpha30,
  },
  stageFinals: {
    backgroundColor: colors.pinkAlpha08,
    borderColor: colors.pinkAlpha30,
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  stageSub: {
    fontSize: 12.5,
    color: colors.mutedDim,
    marginTop: 2,
  },
  tagFree: {
    backgroundColor: colors.teal,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: borderRadius.round,
  },
  tagFreeText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140E',
  },
  tagPaid: {
    backgroundColor: colors.purple,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: borderRadius.round,
  },
  tagPaidText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  tagFinals: {
    backgroundColor: colors.pink,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: borderRadius.round,
  },
  tagFinalsText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 26,
  },
  timelineTrack: {
    position: 'absolute',
    left: 11,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineNode: {
    position: 'relative',
    marginBottom: 16,
  },
  nodeCircle: {
    position: 'absolute',
    left: -28,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bg,
    zIndex: 2,
  },
  nodeCircleText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140E',
  },
  nodeBody: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nodeBodyCurrent: {
    backgroundColor: colors.goldAlpha12,
    borderColor: colors.goldAlpha35,
  },
  nodeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeTitle: {
    fontSize: 15.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  nodeSub: {
    fontSize: 12.5,
    color: colors.mutedDim,
    marginTop: 3,
  },
  tierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 14,
  },
  tierBadgeText: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.extrabold,
  },
});
