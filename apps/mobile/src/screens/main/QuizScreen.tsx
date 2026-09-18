import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, Button } from '@edudeca/ui';
import { ArrowLeft } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { edudecaApi, EdudecaApiError } from '../../services/edudecaApi';
import { progressService } from '../../services/progressService';
import { applyServerProgress } from '../../services/studentLoop/applyServerProgress';
import {
  appendPendingResult,
  buildChallengeCompletePayload,
} from '../../services/studentLoop/challengeCompletePayload';
import { mapChallengeQuestion } from '../../services/studentLoop/mapChallengeQuestion';
import { getGateErrorAction } from '../../utils/gateErrors';

type QuizScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<DashboardStackParamList, 'Quiz'>;

interface QuizScreenProps {
  navigation: QuizScreenNavigationProp;
  route: QuizScreenRouteProp;
}

interface QuizQuestion {
  id: string;
  discipline: string;
  tag: string;
  color: string;
  q: string;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  questionId: string;
  subjectId: string;
  isCorrect: boolean;
  skipped: boolean;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const targetLevel = route.params?.level || 1;
  const user = useAppStore((state) => state.user);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [results, setResults] = useState<QuizResult[]>([]);

  const limitTime = targetLevel === 1 ? 5 * 60 : targetLevel === 2 ? 10 * 60 : 20 * 60;
  const limitStrikes = targetLevel === 1 ? 5 : targetLevel === 2 ? 7 : 10;

  const [timeLeft, setTimeLeft] = useState<number>(limitTime);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const scoreRef = useRef<number>(0);
  const strikesRef = useRef<number>(0);
  const resultsRef = useRef<QuizResult[]>([]);
  const strikeEndedRef = useRef<boolean>(false);
  const timeEndedRef = useRef<boolean>(false);
  const lastEndReasonRef = useRef<'won' | 'strikes' | 'time' | 'quit' | null>(null);

  const initChallenge = async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    try {
      try {
        await edudecaApi.getChallengeAvailability();
      } catch (err: any) {
        if (err instanceof EdudecaApiError && err.status === 401) {
          setIsLoadingQuestions(false);
          return;
        }
        const errCode =
          err instanceof EdudecaApiError
            ? err.code || err.message
            : err?.code || err?.reason || err?.message || '';
        const action = getGateErrorAction(errCode);
        Alert.alert(action.title, action.message, [{ text: 'OK', onPress: () => navigation.navigate(action.navigate as any) }]);
        setIsLoadingQuestions(false);
        return;
      }

      const res = await edudecaApi.getChallengeQuestions(targetLevel);
      if (res.questions && res.questions.length > 0) {
        const mapped: QuizQuestion[] = res.questions.map(mapChallengeQuestion).map((question) => ({
          id: question.id,
          discipline: question.subjectId,
          tag: question.tag,
          color: question.color,
          q: question.q,
          options: question.options,
          correctIndex: question.correctIndex,
        }));
        setQuestions(mapped);
        setCurrentIndex(0);
        scoreRef.current = 0;
        strikesRef.current = 0;
        resultsRef.current = [];
        strikeEndedRef.current = false;
        timeEndedRef.current = false;
        lastEndReasonRef.current = null;
        setScore(0);
        setStrikes(0);
        setResults([]);
        setPickedIndex(null);
        setTimeLeft(limitTime);
        startTimeRef.current = Date.now();
      } else {
        setLoadError('No questions available for this level. Please try again later.');
      }
    } catch (err: any) {
      if (err instanceof EdudecaApiError && err.status === 401) {
        return;
      }
      const errCode =
        err instanceof EdudecaApiError
          ? err.code || err.message
          : err?.code || err?.reason || err?.message || '';
      const action = getGateErrorAction(errCode);
      if (action.title !== 'Challenge Locked') {
        Alert.alert(action.title, action.message, [{ text: 'OK', onPress: () => navigation.navigate(action.navigate as any) }]);
      } else {
        setLoadError(err?.message || 'Failed to load questions. Please check your connection.');
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    initChallenge();
  }, [targetLevel]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    strikesRef.current = strikes;
  }, [strikes]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    if (isLoadingQuestions || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timeEndedRef.current = true;
          handleEndChallenge('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isLoadingQuestions, questions]);

  const handleEndChallenge = async (
    reason: 'won' | 'strikes' | 'time' | 'quit',
    pendingResult?: QuizResult,
  ) => {
    if (isSubmittingRef.current) return;
    lastEndReasonRef.current = reason;
    isSubmittingRef.current = true;
    clearInterval(timerRef.current);
    let completeSucceeded = false;
    try {
      let resultsSnapshot = resultsRef.current;
      if (pendingResult) {
        resultsSnapshot = appendPendingResult(resultsSnapshot, pendingResult);
      }
      if (reason === 'time') {
        const unansweredQuestion = questions.find(
          (question) => !resultsSnapshot.some((result) => result.questionId === question.id),
        );
        if (unansweredQuestion) {
          resultsSnapshot = appendPendingResult(resultsSnapshot, {
            questionId: unansweredQuestion.id,
            subjectId: unansweredQuestion.discipline,
            isCorrect: false,
            skipped: true,
          });
        }
      }
      if (resultsSnapshot !== resultsRef.current) {
        resultsRef.current = resultsSnapshot;
        setResults(resultsSnapshot);
      }
      const scoreSnapshot = scoreRef.current;
      const strikesSnapshot = strikesRef.current;
      const response = await edudecaApi.completeChallenge(
        buildChallengeCompletePayload({
          reason,
          correct: scoreSnapshot,
          total: questions.length,
          campaignLevelAtStart: targetLevel,
          strikes: strikesSnapshot,
          results: resultsSnapshot,
        }),
      );
      completeSucceeded = true;
      if (response?.progress) {
        useAppStore.getState().setProgress({
          ...applyServerProgress(response.progress),
          ...(typeof response.trials?.remaining === 'number'
            ? { trialsRemaining: response.trials.remaining }
            : {}),
        });
      } else if (typeof response?.trials?.remaining === 'number') {
        useAppStore.getState().setProgress({
          trialsRemaining: response.trials.remaining,
        });
      }
      void progressService.loadProgress().catch((loadErr) => {
        console.warn('[QuizScreen] Failed to refresh progress after challenge complete:', loadErr);
      });
      const accuracy = questions.length > 0 ? Math.round((scoreSnapshot / questions.length) * 100) : 0;
      const nextLevel = response?.progress?.campaignLevel;
      const xpEarned = scoreSnapshot * 10;
      navigation.replace('Results', {
        score: scoreSnapshot,
        total: questions.length,
        earnedRdm: xpEarned,
        accuracy,
        leveledUp: Boolean(nextLevel && nextLevel > targetLevel),
        newLevel: nextLevel,
        reason,
        correct: scoreSnapshot,
        strikes: strikesSnapshot,
        xpEarned,
        campaignLevelAtStart: targetLevel,
      });
    } catch (err: any) {
      if (completeSucceeded) {
        return;
      }
      isSubmittingRef.current = false;
      if (err instanceof EdudecaApiError && err.status === 401) {
        return;
      }
      const errCode =
        err instanceof EdudecaApiError
          ? err.code || err.message
          : err?.code || err?.reason || err?.message || '';
      const action = getGateErrorAction(errCode);
      if (action.title !== 'Challenge Locked') {
        Alert.alert(action.title, action.message, [{ text: 'OK', onPress: () => navigation.navigate(action.navigate as any) }]);
      } else {
        Alert.alert('Submission Error', err?.message || 'Failed to submit challenge results.', [
          { text: 'OK' },
        ]);
      }
    }
  };

  const handlePickOption = (index: number) => {
    if (isSubmittingRef.current || strikeEndedRef.current || timeEndedRef.current) return;
    if (pickedIndex !== null) return;
    setPickedIndex(index);
    const currentQ = questions[currentIndex];
    if (index === currentQ.correctIndex) {
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
    } else {
      const nextStrikes = strikesRef.current + 1;
      strikesRef.current = nextStrikes;
      setStrikes(nextStrikes);
      if (nextStrikes >= limitStrikes) {
        strikeEndedRef.current = true;
        setTimeout(() => handleEndChallenge('strikes'), 800);
      }
    }
    const nextResults = appendPendingResult(resultsRef.current, {
      questionId: currentQ.id,
      subjectId: currentQ.discipline,
      isCorrect: index === currentQ.correctIndex,
      skipped: false,
    });
    resultsRef.current = nextResults;
    setResults(nextResults);
  };

  const handleNext = () => {
    if (isSubmittingRef.current) return;
    if (strikeEndedRef.current || timeEndedRef.current) {
      const retryReason = lastEndReasonRef.current;
      if (retryReason !== null) {
        handleEndChallenge(retryReason);
      }
      return;
    }
    const currentQ = questions[currentIndex];
    const isLastQuestion = currentIndex >= questions.length - 1;
    const currentAlreadyRecorded = resultsRef.current.some(
      (result) => result.questionId === currentQ.id,
    );
    if (
      isLastQuestion &&
      currentAlreadyRecorded &&
      lastEndReasonRef.current !== null &&
      lastEndReasonRef.current === 'won'
    ) {
      handleEndChallenge(lastEndReasonRef.current);
      return;
    }
    const isSkipped = pickedIndex === null;
    let skippedResult: QuizResult | undefined;
    if (isSkipped) {
      skippedResult = {
        questionId: currentQ.id,
        subjectId: currentQ.discipline,
        isCorrect: false,
        skipped: true,
      };
      const nextResults = appendPendingResult(resultsRef.current, skippedResult);
      resultsRef.current = nextResults;
      setResults(nextResults);
      const nextStrikes = strikesRef.current + 1;
      strikesRef.current = nextStrikes;
      setStrikes(nextStrikes);
      if (nextStrikes >= limitStrikes) {
        strikeEndedRef.current = true;
        handleEndChallenge('strikes', skippedResult);
        return;
      }
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setPickedIndex(null);
    } else {
      handleEndChallenge('won', skippedResult);
    }
  };

  const handleExit = () => {
    Alert.alert('Quit Challenge?', 'Your progress will be saved but no trial will be used.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => handleEndChallenge('quit') },
    ]);
  };

  if (isLoadingQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={{ color: colors.muted, marginTop: 16, fontSize: 14 }}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.red, fontSize: 15, textAlign: 'center', marginBottom: 20 }}>{loadError}</Text>
          <TouchableOpacity style={{ backgroundColor: colors.teal, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, marginBottom: 12 }} onPress={initChallenge}>
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progressPct = ((currentIndex + 1) / total) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];
  const tagColor = (colors as any)[currentQ.color] || colors.teal;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.quizHead}>
          <TouchableOpacity activeOpacity={0.7} style={styles.backBtn} onPress={handleExit}>
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressPos}>Q{currentIndex + 1}/{total} · Strikes: {strikes}/{limitStrikes}</Text>
              <Text style={styles.progressScore}>Score: {score}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
          <View style={[styles.timerRing, timeLeft <= 60 && styles.timerUrgent, timeLeft === 0 && styles.timerDead]}>
            <Text style={[styles.timerText, timeLeft <= 60 && styles.timerTextUrgent, timeLeft === 0 && styles.timerTextDead]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <View style={styles.tagWrap}>
          <View style={[styles.tagBadge, { borderColor: tagColor }]}>
            <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
            <Text style={[styles.tagLabel, { color: tagColor }]}>{currentQ.tag}</Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.q}</Text>
        </View>

        <View style={styles.optionsWrap}>
          {currentQ.options.map((optText, index) => {
            const isPicked = pickedIndex === index;
            const isCorrect = index === currentQ.correctIndex;
            const isAnswered = pickedIndex !== null;
            let optStyle: ViewStyle = styles.optNormal;
            let textStyle: TextStyle = styles.optTextNormal;
            let letterStyle: ViewStyle = styles.optLetterNormal;
            let letterTextStyle: TextStyle = styles.optLetterTextNormal;
            if (isAnswered) {
              if (isCorrect) { optStyle = styles.optCorrect; textStyle = styles.optTextCorrect; letterStyle = styles.optLetterCorrect; letterTextStyle = styles.optLetterTextCorrect; }
              else if (isPicked) { optStyle = styles.optIncorrect; textStyle = styles.optTextIncorrect; letterStyle = styles.optLetterIncorrect; letterTextStyle = styles.optLetterTextIncorrect; }
              else { optStyle = styles.optDimmed; textStyle = styles.optTextDimmed; }
            }
            return (
              <TouchableOpacity key={index} activeOpacity={0.8} style={[styles.optBtn, optStyle]} onPress={() => handlePickOption(index)} disabled={isAnswered}>
                <View style={[styles.optLetter, letterStyle]}>
                  <Text style={[styles.optLetterText, letterTextStyle]}>{optionLetters[index]}</Text>
                </View>
                <Text style={[styles.optText, textStyle]}>{optText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={pickedIndex === null ? 'Skip Question' : (currentIndex < questions.length - 1 ? 'Next Question' : 'View Results')}
          onPress={handleNext}
          variant={pickedIndex === null ? 'outline' : 'primary'}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scrollContainer: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 40 },
  quizHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  progressWrap: { flex: 1 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressPos: { fontSize: 11, color: colors.muted, fontWeight: typography.fontWeight.bold },
  progressScore: { fontSize: 11, color: colors.teal, fontWeight: typography.fontWeight.extrabold },
  progressBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.teal, borderRadius: 3 },
  timerRing: { paddingHorizontal: 10, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  timerUrgent: { borderColor: colors.amber },
  timerDead: { borderColor: colors.red },
  timerText: { fontSize: 12, fontWeight: typography.fontWeight.extrabold, color: colors.teal },
  timerTextUrgent: { color: colors.amber },
  timerTextDead: { color: colors.red },
  tagWrap: { alignItems: 'flex-start', marginBottom: 12 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: borderRadius.round, borderWidth: 1, backgroundColor: colors.card },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagLabel: { fontSize: 11, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase' },
  questionCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 18, minHeight: 90, justifyContent: 'center' },
  questionText: { fontSize: 15.5, fontWeight: typography.fontWeight.bold, color: colors.text, lineHeight: 22 },
  optionsWrap: { gap: 10, marginBottom: 20 },
  optBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: borderRadius.md, borderWidth: 1.5, gap: 12 },
  optNormal: { backgroundColor: colors.card, borderColor: colors.border },
  optCorrect: { backgroundColor: colors.tealAlpha10, borderColor: colors.teal },
  optIncorrect: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: colors.red },
  optDimmed: { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.5 },
  optLetter: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  optLetterNormal: { backgroundColor: colors.card2 },
  optLetterCorrect: { backgroundColor: colors.teal },
  optLetterIncorrect: { backgroundColor: colors.red },
  optLetterText: { fontSize: 11, fontWeight: typography.fontWeight.extrabold },
  optLetterTextNormal: { color: colors.text },
  optLetterTextCorrect: { color: '#04140E' },
  optLetterTextIncorrect: { color: '#FFFFFF' },
  optText: { flex: 1, fontSize: 13.5, fontWeight: typography.fontWeight.medium },
  optTextNormal: { color: colors.text },
  optTextCorrect: { color: colors.teal, fontWeight: typography.fontWeight.bold },
  optTextIncorrect: { color: colors.red, fontWeight: typography.fontWeight.bold },
  optTextDimmed: { color: colors.mutedDim },
  nextBtn: { marginTop: 6 },
});

