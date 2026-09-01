import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
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
import { setSpendMostlyOn } from '../../store/Slices/onboardingSlice';

type Category = {
  id: string;
  label: string;
  emoji: string;
};

const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food & dining', emoji: '🍔' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'travel', label: 'Travel & fuel', emoji: '🚕' },
  { id: 'bills', label: 'Bills & rent', emoji: '💸' },
  { id: 'health', label: 'Health & fitness', emoji: '🏋️' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'not-sure', label: 'Not sure yet', emoji: '❓' },
];

export default function SpendSelectionScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(24);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.96);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    slideUp.value = withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) });
    return () => { cancelAnimation(fadeIn); cancelAnimation(slideUp); };
  }, []);

  useEffect(() => {
    const has = selected.length > 0;
    ctaOpacity.value = withTiming(has ? 1 : 0, { duration: 220 });
    ctaScale.value = withSpring(has ? 1 : 0.96, { damping: 14, stiffness: 120 });
  }, [selected.length]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value }],
  }));

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    if (selected.length === 0) return;
    dispatch(setSpendMostlyOn(selected));
    router.push('/finalize');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.stepRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <Text style={styles.stepLabel}>3 of 3</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerStyle}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Where does your{'\n'}money go?</Text>
            <Text style={styles.subtitle}>Pick everything that applies — you can update this later.</Text>
          </View>

          {/* Category grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((cat) => {
              const isActive = selected.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  onPress={() => toggle(cat.id)}
                  style={[styles.gridCell, isActive && styles.gridCellActive]}
                >
                  <Text style={styles.emoji}>{cat.emoji}</Text>
                  <Text style={[styles.cellLabel, isActive && styles.cellLabelActive]}>
                    {cat.label}
                  </Text>
                  {isActive && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={11} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selected.length > 0 && (
            <Text style={styles.selectionCount}>
              {selected.length} selected
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <Animated.View style={[styles.ctaWrap, ctaStyle]}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleFinish}
          disabled={selected.length === 0}
          style={styles.ctaBtn}
        >
          <LinearGradient
            colors={['#6c47ff', '#5323e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>Finish Setup</Text>
            <MaterialIcons name="check" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.skipHint}>You can always update this from Settings</Text>
      </Animated.View>
    </SafeAreaView>
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 140,
  },
  titleBlock: {
    marginBottom: 28,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e0fc',
    gap: 6,
    position: 'relative',
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  gridCellActive: {
    borderColor: '#5323e6',
    backgroundColor: '#f5f2ff',
    shadowColor: '#5323e6',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  emoji: {
    fontSize: 26,
  },
  cellLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 18,
  },
  cellLabelActive: {
    color: '#5323e6',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5323e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCount: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '600',
    color: '#5323e6',
    letterSpacing: 0.2,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(252,248,255,0.96)',
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
  skipHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#b0aec8',
    letterSpacing: 0.1,
  },
});
