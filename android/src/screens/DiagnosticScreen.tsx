import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { UsageStatsBridge, AppUsageStat } from '../native/UsageStatsBridge';
import { usageEngine } from '../services/UsageEngine';

export const DiagnosticScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [hasPerm, setHasPerm] = useState(false);
  const [stats, setStats] = useState<AppUsageStat[]>([]);
  const [lastCheck, setLastCheck] = useState<string>('');

  const refreshDiagnostics = async () => {
    const perm = await UsageStatsBridge.hasPermission();
    setHasPerm(perm);

    const data = await UsageStatsBridge.queryDailyUsage([
      'com.instagram.android',
      'com.google.android.youtube',
      'com.twitter.android',
      'com.facebook.katana',
      'com.snapchat.android',
    ]);
    setStats(data);
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshDiagnostics();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>System Diagnostics</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Android Subsystem Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>PACKAGE_USAGE_STATS Permission:</Text>
          <Text style={[styles.status, hasPerm ? styles.green : styles.red]}>
            {hasPerm ? 'GRANTED' : 'DENIED'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Deduplicated Interventions Today:</Text>
          <Text style={styles.value}>{usageEngine.getTriggeredKeysCount()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Last Diagnostic Refresh:</Text>
          <Text style={styles.value}>{lastCheck || 'Never'}</Text>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={refreshDiagnostics}>
          <Text style={styles.refreshBtnText}>Run Manual Diagnostics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Raw Foreground App Accumulation</Text>
        <Text style={styles.infoText}>
          Estimated via Android UsageStatsManager.queryAndAggregateUsageStats. LIFEOS does not observe private screen contents or scrolling gestures.
        </Text>

        <View style={styles.statList}>
          {stats.map((s) => (
            <View key={s.packageName} style={styles.statItem}>
              <Text style={styles.pkgName}>{s.packageName}</Text>
              <Text style={styles.pkgTime}>{s.totalMinutes.toFixed(1)} mins</Text>
            </View>
          ))}
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8fafc',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
  },
  green: {
    color: '#34d399',
  },
  red: {
    color: '#f87171',
  },
  refreshBtn: {
    marginTop: 12,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 12,
  },
  statList: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  pkgName: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#e2e8f0',
  },
  pkgTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
  },
});
