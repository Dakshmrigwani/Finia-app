import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Logger } from '../../utils/logger';

type SpendingCategory = {
  id: string;
  name: string;
  emoji: string;
};

const categories: SpendingCategory[] = [
  { id: 'food', name: 'Food & ordering', emoji: '🍔' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', name: 'Entertainment / subscriptions', emoji: '🎬' },
  { id: 'travel', name: 'Travel / fuel', emoji: '🚕' },
  { id: 'bills', name: 'Bills & rent', emoji: '💸' },
  { id: 'not-sure', name: 'Not sure', emoji: '❓' },
];

export default function MoneyDisappearScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const progressAnim = useSharedValue(0);
  const finishButtonScale = useSharedValue(1);
  const finishButtonOpacity = useSharedValue(0);
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

    // Progress bar animation
    progressAnim.value = withTiming(1, { duration: 800 });

    // Animate finish button when categories are selected
    if (selectedCategories.length > 0) {
      finishButtonScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      finishButtonOpacity.value = withTiming(1, { duration: 300 });
    } else {
      finishButtonScale.value = withTiming(0.9);
      finishButtonOpacity.value = withTiming(0);
    }

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(progressAnim);
      cancelAnimation(finishButtonScale);
      cancelAnimation(finishButtonOpacity);
    };
  }, [selectedCategories.length]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleFinish = () => {
    if (selectedCategories.length === 0) return;
    
    finishButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    
    Logger.debug('Spending categories selected', { selectedCategories });
   router.push("/finalize")
  };

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const finishButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: finishButtonScale.value }],
    opacity: finishButtonOpacity.value,
  }));

  const renderCategoryCard = (category: SpendingCategory) => {
    const isSelected = selectedCategories.includes(category.id);

    return (
      <TouchableOpacity
        key={category.id}
        activeOpacity={0.85}
        onPress={() => toggleCategory(category.id)}
        className="w-[48%]"
      >
        <Animated.View
          className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
            isSelected 
              ? 'bg-white border-[#6c47ff]' 
              : 'bg-[#f5f2ff] border-transparent'
          }`}
          style={{
            shadowColor: '#1a1a2e',
            shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
            shadowOpacity: isSelected ? 0.08 : 0.04,
            shadowRadius: isSelected ? 16 : 8,
            elevation: isSelected ? 6 : 2,
          }}
        >
          {/* Emoji Icon */}
          <View className="h-12 w-12 items-center justify-center bg-white rounded-full mb-3 shadow-sm">
            <Text className="text-2xl">{category.emoji}</Text>
          </View>

          {/* Category Name */}
          <Text className={`font-headline font-bold text-sm leading-snug ${
            isSelected ? 'text-[#1a1a2e]' : 'text-[#1a1a2e]/80'
          }`}>
            {category.name}
          </Text>

          {/* Selection Checkmark */}
          {isSelected && (
            <Animated.View className="absolute top-3 right-3">
              <MaterialIcons name="check-circle" size={20} color="#6c47ff" />
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fcf8ff] pt-6">
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View className="w-full px-5 pt-4 pb-3 flex-row items-center justify-between bg-[#f5f2ff]/80 backdrop-blur-xl">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-1 -ml-2" activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#6c47ff" />
          </TouchableOpacity>
        
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View style={mainContainerStyle}>
          {/* Progress Indicator */}
         <View className="flex-row gap-2 mb-8 items-center mt-2">
                  <View className="h-1.5 w-4 rounded-full bg-[#e2e0fc]" />
                  <View className="h-1.5 w-4 rounded-full bg-[#e2e0fc]" />
                  <View className="h-1.5 w-12 rounded-full bg-[#6c47ff]" />
                  <Text className="ml-auto font-label text-[10px] font-bold uppercase tracking-[0.1em] text-[#797588]">
                    Step 3 of 3
                  </Text>
                </View>

          {/* Header */}
          <View className="mb-6">
            <Text className="font-headline text-3xl font-extrabold leading-tight tracking-tight text-[#1a1a2e]">
              Where does your money usually{' '}
              <Text className="text-[#6c47ff]">disappear?</Text>
            </Text>
            <Text className="text-[#484556] font-body text-base mt-1">
              Pick what fits best
            </Text>
          </View>

          {/* Categories Grid - 2 columns */}
          <View className="flex-row flex-wrap justify-between gap-3">
            {categories.map(renderCategoryCard)}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Section - Fixed Finish Button */}
      <Animated.View 
        style={finishButtonStyle}
        className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#fcf8ff] via-[#fcf8ff] to-transparent"
      >
        <View className="w-full">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFinish}
            disabled={selectedCategories.length === 0}
            className={`w-full rounded-xl shadow-lg overflow-hidden ${
              selectedCategories.length === 0 ? 'opacity-50' : ''
            }`}
            style={{
              shadowColor: '#5323e6',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 40,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={['#6c47ff', '#5323e6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center gap-2"
            >
              <Text className="text-white font-headline font-extrabold text-lg">
                Finish
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <Text className="text-center mt-4 text-[10px] font-label uppercase tracking-wider text-[#1a1a2e]/40">
            You can change this anytime in settings
          </Text>
        </View>
      </Animated.View>

      {/* Background Ambient Elements */}
      <View className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <View className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] opacity-20">
          <LinearGradient
            colors={['#60fcc6', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full rounded-full blur-[100px]"
          />
        </View>
        <View className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] opacity-10">
          <LinearGradient
            colors={['#6c47ff', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full rounded-full blur-[120px]"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
