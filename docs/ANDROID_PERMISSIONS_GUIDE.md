# Android Permissions Guide & Architecture

## Overview
LIFEOS is designed from the ground up to protect user privacy and respect Android operating system policies.

---

## 1. Permissions Implemented

| Permission | Purpose | Why Required | Policy & Privacy Guarantee |
| :--- | :--- | :--- | :--- |
| `PACKAGE_USAGE_STATS` | Usage Duration Estimation | Allows LIFEOS to calculate minutes spent in selected apps (e.g. 30m on Instagram) | Evaluated locally on device. Zero transmission of messages, private photos, or keystrokes. |
| `POST_NOTIFICATIONS` | Friendly Interventions | Delivers respectful reminders when a threshold is crossed | Respects Android Do-Not-Disturb and user-configured Quiet Hours. |
| `RECEIVE_BOOT_COMPLETED`| Schedule Maintenance | Re-registers periodic WorkManager evaluations after device restart | No hidden background battery drains. |
| `SYSTEM_ALERT_WINDOW` | Optional Floating Reminder | Shows a small, dismissible prompt above distracting apps | Strictly optional. Dismissible with a single tap. Non-blocking. |

---

## 2. Technical Limitations & Android Sandbox Rules

1. **No Direct Keystroke or Screen Capture**:
   - LIFEOS never uses Accessibility Services or screen recorders.
   - We do not observe individual feed items, video contents, or chat partners.

2. **Best-Effort Scheduling**:
   - Modern Android OS (Android 12+) restricts unrestricted background execution through battery optimization (Doze mode).
   - Usage evaluation runs via WorkManager periodic requests (every ~15 minutes). Exact threshold timing can vary by several minutes depending on OEM power management.

3. **Anti-Duplicate Mechanism**:
   - The on-device engine caches `YYYY-MM-DD:packageName:thresholdMinutes`.
   - Once a notification is dispatched for e.g. 30m of Instagram, it will never re-fire that day, even if the app process restarts.

---

## 3. How to Test on Android Emulator or Device

1. Install the APK:
   ```bash
   adb install app-debug.apk
   ```
2. Grant Usage Access via ADB (for automated CI/CD testing):
   ```bash
   adb shell appops set com.lifeos android:get_usage_stats allow
   ```
3. Grant Notification permission:
   ```bash
   adb shell pm grant com.lifeos android.permission.POST_NOTIFICATIONS
   ```
4. Verify via Diagnostic Screen:
   - Navigate to **Settings -> System Diagnostics** in the app.
   - Confirm `PACKAGE_USAGE_STATS Permission: GRANTED`.
