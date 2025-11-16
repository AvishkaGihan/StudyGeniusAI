/**
 * API Types and Interfaces
 * Type definitions for API requests and responses
 */

import { User, Deck, Card, StudySession } from "../../utils/types";

// ============================================
// Generic API Response Wrapper
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// ============================================
// Authentication API Types
// ============================================

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

// ============================================
// Deck API Types
// ============================================

export interface CreateDeckRequest {
  title: string;
  description?: string;
}

export interface CreateDeckResponse {
  deck: Deck;
}

export interface UpdateDeckRequest {
  title?: string;
  description?: string;
}

export interface UpdateDeckResponse {
  deck: Deck;
}

export interface GetDecksResponse {
  decks: Deck[];
}

export interface GetDeckResponse {
  deck: Deck;
  cardCount: number;
  dueCards: number;
}

export interface DeleteDeckResponse {
  message: string;
  deckId: string;
}

// ============================================
// Card API Types
// ============================================

export interface CreateCardRequest {
  deckId: string;
  question: string;
  answer: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface CreateCardResponse {
  card: Card;
}

export interface CreateMultipleCardsRequest {
  deckId: string;
  cards: Array<{
    question: string;
    answer: string;
    difficulty?: "easy" | "medium" | "hard";
  }>;
}

export interface CreateMultipleCardsResponse {
  cards: Card[];
  successCount: number;
  failedCount: number;
}

export interface UpdateCardRequest {
  question?: string;
  answer?: string;
  difficulty?: "easy" | "medium" | "hard";
  easeFactor?: number;
  nextReview?: string;
  lastReviewed?: string;
  reviewCount?: number;
}

export interface UpdateCardResponse {
  card: Card;
}

export interface GetCardsRequest {
  deckId: string;
  dueOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetCardsResponse {
  cards: Card[];
  total: number;
}

export interface GetCardResponse {
  card: Card;
}

export interface DeleteCardResponse {
  message: string;
  cardId: string;
}

export interface GetDueCardsRequest {
  deckId: string;
  limit?: number;
}

export interface GetDueCardsResponse {
  cards: Card[];
  dueCount: number;
}

// ============================================
// Study Session API Types
// ============================================

export interface CreateSessionRequest {
  deckId: string;
}

export interface CreateSessionResponse {
  session: StudySession;
  cards: Card[];
}

export interface UpdateSessionRequest {
  cardsReviewed?: number;
  correctCount?: number;
  durationSeconds?: number;
}

export interface UpdateSessionResponse {
  session: StudySession;
}

export interface RecordReviewRequest {
  cardId: string;
  difficulty: "again" | "hard" | "medium" | "easy";
  timeSpent: number; // seconds
}

export interface RecordReviewResponse {
  card: Card;
  nextCard?: Card;
  sessionProgress: {
    cardsReviewed: number;
    cardsRemaining: number;
    correctCount: number;
  };
}

export interface GetSessionsRequest {
  deckId?: string;
  limit?: number;
  offset?: number;
}

export interface GetSessionsResponse {
  sessions: StudySession[];
  total: number;
}

export interface GetSessionStatsResponse {
  totalSessions: number;
  totalCardsReviewed: number;
  totalStudyTime: number; // seconds
  averageAccuracy: number; // percentage
  currentStreak: number; // consecutive days
}

// ============================================
// Supabase-specific Types
// ============================================

export interface SupabaseUser {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: SupabaseUser;
}

export interface SupabaseDeck {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  last_reviewed?: string;
  next_review?: string;
  ease_factor: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseStudySession {
  id: string;
  user_id: string;
  deck_id: string;
  cards_reviewed: number;
  correct_count: number;
  duration_seconds: number;
  created_at: string;
}

// ============================================
// Query Options
// ============================================

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface FilterOptions {
  deckId?: string;
  dueOnly?: boolean;
  searchQuery?: string;
}

// ============================================
// Batch Operations
// ============================================

export interface BatchUpdateRequest<T> {
  updates: Array<{
    id: string;
    data: Partial<T>;
  }>;
}

export interface BatchUpdateResponse<T> {
  updated: T[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

export interface BatchDeleteRequest {
  ids: string[];
}

export interface BatchDeleteResponse {
  deletedIds: string[];
  failedIds: Array<{
    id: string;
    error: string;
  }>;
}
