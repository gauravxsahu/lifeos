import { TextToSpeechBridge } from '../native/TextToSpeechBridge';

export interface ThresholdConfig {
  thresholdMinutes: number;
  reminderMode: 'TEXT_ONLY' | 'VOICE_AND_TEXT' | 'VOICE_ONLY' | 'SMART_COMPANION';
  voiceEnabled: boolean;
  storyEnabled: boolean;
}

export interface MonitoredAppConfig {
  packageName: string;
  displayName: string;
  isEnabled: boolean;
  dailyLimitMinutes: number;
  thresholds: ThresholdConfig[];
}

export interface QuietHoursConfig {
  enabled: boolean;
  start: string; // "HH:mm" (24h)
  end: string;   // "HH:mm" (24h)
}

export interface InterventionEvent {
  packageName: string;
  appName: string;
  thresholdMinutes: number;
  actualMinutes: number;
  deliveryMode: string;
  title: string;
  message: string;
  timestamp: number;
}

export class UsageEngine {
  // Set to store deduplication keys for today: "YYYY-MM-DD:packageName:thresholdMinutes"
  private triggeredThresholds = new Set<string>();
  private activeSoundTimeout: any = null;

  public getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Resets triggered thresholds if day changed
   */
  public resetIfNewDay(currentDayStr: string) {
    const today = this.getTodayKey();
    if (currentDayStr !== today) {
      this.triggeredThresholds.clear();
    }
  }

  /**
   * Checks whether the current time falls inside quiet hours.
   */
  public isWithinQuietHours(
    now: Date,
    quietStart: string = '22:00',
    quietEnd: string = '07:00'
  ): boolean {
    const [startH, startM] = quietStart.split(':').map(Number);
    const [endH, endM] = quietEnd.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // e.g. 22:00 (1320m) to 07:00 (420m) spans midnight
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Evaluates usage stats against configured thresholds and returns any new intervention.
   * Prevents duplicate notifications for the same threshold on the same day.
   */
  public evaluate(
    usageStats: Array<{ packageName: string; totalMinutes: number }>,
    monitoredApps: MonitoredAppConfig[],
    quietHours: QuietHoursConfig,
    now: Date = new Date(),
    userName: string = 'friend',
    lang: string = 'en'
  ): InterventionEvent | null {
    // 1. Check quiet hours
    if (quietHours.enabled && this.isWithinQuietHours(now, quietHours.start, quietHours.end)) {
      return null;
    }

    const todayStr = this.getTodayKey();

    for (const stat of usageStats) {
      const app = monitoredApps.find(
        (a) => a.packageName === stat.packageName && a.isEnabled
      );
      if (!app) continue;

      // Sort thresholds ascending
      const sortedThresholds = [...app.thresholds].sort(
        (a, b) => a.thresholdMinutes - b.thresholdMinutes
      );

      for (const th of sortedThresholds) {
        // If current duration has reached or exceeded threshold
        if (stat.totalMinutes >= th.thresholdMinutes) {
          const deduplicationKey = `${todayStr}:${app.packageName}:${th.thresholdMinutes}`;

          // Check if already triggered today
          if (!this.triggeredThresholds.has(deduplicationKey)) {
            // Mark as triggered to prevent duplicates
            this.triggeredThresholds.add(deduplicationKey);

            // Construct friendly, non-shaming message
            const title = `Hey ${userName}! ❤️`;
            const message = `${Math.round(stat.totalMinutes)} minutes on ${app.displayName} already! No worries, how about taking a small 20-minute break to work on today's goals?`;

            // Trigger voice if delivery mode or threshold requires voice
            if (
              th.voiceEnabled ||
              th.reminderMode === 'VOICE_AND_TEXT' ||
              th.reminderMode === 'VOICE_ONLY'
            ) {
              TextToSpeechBridge.speak(message, lang);
            }

            return {
              packageName: app.packageName,
              appName: app.displayName,
              thresholdMinutes: th.thresholdMinutes,
              actualMinutes: Math.round(stat.totalMinutes),
              deliveryMode: th.reminderMode,
              title,
              message,
              timestamp: now.getTime(),
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Controlled 5-Second Sound Player
   * Enforces strict 5-second maximum playback duration.
   */
  public playFiveSecondReminderSound(audioPlayer?: { play: () => void; stop: () => void }) {
    if (this.activeSoundTimeout) {
      clearTimeout(this.activeSoundTimeout);
      this.activeSoundTimeout = null;
    }

    if (audioPlayer) {
      audioPlayer.play();
      this.activeSoundTimeout = setTimeout(() => {
        audioPlayer.stop();
        this.activeSoundTimeout = null;
      }, 5000); // 5000ms strict limit
    }
  }

  public getTriggeredKeysCount(): number {
    return this.triggeredThresholds.size;
  }

  public clearTriggeredKeys(): void {
    this.triggeredThresholds.clear();
  }
}

export const usageEngine = new UsageEngine();
