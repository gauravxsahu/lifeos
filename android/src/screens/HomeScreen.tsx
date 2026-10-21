import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { UsageStatsBridge, AppUsageStat } from '../native/UsageStatsBridge';
import { usageEngine, InterventionEvent } from '../services/UsageEngine';

export const HomeScreen: React.FC<{
  onNavigateTab: (tab: string) => void;
  onOpenDiagnostics: () => void;
}> = ({ onNavigateTab, onOpenDiagnostics }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [stats, setStats] = useState<AppUsageStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [latestIntervention, setLatestIntervention] = useState<InterventionEvent | null>(null);

  const monitoredPackages = [
    'com.instagram.android',
    'com.google.android.youtube',
    'com.twitter.android',
  ];

  const monitoredConfig = [
    {
      packageName: 'com.instagram.android',
      displayName: 'Instagram',
      isEnabled: true,
      dailyLimitMinutes: 45,
      thresholds: [
        { thresholdMinutes: 20, reminderMode: 'TEXT_ONLY' as const, voiceEnabled: false, storyEnabled: true },
        { thresholdMinutes: 40, reminderMode: 'VOICE_AND_TEXT' as const, voiceEnabled: true, storyEnabled: true },
      ],
    },
    {
      packageName: 'com.google.android.youtube',
      displayName: 'YouTube',
      isEnabled: true,
      dailyLimitMinutes: 60,
      thresholds: [
        { thresholdMinutes: 30, reminderMode: 'TEXT_ONLY' as const, voiceEnabled: false, storyEnabled: true },
      ],
    },
  ];

  const loadUsage = async () => {
    setRefreshing(true);
    const perm = await UsageStatsBridge.hasPermission();
    setHasPermission(perm);

    if (perm) {
      const usage = await UsageStatsBridge.queryDailyUsage(monitoredPackages);
      setStats(usage);

      // Evaluate thresholds
      const intervention = usageEngine.evaluate(
        usage,
        monitoredConfig,
        { enabled: true, start: '22:00', end: '07:00' },
        new Date(),
        'Alex',
        'en'
      );

      if (intervention) {
        setLatestIntervention(intervention);
      }
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const totalMinutes = stats.reduce((acc, curr) => acc + curr.totalMinutes, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsage} />}
    >
      {/* Header Banner */}
      <View style={styles.headerCard}>
        <Text style={styles.appTitle}>LIFEOS</Text>
        <Text style={styles.tagline}>Less Scrolling. More Living.</Text>
        <Text style={styles.welcomeText}>Hey Alex! Your digital companion is active.</Text>
      </View>

      {/* Permission Warning if not authorized */}
      {!hasPermission && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Usage Access Permission Needed</Text>
          <Text style={styles.warningDesc}>
            To calculate your app usage locally without sending private screen data, LIFEOS needs Android Usage Access.
          </Text>
          <TouchableOpacity
            style={styles.permissionBtn}
            onPress={() => UsageStatsBridge.openSettings()}
          >
            <Text style={styles.permissionBtnText}>Grant Permission in Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Latest Intervention Banner */}
      {latestIntervention && (
        <View style={styles.interventionCard}>
          <Text style={styles.interventionBadge}>FRIENDLY INTERVENTION</Text>
          <Text style={styles.interventionTitle}>{latestIntervention.title}</Text>
          <Text style={styles.interventionMsg}>{latestIntervention.message}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => onNavigateTab('Focus')}
            >
              <Text style={styles.actionBtnPrimaryText}>Start 25m Focus</Text>
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

      {/* Usage Statistics Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's App Usage</Text>
          <Text style={styles.cardValue}>{Math.round(totalMinutes)} mins</Text>
        </View>

        <View style={styles.appUsageList}>
          {stats.map((s) => (
            <View key={s.packageName} style={styles.appRow}>
              <Text style={styles.appName}>
                {s.packageName.split('.').pop()?.toUpperCase()}
              </Text>
              <Text style={styles.appTime}>{Math.round(s.totalMinutes)}m</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.diagnosticBtn} onPress={onOpenDiagnostics}>
          <Text style={styles.diagnosticBtnText}>View Diagnostics & Details →</Text>
        </TouchableOpacity>
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
          onPress={() => onNavigateTab('Goals')}
        >
          <Text style={styles.quickLaunchIcon}>🎯</Text>
          <Text style={styles.quickLaunchTitle}>Daily Goals</Text>
          <Text style={styles.quickLaunchSub}>2 pending today</Text>
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: '#451a03',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#b45309',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fde68a',
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 12,
    color: '#fef3c7',
    marginBottom: 10,
    lineHeight: 18,
  },
  permissionBtn: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  interventionCard: {
    backgroundColor: '#064e3b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  interventionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6ee7b7',
    marginBottom: 4,
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  interventionMsg: {
    fontSize: 13,
    color: '#d1fae5',
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  actionBtnSecondaryText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34d399',
  },
  appUsageList: {
    gap: 8,
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  appName: {
    fontSize: 13,
    color: '#e2e8f0',
  },
  appTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  diagnosticBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  diagnosticBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
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
