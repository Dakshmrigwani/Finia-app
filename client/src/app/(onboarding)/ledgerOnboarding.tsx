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
import { setMotive } from '../../store/Slices/onboardingSlice';

type GoalOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const goals: GoalOption[] = [
  {
    id: 'save-more',
    title: 'Save more',
    description: 'Build an emergency fund or plan for your next big goal.',
    icon: 'savings',
  },
  {
    id: 'stop-overspending',
    title: 'Cut overspending',
    description: 'Identify leaks in your budget and regain control.',
    icon: 'trending-down',
  },
  {
    id: 'just-track',
    title: 'Just track',
    description: 'Visualise where your money goes — no strict rules.',
    icon: 'bar-chart',
  },
];

export default function MotiveSelectionScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(24);
  const continueScale = useSharedValue(0.96);
  const continueOpacity = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    slideUp.value = withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) });
    return () => {
      cancelAnimation(fadeIn);
      cancelAnimation(slideUp);
    };
  }, []);

  useEffect(() => {
    if (selected) {
      continueOpacity.value = withTiming(1, { duration: 250 });
      continueScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    } else {
      continueOpacity.value = withTiming(0, { duration: 200 });
      continueScale.value = withTiming(0.96, { duration: 200 });
    }
  }, [selected]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const continueStyle = useAnimatedStyle(() => ({
    opacity: continueOpacity.value,
    transform: [{ scale: continueScale.value }],
  }));

  const handleContinue = () => {
    if (!selected) return;
    dispatch(setMotive(selected));
    router.push('/incomeSelection');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color="#1a1a2e" />
        </TouchableOpacity>

        {/* Step dots */}
        <View style={styles.stepRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.stepLabel}>1 of 3</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerStyle}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>What's your{'\n'}main goal?</Text>
            <Text style={styles.subtitle}>We'll personalise your experience around it.</Text>
          </View>

          {/* Goal cards */}
          <View style={styles.cardsGap}>
            {goals.map((goal) => {
              const isSelected = selected === goal.id;
              return (
                <TouchableOpacity
                  key={goal.id}
                  activeOpacity={0.82}
                  onPress={() => setSelected(goal.id)}
                  style={[styles.card, isSelected && styles.cardSelected]}
                >
                  {/* Icon pill */}
                  <View style={[styles.iconPill, isSelected && styles.iconPillSelected]}>
                    <MaterialIcons
                      name={goal.icon}
                      size={20}
                      color={isSelected ? '#ffffff' : '#5323e6'}
                    />
                  </View>

                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.cardDesc}>{goal.description}</Text>
                  </View>

                  {/* Selection indicator */}
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue button */}
      {selected && (
        <Animated.View style={[styles.ctaWrap, continueStyle]}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleContinue}
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
      )}
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
    paddingBottom: 120,
  },
  titleBlock: {
    marginBottom: 32,
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
    fontWeight: '400',
    color: '#797588',
    lineHeight: 22,
  },
  cardsGap: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e0fc',
    gap: 14,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#5323e6',
    backgroundColor: '#f5f2ff',
    shadowColor: '#5323e6',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  iconPill: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f0edff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillSelected: {
    backgroundColor: '#5323e6',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.3,
  },
  cardTitleSelected: {
    color: '#5323e6',
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#797588',
    lineHeight: 17,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d0cde8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#5323e6',
    backgroundColor: '#5323e6',
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#ffffff',
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
