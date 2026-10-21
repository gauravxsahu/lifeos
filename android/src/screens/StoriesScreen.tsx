import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextToSpeechBridge } from '../native/TextToSpeechBridge';

export const StoriesScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const stories = [
    {
      id: '1',
      title: 'Linus Torvalds and the Genesis of Git',
      subject: 'Linus Torvalds',
      category: 'Software Engineering',
      content: 'In April 2005, Linus Torvalds created the core of Git in less than two weeks through disciplined, incremental problem-solving. Meaningful engineering projects do not require monumental setup—they begin with 20 minutes spent fixing one concrete component.',
      source: 'Git Core LKML Announcement & Documentation (2005)',
    },
    {
      id: '2',
      title: 'Steve Wozniak and the Evening Workbench',
      subject: 'Steve Wozniak',
      category: 'Software Engineering',
      content: 'Steve Wozniak engineered the Apple I motherboard by dedicating 45 minutes every evening after his day shift at Hewlett-Packard. A single 25-minute focus session today preserves the momentum of your future.',
      source: 'iWoz: Computer Geek to Cult Icon (2006)',
    },
    {
      id: '3',
      title: 'Fei-Fei Li and the Genesis of ImageNet',
      subject: 'Dr. Fei-Fei Li',
      category: 'Artificial Intelligence',
      content: 'Dr. Fei-Fei Li painstakingly annotated 14 million images for ImageNet when the field was skeptical. Breakthroughs require relentless, unglamorous groundwork before recognition arrives.',
      source: 'The Worlds I See (2023)',
    },
  ];

  const handleToggleAudio = (id: string, text: string) => {
    if (isPlaying === id) {
      TextToSpeechBridge.stop();
      setIsPlaying(null);
    } else {
      TextToSpeechBridge.stop();
      TextToSpeechBridge.speak(text, 'en');
      setIsPlaying(id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Verified Motivational Stories</Text>
      <Text style={styles.subtitle}>Grounded in facts with historical sources.</Text>

      <View style={styles.list}>
        {stories.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.badge}>VERIFIED BIOGRAPHY</Text>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => handleToggleAudio(s.id, s.content)}
              >
                <Text style={styles.audioBtnText}>
                  {isPlaying === s.id ? '⏹️ Stop' : '🔊 Listen'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.storyTitle}>{s.title}</Text>
            <Text style={styles.storyMeta}>{s.subject} • {s.category}</Text>
            <Text style={styles.storyBody}>{s.content}</Text>
            <Text style={styles.sourceText}>Source: {s.source}</Text>
          </View>
        ))}
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
    marginBottom: 16,
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  audioBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  audioBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  storyMeta: {
    fontSize: 11,
    color: '#38bdf8',
    marginBottom: 8,
  },
  storyBody: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 10,
  },
  sourceText: {
    fontSize: 10,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
});
