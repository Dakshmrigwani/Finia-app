import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
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
import { useDispatch } from 'react-redux';
import { setHasOnboarded } from '../../store/Slices/appSlice';


type TrustFeature = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

const trustFeatures: TrustFeature[] = [
  { id: 'privacy', icon: 'lock-open', title: 'Your data stays private' },
  { id: 'no-bank', icon: 'offline-bolt', title: 'No bank login required' },
  { id: 'control', icon: 'verified-user', title: 'You\'re always in control' },
];

export default function StartUnderstandingScreen() {
  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const progressAnim = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const featuresStagger = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);
  const router = useRouter();
  const dispatch = useDispatch();

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

    // Icon pop animation
    iconScale.value = withSequence(
      withSpring(0.8),
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Staggered feature animations
    featuresStagger.value = withTiming(1, { duration: 800 });

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(progressAnim);
      cancelAnimation(iconScale);
      cancelAnimation(featuresStagger);
      cancelAnimation(buttonScale);
      cancelAnimation(secondaryButtonScale);
    };
  }, []);

  const handleStartTracking = () => {
    buttonScale.value = withSequence(
      withSpring(0.96),
      withSpring(1)
    );
    /**
     * TODO: API Integration
     * After onboarding finishes, you may want to:
     * 1. Send user preferences to backend
     * 2. Create initial user profile
     * 
     * await fetch('YOUR_API_URL/onboarding/complete', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     preferences: { ... }
     *   })
     * });
     */
    dispatch(setHasOnboarded(true));
    // Navigation will be handled by root layout useEffect
    // which will redirect to auth/login when hasOnboarded is true but no token
  };

  const handleConnectLater = () => {
    secondaryButtonScale.value = withSequence(
      withSpring(0.96),
      withSpring(1)
    );
    // Skip for now and proceed to login
    dispatch(setHasOnboarded(true));
  };
    // Navigate to main dashboard

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const getFeatureStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const delay = index * 0.1;
      const opacity = featuresStagger.value >= delay ? 1 : 0;
      const translateX = featuresStagger.value >= delay ? 0 : -20;
      return {
        opacity,
        transform: [{ translateX }],
      };
    });
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-[#F8F7FF] pt-6">
      <StatusBar style="dark" />
      {/* Main Content */}
      <Animated.View style={mainContainerStyle} className="flex-1 px-6 pt-24 pb-12">
        {/* Progress Indicator */}
        <View className="w-full h-[3px] bg-[#EEF0FF] mb-10 rounded-full overflow-hidden">
          <Animated.View 
            style={progressBarStyle}
            className="h-full bg-[#6C47FF] rounded-full"
          />
        </View>

        {/* Hero Content */}
        <View className="w-full mb-12 items-center">
          <Animated.View style={iconStyle}>
            <View className="w-14 h-14 mb-8 items-center justify-center bg-[#EEF0FF]/50 rounded-2xl border border-[#6C47FF]/10">
              <MaterialIcons name="analytics" size={28} color="#6C47FF" />
            </View>
          </Animated.View>
          
          <Text className="font-headline text-[32px] font-extrabold text-[#1e1b4b] tracking-tight leading-tight text-center mb-4">
            Start understanding{' '}
            <Text className="text-[#6C47FF]">your money</Text>
          </Text>
          
          <Text className="text-[#64748b] font-light text-[17px] leading-relaxed max-w-[280px] text-center opacity-80">
            No bank connection needed — just add your first transaction to begin
          </Text>
        </View>

        {/* Trust Features with Staggered Animation */}
        <View className="w-full flex-col gap-5 mb-12">
          {trustFeatures.map((feature, index) => {
            const FeatureAnim = getFeatureStyle(index);
            return (
              <Animated.View 
                key={feature.id}
                style={FeatureAnim}
                className="flex-row items-center gap-4 px-2"
              >
                <View className="w-8 h-8 items-center justify-center">
                  <MaterialIcons name={feature.icon} size={20} color="#6C47FF" opacity={0.6} />
                </View>
                <Text className="text-[15px] font-medium text-[#1e1b4b]/70 tracking-tight">
                  {feature.title}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Action Area */}
        <View className="w-full mt-auto flex-col items-center gap-4">
          {/* Primary Button */}
          <Animated.View style={buttonStyle} className="w-full">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleStartTracking}
              className="w-full rounded-2xl overflow-hidden shadow-md"
              style={{
                shadowColor: '#6C47FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={['#6C47FF', '#5323e6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
              >
                <Text className="text-white font-semibold text-[17px]">
                  Start tracking with Us
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text className="text-center mt-4 text-[10px] uppercase tracking-[0.15em] text-[#64748b] font-bold opacity-60">
              Takes less than 10 seconds
            </Text>
          </Animated.View>

          {/* Secondary Button */}
          <Animated.View style={secondaryButtonStyle}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleConnectLater}
              className="py-3 px-6 mt-2"
            >
              <Text className="text-[#6C47FF] text-[15px] font-semibold">
                Connect later (optional)
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Background Polish */}
      <View className="absolute inset-0 -z-10 pointer-events-none">
        <View className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#6C47FF]/5 rounded-full blur-[100px]" />
        <View className="absolute -bottom-[5%] -right-[5%] w-[30%] h-[30%] bg-[#6C47FF]/3 rounded-full blur-[80px]" />
      </View>
    </SafeAreaView>
  );
}