import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CaptureStackParamList, GeneratedCard } from "../../utils/types";
import { useAppDispatch } from "../../store";
import { addGeneratedCard } from "../../store/slices/cardSlice";
import { generateFlashcardsStream } from "../../services/ai/cardGeneration";
import { appConfig } from "../../config/appConfig";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type CardGenerationScreenNavigationProp = NativeStackNavigationProp<
  CaptureStackParamList,
  "CardGeneration"
>;

type CardGenerationScreenRouteProp = RouteProp<
  CaptureStackParamList,
  "CardGeneration"
>;

/**
 * CardGenerationScreen
 * Generate flashcards from OCR text with streaming display
 */
export const CardGenerationScreen: React.FC = () => {
  const navigation = useNavigation<CardGenerationScreenNavigationProp>();
  const route = useRoute<CardGenerationScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { ocrText, deckId } = route.params;

  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const fadeAnim = new Animated.Value(0);

  /**
   * Generate cards on mount
   */
  useEffect(() => {
    generateCards();
  }, []);

  /**
   * Animate card entrance
   */
  const animateCardEntrance = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /**
   * Generate flashcards with streaming
   */
  const generateCards = async () => {
    try {
      setIsGenerating(true);
      setError("");

      logger.logUserAction("card_generation_started", {
        textLength: ocrText.length,
      });

      const generatedCards: GeneratedCard[] = [];
      const cardCount = appConfig.gemini.defaultCardCount;

      // Stream cards as they're generated
      for await (const card of generateFlashcardsStream(ocrText, cardCount)) {
        generatedCards.push(card);
        setCards([...generatedCards]);
        setProgress((generatedCards.length / cardCount) * 100);

        // Dispatch to Redux
        dispatch(addGeneratedCard(card));

        // Animate entrance
        animateCardEntrance();

        logger.info("Card generated", {
          cardIndex: generatedCards.length,
          total: cardCount,
        });
      }

      logger.logUserAction("card_generation_completed", {
        cardCount: generatedCards.length,
      });

      setIsGenerating(false);
    } catch (err) {
      logger.error("Card generation failed", { error: err });
      setError("Failed to generate flashcards. Please try again.");
      setIsGenerating(false);
    }
  };

  /**
   * Retry generation
   */
  const handleRetry = () => {
    setCards([]);
    setProgress(0);
    generateCards();
  };

  /**
   * Continue to review
   */
  const handleContinue = () => {
    if (cards.length === 0) {
      Alert.alert(
        "No Cards",
        "No flashcards were generated. Please try again."
      );
      return;
    }

    logger.logUserAction("navigate_to_card_review", {
      cardCount: cards.length,
    });

    navigation.navigate("CardReview", {
      cards,
      deckId: deckId || "",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isGenerating ? "Generating Flashcards..." : "Cards Generated!"}
        </Text>

        {isGenerating && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {cards.length} of {appConfig.gemini.defaultCardCount} cards
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Cards List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cards.map((card, index) => (
          <Animated.View
            key={card.tempId || index}
            style={[styles.cardWrapper, { opacity: fadeAnim }]}
          >
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>Card {index + 1}</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.label}>Question:</Text>
                <Text style={styles.question}>{card.question}</Text>

                <Text style={styles.label}>Answer:</Text>
                <Text style={styles.answer}>{card.answer}</Text>
              </View>
            </Card>
          </Animated.View>
        ))}

        {isGenerating && (
          <View style={styles.generatingPlaceholder}>
            <Text style={styles.generatingText}>Generating more cards...</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {!isGenerating && (
        <View style={styles.actions}>
          {error ? (
            <Button
              onPress={handleRetry}
              style={styles.actionButton}
              testID="retry-generation-button"
            >
              Retry
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onPress={handleRetry}
                style={styles.actionButton}
                testID="regenerate-button"
              >
                Regenerate
              </Button>

              <Button
                onPress={handleContinue}
                style={styles.actionButton}
                testID="review-cards-button"
              >
                Review Cards
              </Button>
            </>
          )}
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
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  progressContainer: {
    marginTop: spacing.sm,
  },

  progressText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  progressBar: {
    height: 8,
    backgroundColor: colors.surface.main,
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.primary.main,
  },

  errorContainer: {
    backgroundColor: colors.error.main,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },

  errorText: {
    ...typography.bodyRegular,
    color: colors.error.contrast,
    textAlign: "center",
  },

  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  cardWrapper: {
    marginBottom: spacing.md,
  },

  card: {
    padding: spacing.md,
  },

  cardHeader: {
    marginBottom: spacing.md,
  },

  cardNumber: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "600",
  },

  cardContent: {},

  label: {
    ...typography.label,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },

  question: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  answer: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  generatingPlaceholder: {
    padding: spacing.xl,
    alignItems: "center",
  },

  generatingText: {
    ...typography.bodyRegular,
    color: colors.text.tertiary,
  },

  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },

  actionButton: {
    flex: 1,
  },
});

export default CardGenerationScreen;
