import { GoogleGenAI } from "@google/genai";
import * as FileSystem from "expo-file-system/legacy";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { OCRResult } from "../../utils/types";
import { appConfig } from "../../config/appConfig";

/**
 * OCR Service using Google Gemini Vision API
 * Cloud-based text recognition from images (compatible with Expo Go)
 */

/**
 * Extract text from image using Gemini Vision API
 */
export async function extractTextFromImage(
  imageUri: string
): Promise<OCRResult> {
  try {
    logger.info("Starting OCR extraction with Gemini Vision", { imageUri });

    // Convert image to base64
    logger.info("Converting image to base64");
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64" as any,
    });

    logger.info("Image converted to base64", {
      base64Length: base64.length,
    });

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: appConfig.gemini.apiKey,
    });

    logger.info("Sending image to Gemini for text extraction");

    // Use Gemini Vision to extract text
    const result = await ai.models.generateContent({
      model: appConfig.gemini.visionModel || appConfig.gemini.model,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64,
              },
            },
            {
              text: "Extract all text from this image. Return only the extracted text exactly as it appears, preserving formatting and line breaks. Do not add any explanations or additional text.",
            },
          ],
        },
      ],
    });

    const extractedText = result.text?.trim() || "";

    logger.info("Gemini text extraction response received", {
      textLength: extractedText.length,
    });

    if (!extractedText || extractedText.length === 0) {
      logger.warn("No text detected in image by Gemini");
      throw new AppError(
        ErrorCode.OCR_FAILED,
        "No text detected in image. Please try a clearer photo."
      );
    }

    // Gemini doesn't provide confidence scores, so we estimate based on text quality
    const confidence = 0.9; // High confidence for Gemini
    const language = "en"; // Default to English

    logger.info("OCR extraction successful", {
      textLength: extractedText.length,
      confidence,
      language,
    });

    return {
      text: extractedText,
      confidence,
      language,
    };
  } catch (error) {
    logger.error("OCR extraction failed", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      imageUri,
    });

    if (error instanceof AppError) {
      throw error;
    }

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new AppError(
          ErrorCode.OCR_FAILED,
          "Invalid API key. Please check your Gemini API configuration."
        );
      }

      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new AppError(
          ErrorCode.OCR_FAILED,
          "API quota exceeded. Please try again later."
        );
      }

      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new AppError(
          ErrorCode.OCR_FAILED,
          "Network error. Please check your internet connection."
        );
      }
    }

    throw new AppError(
      ErrorCode.OCR_FAILED,
      `Failed to extract text from image: ${error instanceof Error ? error.message : String(error)}`
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
 * Note: Gemini Vision API doesn't provide block-level details like ML Kit,
 * so this returns the full text only
 */
export async function getDetailedOCRInfo(imageUri: string) {
  try {
    logger.info("Getting detailed OCR info", { imageUri });

    // Use the Gemini-based extraction
    const result = await extractTextFromImage(imageUri);

    if (!result) {
      throw new AppError(ErrorCode.OCR_FAILED, "OCR processing failed");
    }

    // Gemini doesn't provide block-level details, so we return simplified structure
    const detailedInfo = {
      fullText: result.text,
      blocks: [
        {
          text: result.text,
          boundingBox: null, // Not available with Gemini
          lines: result.text.split("\n").map((line) => ({
            text: line,
            elements: [line], // Simplified - no element-level detail
          })),
          language: result.language,
        },
      ],
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
