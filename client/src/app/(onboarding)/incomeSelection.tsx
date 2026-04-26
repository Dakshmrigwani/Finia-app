import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
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
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function MonthlyIncomeScreen() {
  const [income, setIncome] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const underlineWidth = useSharedValue(24);
  const underlineOpacity = useSharedValue(0.2);
  const glowAnim = useSharedValue(0);
  const buttonScale = useSharedValue(1);
const router = useRouter()
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

    // Gentle pulsing glow for decorative element
    glowAnim.value = withTiming(1, { duration: 2000 });

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(underlineWidth);
      cancelAnimation(underlineOpacity);
      cancelAnimation(glowAnim);
      cancelAnimation(buttonScale);
    };
  }, []);

  // Animate underline when input is focused or has value
  useEffect(() => {
    if (isFocused || income.length > 0) {
      underlineWidth.value = withTiming(48, { duration: 300 });
      underlineOpacity.value = withTiming(0.4, { duration: 300 });
    } else {
      underlineWidth.value = withTiming(24, { duration: 300 });
      underlineOpacity.value = withTiming(0.2, { duration: 300 });
    }
  }, [isFocused, income]);

  const handleContinue = () => {
    if (!income || parseFloat(income) === 0) return;
    
    console.log('Monthly income:', income);
   router.push("/spendSelection")
  };

  const formatIncome = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toString();
  };

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    width: underlineWidth.value,
    opacity: underlineOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      glowAnim.value,
      [0, 0.5, 1],
      [0.9, 1.05, 0.9],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      glowAnim.value,
      [0, 0.5, 1],
      [0.3, 0.15, 0.3],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isContinueDisabled = !income || parseFloat(income) === 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#fcf8ff] pt-6">
        <StatusBar style="dark" />

        {/* Top Navigation Bar */}
        <View className="w-full px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#e2e0fc]/50">
          <TouchableOpacity className="p-2 -ml-2" activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#5323e6" />
          </TouchableOpacity>
          <Text className="font-headline font-bold text-[#1a1a2e] text-sm">
            Step 2 of 3
          </Text>
          <TouchableOpacity className="p-2 -mr-2" activeOpacity={0.7}>
            <MaterialIcons name="help-outline" size={24} color="#5323e6" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <Animated.View style={mainContainerStyle} className="flex-1 px-6">
          {/* Header Section */}
          <View className="mt-8 mb-4">
            <Text className="font-headline text-4xl font-extrabold tracking-tight text-[#1a1a2e] leading-tight">
              What's your{' '}
              <Text className="text-[#5323e6]">monthly</Text>{'\n'}
              income?
            </Text>
            <Text className="font-body text-[#484556] text-base mt-2">
              Rough estimate is fine
            </Text>
          </View>

          {/* Input Section */}
          <View className="flex-1 justify-start">
            <View className="relative w-full">
              {/* Currency and Input Row */}
              <View className="flex-row items-baseline">
                <Text className="font-headline text-5xl font-bold text-[#6c47ff] opacity-50 mr-2">
                  ₹
                </Text>
                <TextInput
                  ref={inputRef}
                  value={income}
                  onChangeText={setIncome}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#e2e0fc"
                  className="flex-1 font-headline text-6xl font-extrabold tracking-tighter text-[#1a1a2e] p-0"
                  style={{ fontFamily: 'Manrope' }}
                />
              </View>

              {/* Animated Underline */}
              <Animated.View 
                style={underlineStyle}
                className="h-1 rounded-full bg-gradient-to-r from-[#5323e6] to-[#6c47ff] mt-3"
              />
            </View>
          </View>
        </Animated.View>

        {/* Sticky Continue Button */}
        <Animated.View 
          style={buttonStyle}
          className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#fcf8ff] via-[#fcf8ff] to-transparent"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            disabled={isContinueDisabled}
            className={`w-full rounded-full shadow-lg overflow-hidden ${
              isContinueDisabled ? 'opacity-50' : ''
            }`}
            style={{
              shadowColor: '#5323e6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <LinearGradient
              colors={['#6c47ff', '#5323e6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center"
            >
              <Text className="text-white font-headline font-bold text-base">
                Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}