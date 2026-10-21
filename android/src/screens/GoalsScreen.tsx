import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const GoalsScreen: React.FC = () => {
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Solve two DSA questions',
      category: 'Career',
      target: '2 questions',
      priority: 'HIGH',
      completed: false,
    },
    {
      id: '2',
      title: 'Code LIFEOS Android Bridge',
      category: 'Career',
      target: '60 minutes',
      priority: 'HIGH',
      completed: true,
    },
    {
      id: '3',
      title: 'Practice Spoken English',
      category: 'Personal Development',
      target: '20 minutes',
      priority: 'MEDIUM',
      completed: false,
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Goals</Text>
      <Text style={styles.subtitle}>Define realistic daily milestones.</Text>

      <View style={styles.list}>
        {goals.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.goalCard, g.completed && styles.goalCardCompleted]}
            onPress={() => toggleGoal(g.id)}
          >
            <View style={styles.left}>
              <View style={[styles.checkbox, g.completed && styles.checkboxDone]}>
                {g.completed && <Text style={styles.checkText}>✓</Text>}
              </View>
              <View>
                <Text style={[styles.goalTitle, g.completed && styles.goalTitleDone]}>
                  {g.title}
                </Text>
                <Text style={styles.goalMeta}>
                  {g.category} • {g.target}
                </Text>
              </View>
            </View>
            <Text style={styles.priority}>{g.priority}</Text>
          </TouchableOpacity>
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
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCardCompleted: {
    opacity: 0.6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  goalTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  goalMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  priority: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f43f5e',
  },
});
