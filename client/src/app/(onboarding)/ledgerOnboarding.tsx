import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Logger } from '../../utils/logger';

const { width, height } = Dimensions.get('window');

type GoalOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  gradientColors: string[];
};

const goals: GoalOption[] = [
  {
    id: 'save-more',
    title: 'Save more',
    description: 'Build your emergency fund or plan for your next big dream.',
    icon: 'account-balance-wallet',
    iconBgColor: '#6c47ff',
    iconColor: '#ffffff',
    borderColor: '#6c47ff',
    gradientColors: ['#6c47ff', '#5323e6'],
  },
  {
    id: 'stop-overspending',
    title: 'Stop overspending',
    description: 'Identify leaks in your budget and regain control of your cash flow.',
    icon: 'warning',
    iconBgColor: '#cf2828',
    iconColor: '#ffffff',
    borderColor: '#cf2828',
    gradientColors: ['#cf2828', '#ab0413'],
  },
  {
    id: 'just-track',
    title: 'Just track',
    description: 'Visualize where your money goes without strict rules.',
    icon: 'query-stats',
    iconBgColor: '#006c4f',
    iconColor: '#ffffff',
    borderColor: '#006c4f',
    gradientColors: ['#006c4f', '#00513b'],
  },
];

export default function TheLedgerOnboarding() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);
  
  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const pulseAnim = useSharedValue(0);
  const continueButtonScale = useSharedValue(0.9);
  const continueButtonOpacity = useSharedValue(0);
  const router = useRouter();

  useEffect(() => {
    // Entrance animation
    fadeInAnim.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    slideUpAnim.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Pulse animation for wealth orbit hint
    pulseAnim.value = withSequence(
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 1500 })
    );

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(pulseAnim);
      cancelAnimation(continueButtonScale);
      cancelAnimation(continueButtonOpacity);
    };
  }, []);

  // Animate continue button when goal is selected
  useEffect(() => {
    if (selectedGoal) {
      continueButtonScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      continueButtonOpacity.value = withTiming(1, { duration: 300 });
    } else {
      continueButtonScale.value = withTiming(0.9);
      continueButtonOpacity.value = withTiming(0);
    }
  }, [selectedGoal]);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    Logger.debug('Onboarding goal selected', { goalId });
  };

  const handleContinue = () => {
    Logger.debug('Continuing onboarding with goal', { selectedGoal });
  router.push("/incomeSelection")
  };

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const pulseGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnim.value,
      [0, 0.5, 1],
      [0.8, 1.2, 0.8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      pulseAnim.value,
      [0, 0.5, 1],
      [0.3, 0.08, 0.3],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const continueButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: continueButtonScale.value }],
    opacity: continueButtonOpacity.value,
  }));

  const renderGoalCard = (goal: GoalOption) => {
    const isHovered = hoveredGoal === goal.id;
    const isSelected = selectedGoal === goal.id;

    return (
      <TouchableOpacity
        key={goal.id}
        activeOpacity={0.9}
        onPress={() => handleGoalSelect(goal.id)}
        onPressIn={() => setHoveredGoal(goal.id)}
        onPressOut={() => setHoveredGoal(null)}
        className="relative w-full"
      >
        <Animated.View
          className={`bg-white rounded-2xl p-6 border-2 ${
            isSelected 
              ? `border-[${goal.borderColor}]` 
              : isHovered 
              ? 'border-[#5323e6]/20' 
              : 'border-transparent'
          }`}
          style={{
            shadowColor: '#1a1a2e',
            shadowOffset: { width: 0, height: isSelected ? 16 : 12 },
            shadowOpacity: isSelected ? 0.08 : 0.04,
            shadowRadius: isSelected ? 48 : 40,
            elevation: isSelected ? 8 : 4,
            backgroundColor: isSelected ? '#ffffff' : '#ffffff',
          }}
        >
          {/* Background decorative icon - more prominent when selected */}
          <View className={`absolute top-0 right-0 p-4 transition-all duration-300 ${
            isSelected ? 'opacity-10' : 'opacity-5'
          }`} pointerEvents="none">
            <MaterialIcons
              name={goal.icon}
              size={120}
              color={goal.borderColor}
            />
          </View>

          {/* Title - color changes when selected */}
          <Text className={`font-headline font-bold text-2xl mb-2 ${
            isSelected ? `text-[${goal.borderColor}]` : 'text-[#1a1a2e]'
          }`}>
            {goal.title}
          </Text>
          
          {/* Description */}
          <Text className="font-body text-[#484556] text-sm leading-relaxed max-w-[200px]">
            {goal.description}
          </Text>

          {/* Selection badge - shows when selected */}
          {isSelected && (
            <Animated.View className="mt-6 flex-row items-center gap-2 bg-[#5323e6]/10 px-3 py-1.5 rounded-full self-start">
              <MaterialIcons name="check-circle" size={14} color={goal.borderColor} />
              <Text className="text-[#5323e6] font-semibold text-xs uppercase tracking-wider">
                Selected
              </Text>
            </Animated.View>
          )}

          {/* Hover indicator - shows on press */}
          {isHovered && !isSelected && (
            <Animated.View className="mt-6 flex-row items-center gap-2">
              <Text className="text-[#5323e6] font-semibold text-xs uppercase tracking-wider">
                Select Goal
              </Text>
              <MaterialIcons name="chevron-right" size={16} color="#5323e6" />
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fcf8ff] pt-8">
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View className="w-full bg-[#fcf8ff]/80 backdrop-blur-xl px-6 py-4 flex-row items-center">
        <TouchableOpacity className="p-1">
          <MaterialIcons name="arrow-back" size={24} color="#5323e6" />
        </TouchableOpacity>
        
        <View className="w-8" />
      </View>

      {/* Main Content with ScrollView */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: selectedGoal ? 100 : 32 }}
      >
        <Animated.View style={mainContainerStyle}>
          {/* Step Indicator */}
          <View className="flex-row gap-2 mb-8 items-center mt-2">
            <View className="h-1.5 w-12 rounded-full bg-[#6c47ff]" />
            <View className="h-1.5 w-4 rounded-full bg-[#e2e0fc]" />
            <View className="h-1.5 w-4 rounded-full bg-[#e2e0fc]" />
            <Text className="ml-auto font-label text-[10px] font-bold uppercase tracking-[0.1em] text-[#797588]">
              Step 1 of 3
            </Text>
          </View>

          {/* Editorial Header */}
          <View className="mb-8">
            <Text className="font-headline text-4xl font-extrabold tracking-tight text-[#1a1a2e] mb-3 leading-tight">
              What do you want{' '}
              <Text className="text-[#5323e6]">help</Text> with?
            </Text>
            <Text className="font-body text-[#484556] text-lg">
              Choose one to get started
            </Text>
          </View>

          {/* Goal Selection Cards */}
          <View className="flex-col gap-5 w-full">
            {goals.map(renderGoalCard)}
          </View>

          {/* Wealth Orbit Hint (Aura) */}
          <View className="mt-12 mb-8 relative items-center justify-center">
            {/* Animated glow background */}
            <Animated.View
              className="absolute w-64 h-64 rounded-full bg-[#5323e6]/5"
              style={pulseGlowStyle}
            />
            
            {/* Glassmorphic card */}
            <View className="flex-row items-center gap-4 py-3 px-5 rounded-full bg-[#fcf8ff]/80 shadow-md"
              style={{
                shadowColor: '#1a1a2e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {/* Avatar group */}
              <View className="flex-row -space-x-3">
                <View className="h-8 w-8 rounded-full border-2 border-[#fcf8ff] bg-gray-200 items-center justify-center overflow-hidden">
                  <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }}
                    className="h-full w-full"
                  />
                </View>
                <View className="h-8 w-8 rounded-full border-2 border-[#fcf8ff] bg-gray-200 items-center justify-center overflow-hidden">
                  <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    className="h-full w-full"
                  />
                </View>
                <LinearGradient
                  colors={['#6c47ff', '#5323e6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="h-8 w-8 rounded-full items-center justify-center border-2 border-[#fcf8ff]"
                >
                  <Text className="text-white text-[10px] font-bold">12k</Text>
                </LinearGradient>
              </View>
              <Text className="text-[11px] font-label font-semibold text-[#484556] uppercase tracking-wider">
                Joined this week
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Continue Button - appears when goal is selected */}
      {selectedGoal && (
        <Animated.View 
          className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-gradient-to-t from-[#fcf8ff] via-[#fcf8ff] to-transparent"
          style={continueButtonStyle}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            className="w-full rounded-full shadow-lg overflow-hidden"
            style={{
              shadowColor: '#5323e6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={['#6c47ff', '#5323e6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center"
            >
              <Text className="text-white font-headline font-bold text-base">
                Continue →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
