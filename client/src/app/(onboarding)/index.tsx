import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

// Get screen dimensions for responsive scaling
const { width, height } = Dimensions.get('window');

export default function FiniaSplashScreen() {
  // Animation values using Reanimated's shared values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const slideUpAnim = useSharedValue(30);
  const dotsPulse = useSharedValue(0);
  const buttonScale = useSharedValue(1);
const router = useRouter()
  useEffect(() => {
    // Entrance animation sequence
    fadeAnim.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    scaleAnim.value = withSpring(1, {
      damping: 8,
      stiffness: 40,
    });

    slideUpAnim.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // Dots pulsing animation - infinite loop
    dotsPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    // Cleanup animations on unmount
    return () => {
      cancelAnimation(fadeAnim);
      cancelAnimation(scaleAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(dotsPulse);
    };
  }, []);

  // Handle button press with haptic feedback animation
  const handleGetStarted = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    router.push("/ledgerOnboarding")
    
  };

  // Animated styles for main container
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  // Animated styles for logo scale
  const logoScaledStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  // Animated styles for dot 1
  const dot1Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      dotsPulse.value,
      [0, 0.3, 0.6, 1],
      [0.3, 0.6, 0.8, 0.3],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Animated styles for dot 2
  const dot2Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      dotsPulse.value,
      [0, 0.3, 0.6, 1],
      [0.5, 0.8, 0.3, 0.5],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Animated styles for dot 3
  const dot3Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      dotsPulse.value,
      [0, 0.3, 0.6, 1],
      [0.3, 0.8, 0.6, 0.3],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // Animated styles for button
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-[#fcf8ff]">
      <StatusBar style="dark" />

      {/* Main Container */}
      <View className="flex-1 items-center justify-center">
        {/* Subtle Ambient Glow Background */}
        <View className="absolute items-center justify-center" pointerEvents="none">
          <LinearGradient
            colors={['rgba(108, 71, 255, 0.08)', 'rgba(252, 248, 255, 0)']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 0.8 }}
            style={{
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: width * 0.4,
            }}
          />
        </View>

        {/* Central Content Container - Animated */}
        <Animated.View
          className="items-center justify-center px-6"
          style={mainContainerStyle}
        >
          {/* Logo Section */}
          <View className="mb-10">
            <Animated.View style={logoScaledStyle}>
              <View className="w-24 h-24 bg-white rounded-xl items-center justify-center shadow-lg"
                style={{
                  shadowColor: '#1a1a2e',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.04,
                  shadowRadius: 40,
                  elevation: 8,
                }}
              >
                {/* Glassmorphism effect */}
                <View className="absolute inset-0 rounded-xl bg-white/40" />
                {/* Core Logo Mark */}
                <MaterialIcons name="security" size={52} color="#6c47ff" />
              </View>
            </Animated.View>
          </View>

          {/* Brand Wordmark */}
          <Text className="font-manrope font-extrabold text-5xl tracking-tighter text-[#1a1a2e] mb-4">
            Finia
          </Text>

          {/* Tagline */}
          <Text className="font-manrope font-bold text-lg text-[#1a1a2e]/80 tracking-tight max-w-[280px] text-center">
            Your money, finally making sense.
          </Text>

          {/* Decorative Visual: Soft "Wealth Orbit" Hint */}
          <View className="mt-16 flex-row items-center gap-2">
            <Animated.View
              className="w-1.5 h-1.5 rounded-full bg-[#006c4f]"
              style={dot1Style}
            />
            <Animated.View
              className="w-2 h-2 rounded-full bg-[#5323e6]"
              style={dot2Style}
            />
            <Animated.View
              className="w-1.5 h-1.5 rounded-full bg-[#006c4f]"
              style={dot3Style}
            />
          </View>
        </Animated.View>
      </View>

      {/* Footer Section with Get Started Button and Branding */}
      <View className="absolute bottom-8 left-0 w-full items-center px-6">
        {/* Get Started Button */}
        <Animated.View style={buttonStyle} className="w-full max-w-[280px] mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGetStarted}
            className="w-full bg-[#5323e6] py-4 rounded-full shadow-md"
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
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 999,
              }}
            />
            <Text className="text-white font-manrope font-bold text-base text-center">
              Get Started →
            </Text>
          </TouchableOpacity>
        </Animated.View>

      
      </View>
    </SafeAreaView>
  );
}