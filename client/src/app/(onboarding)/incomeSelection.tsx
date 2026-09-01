import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
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
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setIncome } from '../../store/Slices/onboardingSlice';

const QUICK_PICKS = [
  { label: '₹25k', value: '25000' },
  { label: '₹50k', value: '50000' },
  { label: '₹1L', value: '100000' },
  { label: '₹2L+', value: '200000' },
];

export default function IncomeSelectionScreen() {
  const [income, setIncomeVal] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(24);
  const underlineScale = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.96);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    slideUp.value = withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) });
    return () => { cancelAnimation(fadeIn); cancelAnimation(slideUp); };
  }, []);

  useEffect(() => {
    const active = isFocused || income.length > 0;
    underlineScale.value = withTiming(active ? 1 : 0.2, { duration: 280 });
  }, [isFocused, income]);

  useEffect(() => {
    const valid = income.length > 0 && parseFloat(income) > 0;
    ctaOpacity.value = withTiming(valid ? 1 : 0, { duration: 220 });
    ctaScale.value = withSpring(valid ? 1 : 0.96, { damping: 14, stiffness: 120 });
  }, [income]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: underlineScale.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value }],
  }));

  const handleContinue = () => {
    const val = parseFloat(income);
    if (!val || val <= 0) return;
    dispatch(setIncome(val));
    router.push('/spendSelection');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={styles.stepRow}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.stepLabel}>2 of 3</Text>
        </View>

        <Animated.View style={[styles.body, containerStyle]}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Monthly income</Text>
            <Text style={styles.subtitle}>A rough estimate works fine — this helps us personalise your plan.</Text>
          </View>

          {/* Big input */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.inputArea}
          >
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              ref={inputRef}
              value={income}
              onChangeText={setIncomeVal}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#d0cde8"
              style={styles.amountInput}
            />
          </TouchableOpacity>

          {/* Animated underline */}
          <View style={styles.underlineTrack}>
            <Animated.View style={[styles.underlineFill, underlineStyle]} />
          </View>

          {/* Quick-pick chips */}
          <View style={styles.chipRow}>
            {QUICK_PICKS.map((pick) => (
              <TouchableOpacity
                key={pick.value}
                onPress={() => setIncomeVal(pick.value)}
                style={[
                  styles.chip,
                  income === pick.value && styles.chipActive,
                ]}
              >
                <Text style={[
                  styles.chipLabel,
                  income === pick.value && styles.chipLabelActive,
                ]}>
                  {pick.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.privacy}>
            <MaterialIcons name="lock" size={11} color="#b0aec8" /> This is private and only used to personalise your insights.
          </Text>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinue}
            disabled={!income || parseFloat(income) <= 0}
            style={styles.ctaBtn}
          >
            <LinearGradient
              colors={['#6c47ff', '#5323e6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaLabel}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fcf8ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e0fc',
  },
  stepRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 28,
    height: 3,
    borderRadius: 99,
    backgroundColor: '#e2e0fc',
  },
  dotActive: {
    backgroundColor: '#5323e6',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#797588',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    width: 38,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  titleBlock: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -1,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#797588',
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: '#5323e6',
    opacity: 0.55,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 56,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -2,
    padding: 0,
  },
  underlineTrack: {
    height: 2,
    backgroundColor: '#e2e0fc',
    borderRadius: 99,
    marginTop: 12,
    overflow: 'hidden',
  },
  underlineFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#5323e6',
    borderRadius: 99,
    transformOrigin: 'left',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: '#e2e0fc',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    borderColor: '#5323e6',
    backgroundColor: '#f0edff',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#797588',
  },
  chipLabelActive: {
    color: '#5323e6',
  },
  privacy: {
    marginTop: 20,
    fontSize: 12,
    color: '#b0aec8',
    lineHeight: 18,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(252,248,255,0.96)',
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
});
