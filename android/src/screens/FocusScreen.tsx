import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const FocusScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>
      <Text style={styles.subtitle}>Protect your attention from residue.</Text>

      <View style={styles.timerCard}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>{isRunning ? 'FOCUSING' : 'READY'}</Text>

        <View style={styles.btnRow}>
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => setIsRunning(true)}
            >
              <Text style={styles.startBtnText}>Start 25m Focus</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.pauseBtn}
              onPress={() => setIsRunning(false)}
            >
              <Text style={styles.pauseBtnText}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setIsRunning(false);
              setTimeLeft(25 * 60);
            }}
          >
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    marginBottom: 24,
  },
  timerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#34d399',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 32,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  startBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pauseBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  pauseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  resetBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
