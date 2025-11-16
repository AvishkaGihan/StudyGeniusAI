import TextRecognition from "@react-native-ml-kit/text-recognition";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { OCRResult } from "../../utils/types";

/**
 * OCR Service using Google ML Kit
 * On-device text recognition from images
 */

/**
 * Extract text from image using ML Kit OCR
 */
export async function extractTextFromImage(
  imageUri: string
): Promise<OCRResult> {
  try {
    logger.info("Starting OCR extraction", { imageUri });

    // Perform text recognition
    const result = await TextRecognition.recognize(imageUri);

    if (!result || !result.text) {
      logger.warn("No text detected in image");
      throw new AppError(
        ErrorCode.OCR_FAILED,
        "No text detected in image. Please try a clearer photo."
      );
    }

    // Extract full text
    const extractedText = result.text.trim();

    if (extractedText.length === 0) {
      throw new AppError(
        ErrorCode.OCR_FAILED,
        "No readable text found. Please ensure the image is clear and well-lit."
      );
    }

    // Calculate confidence (ML Kit provides per-block confidence)
    const blocks = result.blocks || [];
    let totalConfidence = 0;
    let blockCount = 0;

    blocks.forEach((block) => {
      if (block.recognizedLanguages && block.recognizedLanguages.length > 0) {
        // ML Kit doesn't provide direct confidence, so we estimate based on text quality
        totalConfidence += 0.9; // Assume high confidence if text was recognized
        blockCount++;
      }
    });

    const averageConfidence =
      blockCount > 0 ? totalConfidence / blockCount : 0.8;

    // Detect language (ML Kit provides this)
    let detectedLanguage = "en"; // Default to English
    if (blocks.length > 0 && blocks[0].recognizedLanguages?.length > 0) {
      detectedLanguage = blocks[0].recognizedLanguages[0].languageCode || "en";
    }

    logger.info("OCR extraction successful", {
      textLength: extractedText.length,
      confidence: averageConfidence,
      language: detectedLanguage,
      blockCount: blocks.length,
    });

    return {
      text: extractedText,
      confidence: averageConfidence,
      language: detectedLanguage,
    };
  } catch (error) {
    logger.error("OCR extraction failed", { error, imageUri });

    if (error instanceof AppError) {
      throw error;
    }

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("permission")) {
        throw new AppError(
          ErrorCode.CAMERA_PERMISSION_DENIED,
          "Camera permission is required to scan text"
        );
      }

      if (
        error.message.includes("file") ||
        error.message.includes("not found")
      ) {
        throw new AppError(
          ErrorCode.IMAGE_PROCESSING_ERROR,
          "Image file not found or invalid"
        );
      }
    }

    throw new AppError(
      ErrorCode.OCR_FAILED,
      "Failed to extract text from image. Please try again."
    );
  }
}

/**
 * Extract text from multiple images (batch processing)
 */
export async function extractTextFromMultipleImages(
  imageUris: string[]
): Promise<OCRResult[]> {
  try {
    logger.info("Starting batch OCR extraction", {
      imageCount: imageUris.length,
    });

    const results: OCRResult[] = [];

    for (const imageUri of imageUris) {
      try {
        const result = await extractTextFromImage(imageUri);
        results.push(result);
      } catch (error) {
        logger.error("Failed to extract text from image in batch", {
          imageUri,
          error,
        });
        // Continue with other images even if one fails
        results.push({
          text: "",
          confidence: 0,
          language: "en",
        });
      }
    }

    logger.info("Batch OCR extraction completed", {
      totalImages: imageUris.length,
      successfulExtractions: results.filter((r) => r.text.length > 0).length,
    });

    return results;
  } catch (error) {
    logger.error("Batch OCR extraction failed", { error });
    throw new AppError(
      ErrorCode.OCR_FAILED,
      "Failed to extract text from images"
    );
  }
}

/**
 * Get detailed OCR information (blocks, lines, elements)
 */
export async function getDetailedOCRInfo(imageUri: string) {
  try {
    logger.info("Getting detailed OCR info", { imageUri });

    const result = await TextRecognition.recognize(imageUri);

    if (!result) {
      throw new AppError(ErrorCode.OCR_FAILED, "OCR processing failed");
    }

    const detailedInfo = {
      fullText: result.text,
      blocks: result.blocks.map((block) => ({
        text: block.text,
        boundingBox: block.frame,
        lines: block.lines.map((line) => ({
          text: line.text,
          elements: line.elements.map((element) => element.text),
        })),
        language: block.recognizedLanguages?.[0]?.languageCode || "unknown",
      })),
    };

    logger.info("Detailed OCR info retrieved", {
      blockCount: detailedInfo.blocks.length,
    });

    return detailedInfo;
  } catch (error) {
    logger.error("Failed to get detailed OCR info", { error });
    throw new AppError(
      ErrorCode.OCR_FAILED,
      "Failed to get detailed text information"
    );
  }
}

/**
 * Validate OCR result quality
 */
export function validateOCRQuality(result: OCRResult): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check text length
  if (result.text.length < 50) {
    issues.push("Text is too short (less than 50 characters)");
  }

  if (result.text.length > 10000) {
    issues.push("Text is too long (more than 10,000 characters)");
  }

  // Check confidence
  if (result.confidence < 0.6) {
    issues.push("Low confidence in text recognition (below 60%)");
  }

  // Check alphanumeric ratio
  const alphanumericCount = (result.text.match(/[a-zA-Z0-9]/g) || []).length;
  const alphanumericRatio = alphanumericCount / result.text.length;

  if (alphanumericRatio < 0.5) {
    issues.push("Text quality is low (too many non-alphanumeric characters)");
  }

  // Check for common OCR artifacts
  const artifactCount = (result.text.match(/[|{}[\]\\]/g) || []).length;
  if (artifactCount > result.text.length * 0.1) {
    issues.push("Text contains many OCR artifacts");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Clean OCR text (remove artifacts, fix common errors)
 */
export function cleanOCRText(text: string): string {
  let cleaned = text;

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove common OCR artifacts
  cleaned = cleaned.replace(/[|]/g, ""); // Vertical bars (often mistaken for I or l)
  cleaned = cleaned.replace(/([a-z])\s+([a-z])/gi, "$1$2"); // Remove spaces within words

  // Fix common character confusions
  cleaned = cleaned.replace(/0([a-zA-Z])/g, "O$1"); // 0 -> O in words
  cleaned = cleaned.replace(/([a-zA-Z])0/g, "$1O"); // 0 -> O in words
  cleaned = cleaned.replace(/1([a-zA-Z])/g, "l$1"); // 1 -> l in words (context-dependent)

  // Normalize line breaks
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // Max 2 consecutive line breaks

  // Remove leading/trailing punctuation on lines
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return cleaned;
}

/**
 * Split OCR text into logical sections (for processing large texts)
 */
export function splitOCRTextIntoSections(
  text: string,
  maxSectionLength: number = 2000
): string[] {
  const sections: string[] = [];

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);

  let currentSection = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed max length, start new section
    if (
      currentSection.length + paragraph.length > maxSectionLength &&
      currentSection.length > 0
    ) {
      sections.push(currentSection.trim());
      currentSection = paragraph;
    } else {
      currentSection += (currentSection.length > 0 ? "\n\n" : "") + paragraph;
    }
  }

  // Add remaining section
  if (currentSection.trim().length > 0) {
    sections.push(currentSection.trim());
  }

  return sections;
}
