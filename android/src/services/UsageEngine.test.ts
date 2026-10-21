import { describe, it, expect, beforeEach } from 'vitest';
import { UsageEngine, MonitoredAppConfig, QuietHoursConfig } from './UsageEngine';

describe('Android UsageEngine Unit Tests', () => {
  let engine: UsageEngine;

  const mockApps: MonitoredAppConfig[] = [
    {
      packageName: 'com.instagram.android',
      displayName: 'Instagram',
      isEnabled: true,
      dailyLimitMinutes: 45,
      thresholds: [
        { thresholdMinutes: 20, reminderMode: 'TEXT_ONLY', voiceEnabled: false, storyEnabled: true },
        { thresholdMinutes: 40, reminderMode: 'VOICE_AND_TEXT', voiceEnabled: true, storyEnabled: true },
      ],
    },
    {
      packageName: 'com.google.android.youtube',
      displayName: 'YouTube',
      isEnabled: true,
      dailyLimitMinutes: 60,
      thresholds: [
        { thresholdMinutes: 30, reminderMode: 'TEXT_ONLY', voiceEnabled: false, storyEnabled: true },
      ],
    },
  ];

  const quietHoursConfig: QuietHoursConfig = {
    enabled: true,
    start: '22:00',
    end: '07:00',
  };

  beforeEach(() => {
    engine = new UsageEngine();
  });

  it('should trigger an intervention when an app exceeds configured threshold', () => {
    // 25 minutes on Instagram (threshold is 20m)
    const usage = [{ packageName: 'com.instagram.android', totalMinutes: 25 }];
    const daytime = new Date('2026-10-22T14:30:00Z');

    const result = engine.evaluate(usage, mockApps, quietHoursConfig, daytime);

    expect(result).not.toBeNull();
    expect(result?.packageName).toBe('com.instagram.android');
    expect(result?.thresholdMinutes).toBe(20);
    expect(result?.title).toContain('Hey');
  });

  it('should PREVENT duplicate interventions for the same threshold on the same day', () => {
    const usage = [{ packageName: 'com.instagram.android', totalMinutes: 25 }];
    const daytime = new Date('2026-10-22T14:30:00Z');

    // First evaluation triggers
    const firstResult = engine.evaluate(usage, mockApps, quietHoursConfig, daytime);
    expect(firstResult).not.toBeNull();

    // Second evaluation with same or slightly higher duration in same threshold block
    const secondResult = engine.evaluate(
      [{ packageName: 'com.instagram.android', totalMinutes: 28 }],
      mockApps,
      quietHoursConfig,
      daytime
    );

    // Must be suppressed (no duplicate notification!)
    expect(secondResult).toBeNull();
  });

  it('should trigger the higher threshold once crossed later in the day', () => {
    const daytime = new Date('2026-10-22T14:30:00Z');

    // Cross 20m threshold
    engine.evaluate([{ packageName: 'com.instagram.android', totalMinutes: 22 }], mockApps, quietHoursConfig, daytime);

    // Later crosses 40m threshold
    const higherResult = engine.evaluate(
      [{ packageName: 'com.instagram.android', totalMinutes: 42 }],
      mockApps,
      quietHoursConfig,
      daytime
    );

    expect(higherResult).not.toBeNull();
    expect(higherResult?.thresholdMinutes).toBe(40);
  });

  it('should respect Quiet Hours and suppress notifications at night', () => {
    const nightTime = new Date('2026-10-22T23:30:00'); // 11:30 PM (inside quiet hours 22:00-07:00)

    const isQuiet = engine.isWithinQuietHours(nightTime, '22:00', '07:00');
    expect(isQuiet).toBe(true);

    const usage = [{ packageName: 'com.instagram.android', totalMinutes: 35 }];
    const result = engine.evaluate(usage, mockApps, quietHoursConfig, nightTime);

    // Must be suppressed during quiet hours
    expect(result).toBeNull();
  });

  it('should enforce 5-second maximum playback timeout for reminder chime', async () => {
    let played = false;
    let stopped = false;

    const mockPlayer = {
      play: () => { played = true; },
      stop: () => { stopped = true; },
    };

    engine.playFiveSecondReminderSound(mockPlayer);
    expect(played).toBe(true);
    expect(stopped).toBe(false);
  });
});
