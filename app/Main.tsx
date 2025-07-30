import {
    AlertCircle,
    CheckCircle,
    Home,
    MessageSquare,
    Moon,
    Search,
    Sun,
    User
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import the separate components
import Connect from './connect';
import Dashboard from './Dashboard';
import { Feed } from './Feed';
import Profile from './Profile';

// Custom Toast Component for Cross-Platform Support
const CustomToast: React.FC<{
  visible: boolean;
  message: string;
  type?: 'success' | 'error';
  theme: 'dark' | 'light';
  onHide: () => void;
}> = ({ visible, message, type = 'success', onHide, theme }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => onHide());
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { 
      opacity: fadeAnim,
      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
      borderLeftColor: type === 'success' ? (theme === 'dark' ? '#10B981' : '#EF4444') : '#EF4444'
    }]}>
      {type === 'success' ? 
        <CheckCircle size={16} color={theme === 'dark' ? '#10B981' : '#EF4444'} /> : 
        <AlertCircle size={16} color="#EF4444" />
      }
      <Text style={[styles.toastText, { color: theme === 'dark' ? '#F9FAFB' : '#111827' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// Profile Placeholder Component
const ProfilePlaceholder: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const styles = getStyles(theme);
  
  return (
    <View style={styles.profilePlaceholder}>
      <User size={64} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
      <Text style={styles.placeholderTitle}>Profile Section</Text>
      <Text style={styles.placeholderText}>
        This would integrate with your existing Profile.tsx component
      </Text>
      <Text style={styles.placeholderSubtext}>
        Import and replace this placeholder with your ProfilePage component
      </Text>
    </View>
  );
};

// Main App Component
const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed' | 'connect' | 'profile'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (Platform.OS === 'android') {
      // Use ToastAndroid for Android if available
      // ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      setToast({ visible: true, message, type });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard theme={theme} showToast={showToast} />;
      case 'feed':
        return <Feed theme={theme} showToast={showToast} />;
      case 'connect':
        return <Connect theme={theme} showToast={showToast} />;
      case 'profile':
        return <Profile theme={theme} />;
      default:
        return <Dashboard theme={theme} showToast={showToast} />;
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.mainContainer}>
      {/* Theme Toggle */}
      <TouchableOpacity 
        style={styles.themeToggle}
        onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? 
          <Sun size={20} color="#F59E0B" /> : 
          <Moon size={20} color="#8B5CF6" />
        }
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.activeNavItem]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Home 
            size={24} 
            color={activeTab === 'dashboard' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            } 
          />
          <Text style={[
            styles.navLabel, 
            activeTab === 'dashboard' && styles.activeNavLabel,
            { color: activeTab === 'dashboard' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            }
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'feed' && styles.activeNavItem]}
          onPress={() => setActiveTab('feed')}
        >
          <MessageSquare 
            size={24} 
            color={activeTab === 'feed' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            } 
          />
          <Text style={[
            styles.navLabel, 
            activeTab === 'feed' && styles.activeNavLabel,
            { color: activeTab === 'feed' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            }
          ]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'connect' && styles.activeNavItem]}
          onPress={() => setActiveTab('connect')}
        >
          <Search 
            size={24} 
            color={activeTab === 'connect' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            } 
          />
          <Text style={[
            styles.navLabel, 
            activeTab === 'connect' && styles.activeNavLabel,
            { color: activeTab === 'connect' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            }
          ]}>
            Connect
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
          onPress={() => setActiveTab('profile')}
        >
          <User 
            size={24} 
            color={activeTab === 'profile' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            } 
          />
          <Text style={[
            styles.navLabel, 
            activeTab === 'profile' && styles.activeNavLabel,
            { color: activeTab === 'profile' ? 
              (theme === 'dark' ? '#8B5CF6' : '#EF4444') : 
              (theme === 'dark' ? '#9CA3AF' : '#6B7280')
            }
          ]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast */}
      <CustomToast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type}
        theme={theme}
        onHide={() => setToast({ ...toast, visible: false })} 
      />
    </View>
  );
};

// Dynamic Styles Function
const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: theme === 'dark' ? '#D1D5DB' : '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: theme === 'dark' ? '#312E81' : '#FEE2E2',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavLabel: {
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

// Individual styles for the main container
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

export default MainApp;