/**
 * Global TypeScript types and interfaces
 * Shared across the entire application
 */

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// ============================================
// Deck Types
// ============================================

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeckWithStats extends Deck {
  cards_due: number;
  retention_rate: number;
  last_studied?: string;
}

// ============================================
// Card Types
// ============================================

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface Card {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  difficulty: DifficultyLevel;
  last_reviewed?: string;
  next_review?: string;
  ease_factor: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
}

export interface GeneratedCard {
  question: string;
  answer: string;
  tempId?: string; // Temporary ID before saving to database
}

// ============================================
// Study Session Types
// ============================================

export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  cards_reviewed: number;
  correct_count: number;
  duration_seconds: number;
  created_at: string;
}

export interface ActiveStudySession {
  deck_id: string;
  current_card_index: number;
  cards: Card[];
  session_start_time: number;
  cards_reviewed: number;
  correct_count: number;
}

// ============================================
// Spaced Repetition Types
// ============================================

export type ReviewDifficulty = "again" | "hard" | "medium" | "easy";

export interface ReviewResult {
  card_id: string;
  difficulty: ReviewDifficulty;
  time_spent: number; // seconds
  ease_factor: number;
  next_review: string;
  interval: number; // days
}

// ============================================
// OCR Types
// ============================================

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

// ============================================
// AI/Gemini Types
// ============================================

export interface CardGenerationRequest {
  ocr_text: string;
  card_count: number;
  deck_id: string;
}

export interface CardGenerationProgress {
  current: number;
  total: number;
  cards: GeneratedCard[];
  status: "generating" | "complete" | "error";
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  card_id?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
}

// ============================================
// Redux State Types
// ============================================

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

export interface NormalizedState<T> {
  byId: Record<string, T>;
  allIds: string[];
  loading: boolean;
  error: string | null;
}

// ============================================
// UI State Types
// ============================================

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
}

// ============================================
// Sync Queue Types
// ============================================

export type SyncOperation = "create" | "update" | "delete";
export type SyncEntity = "deck" | "card" | "session";

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  entity: SyncEntity;
  entity_id: string;
  data: any;
  timestamp: string;
  retry_count: number;
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  SignUp: undefined;
  Login: undefined;
  PasswordReset: undefined;
};

export type AppTabParamList = {
  Capture: undefined;
  Library: undefined;
  Settings: undefined;
};

export type CaptureStackParamList = {
  Camera: undefined;
  OCRPreview: { imageUri: string };
  CardGeneration: { ocrText: string; deckId?: string };
  CardReview: { cards: GeneratedCard[]; deckId: string };
};

export type LibraryStackParamList = {
  DecksList: undefined;
  DeckDetail: { deckId: string };
  StudyMode: { deckId: string };
};

export type SettingsStackParamList = {
  Profile: undefined;
  Preferences: undefined;
  Help: undefined;
};

// ============================================
// Settings Types
// ============================================

export interface UserSettings {
  notifications_enabled: boolean;
  cloud_sync_enabled: boolean;
  daily_goal: number; // cards per day
  study_reminder_time?: string; // HH:mm format
  theme: "dark" | "light"; // Future: support light mode
}

// ============================================
// Statistics Types
// ============================================

export interface DeckStatistics {
  total_cards: number;
  due_cards: number;
  new_cards: number;
  average_ease_factor: number;
  estimated_retention: number;
}

export interface UserStatistics {
  total_decks: number;
  total_cards: number;
  cards_studied_today: number;
  current_streak: number; // consecutive days
  total_study_time: number; // seconds
  average_accuracy: number; // percentage
}

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirm_password: string;
}

export interface DeckFormData {
  title: string;
  description?: string;
}

export interface CardFormData {
  question: string;
  answer: string;
  difficulty?: DifficultyLevel;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================
// Component Props Types
// ============================================

export interface BaseComponentProps {
  className?: string;
  style?: any;
  testID?: string;
}

export interface ButtonProps extends BaseComponentProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  children: React.ReactNode;
}

export interface CardComponentProps extends BaseComponentProps {
  card: Card;
  onFlip?: () => void;
  onDifficultySelect?: (difficulty: ReviewDifficulty) => void;
  showAnswer?: boolean;
}
