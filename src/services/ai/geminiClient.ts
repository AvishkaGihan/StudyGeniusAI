import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { appConfig } from "../../config/appConfig";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";

/**
 * Gemini AI Client
 * Handles communication with Google Gemini API
 */

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

/**
 * Generate content with Gemini (non-streaming)
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    logger.info("Generating content with Gemini", {
      promptLength: prompt.length,
    });

    const result = await ai.models.generateContent({
      model: appConfig.gemini.model,
      contents: prompt,
      config: {
        temperature: appConfig.gemini.temperature,
        topP: appConfig.gemini.topP,
        maxOutputTokens: appConfig.gemini.maxTokens,
      },
    });

    const text = result.text;

    if (!text) {
      throw new AppError(
        ErrorCode.GEMINI_API_ERROR,
        "No response from AI model"
      );
    }

    logger.info("Content generated successfully", {
      responseLength: text.length,
    });

    return text;
  } catch (error) {
    logger.error("Gemini content generation failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to generate content with AI"
    );
  }
}

/**
 * Generate content with streaming (for real-time card generation)
 */
export async function* generateContentStream(
  prompt: string
): AsyncGenerator<string, void, unknown> {
  try {
    logger.info("Starting streaming content generation", {
      promptLength: prompt.length,
    });

    const result = await ai.models.generateContentStream({
      model: appConfig.gemini.model,
      contents: prompt,
      config: {
        temperature: appConfig.gemini.temperature,
        topP: appConfig.gemini.topP,
        maxOutputTokens: appConfig.gemini.maxTokens,
      },
    });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        yield chunkText;
      }
    }

    logger.info("Streaming content generation completed");
  } catch (error) {
    logger.error("Gemini streaming generation failed", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      errorStatus: (error as any)?.status,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      `Failed to generate streaming content with AI: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Chat with Gemini (for tutor feature)
 */
export async function chat(
  messages: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  systemInstruction?: string
): Promise<string> {
  try {
    logger.info("Starting chat with Gemini", {
      messageCount: messages.length,
    });

    // Create a chat session
    const chatSession = await ai.chats.create({
      model: appConfig.gemini.model,
      config: {
        temperature: 0.7, // Slightly lower for more focused responses
        topP: appConfig.gemini.topP,
        maxOutputTokens: appConfig.gemini.maxTokens,
      },
    });

    // Convert messages to the expected format and send them
    for (const message of messages.slice(0, -1)) {
      await chatSession.sendMessage({
        message: message.parts[0].text,
      });
    }

    // Send the last message and get response
    const lastMessage = messages[messages.length - 1];
    const result = await chatSession.sendMessage({
      message: lastMessage.parts[0].text,
    });

    const text = result.text;

    if (!text) {
      throw new AppError(
        ErrorCode.GEMINI_API_ERROR,
        "No response from AI tutor"
      );
    }

    logger.info("Chat response received", {
      responseLength: text.length,
    });

    return text;
  } catch (error) {
    logger.error("Gemini chat failed", { error });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.GEMINI_API_ERROR,
      "Failed to get response from AI tutor"
    );
  }
}

/**
 * Count tokens in text (useful for managing context length)
 */
export async function countTokens(text: string): Promise<number> {
  try {
    const result = await ai.models.countTokens({
      model: appConfig.gemini.model,
      contents: text,
    });

    return result.totalTokens ?? Math.ceil(text.length / 4);
  } catch (error) {
    logger.error("Token counting failed", { error });
    // Return estimate if API fails
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
  }
}

/**
 * Check if Gemini API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const result = await ai.models.generateContent({
      model: appConfig.gemini.model,
      contents: "Hello",
      config: {
        maxOutputTokens: 10,
      },
    });

    return !!result.text;
  } catch (error) {
    logger.error("Gemini API health check failed", { error });
    return false;
  }
}

// Export configured client
export default ai;
