import { GoogleGenAI } from "@google/genai";
import Constants from "expo-constants";

const apiKey = Constants.expoConfig?.extra?.geminiApiKey;

if (!apiKey) {
  throw new Error("Gemini API key must be provided in app config");
}

// Initialize the main client
const genAI = new GoogleGenAI({ apiKey });

// Export a specific model instance for use in the app
// We use gemini-2.5-flash as it's a fast, modern model
export const geminiModel = genAI;

// Helper function for card generation
export async function generateFlashcards(
  ocrText: string,
  cardCount: number = 5
) {
  try {
    const prompt = `Generate ${cardCount} flashcard Q&A pairs from this text. Format as a valid JSON array of objects, where each object has a "question" key and an "answer" key. Make questions clear and answers concise.\n\nText:\n${ocrText}`;

    // Use the correct method to generate content
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Return the text part of the response, which should be the JSON string
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards from Gemini.");
  }
}
