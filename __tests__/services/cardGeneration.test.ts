import {
  generateFlashcards,
  generateFlashcardsStream,
  regenerateCard,
  improveCard,
} from "../../src/services/ai/cardGeneration";
import * as geminiClient from "../../src/services/ai/geminiClient";
import { parseError } from "../../src/utils/errorHandling";

jest.mock("../../src/services/ai/geminiClient");

describe("cardGeneration service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateFlashcards", () => {
    it("should generate cards from valid OCR text", async () => {
      const mockResponse = {
        cards: [
          {
            question: "What is photosynthesis?",
            answer:
              "The process by which plants convert sunlight into chemical energy",
          },
          {
            question: "What is chlorophyll?",
            answer: "The pigment in plants that captures light energy",
          },
        ],
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText =
        "Photosynthesis is the process where plants convert light energy into chemical energy using chlorophyll...";

      const result = await generateFlashcards(ocrText);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("question");
      expect(result[0]).toHaveProperty("answer");
      expect(result[0]).toHaveProperty("tempId");
    });

    it("should handle JSON with markdown code blocks", async () => {
      const mockResponse = `
        \`\`\`json
        {
          "cards": [
            {
              "question": "What is mitochondria?",
              "answer": "The powerhouse of the cell"
            }
          ]
        }
        \`\`\`
      `;

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const ocrText = "Mitochondria is an organelle in cells...";

      const result = await generateFlashcards(ocrText);

      expect(result).toHaveLength(1);
      expect(result[0].question).toBe("What is mitochondria?");
    });

    it("should generate cards with tempId", async () => {
      const mockResponse = {
        cards: [
          {
            question: "Q1?",
            answer: "A1",
          },
        ],
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText = "Some text to generate cards from";

      const result = await generateFlashcards(ocrText);

      expect(result[0].tempId).toBeTruthy();
      expect(typeof result[0].tempId).toBe("string");
    });

    it("should throw error for insufficient text", async () => {
      const shortText = "Too short";

      expect(async () => {
        await generateFlashcards(shortText);
      }).rejects.toThrow();
    });

    it("should throw error for empty text", async () => {
      expect(async () => {
        await generateFlashcards("");
      }).rejects.toThrow();
    });

    it("should throw error for excessive text length", async () => {
      const longText = "word ".repeat(5000);

      expect(async () => {
        await generateFlashcards(longText);
      }).rejects.toThrow();
    });

    it("should limit card generation to 20 cards", async () => {
      const mockResponse = {
        cards: Array.from({ length: 25 }, (_, i) => ({
          question: `Q${i}?`,
          answer: `A${i}`,
        })),
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText = "A".repeat(100);

      const result = await generateFlashcards(ocrText);

      expect(result.length).toBeLessThanOrEqual(20);
    });

    it("should handle malformed JSON gracefully", async () => {
      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        "{ invalid json }"
      );

      const ocrText = "A".repeat(100);

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();
    });

    it("should handle missing cards property", async () => {
      const mockResponse = {
        questions: [],
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText = "A".repeat(100);

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();
    });

    it("should validate card structure", async () => {
      const mockResponse = {
        cards: [
          {
            question: "Valid Q?",
            answer: "Valid A",
          },
          {
            question: "Missing answer",
          },
        ],
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText = "A".repeat(100);

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();
    });

    it("should call geminiClient with proper prompt", async () => {
      const mockResponse = {
        cards: [
          {
            question: "Q?",
            answer: "A",
          },
        ],
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const ocrText = "A".repeat(100);

      await generateFlashcards(ocrText);

      expect(geminiClient.generateContent).toHaveBeenCalled();
      const callArgs = (geminiClient.generateContent as jest.Mock).mock
        .calls[0];
      expect(callArgs[0]).toContain(ocrText);
    });
  });

  describe("generateFlashcardsStream", () => {
    it("should yield cards incrementally", async () => {
      const mockCards = [
        { question: "Q1?", answer: "A1" },
        { question: "Q2?", answer: "A2" },
      ];

      const mockStream = (async function* () {
        for (const card of mockCards) {
          yield JSON.stringify({ card });
        }
      })();

      (geminiClient.generateContentStream as jest.Mock).mockReturnValueOnce(
        mockStream
      );

      const ocrText = "A".repeat(100);
      const generator = generateFlashcardsStream(ocrText);

      const results = [];
      for await (const card of generator) {
        results.push(card);
      }

      expect(results.length).toBeGreaterThan(0);
    });

    it("should parse JSON from each streamed chunk", async () => {
      const mockStream = (async function* () {
        yield '{"card":{"question":"Q1?","answer":"A1"}}';
        yield '{"card":{"question":"Q2?","answer":"A2"}}';
      })();

      (geminiClient.generateContentStream as jest.Mock).mockReturnValueOnce(
        mockStream
      );

      const ocrText = "A".repeat(100);
      const generator = generateFlashcardsStream(ocrText);

      const results = [];
      for await (const card of generator) {
        results.push(card);
      }

      expect(results[0].question).toBe("Q1?");
      expect(results[1].question).toBe("Q2?");
    });

    it("should stop at 20 cards", async () => {
      const mockStream = (async function* () {
        for (let i = 0; i < 30; i++) {
          yield JSON.stringify({
            card: { question: `Q${i}?`, answer: `A${i}` },
          });
        }
      })();

      (geminiClient.generateContentStream as jest.Mock).mockReturnValueOnce(
        mockStream
      );

      const ocrText = "A".repeat(100);
      const generator = generateFlashcardsStream(ocrText);

      const results = [];
      for await (const card of generator) {
        results.push(card);
      }

      expect(results.length).toBeLessThanOrEqual(20);
    });

    it("should assign tempId to each card", async () => {
      const mockStream = (async function* () {
        yield '{"card":{"question":"Q1?","answer":"A1"}}';
      })();

      (geminiClient.generateContentStream as jest.Mock).mockReturnValueOnce(
        mockStream
      );

      const ocrText = "A".repeat(100);
      const generator = generateFlashcardsStream(ocrText);

      for await (const card of generator) {
        expect(card.tempId).toBeTruthy();
        expect(typeof card.tempId).toBe("string");
        break;
      }
    });
  });

  describe("regenerateCard", () => {
    it("should regenerate a single card with different question", async () => {
      const mockResponse = {
        question: "New question for photosynthesis?",
        answer:
          "The process by which plants convert sunlight into chemical energy",
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const originalCard = {
        question: "What is photosynthesis?",
        answer:
          "The process by which plants convert sunlight into chemical energy",
        tempId: "temp_123",
      };

      const result = await regenerateCard(originalCard.answer, [originalCard]);

      expect(result).toHaveProperty("question");
      expect(result).toHaveProperty("answer");
      expect(result.question).not.toBe(originalCard.question);
    });

    it("should maintain answer while regenerating question", async () => {
      const originalAnswer = "The powerhouse of the cell";
      const mockResponse = {
        question: "What organelle is called the powerhouse of the cell?",
        answer: originalAnswer,
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const existingCards = [
        {
          question: "What is mitochondria?",
          answer: originalAnswer,
          tempId: "temp_123",
        },
      ];

      const result = await regenerateCard(originalAnswer, existingCards);

      expect(result.answer).toBe(originalAnswer);
    });
  });

  describe("improveCard", () => {
    it("should improve card formatting and clarity", async () => {
      const mockResponse = {
        question:
          "What is the primary function of chlorophyll in photosynthesis?",
        answer:
          "Chlorophyll captures light energy and converts it into chemical energy (ATP and NADPH) that plants use for growth",
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const originalCard = {
        question: "chlorophyll?",
        answer: "captures light",
        tempId: "temp_123",
      };

      const result = await improveCard(originalCard);

      expect(result).toHaveProperty("question");
      expect(result).toHaveProperty("answer");
      expect(result.question.length).toBeGreaterThanOrEqual(
        originalCard.question.length
      );
    });

    it("should maintain original meaning while improving", async () => {
      const originalCard = {
        question: "What is mitochondria?",
        answer: "Powerhouse of the cell",
        tempId: "temp_123",
      };

      const mockResponse = {
        question: "What is the primary function of mitochondria in cells?",
        answer:
          "Mitochondria is the powerhouse of the cell, responsible for producing ATP energy",
      };

      (geminiClient.generateContent as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockResponse)
      );

      const result = await improveCard(originalCard);

      expect(result.question.toLowerCase()).toContain("mitochondria");
      expect(result.answer.toLowerCase()).toContain("powerhouse");
    });
  });

  describe("error handling", () => {
    it("should handle Gemini API errors gracefully", async () => {
      (geminiClient.generateContent as jest.Mock).mockRejectedValueOnce(
        new Error("API Error: Rate limited")
      );

      const ocrText = "A".repeat(100);

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();
    });

    it("should handle network errors", async () => {
      (geminiClient.generateContent as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const ocrText = "A".repeat(100);

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();
    });

    it("should validate input before API call", async () => {
      const ocrText = "short";

      expect(async () => {
        await generateFlashcards(ocrText);
      }).rejects.toThrow();

      expect(geminiClient.generateContent).not.toHaveBeenCalled();
    });
  });
});
