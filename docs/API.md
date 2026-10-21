# LIFEOS REST API Specification (v1)

Base URL: `http://localhost:4000/api/v1`

---

## 1. Authentication (`/auth`)

### POST `/auth/register`
Creates a new user account, initializes default preferences, and returns JWT.
- **Request Body**:
```json
{
  "email": "alex@lifeos.dev",
  "password": "password123",
  "displayName": "Alex Rivera",
  "preferredLanguage": "en",
  "careerCategory": "Software Engineering",
  "communicationStyle": "FRIENDLY_FRIEND"
}
```
- **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "alex@lifeos.dev",
      "displayName": "Alex Rivera",
      "preferredLanguage": "en",
      "careerCategory": "Software Engineering",
      "communicationStyle": "FRIENDLY_FRIEND"
    },
    "token": "jwt-token-string"
  }
}
```

### POST `/auth/login`
Authenticates existing user and sets `access_token` cookie or returns Bearer token.

### GET `/auth/me`
Returns current user profile, active device list, and counter summaries.

---

## 2. Daily Goals (`/goals`)

### GET `/goals`
Returns user's daily goals with today's completion status.
- **Query Params**: `isActive=true`, `category=Career`

### POST `/goals`
Creates a measurable daily goal.
- **Request Body**:
```json
{
  "title": "Solve two DSA questions",
  "description": "Graphs and trees BFS traversals",
  "category": "Career",
  "targetValue": 2,
  "targetUnit": "questions",
  "priority": "HIGH",
  "schedule": "DAILY"
}
```

### POST `/goals/:id/completions`
Upserts daily completion record for a goal.
- **Request Body**:
```json
{
  "completedValue": 2,
  "isCompleted": true,
  "completionDate": "2026-10-22"
}
```

---

## 3. Monitored Applications & Timers (`/apps`)

### GET `/apps`
Returns user's monitored applications with configured thresholds and delivery modes.

### POST `/apps`
Adds an application to monitor with default thresholds (20m, 40m, 60m).
- **Request Body**:
```json
{
  "packageName": "com.instagram.android",
  "displayName": "Instagram",
  "dailyLimitMinutes": 45
}
```

### PATCH `/thresholds/:id`
Updates reminder mode or toggles voice playback for an individual threshold.
- **Request Body**:
```json
{
  "reminderMode": "VOICE_AND_TEXT",
  "voiceEnabled": true
}
```

---

## 4. App Usage Ingestion (`/usage`)

### POST `/usage/sync`
Batch synchronizes daily aggregated usage from Android device.
- **Request Body**:
```json
{
  "deviceId": "device-uuid",
  "platform": "ANDROID",
  "deviceName": "Pixel 8",
  "summaries": [
    {
      "packageName": "com.instagram.android",
      "usageDate": "2026-10-22",
      "durationMinutes": 35.5
    }
  ]
}
```

### GET `/usage/daily`
Returns today's usage breakdown by application.

### GET `/usage/weekly`
Returns last 7 days of social usage vs. completed focus time.

---

## 5. Verified Motivational Stories (`/stories`)

### GET `/stories`
Returns verified historical biographies with grounded sources and citations.
- **Query Params**: `category=Software Engineering`

### POST `/stories/:id/save`
Toggles bookmark state for the authenticated user.

---

## 6. Focus Sessions (`/focus`)

### POST `/focus/sessions`
Records the start of a deep work focus session.

### PATCH `/focus/sessions/:id`
Updates session status (`COMPLETED`, `PAUSED`, `CANCELLED`) and records actual duration.

---

## 7. AI Personalization & Goal Rescue (`/ai`)

### POST `/ai/reminder`
Generates a compassionate, non-shaming reminder using the user's communication style and language.

### POST `/ai/goal-suggestion`
Suggests a realistic 20-minute action on the user's highest priority pending goal.
