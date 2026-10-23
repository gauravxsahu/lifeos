import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { TextToSpeechBridge } from '../native/TextToSpeechBridge';

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
  testPhrase: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: 'hi',
    label: 'हिन्दी (Hindi)',
    flag: '🇮🇳',
    testPhrase: 'नमस्ते दोस्त! यह आपका लाइफ-ओएस वॉइस साथी है। आज आपका दिन बहुत शानदार रहेगा!',
  },
  {
    code: 'hinglish',
    label: 'Hinglish',
    flag: '🇮🇳',
    testPhrase: 'Hey dost! Yeh aapka LIFEOS Voice Companion hai. Chalo aaj apne goals achieve karte hain!',
  },
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    testPhrase: 'Hey buddy! This is your LIFEOS Voice Companion. You are doing great today!',
  },
  {
    code: 'mr',
    label: 'मराठी (Marathi)',
    flag: '🇮🇳',
    testPhrase: 'नमस्कार मित्रा! हा तुमचा LIFEOS व्हॉइस साथी आहे. आजचा दिवस खूप छान जावो!',
  },
  {
    code: 'bn',
    label: 'বাংলা (Bengali)',
    flag: '🇮🇳',
    testPhrase: 'নমস্কার বন্ধু! এটি আপনার LIFEOS ভয়েস সঙ্গী। আজ আপনার লক্ষ্য পূরণের জন্য শুভকামনা!',
  },
  {
    code: 'ta',
    label: 'தமிழ் (Tamil)',
    flag: '🇮🇳',
    testPhrase: 'வணக்கம் நண்பா! இது உங்கள் LIFEOS குரல் துணை. இன்று உங்கள் இலக்குகளை அடைய வாழ்த்துக்கள்!',
  },
  {
    code: 'te',
    label: 'తెలుగు (Telugu)',
    flag: '🇮🇳',
    testPhrase: 'నమస్కారం మిత్రమా! ఇది మీ LIFEOS వాయిస్ సహాయకుడు. ఈరోజు మీ లక్ష్యాలను సాధించండి!',
  },
  {
    code: 'gu',
    label: 'ગુજરાતી (Gujarati)',
    flag: '🇮🇳',
    testPhrase: 'નમસ્તે મિત્ર! આ તમારો LIFEOS વોઈસ સાથી છે. આજે તમારા લક્ષ્યો પર ધ્યાન આપો!',
  },
  {
    code: 'pa',
    label: 'ਪੰਜਾਬੀ (Punjabi)',
    flag: '🇮🇳',
    testPhrase: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਦੋਸਤ! ਇਹ ਤੁਹਾਡਾ LIFEOS ਵੌਇਸ ਸਾਥੀ ਹੈ। ਅੱਜ ਆਪਣੇ ਟੀਚਿਆਂ ਨੂੰ ਪੂਰਾ ਕਰੋ!',
  },
];

const STYLES = [
  { id: 'FRIENDLY_FRIEND', label: '🤗 Friendly Friend' },
  { id: 'MOTIVATOR', label: '🚀 Motivator' },
  { id: 'CALM_COMPANION', label: '🧘 Calm Companion' },
  { id: 'PROFESSIONAL_MENTOR', label: '👔 Professional Mentor' },
];

export const SettingsScreen: React.FC<{
  onOpenDiagnostics: () => void;
  onOpenPermissions: () => void;
}> = ({ onOpenDiagnostics, onOpenPermissions }) => {
  const [selectedLang, setSelectedLang] = useState<string>('hi');
  const [selectedStyle, setSelectedStyle] = useState<string>('FRIENDLY_FRIEND');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rate, setRate] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeLang = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  const testVoice = async () => {
    setIsPlaying(true);
    await TextToSpeechBridge.speak(activeLang.testPhrase, activeLang.code, rate);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const stopVoice = async () => {
    await TextToSpeechBridge.stop();
    setIsPlaying(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Voice & Preferences</Text>
      <Text style={styles.subtitle}>Multi-language voice companion and gentle intervention settings.</Text>

      {/* Language Selection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🗣️ Voice Assistant Language</Text>
          <Text style={styles.activeBadge}>{activeLang.flag} {activeLang.label}</Text>
        </View>
        <Text style={styles.helpText}>Select your preferred voice companion language:</Text>

        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langChip, isSelected && styles.langChipActive]}
                onPress={() => setSelectedLang(lang.code)}
              >
                <Text style={styles.chipFlag}>{lang.flag}</Text>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Speed Controls */}
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>Speaking Rate: {rate.toFixed(1)}x</Text>
          <View style={styles.speedRow}>
            {[
              { label: '0.8x Slow', val: 0.8 },
              { label: '1.0x Normal', val: 1.0 },
              { label: '1.2x Faster', val: 1.2 },
            ].map((s) => (
              <TouchableOpacity
                key={s.val}
                style={[styles.speedBtn, rate === s.val && styles.speedBtnActive]}
                onPress={() => setRate(s.val)}
              >
                <Text style={[styles.speedBtnText, rate === s.val && styles.speedBtnTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Voice Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.testBtn, isPlaying && styles.testBtnPlaying]}
            onPress={testVoice}
          >
            <Text style={styles.testBtnText}>
              {isPlaying ? '🔊 Speaking now...' : `🔊 Test Voice (${activeLang.label})`}
            </Text>
          </TouchableOpacity>
          {isPlaying && (
            <TouchableOpacity style={styles.stopBtn} onPress={stopVoice}>
              <Text style={styles.stopBtnText}>⏹️ Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Communication Persona Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎭 Companion Communication Style</Text>
        <View style={styles.styleGrid}>
          {STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <TouchableOpacity
                key={style.id}
                style={[styles.styleChip, isSelected && styles.styleChipActive]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Text style={[styles.styleChipText, isSelected && styles.styleChipTextActive]}>
                  {style.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Reminder Controls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Gentle Reminders</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Spoken Voice Alerts</Text>
            <Text style={styles.sublabel}>Speaks friendly messages when limits are reached</Text>
          </View>
          <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Controlled 5-Sec Chime</Text>
            <Text style={styles.sublabel}>Play gentle bell sound (max 5 seconds)</Text>
          </View>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Permissions & Diagnostics</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34d399',
    marginBottom: 4,
  },
  activeBadge: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  langChipActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#38bdf8',
  },
  chipFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  chipTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  subSection: {
    marginVertical: 8,
  },
  subTitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 6,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  speedBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#34d399',
  },
  speedBtnText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  speedBtnTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  testBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testBtnPlaying: {
    backgroundColor: '#059669',
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  stopBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  styleChip: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  styleChipActive: {
    backgroundColor: '#312e81',
    borderColor: '#818cf8',
  },
  styleChipText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  styleChipTextActive: {
    color: '#c7d2fe',
    fontWeight: '800',
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
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
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
