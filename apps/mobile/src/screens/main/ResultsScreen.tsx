import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, Button, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { formatTrialsLeft } from '../../services/studentLoop/trialsCopy';
import { MessageCircle, Instagram, Zap, Award, AlertCircle } from 'lucide-react-native';

type ResultsScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Results'>;
type ResultsScreenRouteProp = RouteProp<DashboardStackParamList, 'Results'>;

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const total = Math.max(1, route.params?.total || 10);
  const score = Math.min(total, Math.max(0, route.params?.score || 0));
  const accuracy = route.params?.accuracy ?? Math.round((score / total) * 100);
  const earnedRdm = route.params?.earnedRdm || 0;
  const leveledUp = route.params?.leveledUp || false;
  const newLevel = route.params?.newLevel;

  const trialsRemaining = useAppStore((state) => state.trialsRemaining);
  const freeZoneComplete = useAppStore((state) => state.freeZoneComplete);
  const streak = useAppStore((state) => state.streak);

  const isPassed = leveledUp || accuracy >= 70;

  // Determine Title & SubText based on spec
  let title = '';
  let subText = '';
  let emoji = isPassed ? '🏆' : '💀';

  if (isPassed) {
    if (newLevel === 4 || freeZoneComplete) {
      title = 'Free Zone Complete!';
      subText = 'You have mastered the first 3 levels.';
    } else {
      title = 'Level Passed!';
      subText = 'Next level unlocks tomorrow.';
    }
  } else {
    if (trialsRemaining > 0) {
      title = 'Try Again';
      subText = formatTrialsLeft(trialsRemaining) + '.';
    } else {
      title = 'Attempts Exhausted';
      subText = 'No more trials left on this level.';
    }
  }

  const handleShare = async (platform: 'WhatsApp' | 'Instagram') => {
    try {
      await Share.share({
        message: `I just scored ${score}/${total} (${accuracy}% accuracy) in EduDeca and earned +${earnedRdm} RDM points! ⚡ Join me in India's Whiz360 Challenge!`,
      });
    } catch (_err) {
      Alert.alert('Share', `Sharing to ${platform}...`);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHero}>
          <Text style={styles.resultsEmoji}>{emoji}</Text>
          <Text style={styles.resultsTitle}>{title}</Text>
          <Text style={styles.resultsSub}>{subText}</Text>
        </View>

        <View style={styles.scoreWrap}>
          <Text style={styles.scoreBig}>
            {score}
            <Text style={styles.scoreOf}>/{total}</Text>
          </Text>
        </View>

        <View style={styles.resultsStatsRow}>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>+{earnedRdm}</Text>
            <Text style={styles.rstatLbl}>RDM Earned</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{accuracy}%</Text>
            <Text style={styles.rstatLbl}>Accuracy</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{Math.max(1, streak)}</Text>
            <Text style={styles.rstatLbl}>Day Streak</Text>
          </View>
        </View>

        {isPassed && (newLevel === 4 || freeZoneComplete) && (
          <Card style={styles.priorityCard}>
            <View style={styles.leveledUpRow}>
              <Zap size={22} color={colors.gold} strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.leveledUpTitle}>Level 4 Priority Access</Text>
                <Text style={styles.leveledUpDesc}>
                  Payment isn't live yet. You'll be notified when Level 4 opens.
                </Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.shareRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.shareBtn} onPress={() => handleShare('WhatsApp')}>
            <MessageCircle size={16} color={colors.teal} />
            <Text style={styles.shareBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.shareBtn} onPress={() => handleShare('Instagram')}>
            <Instagram size={16} color={colors.pink} />
            <Text style={styles.shareBtnText}>Instagram</Text>
          </TouchableOpacity>
        </View>

        <Button title="Continue to Dashboard →" onPress={handleContinue} variant="primary" style={styles.continueBtn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scrollContainer: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 40 },
  resultsHero: { alignItems: 'center', marginBottom: 16 },
  resultsEmoji: { fontSize: 52, marginBottom: 10 },
  resultsTitle: { fontSize: 24, fontWeight: typography.fontWeight.extrabold, color: colors.text, marginBottom: 4 },
  resultsSub: { fontSize: 14.5, color: colors.muted, marginBottom: 16, textAlign: 'center' },
  scoreWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  scoreBig: { fontSize: typography.fontSize.score, fontWeight: typography.fontWeight.extrabold, color: colors.text },
  scoreOf: { fontSize: 18, color: colors.mutedDim, fontWeight: typography.fontWeight.semibold },
  resultsStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  rstat: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center' },
  rstatVal: { fontSize: 18, fontWeight: typography.fontWeight.extrabold, color: colors.teal },
  rstatLbl: { fontSize: 11.5, color: colors.mutedDim, textTransform: 'uppercase', marginTop: 3, fontWeight: typography.fontWeight.bold, letterSpacing: 0.4 },
  priorityCard: { padding: 16, backgroundColor: colors.goldAlpha10, borderColor: colors.goldAlpha35, marginBottom: 16 },
  leveledUpRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  leveledUpTitle: { fontSize: 16, fontWeight: typography.fontWeight.extrabold, color: colors.gold, marginBottom: 2 },
  leveledUpDesc: { fontSize: 13.5, color: colors.text, lineHeight: 18 },
  shareRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, minHeight: 48, borderRadius: borderRadius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  shareBtnText: { fontSize: 14, fontWeight: typography.fontWeight.bold, color: colors.text },
  continueBtn: { marginTop: 4 },
});
