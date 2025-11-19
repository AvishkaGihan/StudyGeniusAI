# StudyGenius AI — UX Design Specification

**Date:** November 16, 2025  
**Project:** StudyGenius AI  
**Type:** Mobile Application (React Native)  
**Platform:** iOS & Android  
**Design Lead:** Sally, UX Designer  

---

## Executive Summary

StudyGenius AI transforms how students study by removing friction from the learning process. This specification documents the complete user experience, visual design, interaction patterns, and user journeys that will guide development and design implementation.

**Core Design Philosophy:** Efficiency + Confidence + Delight + Control

---

## 1. Design Vision & Principles

### 1.1 Project Understanding

**What We're Building:**  
A mobile app that empowers students to study more effectively by:
1. Snapping photos of textbook pages
2. Converting text to beautifully-designed flashcards via AI
3. Studying with spaced repetition algorithm
4. Getting AI-powered explanations when needed

**Target Users:**  
- High school and college students
- Self-learners who study textbooks
- Users who want to optimize study efficiency

**Core Problem Solved:**  
Manual flashcard creation is time-consuming and discourages studying. StudyGenius removes this friction—study should be instant and enjoyable.

### 1.2 Desired Emotional Response

When using StudyGenius, students should feel:

- **Efficient** — "I'm studying smarter, getting results faster"
- **Confident** — "The cards I'm studying are accurate and helpful"
- **Delighted** — "This app is beautiful and fun to use"
- **In Control** — "I shape my learning at my own pace"

These emotions drive user retention and word-of-mouth adoption.

### 1.3 Most Frequent Actions

**The Pareto Principle applies to StudyGenius:**

- **80% of user time:** Studying flashcards (review card → mark difficulty → advance)
- **15% of user time:** Creating decks (snap photo → generate cards)
- **5% of user time:** Browsing, settings, managing decks

**Design Priority:** Study mode must feel buttery smooth and focused. Everything else is secondary.

---

## 2. Design System & Visual Foundation

### 2.1 Design System: React Native Paper + Custom Components

**Why React Native Paper:**
- Provides 50+ pre-built, accessible components
- Dark mode support (essential for StudyGenius)
- Material Design consistency
- Reduces time building standard UI elements
- Cross-platform (iOS/Android) consistency

**Custom Components Needed:**
- **Flashcard Component** — Custom card flip animation with question/answer reveal
- **Card Generation Progress** — Incremental card appearance animation
- **Difficulty Selector** — Easy/Medium/Hard buttons optimized for mobile touch
- **AI Chat Bubble Component** — Conversational messaging UI
- **Camera Capture Overlay** — Custom crop UI with guides

### 2.2 Color Theme: Cool Focus

Professional, calm, focused experience. The color palette communicates trustworthiness and clarity—perfect for serious learners.

**Primary Colors:**
- **Primary Action:** `#0ea5e9` (Sky Blue) — Buttons, highlights, interactive elements
- **Secondary Accent:** `#06b6d4` (Teal) — Supporting actions, secondary buttons
- **Success/Positive:** `#14b8a6` (Mint Green) — Correct answers, completion states
- **Warning/Caution:** `#f59e0b` (Amber) — Due cards, important alerts
- **Error/Destructive:** `#ef4444` (Red) — Delete, error states

**Background & Neutral:**
- **Background Gradient:** `#0f172a` → `#1e293b` (Deep navy to dark slate)
- **Surface/Cards:** `rgba(15, 165, 233, 0.08)` with `border: 1px solid rgba(15, 165, 233, 0.2)`
- **Text Primary:** `#ffffff` (White)
- **Text Secondary:** `rgba(255, 255, 255, 0.7)` (70% opacity white)
- **Text Tertiary:** `rgba(255, 255, 255, 0.5)` (50% opacity white)
- **Dividers/Borders:** `rgba(255, 255, 255, 0.1)` (10% opacity white)

**Color Usage:**
- **Primary actions** (Study buttons, "Generate Cards"): Primary blue
- **Difficulty selector** ("Easy"): Success green
- **Difficulty selector** ("Hard"): Warning amber / Error red
- **Card backgrounds:** Subtle blue tint with 8% opacity
- **Focus states:** Slightly higher opacity on cards
- **Error messages:** Red alert color

### 2.3 Typography System

**Font Family:**
- **Headings (h1-h2):** SF Pro Display (iOS), Roboto (Android), fallback: system fonts
- **Body & UI:** SF Pro Text (iOS), Roboto (Android), fallback: system fonts
- **Monospace (quiz content):** Menlo (iOS), Roboto Mono (Android)

**Type Scale:**
| Element | Size | Weight | Use Case |
|---------|------|--------|----------|
| h1 (Page Title) | 32px | 700 (Bold) | Screen titles, deck names |
| h2 (Section Title) | 24px | 700 (Bold) | Card category headers |
| h3 (Card Title) | 18px | 600 (SemiBold) | Flashcard questions |
| Body Large | 16px | 400 (Regular) | Main content, card answers |
| Body Regular | 14px | 400 (Regular) | Standard UI text, descriptions |
| Small | 12px | 400 (Regular) | Helper text, metadata |
| Tiny | 10px | 400 (Regular) | Timestamps, labels |

**Line Heights:**
- Headings: 1.2
- Body text: 1.6
- Input fields: 1.5

### 2.4 Spacing System

**8px Base Unit:**

| Scale | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal spacing (checkbox padding) |
| sm | 8px | Tight spacing (icon padding) |
| md | 16px | Standard spacing (padding, gaps) |
| lg | 24px | Generous spacing (section gaps) |
| xl | 32px | Large spacing (major sections) |
| 2xl | 48px | Extra large spacing (screen margin) |

**Margins & Padding Guidelines:**
- Screen edges: 16px (md)
- Card padding: 16px (md)
- Button padding: 12px vertical, 16px horizontal (md)
- Input field padding: 12px (md)
- Gap between cards: 12px (md)
- Section separators: 24px (lg) above and below

### 2.5 Shadows & Depth

Dark mode requires subtle elevation:

- **Card elevation:** `0 4px 12px rgba(0, 0, 0, 0.3)`
- **Modal elevation:** `0 12px 24px rgba(0, 0, 0, 0.5)`
- **Hover/active:** Increase opacity by 10%
- **Focus ring (accessibility):** 2px `#0ea5e9` outline

---

## 3. Navigation Architecture

### 3.1 Photo-First Bottom Tab Navigation

**Primary Navigation Structure:**

```
┌─────────────────────────────────┐
│ App Header (context-dependent)  │
├─────────────────────────────────┤
│                                 │
│  ← Screen Content →             │
│                                 │
├─────────────────────────────────┤
│  📷 Capture  │ 📚 Library │ ⚙️  │
│  (Active)    │ (Decks)    │ Set │
└─────────────────────────────────┘
```

**Tab 1: Capture (📷 — Primary)**
- Full-screen camera interface
- Encourages the hero action (snapping textbooks)
- Direct path: Capture → OCR Preview → Generate → Review

**Tab 2: Library (📚 — Secondary)**
- View all created decks
- Deck management (delete, rename, view stats)
- Quick access to study sessions
- Shows deck status (cards due, retention %)

**Tab 3: Settings (⚙️ — Tertiary)**
- User profile & authentication
- Sync preferences (cloud/offline)
- App preferences (theme, notifications)
- Help & feedback

**Design Rationale:**
Photo-First layout removes friction for the primary use case. Users install the app to snap textbooks first, manage decks second. Settings are always available but not prominent (reduces cognitive load).

### 3.2 Header & Back Navigation

**Contextual Headers:**

| Screen | Header | Back Behavior |
|--------|--------|---------------|
| Camera | None / minimal status bar | N/A |
| OCR Preview | "Edit Text" | Discard changes, back to camera |
| Card Generation | "Generating..." | Confirmation: "Cancel generation?" |
| Card Review | Deck name, card count | Back to library |
| Study Mode | "Studying [Deck]" | Save session, back to deck |
| Settings | "Settings" | Back to previous tab |

**Back Navigation Principle:**
- Always available via system back button or explicit back button
- Destructive actions (discard text, cancel generation) show confirmation
- Study sessions auto-save before exiting

---

## 4. Core User Journeys

### 4.1 Journey 1: First-Time Onboarding

**Goal:** User installs app, takes first textbook photo, generates cards, studies immediately.

**Why Minimal Onboarding:**
With beginner skill level, users want to snap and study, not read tutorials. We learn by doing.

#### Flow: Snap → OCR Preview → Generate → Review → Study

**Step 1: App Launch**
- No tour, no intro splash
- Camera screen opens immediately
- Micro-copy: "Snap a textbook page to get started"
- Optional: Subtle help text below camera button

**Step 2: Capture Photo**
- Full-screen camera with auto-crop guides
- Frame guides help align textbook page
- Tap shutter button → Take photo
- Back button returns to camera (no photo taken)

**Step 3: Photo Review**
- Show captured photo full-screen
- Two buttons: "Retake" or "Continue"
- "Continue" → OCR preview

**Step 4: OCR Preview & Edit**
- Display extracted text in editable field
- Let user correct OCR errors (inevitable on photos)
- Encourages user to verify text quality
- Two buttons: "Re-scan" or "Generate Cards"

**Step 5: Card Generation (Incremental)**
- Show loading state with progress
- Cards appear one-by-one as Gemini generates them (Option C)
- Satisfying visual feedback
- "Generating card 1 of 12..." text below
- Smooth fade-in animation for each card

**Step 6: Review Generated Cards**
- Gallery view of generated flashcards
- See question and answer on each card
- Tap to edit individual cards or delete unwanted ones
- Button: "Start Studying" or "Edit Cards"

**Step 7: Study Session**
- Enter study mode with first card
- User sees card flip animation, marks difficulty
- One session = momentum, confidence
- After 5-10 cards: Session summary with stats

---

### 4.2 Journey 2: Study Session (Primary Use Case)

**Goal:** Review flashcards with spaced repetition, mark difficulty, optionally get AI explanations.

**Context:** Users will repeat this journey 10+ times per week. This must feel smooth, focused, distraction-free.

#### Flow: Open Deck → Study Card → Mark Difficulty → Optional AI Help → Repeat

**Step 1: Open Deck**
- Library tab shows all decks with metadata
  - Deck name
  - Card count
  - Cards due today
  - Last studied date
  - Retention % (mock data for portfolio)
- Tap deck → Study button appears
- Show: "12 cards due today" or "Staying on track!" depending on status

**Step 2: Study Mode Entry**
- Full-screen flashcard interface
- Question visible in large, readable text
- Card is slightly raised (elevation shadow)
- Subtle animation: Card slides in from right

**Step 3: Card Reveal (Flip Animation)**
- **Question State:** Tap anywhere on card to reveal answer
- Card rotates 180° with smooth 3D flip effect (React Native Reanimated)
- Answer appears after flip completes
- **Answer State:** Shows full question and answer with clear visual separation

**Step 4: Difficulty Selection**
- After answer is visible, three buttons appear at bottom:
  - **Easy** (Green, `#14b8a6`) — "Got it, moving on"
  - **Medium** (Yellow/Amber, `#f59e0b`) — "I knew it but slower"
  - **Hard** (Red, `#ef4444`) — "Didn't know or forgot"
- Large touch targets (minimum 48px height)
- Button feedback: Slight scale down on tap, then auto-advance
- **Auto-advance:** 300ms after selection, move to next card

**Step 5: AI Tutor (Optional)**
- Always visible: Small "?" button in top-right corner
- Subtle glow effect when card is "Hard"
- If user marks "Hard," show inline suggestion: "Want an explanation? Tap ?"
- Tap "?" → Open chat interface
  - Shows card question in header
  - Chat history below
  - Input field: "Ask me anything about this..."
  - Gemini provides context-aware explanation
- After chat, user can: "Try Again" or "Mark as..."
- Can close chat and continue studying

**Step 6: Session Progression**
- Progress bar shows cards studied: "3/12 cards"
- Subtle encouragement after milestones (5 cards: "Great start!", 10 cards: "Nice streak!")
- Card counter increments smoothly

**Step 7: Session Complete**
- Show summary when all cards reviewed:
  - Cards studied: 12
  - Duration: 8 minutes
  - Accuracy: Easy 40%, Medium 35%, Hard 25%
  - Next review: [dates for each difficulty level]
- Button options:
  - "Study Again" — Shuffle and repeat session
  - "Back to Decks" — Exit session
  - "Continue Learning" — Open different deck

**Why This Flow Works:**
- One action per screen (no decision paralysis)
- Card flip is tactile and satisfying
- AI help is available but not forced
- Progress is visible (counter + bar)
- Session can end anytime with graceful save

---

### 4.3 Journey 3: Capture & Generate Flow

**Goal:** Photo → OCR → Generate beautiful flashcards with AI

**Context:** Users do this 2-3 times per week (creating new decks). Quality of generated cards is critical to app success.

#### Flow: Snap → Auto-OCR → Preview & Edit → Generate → Review

**Step 1: Camera Interface**
- Full-screen camera with guides
- Visible frame guide overlaid on camera (dashed lines)
- Alignment indicator: "Good alignment" when photo is straight
- Shutter button is large (iOS-style circle)
- Secondary option: "Upload from gallery" (subtle, under camera button)
- Tap shutter → Take photo

**Step 2: Photo Captured**
- Show captured image full-screen
- Bright blue border indicates "captured"
- Two actions:
  - **"Retake"** — Back to camera
  - **"Extract Text"** — Proceed to OCR

**Step 3: OCR Processing**
- Show loading state: "Scanning text..." with spinner
- Display progress: "Extracting... 45%"
- Auto-crop optimization visible if user can see it
- On device: Google ML Kit (fast, 1-3 seconds)

**Step 4: OCR Preview & Edit** (Critical Step)
- Display extracted text in editable text area
- Text is selectable (allow copy/paste for debugging)
- Show original photo thumbnail on left (reference)
- Editable text on right
- Let user:
  - Fix OCR errors (inevitable)
  - Delete irrelevant text
  - Add formatting if needed
- Bottom buttons:
  - **"Re-scan"** — Retake photo or try OCR again
  - **"Generate Cards"** → Next step

**Step 5: Card Generation (Incremental UI)**
- Loading screen with progress
- **Visual Feedback:** Cards appear one-by-one (Option C)
  - Skeleton card appears with placeholder gradient
  - Fills in with real content (fade-in)
  - Smooth entrance animation: slide-in from bottom + fade
  - Progress text: "Generating card 1 of 12..."
  - Estimated time: "About 20 seconds"
- User can watch cards generate (satisfying)
- **Back button disabled** during generation (prevent accidental interruption)

**Step 6: Generated Cards Review**
- Card gallery: Grid or scrollable list of generated cards
- Each card shows:
  - Question (preview)
  - Answer (preview)
  - Edit/Delete icons on hover
- Tap card to expand and see full content
- **Actions:**
  - Tap card → "Edit Q&A" (modal form)
  - Swipe/long-press → "Delete card"
  - "Regenerate All" — Run Gemini again with same text
  - "Start Studying" → Enter study mode
  - "Save Draft" → Save without studying

**Why This Flow Works:**
- Photo reference visible during OCR (confidence)
- Incremental generation is visually satisfying (delight)
- Cards can be edited before first study (control)
- Fast path: Snap → Generate → Study in <2 minutes

---

## 5. UX Pattern Decisions

These patterns ensure consistency across the app and guide component implementation.

### 5.1 Button Hierarchy

**Primary Button** — Main action on screen
- **Color:** Primary blue (`#0ea5e9`)
- **Background:** Solid blue
- **Padding:** 12px vertical, 16px horizontal (md)
- **Border radius:** 8px
- **Text:** White, 14px, SemiBold
- **Usage:** "Start Studying", "Generate Cards", "Continue"

**Secondary Button** — Supporting action
- **Color:** Text only, secondary color (`#06b6d4`)
- **Background:** Transparent
- **Border:** 1px solid secondary color
- **Padding:** 12px vertical, 16px horizontal (md)
- **Usage:** "Edit", "Skip", "Cancel"

**Tertiary Button** — Low-priority action
- **Color:** Text only, gray
- **Background:** Transparent
- **Border:** None
- **Padding:** 12px horizontal
- **Usage:** "Learn More", "Dismiss", secondary links

**Difficulty Buttons** — Special case (study mode)
- **Easy:** Green background, white text
- **Medium:** Amber background, white text
- **Hard:** Red background, white text
- **Size:** 48px minimum height (touch target)
- **Layout:** Horizontal row at bottom of card
- **Spacing:** 8px gap between buttons

**Destructive Button** — Delete/Remove actions
- **Color:** Red error color (`#ef4444`)
- **Requires confirmation** before action
- **Usage:** "Delete Deck", "Remove Card"

### 5.2 Feedback & Validation Patterns

**Success State:**
- Color: Success green (`#14b8a6`)
- Icon: Checkmark
- Message: "Cards generated successfully!"
- Duration: Toast auto-dismisses after 3 seconds or user taps
- Placement: Top of screen, full-width banner or small toast

**Error State:**
- Color: Error red (`#ef4444`)
- Icon: Alert/warning icon
- Message: Clear, actionable text ("Photo too blurry. Try again?")
- Duration: Persistent until user dismisses
- Placement: Modal dialog or inline on relevant field

**Loading State:**
- Spinner animation (React Native ActivityIndicator)
- Text: "Generating cards..." or "Loading..."
- Duration: Show spinner, then success state
- Prevent interaction while loading (disable buttons, disable back)

**Input Validation:**
- **On-blur:** Check for empty required fields
- **On-change:** Show character count for max-length fields
- **Error display:** Below input field in red text
- **Example:** "Character count: 245/500"

### 5.3 Form Patterns

**Text Input:**
- **Label:** Above input, 12px gray text
- **Input field:** 14px body text, 12px padding, 1px blue border on focus
- **Helper text:** Below input, 12px gray, optional
- **Error:** Replaces helper text in red

**Text Area (Multi-line):**
- **Label:** Above textarea
- **Textarea:** Min height 100px, scrollable if needed
- **Character count:** Bottom-right, "245/500"
- **Min-height:** 100px, max-height: scrollable

**Buttons in Forms:**
- Primary CTA is button of largest visual weight
- Secondary option is subtle (gray text or outline)
- Placement: Below all fields, sticky at bottom of long forms

### 5.4 Modal & Dialog Patterns

**Confirmation Dialog:**
- Title: Clear, short question ("Delete this deck?")
- Body: Optional context ("This can't be undone")
- Buttons: Destructive action (red) + Cancel (gray outline)
- Size: Medium (takes ~60% of screen)
- Backdrop: Semi-transparent dark overlay

**Information Modal:**
- Title: Bold, 20px
- Content: Scrollable if needed
- Close button: X in top-right
- Size: Large (takes ~80-90% of screen)

**Bottom Sheet:**
- Slides up from bottom
- Rounded top corners
- Draggable handle indicator
- Used for: Deck menu, settings, filters

### 5.5 Empty State Patterns

**First Use (No Decks):**
- Illustration: Simple graphic of a camera
- Headline: "Create your first deck"
- Body text: "Snap a textbook page to get started"
- CTA: "Open Camera" (primary button)

**No Cards Due:**
- Headline: "All caught up!"
- Body: "You're on track. Come back tomorrow for more cards"
- Illustration: Checkmark or celebration icon

**No Search Results:**
- Headline: "No decks found"
- Body: "Try a different search term"
- CTA: "Clear search" (secondary button)

### 5.6 Navigation & Back Button Behavior

**Back Button:**
- Always available (system back on Android, gesture on iOS)
- Behavior: Return to previous screen
- Destructive actions (discard changes) show confirmation
- Example: "Discard changes to this deck?"

**Deep Linking:**
- Study mode: `studygenius://deck/[deck-id]/study`
- Deck view: `studygenius://deck/[deck-id]`
- Allows sharing and direct access from notifications

### 5.7 Notification & Toast Patterns

**Toast Notifications:**
- Duration: 3 seconds auto-dismiss
- Position: Top of screen, 16px margin
- Size: Full width with 16px horizontal padding
- Color: Success (green), Error (red), Info (blue)
- Animation: Slide in from top, slide out to top

**Alert Notifications:**
- Persistent until user dismisses
- Example: "Cloud sync failed. Trying again..."
- Close button available
- Position: Top, below status bar

**In-App Messages:**
- Inline within content: "Want an explanation? Tap ?"
- Contextual to user action
- Dismissible by user or auto-dismiss after 5 seconds

---

## 6. Responsive & Accessibility Strategy

### 6.1 Responsive Breakpoints

**Mobile First Approach:**

| Device | Width | Layout |
|--------|-------|--------|
| Small Mobile | <375px | Single column, 8px margins |
| Standard Mobile | 375-428px | Single column, 16px margins (primary) |
| Large Mobile | 428-600px | Single column, 20px margins |
| Tablet Portrait | 600-800px | 2-column layout where applicable |
| Tablet Landscape | 800px+ | Multi-column layouts |

**Adaptation Patterns:**
- **Tab navigation:** Remains at bottom on all sizes
- **Card grid:** 1 column (mobile) → 2 columns (tablet)
- **Modals:** Full-screen (mobile) → 70% width (tablet)
- **Buttons:** Full width (mobile) → 48% width in pairs (tablet)

### 6.2 Touch Target Sizing

All interactive elements must meet minimum 48px height/width for touch:

- **Buttons:** 48px height minimum
- **Icon buttons:** 48x48px minimum
- **Text links:** 48px height with padding
- **Form inputs:** 48px height minimum
- **Card tap target:** Entire card is tappable (minimum 64px height)

### 6.3 Accessibility Requirements: WCAG 2.1 Level AA

**Color Contrast:**
- Text on background: Minimum 4.5:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio
- Blue (`#0ea5e9`) on dark background (`#1e293b`): 8.3:1 ✓

**Keyboard Navigation:**
- All interactive elements accessible via keyboard
- Tab order is logical (left-to-right, top-to-bottom)
- Focus indicator is visible (blue outline, 2px)
- Escape key closes modals and sheets

**Screen Reader Support:**
- All buttons have descriptive labels
- Form inputs have associated labels
- Images have alt text (if applicable)
- ARIA roles for custom components (dialog, alert, tab)
- Example: `<button accessibility label="Start studying Biology deck">`

**Focus Management:**
- Focus moves to modal when opened
- Focus returns to triggering button when modal closes
- Focus stays visible during keyboard navigation

**Semantic HTML:**
- Use proper heading hierarchy (h1 → h2 → h3)
- List items use `<FlatList>` or semantic lists
- Buttons use `<TouchableOpacity>` with `accessibilityRole="button"`

**Animation Considerations:**
- Card flip animation can be disabled in accessibility settings
- Respects `prefers-reduced-motion` system setting
- Optional: Provide static view alternative for animations

---

## 7. Component Library Strategy

### 7.1 React Native Paper Components

**Used Components:**
- `Button` — Primary, secondary, tertiary variants
- `Card` — Deck cards, content containers
- `TextInput` — OCR preview, settings
- `Checkbox` — Settings, preferences
- `Chip` — Category tags, difficulty badges
- `ActivityIndicator` — Loading states
- `Modal` — Dialogs, sheets
- `Divider` — Visual separation
- `Surface` — Elevated containers

**Customization:**
- Override default styles with ThemeProvider
- Define custom theme object:
  - Colors: Primary blue, secondary teal, etc.
  - Typography: Custom font sizes, weights
  - Shadows: Dark mode-appropriate elevation

### 7.2 Custom Components

**FlashCard Component**
- Props: `question`, `answer`, `onMark`, `isFlipped`
- Features: 3D flip animation, tap to reveal
- States: Question view, Answer view, Loading

**CardGenerationProgress Component**
- Props: `totalCards`, `generatedCards`, `currentCard`
- Features: Incremental card appearance, progress text
- Shows skeleton cards as they appear

**DifficultySelector Component**
- Props: `onSelect`
- Three buttons: Easy/Medium/Hard with color coding
- Full-width on mobile, maintains minimum touch targets

**ChatBubble Component**
- Props: `message`, `isUser`, `timestamp`
- User messages (right-aligned, blue)
- AI messages (left-aligned, darker background)
- Supports text and optional images

**CameraOverlay Component**
- Props: `onCapture`, `onGallery`
- Frame guides, alignment indicator
- Shutter button and gallery option

---

## 8. Core Design Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Onboarding** | Minimal (skip tour) | Beginner users want to snap and study, not read. |
| **Photo-First Navigation** | Capture as Tab 1 | Primary use case (taking photos) is primary navigation. |
| **Card Reveal** | Flip animation | Tactile, satisfying, matches physical flashcard mental model. |
| **Difficulty Selection** | Bottom buttons | Always visible, large touch targets, clear interaction. |
| **AI Help** | Always visible + contextual | Accessible but not forced. Suggested after "Hard" mark. |
| **Generation Feedback** | Incremental cards | Satisfying visual feedback, user can watch progress. |
| **Color Theme** | Cool Focus (blue) | Professional, trustworthy, calm—perfect for serious learning. |
| **Empty States** | Illustration + CTA | Guides new users, reduces confusion, clear next step. |

---

## 9. Interaction Patterns

### 9.1 Swipe & Gesture Support

- **Left swipe on card** → Mark as Easy and advance (optional, secondary to buttons)
- **Right swipe on card** → Mark as Hard (optional, discoverable through tutorial)
- **Pull-to-refresh** on deck list → Sync with server (if cloud sync enabled)
- **Long-press on card** (deck view) → Delete/edit options

### 9.2 Animations & Micro-interactions

**Card Flip:**
- Duration: 300ms
- Easing: Spring easing (slightly bouncy, satisfying)
- 3D perspective effect

**Card Entrance:**
- Slide in from right + fade in
- Duration: 250ms
- Easing: Ease-out

**Button Press:**
- Scale down to 0.95 on press
- Duration: 150ms
- Tactile feedback (optional haptic on press)

**Progress Bar:**
- Animated bar fill on new card
- Duration: 300ms
- Smooth ease-out easing

---

## 10. Implementation Guidelines

### 10.1 For Developers

**Component Structure:**
```
screens/
  CameraScreen.tsx
  OCRPreviewScreen.tsx
  CardGenerationScreen.tsx
  StudyScreen.tsx
  DeckLibraryScreen.tsx

components/
  FlashCard.tsx
  CardGenerationProgress.tsx
  DifficultySelector.tsx
  ChatBubble.tsx
  CameraOverlay.tsx

navigation/
  BottomTabNavigator.tsx
  
theme/
  colors.ts
  typography.ts
  spacing.ts
```

**Theme Configuration:**
```typescript
const theme = {
  colors: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    success: '#14b8a6',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#0f172a',
    surface: 'rgba(15, 165, 233, 0.08)',
  },
  typography: { /* ... */ },
  spacing: { /* ... */ },
};
```

### 10.2 For Designers

**Mockup Requirements:**
- Desktop & mobile layouts
- Interactive states (hover, active, focus)
- Error and loading states
- Empty states with illustrations
- Dark mode applied throughout

**Hand-off Documents:**
- Component specifications with sizing, colors, spacing
- Animation specifications (duration, easing, keyframes)
- Interaction documentation (tap targets, gestures)
- Accessibility requirements checklist

---

## 11. Success Metrics

### 11.1 User Experience Metrics

- **Study session completion rate:** >80% (users finish started sessions)
- **Card flip smoothness:** 60 FPS maintained during flip animation
- **OCR accuracy:** >95% on standard textbook photos (after user correction)
- **Generation time:** <30 seconds for 12-card deck
- **Time-to-first-study:** <2 minutes from app launch (snap → generate → study)

### 11.2 Usability Metrics

- **New user success rate:** >90% complete first study session without help
- **Error recovery:** Users can recover from errors (wrong photo, OCR errors) within 3 steps
- **Accessibility compliance:** 100% WCAG 2.1 AA compliance
- **No crashes:** Zero crashes during critical flows (study, generation)

---

## 12. Future Enhancements

**Phase 2 (Post-MVP):**
- Collaborative decks (share with study partners)
- Study groups & leaderboards
- Audio pronunciation for language learning
- Spaced repetition algorithm refinements
- Custom themes (user-selectable color schemes)
- Offline-first full sync

**Phase 3 (Long-term):**
- AR flashcard visualization
- Voice Q&A (speak question, hear answer)
- Adaptive difficulty (AI adjusts card difficulty based on performance)
- Integration with school learning management systems (LMS)

---

## Appendix: Quick Reference

**Design System:**
- Color: Cool Focus theme (sky blue primary)
- Typography: SF Pro / Roboto families
- Spacing: 8px base unit
- Components: React Native Paper + custom

**Navigation:**
- Bottom tabs: Capture | Library | Settings
- Photo-first layout

**Key Flows:**
1. First-Time: Snap → OCR → Generate → Study (minimal onboarding)
2. Study: Open deck → Flip card → Mark difficulty → AI help optional → Repeat
3. Capture: Snap → OCR preview → Generate cards incrementally → Review

**Interactions:**
- Card flip: 3D animation, 300ms
- Incremental generation: Cards pop in one-by-one
- Difficulty: Bottom buttons (Easy/Medium/Hard)

**Accessibility:**
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- 48px touch targets

---

**Document Status:** ✅ Complete | Ready for Development & Design Implementation

**Next Steps:**
1. Designers: Create high-fidelity mockups using this specification
2. Developers: Build component library following guidelines
3. Team: Schedule design review & iteration sessions
4. QA: Develop test cases based on user journeys

