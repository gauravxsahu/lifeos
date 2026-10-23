import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { StoriesScreen } from './screens/StoriesScreen';
import { FocusScreen } from './screens/FocusScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DiagnosticScreen } from './screens/DiagnosticScreen';
import { PermissionOnboardingScreen } from './screens/PermissionOnboardingScreen';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'Home' | 'Goals' | 'Stories' | 'Focus' | 'Settings'>('Home');
  const [activeModal, setActiveModal] = useState<'none' | 'diagnostics' | 'permissions'>('none');

  const renderContent = () => {
    if (activeModal === 'diagnostics') {
      return <DiagnosticScreen onBack={() => setActiveModal('none')} />;
    }
    if (activeModal === 'permissions') {
      return <PermissionOnboardingScreen onComplete={() => setActiveModal('none')} />;
    }

    switch (currentTab) {
      case 'Home':
        return (
          <HomeScreen
            onNavigateTab={(tab) => setCurrentTab(tab as any)}
            onOpenDiagnostics={() => setActiveModal('diagnostics')}
          />
        );
      case 'Goals':
        return <GoalsScreen />;
      case 'Stories':
        return <StoriesScreen />;
      case 'Focus':
        return <FocusScreen />;
      case 'Settings':
        return (
          <SettingsScreen
            onOpenDiagnostics={() => setActiveModal('diagnostics')}
            onOpenPermissions={() => setActiveModal('permissions')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.main}>{renderContent()}</View>

      {/* Bottom Tab Bar */}
      {activeModal === 'none' && (
        <View style={styles.tabBar}>
          {[
            { id: 'Home', label: 'Home', icon: '🏠' },
            { id: 'Goals', label: 'Goals', icon: '🎯' },
            { id: 'Stories', label: 'Stories', icon: '📖' },
            { id: 'Focus', label: 'Focus', icon: '⏱️' },
            { id: 'Settings', label: 'Settings', icon: '⚙️' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setCurrentTab(tab.id as any)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  main: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#34d399',
    fontWeight: '800',
  },
});

