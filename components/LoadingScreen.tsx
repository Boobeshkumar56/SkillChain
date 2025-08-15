import { LinearGradient } from 'expo-linear-gradient';
import { Bot, Cpu, Zap } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  theme?: 'light' | 'dark';
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  theme = 'light' 
}: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => {
      rotateAnimation.stop();
      bounceAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient
      colors={theme === 'dark' 
        ? ['#0F0F23', '#1F1F3A', '#2D1B69'] 
        : ['#fdf2f8', '#ffffff', '#fef2f2']
      }
      style={styles.container}
    >
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        {/* Rotating robot icon */}
        <Animated.View style={[
          styles.iconContainer,
          {
            transform: [
              { rotate: spin },
              { translateY: bounce }
            ],
          }
        ]}>
          <LinearGradient
            colors={['#EF4444', '#dc2626', '#b91c1c']}
            style={styles.iconGradient}
          >
            <Bot size={40} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        {/* Floating icons */}
        <View style={styles.floatingIcons}>
          <Animated.View style={[
            styles.floatingIcon,
            styles.floatingIcon1,
            { transform: [{ translateY: bounce }] }
          ]}>
            <Cpu size={16} color={theme === 'dark' ? '#8B5CF6' : '#EF4444'} />
          </Animated.View>
          
          <Animated.View style={[
            styles.floatingIcon,
            styles.floatingIcon2,
            { 
              transform: [
                { translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }) }
              ] 
            }
          ]}>
            <Zap size={14} color={theme === 'dark' ? '#F59E0B' : '#F59E0B'} />
          </Animated.View>
        </View>

        {/* Brand and message */}
        <View style={styles.textContainer}>
          <Text style={[
            styles.brand,
            { color: theme === 'dark' ? '#F9FAFB' : '#EF4444' }
          ]}>
            SkillChain
          </Text>
          
          <Animated.Text style={[
            styles.message,
            { 
              color: theme === 'dark' ? '#D1D5DB' : '#6B7280',
              opacity: fadeAnim 
            }
          ]}>
            {message}
          </Animated.Text>

          {/* Loading dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: theme === 'dark' ? '#8B5CF6' : '#EF4444',
                    opacity: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [{
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingIcons: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  floatingIcon: {
    position: 'absolute',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingIcon1: {
    top: 20,
    right: 40,
  },
  floatingIcon2: {
    bottom: 20,
    left: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
