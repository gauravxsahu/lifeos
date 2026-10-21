import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UsageStatsBridge } from '../native/UsageStatsBridge';

export const PermissionOnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const handleGrant = async () => {
    await UsageStatsBridge.openSettings();
    onComplete();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>Your Privacy & Android Permissions</Text>
        <Text style={styles.subtitle}>
          How LIFEOS respects your digital autonomy and personal boundaries.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>1. Usage Access (PACKAGE_USAGE_STATS)</Text>
          <Text style={styles.cardBody}>
            • Required so LIFEOS can calculate accumulated time in foreground for selected social applications (e.g. 30 minutes on Instagram).{'\n'}
            • Strictly evaluated on your device.{'\n'}
            • LIFEOS does NOT see your messages, posts, search queries, or private photos.{'\n'}
            • LIFEOS does NOT use Accessibility services to spy on scrolling gestures.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>2. Notifications (POST_NOTIFICATIONS)</Text>
          <Text style={styles.cardBody}>
            • Delivers kind, encouraging reminders when your chosen threshold is reached.{'\n'}
            • Respects your Quiet Hours (default 10:00 PM to 7:00 AM).{'\n'}
            • Zero shame, zero guilt, and no repeated spam if you dismiss a reminder.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>3. Data Ownership</Text>
          <Text style={styles.cardBody}>
            • You can disable app monitoring anytime.{'\n'}
            • You can delete your usage statistics from the Settings menu with one tap.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleGrant}>
          <Text style={styles.primaryBtnText}>Open Android Settings to Authorize</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
          <Text style={styles.skipBtnText}>I'll configure permissions later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  card: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});
