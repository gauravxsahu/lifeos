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

            // Construct friendly, non-shaming message based on selected language
            let title = `Hey ${userName}! ❤️`;
            let message = `${Math.round(stat.totalMinutes)} minutes on ${app.displayName} already! No worries, how about taking a small 20-minute break to work on today's goals?`;

            const langCode = (lang || 'en').toLowerCase();
            if (langCode === 'hi') {
              title = `नमस्ते ${userName}! ❤️`;
              message = `${app.displayName} पर ${Math.round(stat.totalMinutes)} मिनट हो चुके हैं! कोई बात नहीं, क्या हम 20 मिनट का एक छोटा ब्रेक लेकर आज के गोल्स पर काम करें?`;
            } else if (langCode === 'hinglish') {
              title = `Hey ${userName}! ❤️`;
              message = `${app.displayName} par already ${Math.round(stat.totalMinutes)} minutes ho chuke hain! Tension mat lo, kya hum 20 minute ka break lekar aaj ke goals complete karein?`;
            } else if (langCode === 'mr') {
              title = `नमस्कार ${userName}! ❤️`;
              message = `${app.displayName} वर ${Math.round(stat.totalMinutes)} मिनिटे झाली आहेत. काळजी करू नका, आजच्या उद्दिष्टांवर काम करण्यासाठी २० मिनिटांचा ब्रेक घेऊया का?`;
            } else if (langCode === 'bn') {
              title = `নমস্কার ${userName}! ❤️`;
              message = `${app.displayName}-এ ইতিমধ্যে ${Math.round(stat.totalMinutes)} মিনিট হয়ে গেছে। চিন্তা করবেন না, আজকের লক্ষ্যগুলিতে কাজ করার জন্য ২০ মিনিটের বিরতি নেওয়া যাক?`;
            } else if (langCode === 'ta') {
              title = `வணக்கம் ${userName}! ❤️`;
              message = `${app.displayName}-ல் ஏற்கனவே ${Math.round(stat.totalMinutes)} நிமிடங்கள் ஆகிவிட்டன. கவலைப்பட வேண்டாம், இன்றைய இலக்குகளை அடைய 20 நிமிட இடைவேளை எடுப்போமா?`;
            } else if (langCode === 'te') {
              title = `నమస్కారం ${userName}! ❤️`;
              message = `${app.displayName} లో ఇప్పటికే ${Math.round(stat.totalMinutes)} నిమిషాలు పూర్తయ్యాయి. పర్వాలేదు, నేటి లక్ష్యాలపై దృష్టి పెట్టడానికి 20 నిమిషాల విరామం తీసుకుందామా?`;
            } else if (langCode === 'gu') {
              title = `નમસ્તે ${userName}! ❤️`;
              message = `${app.displayName} પર ${Math.round(stat.totalMinutes)} મિનિટ થઈ ગઈ છે! ચિંતા કરશો નહીં, આજના લક્ષ્યો પર કામ કરવા 20 મિનિટનો બ્રેક લઈએ?`;
            }

            // Trigger voice if delivery mode or threshold requires voice
            if (
              th.voiceEnabled ||
              th.reminderMode === 'VOICE_AND_TEXT' ||
              th.reminderMode === 'VOICE_ONLY'
            ) {
              TextToSpeechBridge.speak(message, langCode);
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
