# LIFEOS — Your AI Digital Friend
> **Tagline:** Less Scrolling. More Living.

LIFEOS is an intelligent digital wellness and productivity companion designed to help people reduce mindless social media scrolling and make meaningful, steady progress toward their personal, educational, and professional goals.

Instead of rigid app blockers or guilt-inducing streak trackers, LIFEOS acts as a supportive friend, personal mentor, and companion that understands your ambitions, monitors permitted device usage statistics locally, and provides friendly, respectful micro-actions at the right moments.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                LIFEOS ARCHITECTURE                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Web Dashboard (React 18 + Vite + TypeScript + Tailwind + Recharts + Lucide) ]   |
|   - Multilingual UI (11 languages: English, Hindi, Hinglish, Bengali, Tamil, etc)|
|   - Real-time Goal Management (Target quantity, units, priority, completions)     |
|   - Monitored App & Timer Configuration (Per-app thresholds, delivery modes)      |
|   - Verified Motivational Story Library (Sourced citations, Listen audio preview) |
|   - Focus Timer & Recovery with Post-Session Goal Verification                    |
|   - Screen-Time Analytics (Usage vs. Focus, threshold trends)                     |
|   - Comprehensive Settings (Voice, TTS speaking rate, Quiet Hours, Privacy)       |
|                                                                                   |
|                                        | HTTPS REST API (/api/v1)                 |
|                                        v                                          |
|  [ Backend API & AI Engine (Node.js + Express + TypeScript + Prisma + PostgreSQL) ]|
|   - JWT Authentication & Strict User Data Isolation                               |
|   - REST API: Auth, Goals, Apps, Thresholds, Usage, Stories, Focus, Preferences   |
|   - Verified Story Catalog & Sourced Bibliography (`StorySource`, `SavedStory`)   |
|   - AI Personalization Engine (Gemini/OpenAI abstraction + Deterministic Fallback)|
|   - Daily Goal Rescue Action Recommendation                                       |
|   - Data Privacy: Export, Usage Reset, Complete Account Purge                     |
|                                        ^                                          |
|                                        | Device Sync & Interventions              |
|                                        v                                          |
|  [ Android Mobile App (React Native + TypeScript + Kotlin Native Module) ]        |
|   - Android UsageStatsManager Bridge (Permitted foreground usage detection)       |
|   - Local Threshold Evaluation & Anti-Duplicate Dispatcher                        |
|   - Delivery Modes: Text-Only, Voice+Text, Voice-Only, Smart Companion           |
|   - Android TextToSpeech Native Integration (Speaking rate, stop playback)        |
|   - Optional 5-Second Reminder Sound & Dismissible Native Overlay Reminder        |
|   - Transparent Permission Explanations (UsageStats, PostNotifications, Overlay)  |
+-----------------------------------------------------------------------------------+
```

---

## Key Features

1. **Smart App Usage Monitoring**:
   - Monitored applications (Instagram, YouTube, X, Reddit, custom packages).
   - Independent thresholds (e.g. 20m, 40m, 60m).
   - Local estimation via Android `UsageStatsManager` without transmitting private messages or screen feeds.

2. **Smart Motivational Interventions**:
   - 4 Delivery Modes: **Text Only**, **Voice and Text**, **Voice Only**, **Smart Companion**.
   - 4 Companion Personalities: **Friendly Friend**, **Professional Mentor**, **Motivator**, **Calm Companion**.
   - Strict Anti-Duplicate prevention (no repetitive annoying notifications).
   - Quiet Hours (Do Not Disturb) respect.

3. **Daily Goal Rescue & Management**:
   - Define measurable goals (quantities, units, categories, priorities).
   - Goal Rescue recommends a 20-minute bite-sized action on pending goals when you're caught scrolling.
   - Interactive Pomodoro / Focus Timer with session recovery across backgrounding and restarts.

4. **Verified Motivational Story Engine**:
   - Fact-checked biographical milestones (Linus Torvalds, Steve Wozniak, Dr. Fei-Fei Li, Satya Nadella, Dr. Cal Newport).
   - Verified bibliographic sources, citations, and URLs.
   - Zero hallucinated quotes or fabricated stories.
   - On-device and browser audio playback via TextToSpeech / Web Speech API.

5. **Multilingual Localization**:
   - 11 Supported Languages: English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam.
   - Dynamic language switching without internal key exposure.

6. **Privacy & Security**:
   - Zero screen recording or keystroke monitoring.
   - One-click full data export (JSON).
   - Purge device usage records while preserving goals.
   - Permanent account deletion.

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v25.9)
- PostgreSQL (Docker or local instance)
- npm or bun

### 1. Database & Backend Setup
```bash
cd backend
cp ../.env.example .env

# Install dependencies
npm install

# Push schema to PostgreSQL and generate Prisma Client
npx prisma db push

# Seed verified stories, demo user, goals, and timer defaults
npm run prisma:seed

# Run backend unit & integration tests
npm test

# Start backend server (runs on http://localhost:4000)
npm run dev
```

### 2. Web Frontend Setup
```bash
cd web

# Install dependencies
npm install

# Run TypeScript compilation and build
npm run build

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Android Mobile Application
```bash
cd android

# Run Android UsageEngine unit tests
npm test
```
To run the Android native build on an emulator or connected device:
```bash
cd android
npm run android
```
Grant testing permissions via ADB:
```bash
adb shell appops set com.lifeos android:get_usage_stats allow
adb shell pm grant com.lifeos android.permission.POST_NOTIFICATIONS
```

---

## Seed & Demo Credentials
- **Email**: `alex@lifeos.dev`
- **Password**: `password123`

---

## Directory Structure
```
lifeos/
├── backend/            # Express.js + TypeScript + Prisma + PostgreSQL
│   ├── src/
│   │   ├── controllers/# Auth, Goals, Apps, Usage, Stories, Focus, Preferences, AI
│   │   ├── middleware/ # Auth, RateLimiter, Centralized Error Handling
│   │   ├── services/   # AI engine (with fallback), Audio player
│   │   ├── routes/     # Versioned REST APIs (/api/v1)
│   │   └── server.ts
│   ├── prisma/         # schema.prisma & verified seed script
│   └── tests/          # Supertest + Vitest automated API tests
├── web/                # React 18 + Vite + Tailwind + Recharts
│   ├── src/
│   │   ├── components/ # Navbar, Sidebar, Layout, Cards
│   │   ├── context/    # AuthContext, LanguageContext, ThemeContext
│   │   ├── i18n/       # Multilingual dictionaries (11 languages)
│   │   ├── pages/      # Landing, Login, Register, Dashboard, Goals, Apps, Stories, Focus, Settings
│   │   └── services/   # Typed API client
├── android/            # React Native + Kotlin Native Bridge
│   ├── src/
│   │   ├── native/     # UsageStatsBridge, TextToSpeechBridge
│   │   ├── services/   # UsageEngine, Threshold evaluation, Anti-duplicate
│   │   └── screens/    # Home, Goals, Stories, Focus, Settings, Diagnostics, Permissions
│   └── android/app/    # Native Kotlin modules (UsageStatsModule, TextToSpeechModule, OverlayService)
├── docs/               # API specs, Android permissions guide, Privacy policy
├── docker-compose.yml  # Production deployment configuration
└── README.md
```

---

## Automated Test Verification

- **Backend Tests (Vitest + Supertest)**: 15 passed (100% success rate)
  - Auth registration & token issuance
  - Multi-tenant user data isolation
  - Daily goal creation & completion tracking
  - Monitored application & threshold updates
  - Device usage synchronization
  - Verified story catalog & bibliographic sources
  - Focus session lifecycle
  - Empathetic AI reminder with deterministic fallback
- **Android Tests (Vitest)**: 5 passed (100% success rate)
  - Usage threshold evaluation
  - Duplicate notification prevention
  - Higher threshold transition logic
  - Quiet hours evaluation
  - 5-second maximum sound limiter

---

## License
MIT License. Built for intentional living and mindful technology habits.
