import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
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
  FadeIn,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { spacing } from '../../utils/styles';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
};

const suggestedQuestions = [
  "How can I save more this month?",
  "Analyze my spending habits",
  "Set up a savings goal",
  "Investment tips for beginners",
];

export default function AIChatRoom() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Finia, your AI financial assistant. I can help you track spending, set goals, and provide personalized insights. What would you like to know today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: suggestedQuestions,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const pulseAnim = useSharedValue(0);
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(1);

  // Colors based on theme
  const colors = {
    background: isDark ? '#1a1a2e' : '#fcf8ff',
    surface: isDark ? '#2f2e43' : '#ffffff',
    surfaceLow: isDark ? '#3d3b54' : '#f5f2ff',
    text: isDark ? '#f2efff' : '#1a1a2e',
    textVariant: isDark ? '#a5a3c0' : '#484556',
    outline: isDark ? '#49466a' : '#c9c3d9',
    primary: '#5323e6',
    primaryContainer: '#6c47ff',
    secondary: '#006c4f',
    tertiary: '#ab0413',
    userBubble: isDark ? '#5323e6' : '#6c47ff',
    aiBubble: isDark ? '#3d3b54' : '#f5f2ff',
  };

  useEffect(() => {
    // Entrance animations
    fadeInAnim.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    slideUpAnim.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    
    // Pulse animation for AI indicator
    pulseAnim.value = withSequence(
      withTiming(1, { duration: 1500 }),
      withTiming(0.3, { duration: 1500 })
    );

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(pulseAnim);
      cancelAnimation(inputScale);
      cancelAnimation(sendButtonScale);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Animate send button
    sendButtonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Show typing indicator
    setIsTyping(true);
    scrollToBottom();

    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
        suggestions: suggestedQuestions,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    if (input.includes('save') || input.includes('saving')) {
      return "Great question! Based on your spending patterns, you could save ~$320/month by reducing dining out and subscription services. I've created a smart savings plan for you. Would you like to see the details?";
    } else if (input.includes('spend') || input.includes('habit')) {
      return "I've analyzed your transactions this month. Your top spending categories are Shopping (35%), Food (25%), and Bills (20%). You're spending 12% less than last month - great progress! Want me to break down any category?";
    } else if (input.includes('goal') || input.includes('target')) {
      return "Setting goals is a fantastic way to build wealth! What would you like to save for? I can help you set up emergency funds, vacation savings, investment portfolios, or debt repayment plans.";
    } else if (input.includes('invest')) {
      return "Smart thinking! Based on your risk profile and current savings, I recommend starting with a diversified portfolio. Would you like me to show you some beginner-friendly investment options?";
    } else {
      return "Thanks for your message! I can help you with budget tracking, savings goals, investment advice, or spending analysis. What would you like to focus on today?";
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    return { opacity };
  });

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#1a1a2e]' : 'bg-[#fcf8ff]'}`} style={{paddingTop: spacing.xl}}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className={`flex-row justify-between items-center px-5 pt-4 pb-3 ${isDark ? 'bg-[#1a1a2e]/80' : 'bg-[#fcf8ff]/80'} backdrop-blur-xl border-b ${isDark ? 'border-[#2f2e43]' : 'border-[#e2e0fc]'}`}>
        <View className="flex-row items-center gap-3">
          <LinearGradient
            colors={['#6c47ff', '#5323e6']}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <MaterialIcons name="auto-awesome" size={18} color="white" />
          </LinearGradient>
          <View>
            <Text className={`font-headline font-bold text-base ${isDark ? 'text-[#f2efff]' : 'text-[#1a1a2e]'}`}>
              Finia AI Assistant
            </Text>
            <View className="flex-row items-center gap-1">
              <Animated.View style={pulseStyle}>
                <View className="w-2 h-2 rounded-full bg-[#006c4f]" />
              </Animated.View>
              <Text className={`text-[10px] ${isDark ? 'text-[#a5a3c0]' : 'text-[#484556]'}`}>
                Online • Ready to help
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => setIsDark(!isDark)}
            className={`w-9 h-9 rounded-full items-center justify-center ${isDark ? 'bg-[#3d3b54]' : 'bg-[#f5f2ff]'}`}
          >
            <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity className={`w-9 h-9 rounded-full items-center justify-center ${isDark ? 'bg-[#3d3b54]' : 'bg-[#f5f2ff]'}`}>
            <MaterialIcons name="more-vert" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Animated.View style={mainContainerStyle}>
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.delay(index * 100).duration(400)}
                className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    message.isUser 
                      ? 'rounded-br-sm' 
                      : 'rounded-bl-sm'
                  }`}
                  style={{
                    backgroundColor: message.isUser ? colors.userBubble : colors.aiBubble,
                    shadowColor: '#1a1a2e',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <Text 
                    className={`text-sm leading-5 ${
                      message.isUser 
                        ? 'text-white' 
                        : isDark ? 'text-[#f2efff]' : 'text-[#1a1a2e]'
                    }`}
                  >
                    {message.text}
                  </Text>
                  <Text 
                    className={`text-[9px] mt-1 ${
                      message.isUser 
                        ? 'text-white/60' 
                        : isDark ? 'text-[#a5a3c0]' : 'text-[#484556]'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>

                {/* Suggestions */}
                {message.suggestions && !message.isUser && index === messages.length - 1 && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleSuggestionPress(suggestion)}
                        className={`px-3 py-2 rounded-full border ${isDark ? 'border-[#3d3b54] bg-[#2f2e43]' : 'border-[#e2e0fc] bg-white'}`}
                      >
                        <Text className={`text-xs ${isDark ? 'text-[#a5a3c0]' : 'text-[#484556]'}`}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Animated.View 
                entering={FadeIn.duration(300)}
                className="items-start mb-4"
              >
                <View 
                  className="rounded-2xl rounded-bl-sm px-4 py-3"
                  style={{ backgroundColor: colors.aiBubble }}
                >
                  <View className="flex-row gap-1">
                    <Animated.View style={pulseStyle}>
                      <View className="w-2 h-2 rounded-full bg-[#5323e6]" />
                    </Animated.View>
                    <Animated.View style={pulseStyle}>
                      <View className="w-2 h-2 rounded-full bg-[#6c47ff]" />
                    </Animated.View>
                    <Animated.View style={pulseStyle}>
                      <View className="w-2 h-2 rounded-full bg-[#c9beff]" />
                    </Animated.View>
                  </View>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Input Area */}
        <Animated.View 
          style={inputStyle}
          className={`px-5 pt-3 pb-6 ${isDark ? 'bg-[#1a1a2e]' : 'bg-[#fcf8ff]'} border-t ${isDark ? 'border-[#2f2e43]' : 'border-[#e2e0fc]'}`}
        >
          <View className="flex-row items-end gap-2">
            <View className={`flex-1 rounded-2xl px-4 py-2 ${isDark ? 'bg-[#2f2e43]' : 'bg-[#f5f2ff]'}`}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Finia anything..."
                placeholderTextColor={isDark ? '#a5a3c0' : '#797588'}
                multiline
                className={`max-h-32 text-base ${isDark ? 'text-[#f2efff]' : 'text-[#1a1a2e]'}`}
                style={{ fontFamily: 'Inter' }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              className={`w-11 h-11 rounded-full items-center justify-center shadow-md ${!inputText.trim() ? 'opacity-50' : ''}`}
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['#6c47ff', '#5323e6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-full h-full rounded-full items-center justify-center"
              >
                <MaterialIcons name="send" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* AI Disclaimer */}
          <Text className={`text-center text-[9px] mt-3 ${isDark ? 'text-[#a5a3c0]' : 'text-[#484556]'}`}>
            Finia AI may provide financial insights but not professional advice
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}