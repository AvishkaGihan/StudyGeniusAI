# StudyGenius AI — Architecture Decision Document

**Project:** StudyGenius AI
**Type:** React Native Mobile App (iOS & Android)
**Date:** November 16, 2025
**For:** BMad (Developer)
**Version:** 1.0

---

## Executive Summary

StudyGenius AI is a sophisticated mobile app that combines computer vision (OCR), generative AI (Gemini), and spaced repetition to transform how students study. This architecture balances **simplicity** (using proven libraries like Expo, Redux Toolkit, React Native Paper) with **innovation** (streaming card generation, before/after swipe hero animation, offline-first sync).

The architecture is designed for:

- **Rapid MVP development** (Expo reduces setup complexity)
- **Production-quality code** (Redux, testing, error handling)
- **Portfolio credibility** (clean structure, documented patterns)
- **Future scaling** (modular feature-based organization)

---

## Project Initialization

**Start with Expo CLI:**

```bash
npx create-expo-app@latest StudyGeniusAI --template

cd StudyGeniusAI

# Install core dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
npm install react-native-reanimated
npm install @reduxjs/toolkit react-redux
npm install react-native-paper
npm install @supabase/supabase-js
npm install react-hook-form
npm install date-fns
npm install react-native-logs
npm install axios
npm install expo-camera expo-file-system google-ml-kit

# Install dev dependencies
npm install --save-dev @testing-library/react-native jest @types/jest
npm install --save-dev eslint prettier husky lint-staged
npm install --save-dev @react-native/eslint-config-react-native
```

**This initialization command will be your first implementation story.**

---

## Decision Summary

| #   | Category          | Decision                                       | Version           | Rationale                                                                                                       |
| --- | ----------------- | ---------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | State Management  | Redux Toolkit                                  | @latest           | Complex app state (auth, decks, cards, sessions, spaced rep) requires predictable, debuggable state management  |
| 2   | Navigation        | React Navigation (Bottom Tabs + Nested Stacks) | @latest           | Matches UX spec photo-first design, maintains state per tab, clean separation of Capture/Library/Settings flows |
| 3   | Backend           | Supabase (PostgreSQL + Auth)                   | @latest           | Managed PostgreSQL, built-in auth, real-time capabilities, excellent DX                                         |
| 4   | API Format        | Standardized Response Wrapper                  | -                 | Consistent {success, data/error, timestamp} structure enables uniform error handling across all APIs            |
| 5   | Error Handling    | Layered (API → Redux → UI → Global)            | -                 | Retry logic, offline queue, user-friendly messages, code-based error identification                             |
| 6   | Authentication    | Supabase JWT in Secure Storage                 | -                 | Email/password signup/login, JWT in Expo SecureStore, 1hr access token, 30d refresh token                       |
| 7   | File Handling     | Hybrid (device FS + AsyncStorage + Supabase)   | -                 | Temp photos on device, OCR text in Supabase, styled card cache in AsyncStorage                                  |
| 8   | Logging           | Structured (debug, info, warn, error)          | react-native-logs | Timestamp + context, excludes secrets, enables debugging and future analytics                                   |
| 9   | Date/Time         | ISO 8601 UTC storage, local display            | date-fns          | All dates stored as UTC, spaced rep calculated in UTC, displayed in user timezone                               |
| 10  | Testing           | Jest + unit/integration (60-70% coverage)      | @latest           | Test critical paths (spaced rep, auth, card generation, study sessions), pragmatic coverage                     |
| 11  | UI Library        | React Native Paper + custom components         | @latest           | 50+ pre-built components, dark mode support, Material Design consistency, custom flashcard/camera/chat          |
| 12  | Styling           | Custom theme (dark mode, cool focus colors)    | -                 | Dark navy/charcoal background, vibrant blue/teal/green accents, glassmorphism, smooth animations                |
| 13  | Animation Library | React Native Reanimated                        | @latest           | Smooth 60fps animations (card flip, swipe, card generation progress)                                            |
| 14  | Form Handling     | React Hook Form                                | @latest           | Lightweight, performant, integrates with Supabase validation                                                    |
| 15  | Camera            | Expo Camera + Google ML Kit OCR                | @latest           | Cross-platform, on-device OCR (fast, private), auto-crop support                                                |
| 16  | AI Generation     | Gemini API with streaming                      | @latest           | Multimodal (text → Q&A), streaming for incremental card display, cost-effective                                 |
| 17  | Offline Support   | Local-first + async sync queue                 | -                 | Study offline with cached data, queue deck/card changes, auto-sync when online                                  |
| 18  | Real-time Sync    | Periodic sync (not real-time)                  | -                 | Single-user app, periodic sync sufficient, reduces complexity vs real-time subscriptions                        |

---

## Project Structure

```
StudyGenius/
├── app.json                          # Expo configuration
├── app.config.js                     # Environment-specific config
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Testing configuration
├── .env.example                      # Template for environment variables
├── .eslintrc.js                      # Linting rules
├── .prettierrc.js                    # Code formatting
├── package.json
├── .gitignore
│
├── src/
│   ├── App.tsx                       # Root component
│   │
│   ├── screens/                      # Screen components (one per screen in your app)
│   │   ├── auth/
│   │   │   ├── SignUpScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── PasswordResetScreen.tsx
│   │   ├── capture/                  # Photo capture flow (Capture tab)
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── OCRPreviewScreen.tsx
│   │   │   ├── CardGenerationScreen.tsx
│   │   │   └── CardReviewScreen.tsx
│   │   ├── library/                  # Deck management flow (Library tab)
│   │   │   ├── DecksListScreen.tsx
│   │   │   ├── DeckDetailScreen.tsx
│   │   │   └── StudyModeScreen.tsx
│   │   ├── tutor/
│   │   │   └── TutorChatScreen.tsx
│   │   └── settings/                 # User preferences (Settings tab)
│   │       ├── ProfileScreen.tsx
│   │       ├── PreferencesScreen.tsx
│   │       └── HelpScreen.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Auth/App stack switcher
│   │   ├── AuthNavigator.tsx         # Sign up, login, password reset
│   │   ├── AppNavigator.tsx          # Bottom tabs + nested stacks
│   │   ├── CaptureNavigator.tsx      # Capture tab stack
│   │   ├── LibraryNavigator.tsx      # Library tab stack
│   │   └── SettingsNavigator.tsx     # Settings tab stack
│   │
│   ├── store/                        # Redux Toolkit state management
│   │   ├── index.ts                  # Store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.ts          # User, token, auth state
│   │   │   ├── deckSlice.ts          # Decks CRUD operations
│   │   │   ├── cardSlice.ts          # Cards CRUD operations
│   │   │   ├── studySlice.ts         # Active study session state
│   │   │   ├── spacedRepSlice.ts     # SM-2 algorithm state
│   │   │   ├── uiSlice.ts            # Loading, modals, notifications
│   │   │   └── syncSlice.ts          # Offline sync queue
│   │   └── middleware/
│   │       ├── apiMiddleware.ts      # API error handling
│   │       └── syncMiddleware.ts     # Offline queue management
│   │
│   ├── services/                     # External integrations & business logic
│   │   ├── api/
│   │   │   ├── supabaseClient.ts     # Supabase initialization
│   │   │   ├── authApi.ts            # /auth endpoints
│   │   │   ├── deckApi.ts            # /decks endpoints
│   │   │   ├── cardApi.ts            # /cards endpoints
│   │   │   ├── sessionApi.ts         # /sessions endpoints
│   │   │   └── types.ts              # API response types
│   │   ├── ai/
│   │   │   ├── geminiClient.ts       # Gemini API initialization
│   │   │   ├── cardGeneration.ts     # Q&A generation logic (streaming)
│   │   │   └── tutorChat.ts          # Tutor chat conversation logic
│   │   ├── vision/
│   │   │   ├── ocrService.ts         # Google ML Kit OCR
│   │   │   └── imageProcessing.ts    # Photo crop, compress, validate
│   │   ├── storage/
│   │   │   ├── secureStore.ts        # Expo SecureStore (tokens)
│   │   │   ├── asyncStorage.ts       # Async cache (cards, sessions)
│   │   │   └── fileSystem.ts         # expo-file-system (temp photos)
│   │   └── logger.ts                 # Structured logging service
│   │
│   ├── components/                   # Reusable React components
│   │   ├── common/
│   │   │   ├── Button.tsx            # Primary, secondary, tertiary variants
│   │   │   ├── Input.tsx             # Text input with validation
│   │   │   ├── Card.tsx              # Base card component
│   │   │   ├── Modal.tsx             # Modal wrapper
│   │   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   │   ├── ErrorBoundary.tsx     # Error boundary
│   │   │   └── Toast.tsx             # Toast notifications
│   │   ├── flashcard/
│   │   │   ├── FlashcardCard.tsx     # Flip animation, question/answer
│   │   │   ├── CardGrid.tsx          # Grid of flashcards
│   │   │   └── DifficultySelector.tsx # Easy/Medium/Hard buttons
│   │   ├── camera/
│   │   │   ├── CameraView.tsx        # Camera preview
│   │   │   ├── CropOverlay.tsx       # Crop guides
│   │   │   └── CameraControls.tsx    # Capture, flip camera, gallery
│   │   └── tutor/
│   │       ├── ChatBubble.tsx        # Message display
│   │       └── ChatInput.tsx         # Message input
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Auth logic (login, logout, signup)
│   │   ├── useDecks.ts               # Deck CRUD
│   │   ├── useStudySession.ts        # Study session state
│   │   ├── useSpacedRep.ts           # SM-2 algorithm calculations
│   │   ├── useOfflineSync.ts         # Sync queue management
│   │   ├── useCamera.ts              # Camera permissions + state
│   │   └── useNetworkStatus.ts       # Online/offline detection
│   │
│   ├── utils/                        # Pure utility functions
│   │   ├── validation.ts             # Input validation (email, OCR text, card content)
│   │   ├── dateUtils.ts              # UTC/timezone conversions
│   │   ├── spacedRepAlgorithm.ts     # SM-2 implementation
│   │   ├── errorHandling.ts          # Error parsing, user messages
│   │   ├── constants.ts              # App-wide constants
│   │   └── types.ts                  # Global TypeScript types
│   │
│   ├── theme/
│   │   ├── colors.ts                 # Color palette (dark mode)
│   │   ├── typography.ts             # Font sizes, weights, line heights
│   │   ├── spacing.ts                # 8px scale (xs, sm, md, lg, xl, 2xl)
│   │   └── darkTheme.ts              # Material Design theme config
│   │
│   └── config/
│       ├── env.ts                    # Environment variable validation
│       └── appConfig.ts              # App-wide configuration
│
├── __tests__/                        # Test files (mirror src/ structure)
│   ├── store/
│   │   ├── spacedRepSlice.test.ts    # SM-2 algorithm tests
│   │   └── authSlice.test.ts         # Auth state tests
│   ├── services/
│   │   ├── cardGeneration.test.ts
│   │   └── errorHandling.test.ts
│   └── utils/
│       └── spacedRepAlgorithm.test.ts
│
├── docs/
│   ├── ARCHITECTURE.md               # This document
│   ├── SETUP.md                      # Development setup & run instructions
│   ├── API_CONTRACTS.md              # API request/response specs
│   ├── IMPLEMENTATION_GUIDE.md       # Patterns & conventions for agents
│   └── DATABASE_SCHEMA.sql           # Supabase table definitions
│
└── assets/
    ├── images/                       # App graphics
    ├── icons/                        # Tab icons, button icons
    └── fonts/                        # Custom fonts (if needed)
```

---

## Epic to Architecture Mapping

From your PRD, here's how each major feature maps to architecture components:

| Epic          | Core Feature               | Screens                                | Redux Slices                          | Services                     | Components                        |
| ------------- | -------------------------- | -------------------------------------- | ------------------------------------- | ---------------------------- | --------------------------------- |
| **Capture**   | Photo capture + OCR        | CameraScreen, OCRPreviewScreen         | cardSlice, uiSlice                    | ocrService, imageProcessing  | CameraView, CropOverlay           |
| **Generate**  | AI card creation           | CardGenerationScreen, CardReviewScreen | cardSlice, uiSlice                    | geminiClient, cardGeneration | FlashcardCard, LoadingSpinner     |
| **Study**     | Spaced repetition sessions | StudyModeScreen, DecksListScreen       | studySlice, spacedRepSlice, deckSlice | sessionApi                   | FlashcardCard, DifficultySelector |
| **Dashboard** | Deck management & stats    | DecksListScreen, DeckDetailScreen      | deckSlice, studySlice                 | deckApi                      | DecksList, StatsDisplay           |
| **Tutor**     | AI explanation chatbot     | TutorChatScreen                        | uiSlice (for UI state)                | geminiClient, tutorChat      | ChatBubble, ChatInput             |
| **Auth**      | User signup/login          | SignUpScreen, LoginScreen              | authSlice                             | authApi, secureStore         | Input, Button, ErrorMessage       |
| **Settings**  | User preferences           | ProfileScreen, PreferencesScreen       | authSlice, uiSlice                    | authApi                      | Input, Toggle, Button             |

---

## Technology Stack Details

### Frontend & UI

| Technology              | Version | Purpose                                  |
| ----------------------- | ------- | ---------------------------------------- |
| React Native            | Latest  | Cross-platform mobile framework          |
| Expo                    | Latest  | Development, building, deployment        |
| React Navigation        | Latest  | Navigation (tabs, stacks, modals)        |
| React Native Paper      | Latest  | 50+ pre-built Material Design components |
| React Native Reanimated | Latest  | 60fps animations (card flip, swipe)      |
| TypeScript              | Latest  | Type safety, developer experience        |

### State Management & Data

| Technology              | Version | Purpose                                  |
| ----------------------- | ------- | ---------------------------------------- |
| Redux Toolkit           | Latest  | Predictable, debuggable state management |
| react-redux             | Latest  | Redux React bindings                     |
| @react-navigation/redux | Latest  | Deep linking & Redux state               |
| AsyncStorage            | Latest  | Persistent local cache (cards, sessions) |
| Expo SecureStore        | Latest  | Secure token storage (JWT)               |

### Backend & APIs

| Technology         | Version | Purpose                                 |
| ------------------ | ------- | --------------------------------------- |
| Supabase           | Latest  | PostgreSQL + Auth + Real-time           |
| Supabase JS Client | Latest  | Type-safe Supabase queries              |
| axios              | Latest  | HTTP client (if needed for custom APIs) |

### Vision & AI

| Technology        | Version | Purpose                                |
| ----------------- | ------- | -------------------------------------- |
| Expo Camera       | Latest  | Camera access (iOS & Android)          |
| google-ml-kit     | Latest  | On-device OCR (fast, private)          |
| Google Gemini API | Latest  | Q&A generation, tutor chat (streaming) |

### Forms & Validation

| Technology      | Version | Purpose                                      |
| --------------- | ------- | -------------------------------------------- |
| React Hook Form | Latest  | Lightweight form state management            |
| Zod or Joi      | Latest  | Schema validation (optional, can use custom) |

### Utilities

| Technology                  | Version | Purpose                            |
| --------------------------- | ------- | ---------------------------------- |
| date-fns                    | Latest  | Date manipulation (UTC, timezones) |
| react-native-logs           | Latest  | Structured logging                 |
| @react-native/eslint-config | Latest  | Code linting                       |
| prettier                    | Latest  | Code formatting                    |

### Testing

| Technology                    | Version | Purpose                     |
| ----------------------------- | ------- | --------------------------- |
| Jest                          | Latest  | Unit & integration testing  |
| @testing-library/react-native | Latest  | Component testing utilities |

---

## Integration Points

### Frontend ↔ Backend

```
Frontend (React Native)
    ↓
Redux (State Management)
    ↓
Services Layer (Supabase Client, Gemini Client)
    ↓
External APIs (Supabase, Google Gemini, ML Kit)
    ↓
Backend (Supabase PostgreSQL)
```

**Data Flow Example: Generate Flashcards**

```
User taps "Generate" in CardGenerationScreen
    ↓
Dispatch Redux action: startCardGeneration(deckId, ocrText)
    ↓
Redux middleware calls geminiClient.generateCards(ocrText)
    ↓
Gemini API returns streamed card objects
    ↓
For each card: Dispatch Redux addGeneratedCard(card)
    ↓
CardGenerationScreen listens to Redux cardSlice
    ↓
New cards animate into view
    ↓
User reviews cards
    ↓
Tap "Save Cards" → Dispatch saveCards action
    ↓
Redux middleware calls cardApi.saveCards(cards)
    ↓
Supabase inserts into `cards` table
    ↓
Redux updates cardSlice with saved cards (now have IDs)
    ↓
Navigation → CardReviewScreen (cards now persisted)
```

### Offline Sync Flow

```
User offline → Changes queued locally in syncSlice
    ↓
Redux middleware: No API calls, just update local state
    ↓
User studies → State changes only (no network)
    ↓
App detects connection → Check syncSlice for pending changes
    ↓
Send queued changes to Supabase in order
    ↓
Server validates & persists → Response to client
    ↓
Clear syncSlice queue → User sees "synced" indicator
```

---

## Novel Pattern Designs

### Pattern 1: Before/After Swipe Hero Feature

**Purpose:** Portfolio showpiece demonstrating photo transformation into beautifully designed flashcards.

**Technical Design:**

```typescript
// BeforeAfterSwipe Component
interface BeforeAfterSwipeProps {
  beforeImage: string; // Original textbook photo
  afterCards: Card[]; // Generated flashcards
}

export const BeforeAfterSwipe: React.FC<BeforeAfterSwipeProps> = ({
  beforeImage,
  afterCards,
}) => {
  const position = useSharedValue(0);

  const panGestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      position.value = Math.max(0, Math.min(event.translationX, screenWidth));
    },
  });

  return (
    <View>
      {/* Before: Photo */}
      <Image source={{ uri: beforeImage }} />

      {/* After: Cards Grid */}
      <CardGrid cards={afterCards} />

      {/* Gesture Handler */}
      <PanGestureHandler onGestureEvent={panGestureHandler}>
        <Animated.View style={{ left: position }} />
      </PanGestureHandler>
    </View>
  );
};
```

**User Experience:**

1. User generates cards from photo
2. CardReviewScreen shows before/after swipe
3. Swipe left to see photo, swipe right to see cards
4. Visual feedback: scaling, opacity changes
5. Can toggle between before/after or review individual cards

**Implementation Location:** `src/components/heroFeatures/BeforeAfterSwipe.tsx`

---

### Pattern 2: Incremental Card Generation with Progress

**Purpose:** Show cards appearing one-by-one as Gemini generates them, instead of waiting for all cards.

**Technical Design:**

```typescript
// Flow:
// 1. User submits OCR text → CardGenerationScreen
// 2. geminiClient.generateCardsStream(text) → yields cards
// 3. For each card yielded:
//    - Redux: dispatch(addGeneratedCard(card))
//    - Component: watches Redux, animates card into grid
// 4. Progress counter: "3 of 5 cards generated..."
// 5. Timeout: If >30s, show "Still generating..." with retry option

// geminiClient.ts
export async function* generateCardsStream(
  ocrText: string
): AsyncGenerator<Card> {
  const stream = await gemini.generateContent({
    contents: [{
      parts: [{
        text: `Generate 5 flashcard Q&A pairs from this text:\n\n${ocrText}`
      }]
    ],
    generationConfig: {
      maxOutputTokens: 2000
    }
  })

  for await (const chunk of stream) {
    const text = chunk.text()
    const cards = parseCardsFromText(text)
    for (const card of cards) {
      yield card
    }
  }
}

// Redux middleware calls this and dispatches on each yield:
// dispatch(cardSlice.actions.addGeneratedCard(card))

// Component watches:
const generatedCards = useSelector(selectGeneratedCards)
const progress = `${generatedCards.length} of ${expectedCardCount}`
```

**User Experience:**

1. "Generating cards..." → First card appears with animation
2. Counter: "1 of 5"
3. Pause → Second card appears
4. Counter: "2 of 5"
5. ... repeat until complete
6. "All 5 cards generated! Review and save."

**Benefits:**

- Perceived speed (cards appear immediately)
- Visual feedback (progress visible)
- User can review early cards while generation continues
- Timeout + retry for long generations

**Implementation Location:** `src/services/ai/cardGeneration.ts` and `src/screens/capture/CardGenerationScreen.tsx`

---

## Implementation Patterns

These patterns ensure all AI agents write compatible, consistent code.

### Naming Conventions

**REST API Endpoints:**

```
POST   /api/decks             # Create deck
GET    /api/decks             # List all decks
GET    /api/decks/:deckId     # Get single deck
PUT    /api/decks/:deckId     # Update deck
DELETE /api/decks/:deckId     # Delete deck

GET    /api/decks/:deckId/cards  # Cards in deck
POST   /api/cards             # Create card
GET    /api/cards/:cardId     # Get single card
PUT    /api/cards/:cardId     # Update card
DELETE /api/cards/:cardId     # Delete card
```

**Database Tables & Columns:**

```sql
-- Tables: plural, lowercase, snake_case
users, decks, cards, study_sessions, chat_history

-- Columns: lowercase, snake_case
user_id, deck_id, card_id, created_at, updated_at, ease_factor

-- Foreign keys: {table_singular}_id
user_id → users.id
deck_id → decks.id
card_id → cards.id
```

**Redux Slices & Actions:**

```typescript
// Slices: singular domain
authSlice, deckSlice, cardSlice, studySlice, spacedRepSlice

// Actions: verb + noun
setUser, fetchDecks, createCard, updateCard, startStudySession

// State shape: mirrors database
{
  auth: { user, token, loading },
  deck: { byId: {...}, allIds: [], loading },
  card: { byId: {...}, allIds: [], loading }
}
```

**React Components:**

```typescript
// Components: PascalCase
FlashcardCard, DecksList, StudyModeScreen, CameraView;

// Props interfaces: ComponentNameProps
FlashcardCardProps, DecksListProps;

// Event handlers: onAction
onCardFlip, onDifficultySelect, onStudyComplete;
```

**Functions & Utilities:**

```typescript
// Actions: verb-first
calculateNextReview(), validateOCRText(), generateCardId();

// Getters: noun-first
getNextReviewDate(), getUserDecks(), formatDate();

// Constants: SCREAMING_SNAKE_CASE
MAX_CARDS_PER_GENERATION, SM2_MIN_EASE_FACTOR, API_TIMEOUT_MS;
```

### Redux Pattern: Normalized State + Async Thunks

**Always normalize state:**

```typescript
// ✅ GOOD: Normalized
{
  card: {
    byId: {
      'card_1': { id: 'card_1', question: '...', deckId: 'deck_1' },
      'card_2': { id: 'card_2', question: '...', deckId: 'deck_1' }
    },
    allIds: ['card_1', 'card_2'],
    loading: false,
    error: null
  }
}

// ❌ BAD: Nested (hard to update, inefficient)
{
  decks: [{
    id: 'deck_1',
    cards: [{...}, {...}]  // Can't update nested card efficiently
  }]
}

// Selectors (memoized):
export const selectCardsByDeckId = (deckId) => (state) =>
  state.card.allIds
    .map(id => state.card.byId[id])
    .filter(card => card.deckId === deckId)
```

**Async thunk pattern:**

```typescript
// Create async thunk
export const fetchCards = createAsyncThunk(
  "card/fetchCards",
  async (deckId: string, { rejectWithValue }) => {
    try {
      const response = await cardApi.getCards(deckId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
)
  // Handle in reducer
  .addCase(fetchCards.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(fetchCards.fulfilled, (state, action) => {
    state.loading = false;
    // Normalize: convert array to byId + allIds
    state.byId = {};
    state.allIds = [];
    action.payload.forEach((card) => {
      state.byId[card.id] = card;
      state.allIds.push(card.id);
    });
  })
  .addCase(fetchCards.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });
```

### API Response Format

**All API responses:**

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}

// Success:
{ success: true, data: {...}, timestamp: "2025-11-16T10:30:00Z" }

// Error:
{
  success: false,
  error: {
    code: "CARD_GENERATION_FAILED",
    message: "Failed to generate flashcards",
    details: { reason: "API timeout", retryable: true }
  },
  timestamp: "2025-11-16T10:30:00Z"
}
```

**Error codes (enum):**

```typescript
enum ErrorCode {
  // Auth
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  PERMISSION_DENIED = "PERMISSION_DENIED",

  // Cards
  CARD_GENERATION_FAILED = "CARD_GENERATION_FAILED",
  INVALID_OCR_TEXT = "INVALID_OCR_TEXT",

  // Network
  NETWORK_ERROR = "NETWORK_ERROR",
  API_TIMEOUT = "API_TIMEOUT",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}
```

### Error Handling Layers

**Layer 1: API Service**

```typescript
// cardApi.ts
try {
  const response = await supabase.from("cards").select();
  if (!response.data) {
    throw new AppError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: "Failed to fetch cards",
    });
  }
  return { success: true, data: response.data };
} catch (error) {
  const parsed = parseError(error);
  return { success: false, error: parsed };
}
```

**Layer 2: Redux Middleware**

```typescript
// In async thunk rejected case:
.addCase(fetchCards.rejected, (state, action) => {
  const error = action.payload as AppError
  if (error.code === ErrorCode.PERMISSION_DENIED) {
    // Redirect to login
    dispatch(logout())
  } else if (error.code === ErrorCode.NETWORK_ERROR) {
    // Show offline indicator
    dispatch(uiSlice.actions.setOfflineMode(true))
  }
  state.error = error
})
```

**Layer 3: UI Components**

```typescript
const DecksScreen = () => {
  const { error, loading, decks } = useSelector((state) => state.deck);

  if (error) {
    return <ErrorScreen error={error} onRetry={() => dispatch(fetchDecks())} />;
  }

  if (loading) return <LoadingSpinner />;
  if (!decks.length) return <EmptyState />;

  return <DecksList decks={decks} />;
};
```

**Layer 4: Global Error Handler**

```typescript
// App.tsx
<ErrorBoundary
  onError={(error) => {
    logger.error("Unhandled error", error);
    dispatch(
      uiSlice.actions.showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      })
    );
  }}
>
  <RootNavigator />
</ErrorBoundary>
```

### Component Structure Pattern

```typescript
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

// Props interface
interface CameraScreenProps {
  deckId: string;
}

// Main component
export const CameraScreen: React.FC<CameraScreenProps> = ({ deckId }) => {
  // 1. Hooks
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const { loading, error } = useSelector(selectCamera);

  // 2. Local state
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  // 3. Effects
  useEffect(() => {
    if (!user) {
      navigation.navigate("Auth", { screen: "Login" });
    }
  }, [user, navigation]);

  // 4. Handlers
  const handleCapturePhoto = async () => {
    try {
      const image = await capturePhoto();
      setPhoto(image);
      navigation.navigate("OCRPreview", { photo });
    } catch (err) {
      dispatch(
        uiSlice.actions.showToast({
          type: "error",
          message: "Failed to capture photo",
        })
      );
    }
  };

  // 5. Render
  if (error) return <ErrorScreen error={error} />;
  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <CameraView onReady={() => setIsCameraReady(true)} />
      <Button onPress={handleCapturePhoto} disabled={!isCameraReady}>
        Capture
      </Button>
    </View>
  );
};
```

### Form Handling Pattern

```typescript
import { useForm, Controller } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(login(data));
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email",
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            placeholder="Email"
            keyboardType="email-address"
            error={errors.email?.message}
          />
        )}
      />

      <Button onPress={handleSubmit(onSubmit)}>Log In</Button>
    </View>
  );
};
```

---

## Consistency Rules

### Naming Consistency

- **API endpoints:** Plural nouns, RESTful methods (GET, POST, PUT, DELETE)
- **Database columns:** All lowercase, snake_case, no special prefixes
- **Redux actions:** Descriptive verb_noun pattern (setUser, fetchDecks, updateCard)
- **Components:** File names match component names (FlashcardCard.tsx)
- **Functions:** Verb-first for actions, noun-first for getters

### Code Organization

- **Imports:** React/RN → Third-party → App modules → Styles
- **Component order:** Props → Hooks → State → Effects → Handlers → JSX
- **Tests colocated:** Next to implementation with `.test.ts` suffix
- **No index.ts re-exports:** Import from actual files (tree-shakeable)

### Data Architecture

- **Always normalize Redux state:** byId + allIds pattern for collections
- **Use selectors:** Memoized selectors for derived state
- **Single source of truth:** One Redux slice owns each domain
- **Immutable updates:** Never mutate state directly

### API Consistency

- **Request validation:** Type-check at API service layer
- **Response wrapping:** All responses use success/error wrapper
- **Error codes:** Use enum, never raw strings
- **Null handling:** Use optional types, null checks in components

### Styling Consistency

- **No inline styles:** All styles in theme files or component styles
- **Use color constants:** Never hardcode colors
- **Spacing scale:** Always use 8px multiples
- **Dark mode only:** No light mode variations

### Testing Consistency

- **Test file location:** Mirror src structure in **tests**
- **Test naming:** describe blocks per function/component
- **Mock API calls:** Always mock external services
- **Assertions clear:** Use descriptive it() descriptions

---

## Data Architecture

### Supabase Schema

**users table**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**decks table**

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  card_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_decks_user_id ON decks(user_id);
```

**cards table**

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  ease_factor FLOAT DEFAULT 2.5,
  review_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_next_review ON cards(next_review);
```

**study_sessions table**

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  cards_reviewed INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_sessions_deck_id ON study_sessions(deck_id);
```

**chat_history table** (optional, for tutor context)

```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_chat_user_id ON chat_history(user_id);
```

### Redux State Shape

```typescript
interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: AppError | null;
  };

  deck: {
    byId: Record<string, Deck>;
    allIds: string[];
    loading: boolean;
    error: AppError | null;
  };

  card: {
    byId: Record<string, Card>;
    allIds: string[];
    loading: boolean;
    error: AppError | null;
    generatingCardIds: string[]; // Cards being generated
  };

  study: {
    currentSessionId: string | null;
    currentDeckId: string | null;
    currentCardIndex: number;
    sessionStartTime: number;
    cardsReviewed: number;
    correctCount: number;
    loading: boolean;
  };

  spacedRep: {
    // Transient state for SM-2 calculations
    currentCardEaseFactor: number;
    nextReviewDate: string | null;
  };

  ui: {
    offlineMode: boolean;
    loadingToasts: string[];
    notifications: Toast[];
    modalsOpen: Record<string, boolean>;
  };

  sync: {
    pendingChanges: SyncQueueItem[];
    isSyncing: boolean;
    lastSyncTime: number | null;
  };
}
```

---

## API Contracts

### Authentication Endpoints

**POST /auth/signup**

```json
Request:
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}

Response (Success):
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "..." },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "timestamp": "2025-11-16T10:30:00Z"
}

Response (Error):
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email is already registered"
  }
}
```

**POST /auth/login**

```json
Request:
{
  "email": "student@example.com",
  "password": "SecurePassword123"
}

Response:
Same as signup
```

**POST /auth/refresh**

```json
Request:
{
  "refreshToken": "refresh_token"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### Card Generation Endpoint

**POST /cards/generate**

```json
Request:
{
  "deckId": "deck_uuid",
  "ocrText": "Extracted text from OCR...",
  "cardCount": 5,
  "stream": true
}

Response (Streaming):
Stream returns newline-delimited JSON:
{
  "success": true,
  "data": {"id": "card_uuid", "question": "...", "answer": "..."}
}
{
  "success": true,
  "data": {"id": "card_uuid", "question": "...", "answer": "..."}
}
...

Or (Non-streaming):
{
  "success": true,
  "data": [
    {"id": "card_uuid", "question": "...", "answer": "..."},
    {"id": "card_uuid", "question": "...", "answer": "..."}
  ]
}
```

### Study Session Endpoints

**POST /sessions**

```json
Request:
{
  "deckId": "deck_uuid"
}

Response:
{
  "success": true,
  "data": {
    "id": "session_uuid",
    "deckId": "deck_uuid",
    "cardsToReview": [
      {
        "id": "card_uuid",
        "question": "...",
        "nextReview": "2025-11-16T10:30:00Z"
      }
    ]
  }
}
```

**POST /sessions/:id/review**

```json
Request:
{
  "cardId": "card_uuid",
  "difficulty": "easy" | "medium" | "hard",
  "timeSpent": 15
}

Response:
{
  "success": true,
  "data": {
    "nextCard": {...},
    "sessionProgress": {
      "cardsReviewed": 3,
      "cardsRemaining": 2
    }
  }
}
```

---

## Security Architecture

### Token Management

- **Tokens stored in Expo SecureStore** (encrypted at rest on device)
- **Access token:** 1 hour expiry, used for API calls
- **Refresh token:** 30 days expiry, used to get new access token
- **Token refresh:** Automatic before expiry + on app launch
- **Logout:** Clear tokens from secure storage + Redux

### API Security

- **HTTPS only:** All API calls via HTTPS
- **CORS:** Backend validates origin
- **Rate limiting:** Gemini API (per-user quota), Supabase (built-in limits)
- **Input validation:** Email format, OCR text length, card content length

### Data Security

- **User passwords:** Hashed by Supabase (bcrypt)
- **Sensitive data never logged:** No tokens, passwords, email in logs
- **User data isolation:** Row-level security (RLS) on Supabase
- **Offline data:** Cached in encrypted AsyncStorage (device-encrypted by OS)

### Permissions

- **Camera:** Request at runtime (iOS 14+, Android 6+)
- **File system:** Temp file permissions for photos
- **Network:** No special permissions (standard app usage)

---

## Performance Considerations

### Rendering Optimization

- **Memoize components:** React.memo for expensive renders
- **Normalize Redux state:** Avoid nested arrays for performance selectors
- **List virtualization:** FlatList for large card lists (deck view)
- **Lazy loading:** Load cards on-demand in study mode

### Network Optimization

- **Image compression:** Compress photos before OCR (reduce bytes)
- **Request batching:** Combine related requests (don't do 10 individual card saves)
- **Caching strategy:** Cache decks/cards locally, invalidate on change
- **Streaming:** Gemini streaming reduces perceived latency

### Storage Optimization

- **AsyncStorage limits:** ~10MB per app, clear old cached data
- **Temp file cleanup:** Delete captured photos after OCR
- **Indexed queries:** Supabase indexes on user_id, deck_id for fast queries

### Animation Performance

- **60fps targets:** Use Reanimated (not JS animations)
- **Off-thread animations:** Card flip, swipe transitions run on native thread
- **GPU acceleration:** Let React Native handle heavy lifting

---

## Deployment Architecture

### Build & Release

**iOS:**

```bash
# Create Expo development build
eas build --platform ios

# Or use EAS Preview for testing
eas update

# Publish to App Store
eas submit --platform ios
```

**Android:**

```bash

# Create Expo development build
eas build --platform android

# Publish to Play Store
eas submit --platform android
```

### Environment Variables

**.env.example**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### Monitoring

- **Sentry or similar:** Error tracking + crash reporting
- **Analytics:** Firebase Analytics or Mixpanel (optional)
- **Performance monitoring:** Track API response times, card generation duration
- **Logging:** Structured logs to CloudWatch or similar

---

## Development Environment

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Mac with Xcode 15+
- Android: Android Studio with SDK 33+

### Setup Commands

```bash
# Clone repository
git clone <repo>
cd StudyGenius

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase and Gemini credentials

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Useful Commands

```bash
# Start Expo server (choose iOS/Android when prompted)
expo start

# Clear cache (if experiencing issues)
expo start -c

# Run on specific device
expo start --localhost

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## Architecture Decision Records (ADRs)

### ADR-001: React Native + Expo over React

**Decision:** Use React Native with Expo for cross-platform mobile development

**Rationale:**

- Expo abstracts away native build complexity
- Single codebase for iOS + Android
- Cloud build service (EAS) eliminates local setup
- Perfect for MVP portfolio projects
- Large ecosystem of pre-built modules

**Alternatives Considered:**

- Native iOS/Android: More control, significant time overhead
- Flutter: Different language, larger learning curve
- Web-based (React): Not native mobile experience

**Status:** Accepted

---

### ADR-002: Redux Toolkit over Context API

**Decision:** Use Redux Toolkit for state management

**Rationale:**

- Complex state: auth, decks, cards, sessions, spaced rep algorithm
- Normalized state prevents bugs in nested updates
- Redux DevTools for debugging
- Middleware for API integration + offline queue
- More scalable as app grows

**Alternatives Considered:**

- Context API: Simpler but performance issues with frequent updates
- Zustand: Lighter, but lacks middleware and DevTools

**Status:** Accepted

---

### ADR-003: Supabase over Firebase

**Decision:** Use Supabase (PostgreSQL + Auth) over Firebase

**Rationale:**

- PostgreSQL: Relational data (decks → cards, users → sessions)
- Open source: Self-hostable if needed
- Type safety with PostgREST API
- Row-level security for data isolation
- Simpler auth (no Firebase complexity)

**Alternatives Considered:**

- Firebase: Proprietary, vendor lock-in, less suitable for relational data
- Custom backend: Too much overhead for MVP

**Status:** Accepted

---

### ADR-004: On-Device OCR over Cloud

**Decision:** Use Google ML Kit for on-device OCR, not cloud-based

**Rationale:**

- **Speed:** Instant OCR without network round-trip
- **Privacy:** Photos never leave device
- **Cost:** No per-image API costs
- **Offline:** Works without internet
- **Accuracy:** ML Kit sufficient for printed textbooks

**Alternatives Considered:**

- Google Cloud Vision API: Better accuracy but slower, costs, privacy
- AWS Textract: Enterprise solution, overkill

**Status:** Accepted

---

### ADR-005: Gemini API Streaming for Incremental Generation

**Decision:** Use Gemini API with streaming for card generation

**Rationale:**

- **UX:** Users see cards appearing one-by-one (feels faster)
- **Feedback:** Progress visible during generation
- **Safety:** Can detect generation failure early (if nothing after 30s)
- **Token efficiency:** Stream stops when sufficient cards generated

**Alternatives Considered:**

- Single API call, wait for all: Slower perceived performance
- Local generation (no API): Less capable, complex implementation

**Status:** Accepted

---

### ADR-006: Local-First Offline Support

**Decision:** Local-first architecture with async sync queue

**Rationale:**

- **Resilience:** App works without internet (study mode offline)
- **UX:** No loading spinners for cached data
- **Simplicity:** Single-user app, no real-time sync needed
- **Portfolio:** Demonstrates advanced patterns

**Alternatives Considered:**

- Real-time sync (Supabase subscriptions): Overkill for MVP, complex offline handling
- Online-only: Breaks study mode when offline

**Status:** Accepted

---

## Next Steps

1. **Complete Setup:** Run `npx create-expo-app@latest StudyGeniusAI` and install dependencies
2. **Supabase Setup:** Create Supabase project, configure auth, create tables
3. **Gemini API:** Get API key, test streaming endpoints
4. **Navigation:** Build RootNavigator, AuthNavigator, AppNavigator structure
5. **First Feature:** Implement auth (signup, login) to validate architecture
6. **Iterate:** Build features in this order:
   - Photo capture (camera, permissions)
   - OCR (ML Kit integration)
   - Card generation (Gemini streaming)
   - Study mode (spaced rep)
   - Dashboard (deck management)
   - Tutor (Gemini chat)
   - Polish (animations, dark mode, offline)

---

**Architecture Complete!**

This document is your technical specification. All AI agents will read this before implementation to maintain consistency across the codebase.

For questions about decisions, constraints, or clarifications, refer to the Architecture Decision Records (ADRs) section.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: November 16, 2025_
_For: BMad_
