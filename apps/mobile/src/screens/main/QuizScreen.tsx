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
import { Question } from '@edudeca/types';
import { useAppStore } from '../../store/useAppStore';
import { quizService } from '../../services';

type QuizScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<DashboardStackParamList, 'Quiz'>;

interface QuizScreenProps {
  navigation?: any;
  route?: any;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const roundLength = route.params?.quizLength || 10;
  const user = useAppStore((state) => state.user);
  const currentLevel = useAppStore((state) => state.level);
  const targetLevel = route.params?.level || Math.max(1, currentLevel || 1);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const addRdm = useAppStore((state) => state.addRdm);
  const incrementQuizzesCompleted = useAppStore((state) => state.incrementQuizzesCompleted);
  const incrementStreak = useAppStore((state) => state.incrementStreak);
  const incrementLevel = useAppStore((state) => state.incrementLevel);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    try {
      const serverQuestions = await quizService.fetchChallengeQuestions(targetLevel);
      if (serverQuestions.length > 0) {
        // Use only the number of questions needed for this round
        setQuestions(serverQuestions.slice(0, roundLength));
      } else {
        setLoadError('No questions available for this level. Please try again later.');
      }
    } catch (err: any) {
      console.log('[QuizScreen] Question fetch error:', err.message);
      setLoadError(err.message || 'Failed to load questions. Check your connection.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Fetch questions from the EduDeca website API on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    loadQuestions();
    setCurrentIndex(0);
    setScore(0);
  }, [roundLength, targetLevel]);

  // High-precision countdown timer
  useEffect(() => {
    if (questions.length === 0) return;

    setTimeLeft(20);
    setPickedIndex(null);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, questions]);

  const handleTimeOut = () => {
    setPickedIndex(-1); // Lock as incorrect
  };

  const handlePickOption = (index: number) => {
    if (pickedIndex !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPickedIndex(index);
    const currentQ = questions[currentIndex];
    if (index === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const total = Math.max(1, questions.length);
    const finalScore = Math.min(total, Math.max(0, score));
    const accuracy = Math.min(100, Math.max(0, Math.round((finalScore / total) * 100)));
    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const isPassed = accuracy >= 70;

    // RDM calculation strictly proportional to actual score:
    // - Quick Round (10 Qs): 5 RDM per correct answer (up to 50 RDM for 10/10)
    // - Standard Round (20 Qs): 5.5 RDM per correct answer (up to 110 RDM for 20/20)
    // - Full Round (30 Qs): 6 RDM per correct answer (up to 180 RDM for 30/30)
    let earnedRdm = 0;
    if (total <= 10) {
      earnedRdm = Math.min(50, finalScore * 5);
    } else if (total <= 20) {
      earnedRdm = Math.min(110, Math.round(finalScore * 5.5));
    } else {
      earnedRdm = Math.min(180, finalScore * 6);
    }

    setIsSubmitting(true);

    try {
      // Live API backend submission
      const response = await quizService.submitQuizAttempt(
        {
          userId: user?.id,
          level: targetLevel,
          score: finalScore,
          total,
          totalQuestions: total,
          accuracy,
          timeTaken,
          earnedRdm,
          passed: isPassed,
        },
        user?.id
      );

      if (response?.user) {
        setUserProfile(response.user);
      } else {
        addRdm(earnedRdm);
        incrementQuizzesCompleted();
        incrementStreak();
        if (isPassed && targetLevel > currentLevel) {
          incrementLevel();
        }
      }

      navigation.navigate('Results', {
        score: finalScore,
        total,
        earnedRdm: response?.attempt?.earnedRdm ?? earnedRdm,
        accuracy: response?.attempt?.accuracy ?? accuracy,
        leveledUp: response?.leveledUp ?? (isPassed && targetLevel > currentLevel),
        newLevel: response?.newLevel ?? (isPassed ? Math.max(currentLevel, targetLevel) : currentLevel),
      });
    } catch (err: any) {
      // Direct store update fallback
      addRdm(earnedRdm);
      incrementQuizzesCompleted();
      incrementStreak();
      if (isPassed && targetLevel > currentLevel) {
        incrementLevel();
      }

      navigation.navigate('Results', {
        score: finalScore,
        total,
        earnedRdm,
        accuracy,
        leveledUp: isPassed && targetLevel > currentLevel,
        newLevel: isPassed ? Math.max(currentLevel, targetLevel) : currentLevel,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    Alert.alert('Leave this round?', "Your progress won't be saved.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          navigation.navigate('Dashboard');
        },
      },
    ]);
  };

  if (loadError && questions.length === 0 && !isLoadingQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.amber, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Challenge Unavailable
          </Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginHorizontal: 32, marginBottom: 20 }}>
            {loadError}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.teal, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, marginBottom: 12 }}
            onPress={loadQuestions}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={{ color: colors.muted }}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0 || isSubmitting) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {isSubmitting ? 'Syncing results with server...' : 'Preparing round...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progressPct = ((currentIndex + 1) / total) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];
  const tagColor = (colors as any)[currentQ.color] || colors.teal;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quiz Header: Back + Progress + Circular Timer */}
        <View style={styles.quizHead}>
          <TouchableOpacity activeOpacity={0.7} style={styles.backBtn} onPress={handleExit}>
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressPos}>
                Question {currentIndex + 1} of {total}
              </Text>
              <Text style={styles.progressScore}>Score: {score}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          <View
            style={[
              styles.timerRing,
              timeLeft <= 5 && styles.timerUrgent,
              timeLeft === 0 && styles.timerDead,
            ]}
          >
            <Text
              style={[
                styles.timerText,
                timeLeft <= 5 && styles.timerTextUrgent,
                timeLeft === 0 && styles.timerTextDead,
              ]}
            >
              {timeLeft}
            </Text>
          </View>
        </View>

        {/* Discipline Tag Chip */}
        <View style={styles.tagWrap}>
          <View style={[styles.tagBadge, { borderColor: tagColor }]}>
            <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
            <Text style={[styles.tagLabel, { color: tagColor }]}>{currentQ.tag}</Text>
          </View>
        </View>

        {/* Question Text */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.q}</Text>
        </View>

        {/* 4 Interactive Option Buttons */}
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
              if (isCorrect) {
                optStyle = styles.optCorrect;
                textStyle = styles.optTextCorrect;
                letterStyle = styles.optLetterCorrect;
                letterTextStyle = styles.optLetterTextCorrect;
              } else if (isPicked) {
                optStyle = styles.optIncorrect;
                textStyle = styles.optTextIncorrect;
                letterStyle = styles.optLetterIncorrect;
                letterTextStyle = styles.optLetterTextIncorrect;
              } else {
                optStyle = styles.optDimmed;
                textStyle = styles.optTextDimmed;
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.optBtn, optStyle]}
                onPress={() => handlePickOption(index)}
                disabled={isAnswered}
              >
                <View style={[styles.optLetter, letterStyle]}>
                  <Text style={[styles.optLetterText, letterTextStyle]}>
                    {optionLetters[index]}
                  </Text>
                </View>
                <Text style={[styles.optText, textStyle]}>{optText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next / Finish Button */}
        {pickedIndex !== null && (
          <Button
            title={currentIndex < questions.length - 1 ? 'Next Question →' : 'View Results →'}
            onPress={handleNext}
            variant="primary"
            style={styles.nextBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  quizHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPos: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  progressScore: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: typography.fontWeight.extrabold,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 3,
  },
  timerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUrgent: {
    borderColor: colors.amber,
  },
  timerDead: {
    borderColor: colors.red,
  },
  timerText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  timerTextUrgent: {
    color: colors.amber,
  },
  timerTextDead: {
    color: colors.red,
  },
  tagWrap: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    backgroundColor: colors.card,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
    minHeight: 90,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 15.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: 22,
  },
  optionsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: 12,
  },
  optNormal: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  optCorrect: {
    backgroundColor: colors.tealAlpha10,
    borderColor: colors.teal,
  },
  optIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.red,
  },
  optDimmed: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    opacity: 0.5,
  },
  optLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterNormal: {
    backgroundColor: colors.card2,
  },
  optLetterCorrect: {
    backgroundColor: colors.teal,
  },
  optLetterIncorrect: {
    backgroundColor: colors.red,
  },
  optLetterText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
  },
  optLetterTextNormal: {
    color: colors.text,
  },
  optLetterTextCorrect: {
    color: '#04140E',
  },
  optLetterTextIncorrect: {
    color: '#FFFFFF',
  },
  optText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.medium,
  },
  optTextNormal: {
    color: colors.text,
  },
  optTextCorrect: {
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
  optTextIncorrect: {
    color: colors.red,
    fontWeight: typography.fontWeight.bold,
  },
  optTextDimmed: {
    color: colors.mutedDim,
  },
  nextBtn: {
    marginTop: 6,
  },
});
