# LIFEOS Privacy Policy & Data Architecture

Tagline: "Less Scrolling. More Living."

---

## 1. Core Principles

1. **No Shame, No Manipulation**:
   LIFEOS never employs negative psychology, guilt-inducing streaks, or humiliating notifications.

2. **Data Minimization**:
   - Only aggregated durations (e.g. 35 minutes on Instagram on 2026-10-22) are stored.
   - We do NOT collect URLs browsed, text typed, contacts, or message contents.

3. **User Ownership**:
   - **Data Export**: Users can download a full JSON copy of all account data at any time (`GET /api/v1/preferences/privacy/export`).
   - **Usage Purge**: Users can delete all device usage statistics while retaining daily goals (`DELETE /api/v1/preferences/privacy/usage`).
   - **Account Deletion**: Users can permanently erase their account and all associated database records (`DELETE /api/v1/preferences/privacy/account`).

4. **Transparent AI Usage**:
   - The AI Personalization Engine only receives user-approved context (display name, career field, communication style, and active daily goal titles).
   - We do not train proprietary foundational models on user data.
