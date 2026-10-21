import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { TextToSpeechBridge } from '../native/TextToSpeechBridge';

export const SettingsScreen: React.FC<{
  onOpenDiagnostics: () => void;
  onOpenPermissions: () => void;
}> = ({ onOpenDiagnostics, onOpenPermissions }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rate, setRate] = useState(1.0);

  const testVoice = () => {
    TextToSpeechBridge.speak('Hey buddy! This is your LIFEOS Voice Companion. You are doing great today!', 'en', rate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mobile Settings</Text>
      <Text style={styles.subtitle}>Configure voice assistant, notifications, and privacy.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Voice Companion</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Voice Reminders</Text>
          <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Controlled 5-Sec Chime</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        <TouchableOpacity style={styles.testBtn} onPress={testVoice}>
          <Text style={styles.testBtnText}>🔊 Test On-Device Voice Speech</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permissions & Diagnostics</Text>
        <TouchableOpacity style={styles.navRow} onPress={onOpenPermissions}>
          <Text style={styles.navRowText}>Android Permissions Guide</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navRow} onPress={onOpenDiagnostics}>
          <Text style={styles.navRowText}>System Diagnostics & Stats</Text>
          <Text style={styles.arrow}>→</Text>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  testBtn: {
    marginTop: 14,
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navRowText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: '#38bdf8',
  },
});
