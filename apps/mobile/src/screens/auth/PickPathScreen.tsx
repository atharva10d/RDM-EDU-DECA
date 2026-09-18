import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card, Pill } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft } from 'lucide-react-native';

type PickPathScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PickPath'>;

interface PickPathScreenProps {
  navigation?: any;
}

export const PickPathScreen: React.FC<PickPathScreenProps> = ({ navigation }) => {
  const selectedTrack = useAppStore((state) => state.selectedTrack);
  const setSelectedTrack = useAppStore((state) => state.setSelectedTrack);
  const [localTrack, setLocalTrack] = useState<'A' | 'B'>(selectedTrack || 'A');

  const handleSelectTrack = (track: 'A' | 'B') => {
    setLocalTrack(track);
    setSelectedTrack(track);
  };

  const handleContinue = () => {
    setSelectedTrack(localTrack);
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Optional Back Button if stack has history */}
        {navigation?.canGoBack?.() && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
        )}

        {/* Step Pills Row */}
        <View style={styles.pillRow}>
          <Pill label="Join free" variant="teal" />
          <Pill label="Go viral" variant="blue" />
          <Pill label="Level up" variant="purple" />
          <Pill label="Go national" variant="dim" />
          <Pill label="Pick path" variant="active" />
          <Pill label="Sign in" variant="dim" />
        </View>

        {/* Screen Header */}
        <Text style={styles.screenTitle}>Choose your disciplines</Text>
        <Text style={styles.screenSub}>
          Locked cores stay. Pick one family path.
        </Text>

        {/* Gradient Progress Bar */}
        <View style={styles.progressBar} />

        {/* Card: Locked 8 Core Subjects */}
        <Card style={styles.lockedCard}>
          <Text style={styles.lockedHeader}>LOCKED IN · 8 subjects</Text>

          <View style={styles.chipRow}>
            <View style={[styles.chipMini, { borderColor: 'rgba(34,211,166,0.6)' }]}>
              <Text style={styles.chipText}>Physics</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
            <View style={[styles.chipMini, { borderColor: 'rgba(239,159,39,0.65)' }]}>
              <Text style={styles.chipText}>Chemistry</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
            <View style={[styles.chipMini, { borderColor: 'rgba(34,211,166,0.6)' }]}>
              <Text style={styles.chipText}>Verbal</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={[styles.chipMini, { borderColor: 'rgba(34,211,166,0.6)' }]}>
              <Text style={styles.chipText}>Quant</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
            <View style={[styles.chipMini, { borderColor: 'rgba(127,119,221,0.65)' }]}>
              <Text style={styles.chipText}>Analytical</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
            <View style={[styles.chipMini, { borderColor: 'rgba(240,180,41,0.65)' }]}>
              <Text style={styles.chipText}>GK</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
          </View>

          <View style={[styles.chipRow, { marginBottom: 0 }]}>
            <View style={[styles.chipMini, { borderColor: 'rgba(232,93,138,0.65)' }]}>
              <Text style={styles.chipText}>FinLit</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
            <View style={[styles.chipMini, { borderColor: 'rgba(240,180,41,0.65)' }]}>
              <Text style={styles.chipText}>Entrep</Text>
              <View style={styles.ckBox}>
                <Text style={styles.ckMark}>✓</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Card: Track Selection */}
        <Card style={styles.trackCard}>
          <Text style={styles.trackHeader}>YOUR PATH</Text>
          <Text style={styles.trackSub}>
            Pick one track — both its subjects come together
          </Text>

          {/* Track A */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.trackBox,
              localTrack === 'A' && styles.trackBoxSelectedA,
            ]}
            onPress={() => handleSelectTrack('A')}
          >
            <View style={styles.trackBoxHead}>
              <Text style={styles.trackBoxTitle}>Track A</Text>
              <View
                style={[
                  styles.trackRadio,
                  localTrack === 'A' && styles.trackRadioSelectedA,
                ]}
              >
                {localTrack === 'A' && <View style={styles.trackRadioInnerA} />}
              </View>
            </View>

            <View
              style={[
                styles.optRow,
                localTrack === 'A' && styles.optRowSelectedTeal,
              ]}
            >
              <Text style={styles.optLbl}>Σ Mathematics</Text>
              <View
                style={[
                  styles.boxCheck,
                  localTrack === 'A' && styles.boxCheckTeal,
                ]}
              >
                {localTrack === 'A' && <Text style={styles.ckMarkDark}>✓</Text>}
              </View>
            </View>

            <View
              style={[
                styles.optRow,
                localTrack === 'A' && styles.optRowSelectedTeal,
                { marginBottom: 0 },
              ]}
            >
              <Text style={styles.optLbl}>✎ Applied Mathematics</Text>
              <View
                style={[
                  styles.boxCheck,
                  localTrack === 'A' && styles.boxCheckTeal,
                ]}
              >
                {localTrack === 'A' && <Text style={styles.ckMarkDark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>

          {/* Track B */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.trackBox,
              localTrack === 'B' && styles.trackBoxSelectedB,
              { marginBottom: 0 },
            ]}
            onPress={() => handleSelectTrack('B')}
          >
            <View style={styles.trackBoxHead}>
              <Text style={styles.trackBoxTitle}>Track B</Text>
              <View
                style={[
                  styles.trackRadio,
                  localTrack === 'B' && styles.trackRadioSelectedB,
                ]}
              >
                {localTrack === 'B' && <View style={styles.trackRadioInnerB} />}
              </View>
            </View>

            <View
              style={[
                styles.optRow,
                localTrack === 'B' && styles.optRowSelectedPurple,
              ]}
            >
              <Text style={styles.optLbl}>🧬 Biology</Text>
              <View
                style={[
                  styles.boxCheck,
                  localTrack === 'B' && styles.boxCheckPurple,
                ]}
              >
                {localTrack === 'B' && <Text style={styles.ckMarkDark}>✓</Text>}
              </View>
            </View>

            <View
              style={[
                styles.optRow,
                localTrack === 'B' && styles.optRowSelectedPurple,
                { marginBottom: 0 },
              ]}
            >
              <Text style={styles.optLbl}>🧪 Biotechnology</Text>
              <View
                style={[
                  styles.boxCheck,
                  localTrack === 'B' && styles.boxCheckPurple,
                ]}
              >
                {localTrack === 'B' && <Text style={styles.ckMarkDark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.hintTxt}>
            Slots 9 &amp; 10 · choosing a track locks in both of its subjects together.
          </Text>
        </Card>

        {/* Card: 10-Subject Lineup Grid */}
        <Card style={styles.lineupCard}>
          <View style={styles.lineupHead}>
            <Text style={styles.lineupTitle}>Your lineup</Text>
            <Text style={styles.lineupStatus}>Ready to continue</Text>
          </View>

          <View style={styles.lineupGrid}>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.teal }]}>
                <Text style={styles.lineupNumText}>1</Text>
              </View>
              <Text style={styles.lineupName}>Phy</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.amber }]}>
                <Text style={styles.lineupNumText}>2</Text>
              </View>
              <Text style={styles.lineupName}>Chem</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.teal }]}>
                <Text style={styles.lineupNumText}>3</Text>
              </View>
              <Text style={styles.lineupName}>Verb</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.teal }]}>
                <Text style={styles.lineupNumText}>4</Text>
              </View>
              <Text style={styles.lineupName}>Quant</Text>
            </View>
          </View>

          <View style={styles.lineupGrid}>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.purple }]}>
                <Text style={styles.lineupNumText}>5</Text>
              </View>
              <Text style={styles.lineupName}>Analyt</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.gold }]}>
                <Text style={styles.lineupNumText}>6</Text>
              </View>
              <Text style={styles.lineupName}>GK</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.pink }]}>
                <Text style={styles.lineupNumText}>7</Text>
              </View>
              <Text style={styles.lineupName}>FinLit</Text>
            </View>
            <View style={styles.lineupItem}>
              <View style={[styles.lineupNum, { backgroundColor: colors.gold }]}>
                <Text style={styles.lineupNumText}>8</Text>
              </View>
              <Text style={styles.lineupName}>Entrep</Text>
            </View>
          </View>

          {/* Dynamic 9 & 10 Lineup Row */}
          <View style={[styles.lineupGrid, { marginBottom: 0, justifyContent: 'center' }]}>
            <View style={[styles.lineupItem, { flex: 0.5 }]}>
              <View
                style={[
                  styles.lineupNum,
                  { backgroundColor: localTrack === 'A' ? colors.teal : colors.teal },
                ]}
              >
                <Text style={styles.lineupNumText}>9</Text>
              </View>
              <Text style={styles.lineupName}>
                {localTrack === 'A' ? 'Math' : 'Bio'}
              </Text>
            </View>
            <View style={[styles.lineupItem, { flex: 0.5 }]}>
              <View
                style={[
                  styles.lineupNum,
                  { backgroundColor: localTrack === 'A' ? colors.purple : colors.purple },
                ]}
              >
                <Text style={styles.lineupNumText}>10</Text>
              </View>
              <Text style={styles.lineupName}>
                {localTrack === 'A' ? 'AMath' : 'Biotech'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          title="Continue with your 10 disciplines →"
          onPress={handleContinue}
          variant="primary"
          style={styles.continueButton}
        />
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
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  screenSub: {
    fontSize: typography.fontSize.sm,
    color: colors.muted,
    marginBottom: 14,
  },
  progressBar: {
    height: 4,
    borderRadius: borderRadius.round,
    backgroundColor: colors.teal,
    marginBottom: 14,
  },
  lockedCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  lockedHeader: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.6,
    color: colors.teal,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chipMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  ckBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ckMark: {
    fontSize: 9,
    fontWeight: typography.fontWeight.black,
    color: '#0B0E14',
  },
  ckMarkDark: {
    fontSize: 10,
    fontWeight: typography.fontWeight.black,
    color: '#0B0E14',
  },
  trackCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  trackHeader: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: 0.6,
    color: colors.amber,
    marginBottom: 2,
  },
  trackSub: {
    fontSize: 10.5,
    color: colors.mutedDim,
    marginBottom: 10,
  },
  trackBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.015)',
    marginBottom: 10,
  },
  trackBoxSelectedA: {
    borderColor: 'rgba(34,211,166,0.7)',
    backgroundColor: colors.tealAlpha10,
  },
  trackBoxSelectedB: {
    borderColor: 'rgba(127,119,221,0.7)',
    backgroundColor: colors.purpleAlpha08,
  },
  trackBoxHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackBoxTitle: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  trackRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackRadioSelectedA: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  trackRadioSelectedB: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  trackRadioInnerA: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#062017',
  },
  trackRadioInnerB: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 7,
  },
  optRowSelectedTeal: {
    borderColor: 'rgba(34,211,166,0.7)',
    backgroundColor: colors.tealAlpha10,
  },
  optRowSelectedPurple: {
    borderColor: 'rgba(127,119,221,0.7)',
    backgroundColor: colors.purpleAlpha08,
  },
  optLbl: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  boxCheck: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCheckTeal: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  boxCheckPurple: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  hintTxt: {
    fontSize: 10.5,
    color: colors.mutedDim,
    marginTop: 6,
  },
  lineupCard: {
    padding: spacing.base,
    marginBottom: 16,
  },
  lineupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lineupTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  lineupStatus: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
  lineupGrid: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 8,
  },
  lineupItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  lineupNum: {
    width: 15,
    height: 15,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lineupNumText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.extrabold,
    color: '#0B0E14',
  },
  lineupName: {
    fontSize: 9.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  continueButton: {
    marginBottom: 10,
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
    marginBottom: 12,
  },
});
