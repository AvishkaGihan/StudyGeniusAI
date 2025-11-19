import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LibraryStackParamList, Card } from "../../utils/types";
import { useStudySession } from "../../hooks/useStudySession";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  selectCurrentCard,
  selectSessionProgress,
} from "../../store/slices/studySlice";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import FlashcardCard from "../../components/flashcard/FlashcardCard";
import DifficultySelector from "../../components/flashcard/DifficultySelector";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { logger } from "../../services/logger";

type StudyModeScreenNavigationProp = NativeStackNavigationProp<
  LibraryStackParamList,
  "StudyMode"
>;

type StudyModeScreenRouteProp = RouteProp<LibraryStackParamList, "StudyMode">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * StudyModeScreen
 * Main study interface with flashcards and spaced repetition
 * Tertiary screen in Library tab
 */
export const StudyModeScreen: React.FC = () => {
  const navigation = useNavigation<StudyModeScreenNavigationProp>();
  const route = useRoute<StudyModeScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { deckId } = route.params;
  const {
    startSession,
    reviewCard,
    endSession,
    isActive,
    loading,
    error,
    currentCard,
    progress,
    getAccuracy,
  } = useStudySession();

  const reduxCurrentCard = useAppSelector(selectCurrentCard);
  const reduxProgress = useAppSelector(selectSessionProgress);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState<{
    totalCards: number;
    cardsStudied: number;
    correctCount: number;
    startTime: number;
  } | null>(null);

  /**
   * Start study session on mount
   */
  useEffect(() => {
    initializeSession();
  }, [deckId]);

  /**
   * Initialize study session
   */
  const initializeSession = async () => {
    try {
      logger.logUserAction("initialize_study_session", { deckId });

      await startSession(deckId);

      setSessionStarted(true);
      setSessionStats({
        totalCards: reduxProgress?.total || 0,
        cardsStudied: 0,
        correctCount: 0,
        startTime: Date.now(),
      });

      logger.logUserAction("study_session_initialized", { deckId });
    } catch (err) {
      logger.error("Failed to start study session", { error: err });
      Alert.alert("Error", "Failed to start study session. Please try again.", [
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };

  /**
   * Handle card difficulty selection
   */
  const handleDifficultySelect = useCallback(
    async (difficulty: "again" | "hard" | "medium" | "easy") => {
      if (!reduxCurrentCard || isReviewing) {
        return;
      }

      try {
        setIsReviewing(true);

        logger.logUserAction("card_difficulty_selected", {
          cardId: reduxCurrentCard.id,
          difficulty,
        });

        // Review the card
        await reviewCard(difficulty);

        // Update stats
        if (sessionStats) {
          setSessionStats({
            ...sessionStats,
            cardsStudied: sessionStats.cardsStudied + 1,
            correctCount:
              difficulty === "easy" || difficulty === "medium"
                ? sessionStats.correctCount + 1
                : sessionStats.correctCount,
          });
        }

        // Reset for next card
        setShowAnswer(false);

        logger.logUserAction("card_reviewed", {
          cardId: reduxCurrentCard.id,
          difficulty,
        });
      } catch (err) {
        logger.error("Failed to review card", { error: err });
        Alert.alert("Error", "Failed to record review. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setIsReviewing(false);
      }
    },
    [reduxCurrentCard, isReviewing, sessionStats, reviewCard]
  );

  /**
   * Handle end session
   */
  const handleEndSession = () => {
    if (!sessionStats) return;

    Alert.alert(
      "End Study Session",
      `You've studied ${sessionStats.cardsStudied} cards. End session?`,
      [
        {
          text: "Continue Studying",
          style: "cancel",
        },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            try {
              logger.logUserAction("end_study_session", { deckId });

              const sessionDuration = Math.floor(
                (Date.now() - sessionStats.startTime) / 1000
              );

              endSession();

              logger.logUserAction("study_session_ended", {
                deckId,
                cardsStudied: sessionStats.cardsStudied,
                correctCount: sessionStats.correctCount,
                durationSeconds: sessionDuration,
              });

              // Show session summary and return to deck detail
              navigation.goBack();
            } catch (err) {
              logger.error("Failed to end session", { error: err });
            }
          },
        },
      ]
    );
  };

  /**
   * Render loading state
   */
  if (loading && !sessionStarted) {
    return (
      <LoadingSpinner fullScreen message="Preparing your study session..." />
    );
  }

  /**
   * Render error state
   */
  if (error && !sessionStarted) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to start session</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          variant="primary"
          onPress={() => initializeSession()}
          style={styles.retryButton}
          testID="retry-button"
        >
          Try Again
        </Button>
      </View>
    );
  }

  /**
   * Render session complete state
   */
  if (
    sessionStats &&
    reduxProgress &&
    reduxProgress.current > reduxProgress.total
  ) {
    const duration = Math.floor((Date.now() - sessionStats.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const accuracy = Math.round(
      (sessionStats.correctCount / sessionStats.cardsStudied) * 100 || 0
    );

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sessionCompleteContainer}>
          {/* Success Icon */}
          <Text style={styles.successIcon}>🎉</Text>

          {/* Title */}
          <Text style={styles.completeTitle}>Session Complete!</Text>

          {/* Stats Card */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cards Studied</Text>
              <Text style={styles.statValue}>{sessionStats.cardsStudied}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Time Spent</Text>
              <Text style={styles.statValue}>
                {minutes}:{seconds.toString().padStart(2, "0")}
              </Text>
            </View>
          </View>

          {/* Encouragement */}
          <Text style={styles.encouragementText}>
            {accuracy >= 80
              ? "Excellent performance! Keep it up! 🌟"
              : accuracy >= 60
                ? "Great effort! Practice makes perfect! 💪"
                : "Good progress! Review these cards again soon! 📚"}
          </Text>

          {/* Action Buttons */}
          <View style={styles.completeActions}>
            <Button
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
              testID="back-button"
            >
              Back to Deck
            </Button>

            <Button
              variant="primary"
              onPress={() => {
                setSessionStarted(false);
                setSessionStats(null);
                setShowAnswer(false);
                initializeSession();
              }}
              style={styles.actionButton}
              testID="study-again-button"
            >
              Study Again
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  /**
   * Render main study mode
   */
  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {reduxProgress
              ? `${reduxProgress.current} / ${reduxProgress.total}`
              : "Loading..."}
          </Text>
          <Text style={styles.progressLabel}>Cards</Text>
        </View>

        <TouchableOpacity
          onPress={handleEndSession}
          testID="end-session-button"
          style={styles.endButton}
        >
          <Text style={styles.endButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {reduxProgress && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.round(
                  (reduxProgress.current / reduxProgress.total) * 100
                )}%`,
              },
            ]}
          />
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {reduxCurrentCard ? (
          <>
            {/* Flashcard */}
            <View style={styles.cardContainer}>
              <FlashcardCard
                card={reduxCurrentCard}
                isFlipped={showAnswer}
                onFlip={() => setShowAnswer(!showAnswer)}
                testID="study-card"
              />
            </View>

            {/* Tap Hint */}
            {!showAnswer && (
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>
                  Tap card to reveal answer
                </Text>
              </View>
            )}

            {/* Question Preview (when answer is shown) */}
            {showAnswer && (
              <View style={styles.cardInfo}>
                <Text style={styles.infoLabel}>Question:</Text>
                <Text style={styles.infoText} numberOfLines={2}>
                  {reduxCurrentCard.question}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.loadingCardContainer}>
            <LoadingSpinner message="Loading card..." />
          </View>
        )}
      </ScrollView>

      {/* Difficulty Selector */}
      {showAnswer && reduxCurrentCard && (
        <View style={styles.difficultyContainer}>
          <DifficultySelector
            onSelect={handleDifficultySelect}
            disabled={isReviewing}
            testID="difficulty-selector"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  progressInfo: {
    alignItems: "center",
  },

  progressText: {
    ...typography.h2,
    color: colors.primary.main,
  },

  progressLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  endButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.main,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface.border,
  },

  endButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
  },

  progressBarContainer: {
    height: 4,
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },

  progressBar: {
    height: "100%",
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.sm,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },

  cardContainer: {
    width: "100%",
    marginBottom: spacing.lg,
  },

  tapHint: {
    alignItems: "center",
    marginTop: spacing.md,
  },

  tapHintText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },

  cardInfo: {
    width: "100%",
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },

  infoLabel: {
    ...typography.label,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },

  infoText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },

  loadingCardContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },

  difficultyContainer: {
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  sessionCompleteContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },

  successIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },

  completeTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  statsContainer: {
    width: "100%",
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },

  statLabel: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  statValue: {
    ...typography.h2,
    color: colors.primary.main,
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  encouragementText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  completeActions: {
    width: "100%",
    gap: spacing.sm,
  },

  actionButton: {
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background.default,
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  errorTitle: {
    ...typography.h2,
    color: colors.error.main,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  errorText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  retryButton: {
    minWidth: 200,
  },
});

export default StudyModeScreen;
