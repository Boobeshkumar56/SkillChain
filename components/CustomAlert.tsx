import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  theme?: 'light' | 'dark';
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  theme = 'light'
}: CustomAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color="#10B981" />;
      case 'error':
        return <AlertCircle size={24} color="#EF4444" />;
      default:
        return <Info size={24} color="#3B82F6" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertContainer,
          { backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }
        ]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={[
              styles.title,
              { color: theme === 'dark' ? '#F9FAFB' : '#111827' }
            ]}>
              {title}
            </Text>
            <Text style={[
              styles.message,
              { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }
            ]}>
              {message}
            </Text>
          </View>
          
          <View style={styles.buttons}>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={[
                  styles.buttonText,
                  { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }
                ]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.button}
              onPress={onConfirm || onClose}
            >
              <LinearGradient
                colors={[getIconColor(), getIconColor()]}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
