import { generateContent, generateContentStream } from "./geminiClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { GeneratedCard } from "../../utils/types";
import { appConfig } from "../../config/appConfig";

/**
 * Card Generation Service
 * Handles flashcard generation from OCR text using Gemini AI
 */

/**
 * Generate flashcards from OCR text (non-streaming)
 */
export async function generateFlashcards(
  ocrText: string,
  cardCount: number = appConfig.gemini.defaultCardCount
): Promise<GeneratedCard[]> {
  try {
    logger.info("Generating flashcards", {
      textLength: ocrText.length,
      cardCount,
    });

    // Validate inputs
    if (!ocrText || ocrText.trim().length < appConfig.ocr.minTextLength) {
      throw new AppError(
        ErrorCode.INVALID_OCR_TEXT,
        "Text is too short to generate flashcards"
      );
    }

    if (cardCount < 1 || cardCount > appConfig.gemini.maxCardCount) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Card count must be between 1 and ${appConfig.gemini.maxCardCount}`
      );
    }

    // Create prompt for Gemini
    const prompt = createCardGenerationPrompt(ocrText, cardCount);

    // Generate content
    const response = await generateContent(prompt);

    // Parse response into cards
    const cards = parseGeneratedCards(response);

    if (cards.length === 0) {
      throw new AppError(
        ErrorCode.CARD_GENERATION_FAILED,
        "Failed to generate any flashcards from the text"
      );
    }

    logger.info("Flashcards generated successfully", {
      count: cards.length,
    });

    return cards;
  } catch (error) {
    logger.error("Flashcard generation failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.CARD_GENERATION_FAILED,
      "Failed to generate flashcards"
    );
  }
}

/**
 * Generate flashcards with streaming (cards appear one by one)
 */
export async function* generateFlashcardsStream(
  ocrText: string,
  cardCount: number = appConfig.gemini.defaultCardCount
): AsyncGenerator<GeneratedCard, void, unknown> {
  try {
    logger.info("Starting streaming flashcard generation", {
      textLength: ocrText.length,
      cardCount,
    });

    // Validate inputs
    if (!ocrText || ocrText.trim().length < appConfig.ocr.minTextLength) {
      throw new AppError(
        ErrorCode.INVALID_OCR_TEXT,
        "Text is too short to generate flashcards"
      );
    }

    // Create prompt
    const prompt = createCardGenerationPrompt(ocrText, cardCount);

    // Buffer to accumulate streamed text
    let buffer = "";
    let yieldedCards = 0;

    // Stream content from Gemini
    for await (const chunk of generateContentStream(prompt)) {
      buffer += chunk;

      // Try to parse complete cards from buffer
      const cards = parseGeneratedCards(buffer);

      // Yield new cards that haven't been yielded yet
      for (let i = yieldedCards; i < cards.length; i++) {
        logger.info("Yielding card from stream", {
          index: i + 1,
          total: cardCount,
        });
        yield cards[i];
        yieldedCards++;
      }
    }

    // Final parse to catch any remaining cards
    const finalCards = parseGeneratedCards(buffer);
    for (let i = yieldedCards; i < finalCards.length; i++) {
      yield finalCards[i];
    }

    logger.info("Streaming flashcard generation completed", {
      totalCards: yieldedCards,
    });
  } catch (error) {
    logger.error("Streaming flashcard generation failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.CARD_GENERATION_FAILED,
      "Failed to generate flashcards"
    );
  }
}

/**
 * Create prompt for card generation
 */
function createCardGenerationPrompt(
  ocrText: string,
  cardCount: number
): string {
  return `You are an expert educator creating flashcards for students.

Your task: Generate exactly ${cardCount} high-quality flashcard Q&A pairs from the following text.

Instructions:
1. Create clear, concise questions that test understanding of key concepts
2. Provide accurate, complete answers
3. Focus on the most important information
4. Make questions specific and unambiguous
5. Ensure answers are self-contained (include context if needed)
6. Return ONLY valid JSON array format (no markdown, no extra text)

Output format (JSON array only):
[
  {
    "question": "What is the definition of photosynthesis?",
    "answer": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar."
  },
  {
    "question": "What are the two main stages of photosynthesis?",
    "answer": "The two main stages are: 1) Light-dependent reactions (occur in thylakoid membranes), and 2) Light-independent reactions or Calvin cycle (occur in the stroma)."
  }
]

TEXT TO ANALYZE:
${ocrText}

Generate exactly ${cardCount} flashcards as a JSON array:`;
}

/**
 * Parse generated cards from AI response
 */
function parseGeneratedCards(response: string): GeneratedCard[] {
  try {
    // Remove markdown code blocks if present
    let cleanedResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // Try to find JSON array in the response
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }

    // Parse JSON
    const parsed = JSON.parse(cleanedResponse);

    if (!Array.isArray(parsed)) {
      logger.warn("Response is not an array", { response: cleanedResponse });
      return [];
    }

    // Map to GeneratedCard format
    const cards: GeneratedCard[] = parsed
      .filter((item) => {
        // Validate card structure
        return (
          item &&
          typeof item === "object" &&
          typeof item.question === "string" &&
          typeof item.answer === "string" &&
          item.question.trim().length > 0 &&
          item.answer.trim().length > 0
        );
      })
      .map((item, index) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
        tempId: `temp_${Date.now()}_${index}`,
      }));

    return cards;
  } catch (error) {
    logger.error("Failed to parse generated cards", { error, response });
    return [];
  }
}

/**
 * Regenerate specific card (if user wants different question/answer)
 */
export async function regenerateCard(
  ocrText: string,
  existingCards: GeneratedCard[]
): Promise<GeneratedCard> {
  try {
    logger.info("Regenerating single card", {
      existingCardCount: existingCards.length,
    });

    // Create prompt to generate ONE different card
    const existingQuestions = existingCards.map((c) => c.question).join("\n- ");

    const prompt = `You are an expert educator creating flashcards.

Generate exactly ONE new flashcard Q&A pair from this text that is DIFFERENT from these existing questions:
- ${existingQuestions}

Return ONLY valid JSON format (no markdown):
{
  "question": "Your question here",
  "answer": "Your answer here"
}

TEXT:
${ocrText}

Generate ONE new flashcard as JSON:`;

    const response = await generateContent(prompt);

    // Parse single card
    const cleanedResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    if (!parsed.question || !parsed.answer) {
      throw new Error("Invalid card format");
    }

    const card: GeneratedCard = {
      question: parsed.question.trim(),
      answer: parsed.answer.trim(),
      tempId: `temp_${Date.now()}_regenerated`,
    };

    logger.info("Card regenerated successfully");

    return card;
  } catch (error) {
    logger.error("Card regeneration failed", { error });
    throw new AppError(
      ErrorCode.CARD_GENERATION_FAILED,
      "Failed to regenerate card"
    );
  }
}

/**
 * Improve card quality (refine question/answer)
 */
export async function improveCard(card: GeneratedCard): Promise<GeneratedCard> {
  try {
    logger.info("Improving card quality", { question: card.question });

    const prompt = `You are an expert educator. Improve this flashcard by making the question clearer and the answer more comprehensive:

Current Flashcard:
Question: ${card.question}
Answer: ${card.answer}

Return ONLY valid JSON format (no markdown):
{
  "question": "Improved question",
  "answer": "Improved answer"
}

Improve this flashcard:`;

    const response = await generateContent(prompt);

    const cleanedResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    if (!parsed.question || !parsed.answer) {
      throw new Error("Invalid card format");
    }

    const improvedCard: GeneratedCard = {
      question: parsed.question.trim(),
      answer: parsed.answer.trim(),
      tempId: card.tempId,
    };

    logger.info("Card improved successfully");

    return improvedCard;
  } catch (error) {
    logger.error("Card improvement failed", { error });
    throw new AppError(
      ErrorCode.CARD_GENERATION_FAILED,
      "Failed to improve card"
    );
  }
}
