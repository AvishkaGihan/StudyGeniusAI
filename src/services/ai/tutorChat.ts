import { chat } from "./geminiClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { TutorMessage, Card } from "../../utils/types";

/**
 * Tutor Chat Service
 * Handles AI tutor conversations for explaining flashcard concepts
 */

/**
 * System instruction for tutor mode
 */
const TUTOR_SYSTEM_INSTRUCTION = `You are StudyGenius AI Tutor, a patient and knowledgeable teacher helping students understand their study material.

Your role:
- Explain concepts clearly and concisely
- Use analogies and examples when helpful
- Break down complex topics into digestible parts
- Encourage understanding, not just memorization
- Be supportive and motivating
- Ask clarifying questions if the student's question is unclear

Communication style:
- Friendly but professional
- Concise (2-3 paragraphs max unless asked for more detail)
- Use simple language unless technical terms are necessary
- Include examples when they help understanding

Important:
- Never just give answers to flashcard questions without explanation
- Focus on "why" and "how", not just "what"
- If the question is about a specific flashcard, reference the card content in your explanation`;

/**
 * Get AI tutor response for a general question
 */
export async function getTutorResponse(
  userMessage: string,
  conversationHistory: TutorMessage[] = []
): Promise<string> {
  try {
    logger.info("Getting tutor response", {
      messageLength: userMessage.length,
      historyLength: conversationHistory.length,
    });

    // Convert conversation history to Gemini format
    const messages = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    // Add current user message
    messages.push({
      role: "user" as const,
      parts: [{ text: userMessage }],
    });

    // Get response from Gemini
    const response = await chat(messages, TUTOR_SYSTEM_INSTRUCTION);

    logger.info("Tutor response received", {
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    logger.error("Tutor response failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to get tutor response"
    );
  }
}

/**
 * Get AI tutor explanation for a specific flashcard
 */
export async function explainCard(
  card: Card,
  userQuestion?: string
): Promise<string> {
  try {
    logger.info("Getting card explanation", {
      cardId: card.id,
      hasUserQuestion: !!userQuestion,
    });

    // Create context-aware prompt
    const prompt = userQuestion
      ? `I'm studying this flashcard:

Question: ${card.question}
Answer: ${card.answer}

My question: ${userQuestion}

Please help me understand this concept.`
      : `I'm studying this flashcard and need help understanding it:

Question: ${card.question}
Answer: ${card.answer}

Please explain this concept in a clear and helpful way. Help me understand WHY this answer is correct, not just WHAT the answer is.`;

    // Get explanation
    const response = await chat(
      [
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ],
      TUTOR_SYSTEM_INSTRUCTION
    );

    logger.info("Card explanation received", {
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    logger.error("Card explanation failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to get card explanation"
    );
  }
}

/**
 * Get follow-up clarification on a concept
 */
export async function askFollowUp(
  originalQuestion: string,
  originalAnswer: string,
  followUpQuestion: string
): Promise<string> {
  try {
    logger.info("Getting follow-up response", {
      followUpLength: followUpQuestion.length,
    });

    const messages = [
      {
        role: "user" as const,
        parts: [{ text: originalQuestion }],
      },
      {
        role: "model" as const,
        parts: [{ text: originalAnswer }],
      },
      {
        role: "user" as const,
        parts: [{ text: followUpQuestion }],
      },
    ];

    const response = await chat(messages, TUTOR_SYSTEM_INSTRUCTION);

    logger.info("Follow-up response received", {
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    logger.error("Follow-up response failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to get follow-up response"
    );
  }
}

/**
 * Get study tips for a specific topic
 */
export async function getStudyTips(topic: string): Promise<string> {
  try {
    logger.info("Getting study tips", { topic });

    const prompt = `I'm studying ${topic}. Can you give me some effective study tips and strategies for mastering this subject?`;

    const response = await chat(
      [
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ],
      TUTOR_SYSTEM_INSTRUCTION
    );

    logger.info("Study tips received", {
      responseLength: response.length,
    });

    return response;
  } catch (error) {
    logger.error("Study tips failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(ErrorCode.GEMINI_API_ERROR, "Failed to get study tips");
  }
}

/**
 * Generate practice questions for a topic
 */
export async function generatePracticeQuestions(
  topic: string,
  count: number = 3
): Promise<Array<{ question: string; hint: string }>> {
  try {
    logger.info("Generating practice questions", { topic, count });

    const prompt = `Generate ${count} practice questions to test understanding of: ${topic}

For each question, provide a helpful hint that guides thinking without giving away the answer.

Return ONLY valid JSON format (no markdown):
[
  {
    "question": "Practice question here",
    "hint": "Helpful hint here"
  }
]`;

    const response = await chat(
      [
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ],
      TUTOR_SYSTEM_INSTRUCTION
    );

    // Parse response
    const cleanedResponse = response
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const questions = JSON.parse(cleanedResponse);

    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format");
    }

    logger.info("Practice questions generated", { count: questions.length });

    return questions;
  } catch (error) {
    logger.error("Practice question generation failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to generate practice questions"
    );
  }
}

/**
 * Format conversation history for display
 */
export function formatConversationHistory(messages: TutorMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "You" : "Tutor";
      return `${role}: ${msg.content}`;
    })
    .join("\n\n");
}

/**
 * Summarize conversation (for saving or reviewing)
 */
export async function summarizeConversation(
  messages: TutorMessage[]
): Promise<string> {
  try {
    logger.info("Summarizing conversation", { messageCount: messages.length });

    const conversationText = formatConversationHistory(messages);

    const prompt = `Summarize this tutoring conversation in 2-3 sentences, highlighting the main concepts discussed:

${conversationText}

Summary:`;

    const response = await chat(
      [
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ],
      TUTOR_SYSTEM_INSTRUCTION
    );

    logger.info("Conversation summarized");

    return response.trim();
  } catch (error) {
    logger.error("Conversation summary failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to summarize conversation"
    );
  }
}
