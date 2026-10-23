import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { UsageStatsBridge, AppUsageStat } from '../native/UsageStatsBridge';
import { TextToSpeechBridge } from '../native/TextToSpeechBridge';
import { usageEngine, InterventionEvent } from '../services/UsageEngine';

interface MonitoredAppItem {
  packageName: string;
  displayName: string;
  icon: string;
  thresholdMinutes: number;
  voiceEnabled: boolean;
  popupEnabled: boolean;
  isEnabled: boolean;
}

export const HomeScreen: React.FC<{
  onNavigateTab: (tab: string) => void;
  onOpenDiagnostics: () => void;
}> = ({ onNavigateTab, onOpenDiagnostics }) => {
  const [hasUsagePerm, setHasUsagePerm] = useState(false);
  const [hasOverlayPerm, setHasOverlayPerm] = useState(false);
  const [stats, setStats] = useState<AppUsageStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [latestIntervention, setLatestIntervention] = useState<InterventionEvent | null>(null);

  // User-configurable monitored apps with custom limits (e.g. 15 mins for Instagram reels)
  const [monitoredApps, setMonitoredApps] = useState<MonitoredAppItem[]>([
    {
      packageName: 'com.instagram.android',
      displayName: 'Instagram (Reels)',
      icon: '📸',
      thresholdMinutes: 15, // 15 mins custom limit as requested
      voiceEnabled: true,
      popupEnabled: true,
      isEnabled: true,
    },
    {
      packageName: 'com.google.android.youtube',
      displayName: 'YouTube (Shorts)',
      icon: '▶️',
      thresholdMinutes: 20,
      voiceEnabled: true,
      popupEnabled: true,
      isEnabled: true,
    },
    {
      packageName: 'com.twitter.android',
      displayName: 'X / Twitter',
      icon: '🐦',
      thresholdMinutes: 15,
      voiceEnabled: true,
      popupEnabled: true,
      isEnabled: true,
    },
  ]);

  const checkPermissions = async () => {
    const uPerm = await UsageStatsBridge.hasPermission();
    setHasUsagePerm(uPerm);
    const oPerm = await UsageStatsBridge.hasOverlayPermission();
    setHasOverlayPerm(oPerm);
  };

  const loadUsage = async () => {
    setRefreshing(true);
    await checkPermissions();

    const packages = monitoredApps.map((a) => a.packageName);
    const usage = await UsageStatsBridge.queryDailyUsage(packages);
    setStats(usage);

    // Format for engine evaluation
    const engineConfig = monitoredApps.map((app) => ({
      packageName: app.packageName,
      displayName: app.displayName,
      isEnabled: app.isEnabled,
      dailyLimitMinutes: app.thresholdMinutes * 2,
      thresholds: [
        {
          thresholdMinutes: app.thresholdMinutes,
          reminderMode: (app.voiceEnabled ? 'VOICE_AND_TEXT' : 'TEXT_ONLY') as any,
          voiceEnabled: app.voiceEnabled,
          storyEnabled: true,
        },
      ],
    }));

    const intervention = usageEngine.evaluate(
      usage,
      engineConfig,
      { enabled: true, start: '22:00', end: '07:00' },
      new Date(),
      'dost',
      'hinglish'
    );

    if (intervention) {
      setLatestIntervention(intervention);
      // Trigger floating overlay popup over Instagram or active app
      UsageStatsBridge.showOverlay(
        `🌱 ${intervention.appName} Limit`,
        intervention.message
      );
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const changeThreshold = (pkg: string, minutes: number) => {
    setMonitoredApps((prev) =>
      prev.map((app) => (app.packageName === pkg ? { ...app, thresholdMinutes: minutes } : app))
    );
  };

  const toggleVoice = (pkg: string) => {
    setMonitoredApps((prev) =>
      prev.map((app) => (app.packageName === pkg ? { ...app, voiceEnabled: !app.voiceEnabled } : app))
    );
  };

  // Immediate Test trigger for 15-minute Instagram Reel Intervention
  const testReelIntervention = async () => {
    const title = 'Instagram (15-Min Reel Reminder)';
    const msg =
      'Hey dost! Aap 15 minute se Instagram reels dekh rahe hain. Tension mat lo, chalo ek chhota break leke aaj ke goals complete karte hain?';

    // 1. Show floating popup card on top of screen
    await UsageStatsBridge.showOverlay(title, msg);

    // 2. Speak voice companion message in natural Hinglish/Hindi
    await TextToSpeechBridge.speak(msg, 'hinglish');

    // 3. Also update in-app card
    setLatestIntervention({
      packageName: 'com.instagram.android',
      appName: 'Instagram (Reels)',
      thresholdMinutes: 15,
      actualMinutes: 15,
      deliveryMode: 'VOICE_AND_TEXT',
      title,
      message: msg,
      timestamp: Date.now(),
    });
  };

  const totalMinutes = stats.reduce((acc, curr) => acc + curr.totalMinutes, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsage} />}
    >
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.appTitle}>LIFEOS</Text>
          <View style={styles.livePill}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveText}>COMPANION ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.tagline}>Gentle Interventions • Less Scrolling, More Living</Text>
      </View>

      {/* Permission Prompts */}
      {!hasUsagePerm && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Usage Access Permission Required</Text>
          <Text style={styles.warningDesc}>
            To detect when you spend 15 mins on Instagram/YouTube locally on-device, grant Usage Access.
          </Text>
          <TouchableOpacity
            style={styles.warningBtn}
            onPress={() => UsageStatsBridge.openSettings()}
          >
            <Text style={styles.warningBtnText}>Grant Usage Access →</Text>
          </TouchableOpacity>
        </View>
      )}

      {!hasOverlayPerm && (
        <View style={styles.overlayCard}>
          <Text style={styles.overlayTitle}>🪟 "Display Over Other Apps" Required for Popups</Text>
          <Text style={styles.overlayDesc}>
            To show the gentle floating popup card directly over Instagram when 15 mins pass, allow Overlay permission.
          </Text>
          <TouchableOpacity
            style={styles.overlayBtn}
            onPress={() => UsageStatsBridge.openOverlaySettings()}
          >
            <Text style={styles.overlayBtnText}>Enable Popup Over Other Apps →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Reel Alert Simulator */}
      <View style={styles.testCard}>
        <View style={styles.testHeader}>
          <Text style={styles.testTitle}>⚡ Test Reel Popup & Voice Alert</Text>
          <Text style={styles.testBadge}>INSTANT DEMO</Text>
        </View>
        <Text style={styles.testDesc}>
          Simulate being on Instagram for 15 minutes. It will pop up a floating card over your screen and speak in voice!
        </Text>
        <TouchableOpacity style={styles.testActionBtn} onPress={testReelIntervention}>
          <Text style={styles.testActionBtnText}>
            🚀 Trigger 15-Min Reel Popup & Voice Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Intervention Display */}
      {latestIntervention && (
        <View style={styles.interventionCard}>
          <Text style={styles.interventionBadge}>ACTIVE REMINDER</Text>
          <Text style={styles.interventionTitle}>{latestIntervention.title}</Text>
          <Text style={styles.interventionMsg}>{latestIntervention.message}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => onNavigateTab('Focus')}
            >
              <Text style={styles.actionBtnPrimaryText}>Start 25m Focus ⏱️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => setLatestIntervention(null)}
            >
              <Text style={styles.actionBtnSecondaryText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Time Limits Per App */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Custom App Time Limits</Text>
        <Text style={styles.cardSubtitle}>
          Choose exactly after how many minutes the popup and voice alert should trigger:
        </Text>

        {monitoredApps.map((app) => {
          const appStat = stats.find((s) => s.packageName === app.packageName);
          const currentMins = Math.round(appStat?.totalMinutes || 0);

          return (
            <View key={app.packageName} style={styles.appConfigBox}>
              <View style={styles.appConfigHeader}>
                <Text style={styles.appIcon}>{app.icon}</Text>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.appNameText}>{app.displayName}</Text>
                  <Text style={styles.appUsageText}>Today: {currentMins} mins used</Text>
                </View>
                <View style={styles.voiceToggleRow}>
                  <Text style={styles.voiceToggleLabel}>🔊 Voice</Text>
                  <Switch
                    value={app.voiceEnabled}
                    onValueChange={() => toggleVoice(app.packageName)}
                  />
                </View>
              </View>

              {/* Threshold buttons */}
              <View style={styles.thresholdBtnRow}>
                {[10, 15, 20, 30, 45].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.thresholdBtn,
                      app.thresholdMinutes === m && styles.thresholdBtnActive,
                    ]}
                    onPress={() => changeThreshold(app.packageName, m)}
                  >
                    <Text
                      style={[
                        styles.thresholdBtnText,
                        app.thresholdMinutes === m && styles.thresholdBtnTextActive,
                      ]}
                    >
                      {m} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.thresholdInfo}>
                Popup & voice will trigger after {app.thresholdMinutes} minutes of usage today.
              </Text>
            </View>
          );
        })}
      </View>

      {/* Quick Launch Actions */}
      <View style={styles.quickLaunchRow}>
        <TouchableOpacity
          style={styles.quickLaunchCard}
          onPress={() => onNavigateTab('Focus')}
        >
          <Text style={styles.quickLaunchIcon}>⏱️</Text>
          <Text style={styles.quickLaunchTitle}>Focus Session</Text>
          <Text style={styles.quickLaunchSub}>25-minute deep work</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLaunchCard}
          onPress={() => onNavigateTab('Stories')}
        >
          <Text style={styles.quickLaunchIcon}>📖</Text>
          <Text style={styles.quickLaunchTitle}>Stories</Text>
          <Text style={styles.quickLaunchSub}>Verified motivation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  liveDot: {
    color: '#34d399',
    fontSize: 10,
    marginRight: 4,
  },
  liveText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 12,
    color: '#94a3b8',
  },
  warningCard: {
    backgroundColor: '#451a03',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#b45309',
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fde68a',
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 11,
    color: '#fef3c7',
    marginBottom: 10,
    lineHeight: 16,
  },
  warningBtn: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  warningBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  overlayCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  overlayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c7d2fe',
    marginBottom: 4,
  },
  overlayDesc: {
    fontSize: 11,
    color: '#e0e7ff',
    marginBottom: 10,
    lineHeight: 16,
  },
  overlayBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  overlayBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  testCard: {
    backgroundColor: '#0f2744',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
  },
  testBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0284c7',
    backgroundColor: '#082f49',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  testDesc: {
    fontSize: 11,
    color: '#93c5fd',
    marginBottom: 12,
    lineHeight: 16,
  },
  testActionBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  testActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  interventionCard: {
    backgroundColor: '#064e3b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#059669',
  },
  interventionBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6ee7b7',
    marginBottom: 4,
  },
  interventionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  interventionMsg: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 17,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  actionBtnSecondaryText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14,
  },
  appConfigBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  appConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appIcon: {
    fontSize: 22,
  },
  appNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  appUsageText: {
    fontSize: 11,
    color: '#64748b',
  },
  voiceToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceToggleLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  thresholdBtnRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  thresholdBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  thresholdBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  thresholdBtnText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  thresholdBtnTextActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  thresholdInfo: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
  },
  quickLaunchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickLaunchCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickLaunchIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickLaunchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  quickLaunchSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
});
