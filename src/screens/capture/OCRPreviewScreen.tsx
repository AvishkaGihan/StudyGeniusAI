import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CaptureStackParamList } from "../../utils/types";
import { extractTextFromImage } from "../../services/vision/ocrService";
import { prepareImageForOCR } from "../../services/vision/imageProcessing";
import { validateOCRText } from "../../utils/validation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { logger } from "../../services/logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type OCRPreviewScreenNavigationProp = NativeStackNavigationProp<
  CaptureStackParamList,
  "OCRPreview"
>;

type OCRPreviewScreenRouteProp = RouteProp<CaptureStackParamList, "OCRPreview">;

/**
 * OCRPreviewScreen
 * Preview captured image and extracted OCR text with editing capability
 */
export const OCRPreviewScreen: React.FC = () => {
  const navigation = useNavigation<OCRPreviewScreenNavigationProp>();
  const route = useRoute<OCRPreviewScreenRouteProp>();

  const { imageUri } = route.params;

  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  /**
   * Process image and extract text
   */
  useEffect(() => {
    processImage();
  }, [imageUri]);

  const processImage = async () => {
    try {
      setIsProcessing(true);
      setError("");

      logger.info("Starting OCR processing", { imageUri });

      // Prepare image for OCR
      const preparedImage = await prepareImageForOCR(imageUri);

      logger.info("Image prepared, extracting text");

      // Extract text
      const result = await extractTextFromImage(preparedImage.uri);

      logger.info("Text extracted successfully", {
        textLength: result.text.length,
        confidence: result.confidence,
      });

      // Validate text
      const validation = validateOCRText(result.text);
      if (!validation.valid) {
        setError(validation.error || "Failed to extract valid text");
        setOcrText("");
      } else {
        setOcrText(result.text);
      }
    } catch (err) {
      logger.error("OCR processing failed", { error: err });
      setError(
        "Failed to extract text. Please try again with a clearer photo."
      );
      setOcrText("");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Retry OCR
   */
  const handleRetry = () => {
    navigation.goBack();
  };

  /**
   * Continue to card generation
   */
  const handleContinue = () => {
    const validation = validateOCRText(ocrText);

    if (!validation.valid) {
      Alert.alert(
        "Invalid Text",
        validation.error || "Please enter valid text"
      );
      return;
    }

    logger.logUserAction("ocr_text_confirmed", {
      textLength: ocrText.length,
    });

    navigation.navigate("CardGeneration", { ocrText });
  };

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Scanning text..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {/* OCR Text */}
        <View style={styles.textContainer}>
          <Text style={styles.sectionTitle}>Extracted Text</Text>
          <Text style={styles.helperText}>
            Review and edit the text before generating flashcards
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <Input
              value={ocrText}
              onChangeText={setOcrText}
              placeholder="Extracted text will appear here..."
              multiline
              numberOfLines={10}
              maxLength={10000}
              style={styles.textInput}
            />
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          variant="secondary"
          onPress={handleRetry}
          style={styles.actionButton}
          testID="retry-button"
        >
          Retake Photo
        </Button>

        <Button
          onPress={handleContinue}
          disabled={!ocrText || ocrText.trim().length === 0}
          style={styles.actionButton}
          testID="continue-button"
        >
          Generate Cards
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  previewImage: {
    width: SCREEN_WIDTH,
    height: 300,
    resizeMode: "cover",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.dark,
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    marginBottom: spacing.md,
  },

  image: {
    width: SCREEN_WIDTH,
    height: 250,
    resizeMode: "cover",
  },

  textContainer: {
    padding: spacing.md,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  helperText: {
    ...typography.bodyRegular,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },

  textInput: {
    minHeight: 200,
  },

  errorContainer: {
    backgroundColor: colors.error.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },

  errorText: {
    ...typography.bodyRegular,
    color: colors.error.contrast,
    textAlign: "center",
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

export default OCRPreviewScreen;
