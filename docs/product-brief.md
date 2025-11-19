# StudyGenius AI — Product Brief

**Project:** StudyGenius AI
**Type:** Mobile Application (React Native)
**Tier:** Starter ($120 equivalent concept)
**Target Users:** Students (high school/college), self-learners
**Primary Use Case:** Convert textbook photos into AI-generated flashcards with spaced repetition study sessions
**Portfolio Goal:** Demonstrate multimodal AI (vision + text), modern mobile UX, and production-ready code
**Platform:** iOS & Android (React Native)
**Timeline:** Fast-tracked, production-quality MVP

---

## 1. Problem Statement

Students waste **hours manually typing flashcards** from textbooks. Even when they do create cards, they lack:

- **Smart review timing** (spaced repetition requires discipline)
- **Conceptual understanding** (answers without explanation)
- **Study accountability** (no metrics, no progress visibility)

**Result:** Inefficient studying, forgotten material, wasted time.

---

## 2. Solution Overview

**StudyGenius AI** solves this with a three-step flow:

1. **📸 Capture** — Take a photo of textbook page → Auto-crop + OCR extract
2. **✨ Generate** — Gemini AI creates Q&A pairs from text (with user editing)
3. **📚 Study** — Spaced repetition algorithm + AI tutor for explanations

**Hero Feature:** Before/After swipe animation shows textbook photo → beautifully designed flashcards (instant gratification, portfolio wow-factor).

---

## 3. Core Features

### 3.1 Photo Capture & OCR

- **Camera interface** with manual crop control
- **Google ML Kit on-device OCR** for text extraction
- **OCR preview screen** — user can edit/correct extracted text before card generation
- **Auto-crop** for optimal text framing
- **Camera roll upload** as fallback option

### 3.2 AI Flashcard Generation

- **Google Gemini API** generates Q&A pairs from extracted text
- **Incremental generation** — show progress as cards are created (UX polish)
- **Auto formatting** — beautifully styled cards (gradients, dark mode, readable typography)
- **User can regenerate** if unsatisfied with results

### 3.3 Study Dashboard

- **Deck management** — view all created decks, stats per deck
- **Study mode** — review cards with spaced repetition scheduling
- **Retention metrics** — Mock data showing "87% retention rate" (portfolio showpiece)
- **Study streak** — consecutive days studied (motivational gamification)

### 3.4 Spaced Repetition Algorithm

- **SM-2 Algorithm (lite version)** — adjusts review intervals based on difficulty
- **Cards marked as:** Due, Not Due, Hard, Medium, Easy
- **Intervals:** Show next review date for each card
- **Session tracking** — log study time, review count

### 3.5 AI Tutor Chatbot

- **Multiple entry points:**
  - Tap "?" button on any flashcard
  - Auto-trigger after wrong answer ("Want an explanation?")
  - Dedicated "Tutor" tab in navigation
- **Conversational** — explain concept + allow follow-up questions
- **Context-aware** — knows which flashcard/concept is being discussed
- **Gemini-powered** with study-focused prompts

### 3.6 User Accounts & Cloud Sync

- **Email/password authentication** via Supabase
- **Cloud sync (optional)** — sync decks across devices
- **Local-first** — study offline, sync when connected
- **Cloud preference toggle** in settings

---

## 4. User Flows

### Flow 1: First-Time User

1. Sign up with email → Supabase auth
2. See "Take a photo" button (skip tour, straight to action)
3. Tap camera → capture textbook page
4. Auto-crop, auto-OCR
5. Review extracted text, edit if needed
6. Tap "Generate cards" → Gemini creates Q&A
7. See beautifully formatted cards
8. Tap "Start studying" → Study mode begins
9. Dashboard shows stats (mock: "87% retention")

### Flow 2: Existing User Studying

1. Open app → Dashboard shows decks
2. Tap deck → Study session
3. See flashcard → Tap to reveal answer
4. Mark as Easy/Medium/Hard
5. If wrong answer → "Explain this" appears
6. Tap → AI tutor explains concept conversationally
7. Continue until session complete
8. Dashboard updates with session stats

### Flow 3: Improve Card Quality

1. View generated cards
2. Regenerate for same photo (new questions)
3. Edit individual Q&A pairs
4. Delete unwanted cards

---

## 5. Design Direction

### Visual Style: **Dark Mode First, Modern Gradient**

- **Primary Dark Background** — dark navy/charcoal for OLED efficiency
- **Accent Colors** — vibrant gradients (purple → blue, orange → red)
- **Glassmorphism elements** — semi-transparent cards, depth
- **Typography** — Clean, readable (inter/plus jakarta, SF Pro for iOS)
- **Animations** — Smooth transitions, swipe between photo/cards, card flip effects

### Key Screens:

1. **Onboarding** — Sign up, skip to app
2. **Camera Capture** — Full-screen camera with crop UI
3. **OCR Preview** — Editable text before generation
4. **Card Generation** — Loading state with progress
5. **Card Gallery** — Grid of generated flashcards
6. **Study Mode** — Full-screen card flip, answer reveal, difficulty selector
7. **Dashboard** — Deck list, retention stats, study streak
8. **Tutor Chat** — Conversational AI interface
9. **Settings** — Auth, cloud sync toggle, theme settings

### Hero Interaction: **Before/After Swipe**

- Show textbook photo on left
- Swipe right to reveal beautifully designed cards
- Smooth animation, satisfying visual feedback
- (This is your portfolio wow moment)

---

## 6. Technical Stack

### Frontend

- **React Native** (Expo or bare — TBD based on complexity)
- **Navigation:** React Navigation (Bottom Tabs)
- **State Management:** Redux or Zustand (lightweight)
- **UI Library:** React Native Paper + custom styling
- **Animations:** React Native Reanimated (smooth, performant)

### Backend & Services

- **Authentication:** Supabase (email/password)
- **Database:** Supabase PostgreSQL (decks, cards, sessions)
- **Storage:** Supabase Storage (deck backups, optional)
- **AI/Vision:**
  - **Google Gemini API** — Q&A generation
  - **Google ML Kit** — On-device OCR
- **Cloud Messaging (optional):** Firebase Cloud Messaging for study reminders

### Data Schema (Simplified)

```
Users
  id (UUID)
  email
  created_at

Decks
  id, user_id, title, created_at, card_count, study_sessions

Cards
  id, deck_id, question, answer, difficulty, last_reviewed, next_review

StudySessions
  id, user_id, deck_id, cards_reviewed, correct_count, duration, created_at

ChatHistory (optional for tutor context)
  id, user_id, card_id, messages[], created_at
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1)

- [ ] Project setup (React Native, Supabase auth)
- [ ] Basic navigation (camera, dashboard, study mode screens)
- [ ] Supabase database schema
- [ ] UI component library (dark mode styling)

### Phase 2: Photo & OCR (Week 2)

- [ ] Camera interface with crop UI
- [ ] Google ML Kit integration
- [ ] OCR preview + edit screen
- [ ] Save extracted text to Supabase

### Phase 3: AI Card Generation (Week 2-3)

- [ ] Gemini API integration
- [ ] Q&A generation pipeline
- [ ] Card formatting & styling
- [ ] Before/After swipe animation (hero feature)

### Phase 4: Study Mode & Spaced Repetition (Week 3-4)

- [ ] Study session logic (SM-2 lite)
- [ ] Card flip animations
- [ ] Difficulty selector (Easy/Medium/Hard)
- [ ] Session tracking & saving

### Phase 5: Dashboard & Stats (Week 4)

- [ ] Dashboard layout (decks, stats, streak)
- [ ] Mock retention data (87% metric)
- [ ] Deck management (delete, rename, view stats)

### Phase 6: AI Tutor Chatbot (Week 4-5)

- [ ] Chat UI (messages, input)
- [ ] Gemini integration for explanations
- [ ] Context awareness (current card/concept)
- [ ] Multiple entry points (button, wrong answer, tab)

### Phase 7: Polish & Deployment (Week 5+)

- [ ] Dark mode refinement
- [ ] Performance optimization
- [ ] Error handling & edge cases
- [ ] Testing (manual on iOS/Android)
- [ ] Build APK/IPA for portfolio demo
- [ ] Case study documentation

---

## 8. MVP Success Criteria

✅ **Core Features Working:**

- Photo capture + OCR ✓
- Gemini Q&A generation ✓
- Card display with styling ✓
- Study mode with spaced rep ✓
- Dashboard with stats ✓
- AI tutor chatbot ✓

✅ **User Experience:**

- Smooth animations (swipe, card flip) ✓
- Dark mode throughout ✓
- No crashes or freezes ✓
- Offline-capable (study works without internet) ✓

✅ **Portfolio Ready:**

- Production code quality ✓
- Beautiful UI (client-impressive) ✓
- Working demo (no dummy features) ✓
- GitHub repo (open-source) ✓
- Case study (problem → solution → metrics) ✓

---

## 9. Post-Launch Strategy

### Portfolio Positioning:

**"Multimodal AI for Education"** — Demonstrate:

- Vision AI (camera + OCR)
- Text AI (Gemini Q&A generation)
- Mobile-first UX (React Native cross-platform)
- Real-world features (auth, cloud sync, offline capability)

### Client Pitch Angle:

_"I built StudyGenius AI as a portfolio project to show I can handle:_

- _Complex AI workflows (vision → text → generation)_
- _Beautiful, modern mobile UI design_
- _Production-ready code (auth, databases, APIs)_
- _Actual user problems (education is hot, low-budget vertical)_
- _Full-stack thinking (frontend + backend + AI integration)_

_This app proves I can take your app idea from concept to polished, investable product."_

### Deliverables:

- ✅ Working app (build APK/IPA for install)
- ✅ GitHub repo (clean code, well-documented)
- ✅ Case study doc (1-2 page writeup)
- ✅ Before/After screenshots (photo → flashcards)
- ✅ Feature demo video (3-5 min walkthrough)

---

## 10. Success Metrics (Portfolio Perspective)

- **Client Engagement:** Portfolio viewers spend 5+ min with demo
- **Quality Signal:** Zero crashes during demo
- **Technical Credibility:** GitHub shows clean, well-structured code
- **Design Appeal:** Clients comment on UI polish
- **Feature Completeness:** All promised features work flawlessly
- **Landing Leads:** Portfolio results in freelance inquiries

---

## 11. Risks & Mitigation

| Risk                             | Mitigation                                 |
| -------------------------------- | ------------------------------------------ |
| OCR fails on poor quality photos | Show preview, let user edit text           |
| Gemini API costs spike           | Rate limit, cache common queries           |
| Spaced rep complexity            | Use SM-2 lite (simplified version)         |
| Cross-platform bugs              | Test on both iOS/Android throughout        |
| Portfolio demo crashes           | Extensive testing, use mock data if needed |

---

## Appendix: Quick Reference

**Tech Stack:** React Native, Supabase, Gemini API, ML Kit
**Design:** Dark mode, gradients, glassmorphism
**Timeline:** ~5 weeks, production-quality MVP
**Portfolio Goal:** Land freelance clients wanting app development
**Key Differentiator:** Multimodal AI (vision + text) in a beautiful, working app
**Hero Feature:** Before/After swipe (textbook → flashcards)

---

**Status:** ✅ Brief Complete | Next: Technical Implementation Plan
