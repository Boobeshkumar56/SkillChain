import { Home, MessageSquare, Search, User, Video } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabBarProps {
  currentScreen: 'dashboard' | 'feed' | 'connect' | 'profile' | 'videos';
  onScreenChange: (screen: 'dashboard' | 'feed' | 'connect' | 'profile' | 'videos') => void;
  theme: 'dark' | 'light';
}

const TabBar: React.FC<TabBarProps> = ({ currentScreen, onScreenChange, theme }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'feed', label: 'Feed', icon: MessageSquare },
    { id: 'connect', label: 'Connect', icon: Search },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = currentScreen === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onScreenChange(tab.id)}
          >
            <IconComponent 
              size={24} 
              color={isActive ? 
                (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
                (theme === 'dark' ? '#9CA3AF' : '#6B7280')
              } 
            />
            <Text style={[
              styles.label, 
              isActive && styles.activeLabel,
              { color: isActive ? 
                (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
                (theme === 'dark' ? '#9CA3AF' : '#6B7280')
              }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: theme === 'dark' ? '#312E81' : '#FEE2E2',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '600',
  },
});

export default TabBar;
