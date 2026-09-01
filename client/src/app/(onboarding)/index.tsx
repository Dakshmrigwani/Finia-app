import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingVideoSplash() {
  const router = useRouter();
  const videoRef = useRef<any>(null);

  // Staggered fade-in animations
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(16);
  const taglineOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(20);

  useEffect(() => {
    // Wordmark fades in first
    wordmarkOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    wordmarkY.value = withDelay(
      600,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
    // Tagline follows
    taglineOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    // Buttons last
    buttonsOpacity.value = withDelay(
      1400,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    buttonsY.value = withDelay(
      1400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Portrait video — full bleed background */}
      <Video
        ref={videoRef}
        source={require('../../components/video/onboarding.mp4')}
        style={StyleSheet.absoluteFillObject}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted
        shouldPlay
      />

      {/* Dark gradient scrim — heavier at top and bottom */}
      <LinearGradient
        colors={[
          'rgba(10,8,24,0.55)',
          'rgba(10,8,24,0.10)',
          'rgba(10,8,24,0.10)',
          'rgba(10,8,24,0.82)',
        ]}
        locations={[0, 0.22, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Brand — top section */}
      <View style={styles.topSection}>
        <Animated.View style={wordmarkStyle}>
          <Text style={styles.brand}>Finia</Text>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>Your money, finally making sense.</Text>
        </Animated.View>
      </View>

      {/* CTA — bottom section */}
      <Animated.View style={[styles.bottomSection, buttonsStyle]}>
        {/* Sign Up — primary */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
        >
          <LinearGradient
            colors={['#6c47ff', '#5323e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryLabel}>Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Log In — ghost */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.ghostButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.ghostLabel}>I already have an account</Text>
        </TouchableOpacity>

        {/* Legal micro-copy */}
        <Text style={styles.legal}>
          By continuing you accept our{' '}
          <Text style={styles.legalLink}>Terms</Text> &{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0818',
    width,
    height,
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  brand: {
    fontFamily: 'Manrope',
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
    lineHeight: 56,
  },
  tagline: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 8,
    letterSpacing: -0.2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5323e6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryGradient: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  ghostButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ghostLabel: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: -0.2,
  },
  legal: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
    letterSpacing: 0.1,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
});