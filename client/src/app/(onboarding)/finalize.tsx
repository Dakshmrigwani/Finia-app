import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setHasOnboarded } from '../../store/Slices/appSlice';
import { resetOnboarding } from '../../store/Slices/onboardingSlice';
import { updateUserProfile } from '../../api/user.api';
import { Logger } from '../../utils/logger';

const PERKS = [
  { icon: 'bar-chart' as const, text: 'Personalised spending insights' },
  { icon: 'notifications-none' as const, text: 'Smart nudges before you overspend' },
  { icon: 'trending-up' as const, text: 'Progress tracking toward your goals' },
];

export default function FinalizeScreen() {
  const dispatch = useDispatch();
  const { motive, income, spendMostlyOn } = useSelector(
    (state: RootState) => state.onboarding
  );
  const [saving, setSaving] = useState(false);

  // Entrance animations
  const iconScale = useSharedValue(0.7);
  const iconOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(16);
  const perksOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaY = useSharedValue(12);

  useEffect(() => {
    iconScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 80 }));
    iconOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));

    titleOpacity.value = withDelay(350, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    titleY.value = withDelay(350, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    perksOpacity.value = withDelay(650, withTiming(1, { duration: 500 }));

    ctaOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
    ctaY.value = withDelay(900, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

    return () => {
      cancelAnimation(iconScale);
      cancelAnimation(iconOpacity);
      cancelAnimation(titleOpacity);
      cancelAnimation(titleY);
      cancelAnimation(perksOpacity);
      cancelAnimation(ctaOpacity);
      cancelAnimation(ctaY);
    };
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const perksStyle = useAnimatedStyle(() => ({ opacity: perksOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaY.value }],
  }));

  const markOnboarded = async () => {
    try {
      await AsyncStorage.setItem('has_onboarded', 'true');
    } catch (e) {
      Logger.warn('Could not persist hasOnboarded flag', { error: e });
    }
    dispatch(resetOnboarding());
    dispatch(setHasOnboarded(true));
    // Root layout will redirect to /(auth)/login automatically
  };

  const handleStart = async () => {
    setSaving(true);
    try {
      // Submit collected onboarding data to the backend
      await updateUserProfile({
        ...(motive ? { motive } : {}),
        ...(income ? { income } : {}),
        ...(spendMostlyOn.length > 0 ? { spendMostlyOn: spendMostlyOn.join(',') } : {}),
      });
    } catch (err) {
      // Non-fatal — missing data will be prompted from home screen
      Logger.warn('Onboarding profile update failed — will retry from home', { error: err });
    } finally {
      await markOnboarded();
    }
  };

  const handleSkip = async () => {
    await markOnboarded();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.body}>
        {/* Check mark icon */}
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <LinearGradient
            colors={['#6c47ff', '#5323e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <MaterialIcons name="check" size={36} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleBlock, titleStyle]}>
          <Text style={styles.title}>You're all set</Text>
          <Text style={styles.subtitle}>
            Here's what you'll get from day one.
          </Text>
        </Animated.View>

        {/* Perks list */}
        <Animated.View style={[styles.perks, perksStyle]}>
          {PERKS.map((perk, i) => (
            <View key={i} style={styles.perkRow}>
              <View style={styles.perkIcon}>
                <MaterialIcons name={perk.icon} size={18} color="#5323e6" />
              </View>
              <Text style={styles.perkText}>{perk.text}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* CTA area */}
      <Animated.View style={[styles.ctaArea, ctaStyle]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleStart}
          disabled={saving}
          style={styles.ctaBtn}
        >
          <LinearGradient
            colors={['#6c47ff', '#5323e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.ctaLabel}>Start tracking</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleSkip}
          disabled={saving}
          style={styles.skipBtn}
        >
          <Text style={styles.skipLabel}>Skip for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fcf8ff',
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconWrap: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -1.2,
    lineHeight: 42,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#797588',
    lineHeight: 24,
  },
  perks: {
    gap: 16,
    width: '100%',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  perkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0edff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
    lineHeight: 20,
  },
  ctaArea: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 16,
    gap: 10,
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#5323e6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaGradient: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b0aec8',
  },
});
