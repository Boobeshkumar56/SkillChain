import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  theme: 'dark' | 'light';
}

const Toast: React.FC<ToastProps> = ({ visible, message, type, theme }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { 
          toValue: 0, 
          duration: 300, 
          useNativeDriver: true 
        })
      ]).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const styles = getStyles(theme);

  return (
    <Animated.View style={[
      styles.container, 
      { 
        opacity: fadeAnim,
        borderLeftColor: type === 'success' ? 
          (theme === 'dark' ? '#10B981' : '#059669') : 
          type === 'error' ? '#EF4444' :
          (theme === 'dark' ? '#3B82F6' : '#2563EB')
      }
    ]}>
      {type === 'success' ? 
        <CheckCircle size={16} color={theme === 'dark' ? '#10B981' : '#059669'} /> : 
        type === 'error' ?
        <AlertCircle size={16} color="#EF4444" /> :
        <Info size={16} color={theme === 'dark' ? '#3B82F6' : '#2563EB'} />
      }
      <Text style={styles.message}>
        {message}
      </Text>
    </Animated.View>
  );
};

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
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
  message: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    color: theme === 'dark' ? '#F9FAFB' : '#111827',
  },
});

export default Toast;
