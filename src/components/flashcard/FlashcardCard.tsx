import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Card as CardType } from "../../utils/types";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 4;

/**
 * FlashcardCard Component
 * Card with 3D flip animation showing question/answer
 */

interface FlashcardCardProps {
  card: CardType;
  isFlipped: boolean;
  onFlip: () => void;
  testID?: string;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  isFlipped,
  onFlip,
  testID,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <TouchableOpacity
      onPress={onFlip}
      activeOpacity={0.9}
      style={styles.container}
      testID={testID}
    >
      {/* Front (Question) */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          {
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Question</Text>
          <Text style={styles.text}>{card.question}</Text>
        </View>

        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to reveal answer</Text>
        </View>
      </Animated.View>

      {/* Back (Answer) */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          {
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Answer</Text>
          <Text style={styles.text}>{card.answer}</Text>
        </View>

        <View style={styles.questionPreview}>
          <Text style={styles.questionPreviewText} numberOfLines={2}>
            Q: {card.question}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 400,
    alignSelf: "center",
  },

  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: spacing.lg,
    backfaceVisibility: "hidden",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  front: {},

  back: {},

  content: {
    flex: 1,
    justifyContent: "center",
  },

  label: {
    ...typography.label,
    color: colors.primary.main,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },

  text: {
    ...typography.question,
    color: colors.text.primary,
    textAlign: "left",
  },

  tapHint: {
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  tapHintText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },

  questionPreview: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  questionPreviewText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
});

export default FlashcardCard;
