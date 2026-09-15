import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { spacing } from '../../utils/styles';
import { useTheme } from '../../context/themeContext';
import { useAIChat, ChatMessage } from '../../hooks/useAIChat';

const QUICK_ACTIONS = [
  {
    icon: 'restaurant',
    title: 'Dinner Affordability',
    prompt: 'Can I afford dinner tonight based on my food budget and recent spending?',
  },
  {
    icon: 'pie-chart',
    title: 'Budget Status',
    prompt: 'How are my monthly category budgets looking right now?',
  },
  {
    icon: 'flag',
    title: 'Savings Goals',
    prompt: 'Review my active savings goals and tell me if I am on track.',
  },
  {
    icon: 'receipt-long',
    title: 'Recent Expenses',
    prompt: 'What are my latest transactions and where am I spending the most?',
  },
];

export default function AIChatRoom() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const {
    messages,
    isTyping,
    toolStatus,
    activeToolName,
    connectionStatus,
    sendMessage,
    startNewChat,
  } = useAIChat({
    initialMessages: [
      {
        id: 'welcome-init',
        text: "Hello! I'm Finia, your real-time financial copilot. I analyze your linked accounts, budgets, and goals to give you personalized money guidance. What can I check for you today?",
        isUser: false,
        timestamp: new Date(),
        suggestions: [
          'Can I afford dinner tonight?',
          'Analyze my spending this month',
          'Check my savings goals',
          'Show my budget limits',
        ],
      },
    ],
  });

  const [inputText, setInputText] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animations
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(20);
  const pulseAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);

  // Theme palette
  const colors = useMemo(
    () => ({
      bg: isDark ? '#12111f' : '#f8f7fd',
      headerBg: isDark ? 'rgba(18, 17, 31, 0.94)' : 'rgba(248, 247, 253, 0.94)',
      surface: isDark ? '#1d1b2e' : '#ffffff',
      surfaceRaised: isDark ? '#28253f' : '#ffffff',
      cardBorder: isDark ? '#2f2c4a' : '#eae7f8',
      text: isDark ? '#f4f3fb' : '#141324',
      textSecondary: isDark ? '#a4a1be' : '#5c5974',
      textMuted: isDark ? '#7a7698' : '#8e8aa8',
      primary: '#6c47ff',
      primaryDark: '#5323e6',
      primaryGlow: 'rgba(108, 71, 255, 0.15)',
      success: '#10b981',
      warning: '#f59e0b',
      aiBubbleBg: isDark ? '#232038' : '#ffffff',
      inputBg: isDark ? '#201e33' : '#ffffff',
    }),
    [isDark]
  );

  useEffect(() => {
    fadeInAnim.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    slideUpAnim.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });

    pulseAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0.3, { duration: 1200 })),
      -1,
      true
    );

    glowAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0.4, { duration: 1800 })),
      -1,
      true
    );

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(pulseAnim);
      cancelAnimation(glowAnim);
      cancelAnimation(sendButtonScale);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolStatus, isTyping]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
    setShowScrollBottom(!isCloseToBottom && contentOffset.y > 200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(protected)');
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || isTyping) return;

    sendButtonScale.value = withSequence(
      withSpring(0.88, { damping: 12 }),
      withSpring(1, { damping: 10 })
    );

    sendMessage(inputText);
    setInputText('');
  };

  const handleActionPress = (prompt: string) => {
    if (isTyping) return;
    sendMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getToolIcon = (name: string | null) => {
    switch (name) {
      case 'get_budgets':
        return 'pie-chart';
      case 'get_goals':
        return 'flag';
      case 'get_recent_transactions':
        return 'receipt-long';
      case 'get_spending_summary':
      case 'get_category_spending':
        return 'insights';
      case 'get_user_profile':
        return 'person';
      default:
        return 'auto-awesome';
    }
  };

  // Render markdown-like text with bolding and bullet lists
  const renderFormattedText = (content: string, isUserMessage: boolean) => {
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const isHeading = trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ');
      const cleanLine = isBullet ? trimmed.replace(/^[\*\-•]\s*/, '') : isHeading ? trimmed.replace(/^#+\s*/, '') : line;

      // Split bold chunks (**bold**)
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <View key={`line-${lineIdx}`} className={`flex-row flex-wrap ${isBullet ? 'pl-2 mb-1' : 'mb-0.5'}`}>
          {isBullet && (
            <Text
              style={{
                color: isUserMessage ? 'white' : colors.primary,
                marginRight: 6,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              •
            </Text>
          )}
          <Text
            style={{
              fontSize: isHeading ? 15 : 13.5,
              fontWeight: isHeading ? '700' : '400',
              lineHeight: isHeading ? 22 : 20,
              color: isUserMessage ? '#ffffff' : colors.text,
            }}
          >
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text
                    key={`b-${partIdx}`}
                    style={{
                      fontWeight: '700',
                      color: isUserMessage ? '#ffffff' : colors.text,
                    }}
                  >
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      );
    });
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 0.5, 1], [0.35, 1, 0.35]);
    return { opacity };
  });

  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
  }));

  const mainAnimStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: Platform.OS === 'android' ? 28 : 0,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Top App Bar ─────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}
      >
        {/* Left: Back Button & Assistant Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              backgroundColor: isDark ? '#26233d' : '#f0eef9',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* Title & Status Subtitle */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  letterSpacing: -0.2,
                }}
              >
                Finia AI Assistant
              </Text>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  borderRadius: 6,
                  backgroundColor: isDark ? '#2e294e' : '#ede9fe',
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '700',
                    color: colors.primary,
                    textTransform: 'uppercase',
                  }}
                >
                  Agent
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
              {isTyping ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Animated.View style={pulseStyle}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </Animated.View>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 11, fontWeight: '500', color: colors.primary }}
                  >
                    {toolStatus ? 'Checking finances...' : 'Typing response...'}
                  </Text>
                </View>
              ) : (
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, color: colors.textSecondary }}
                >
                  {connectionStatus === 'connected'
                    ? 'Online • Ready to assist'
                    : connectionStatus === 'connecting'
                    ? 'Connecting to agent...'
                    : 'Offline • Connecting...'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* New Chat Button */}
          <TouchableOpacity
            onPress={() => startNewChat()}
            activeOpacity={0.7}
            accessibilityLabel="Start new chat"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? '#26233d' : '#f0eef9',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MaterialIcons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityLabel="Toggle dark mode"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? '#26233d' : '#f0eef9',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MaterialIcons
              name={isDark ? 'light-mode' : 'dark-mode'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chat Messages Stream Area ───────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : `padding`}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 10}
      >
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          <Animated.View style={mainAnimStyle}>
            {/* Quick Action Prompt Cards (if 1 message) */}
            {messages.length === 1 && (
              <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: 10,
                  }}
                >
                  Quick Inquiries
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {QUICK_ACTIONS.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleActionPress(item.prompt)}
                      activeOpacity={0.75}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 14,
                        backgroundColor: colors.surfaceRaised,
                        borderWidth: 1,
                        borderColor: colors.cardBorder,
                        maxWidth: '48%',
                        flexGrow: 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.2 : 0.04,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isDark ? '#2e2a4d' : '#ede9fe',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialIcons
                          name={item.icon as any}
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: colors.text,
                          flex: 1,
                        }}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Message Feed */}
            {messages
              .filter(
                (m) =>
                  !m.text.toLowerCase().includes('websocket connection error') &&
                  !m.text.toLowerCase().includes('encountered an issue: websocket')
              )
              .map((message, index) => {
              const isUser = message.isUser;
              const isLastMessage = index === messages.length - 1;

              return (
                <Animated.View
                  key={message.id}
                  entering={FadeInUp.delay(Math.min(index * 40, 200)).duration(260)}
                  style={{
                    marginBottom: 16,
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      gap: 8,
                      maxWidth: '86%',
                    }}
                  >
                    {/* AI Avatar Icon beside AI bubble */}
                    {!isUser && (
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isDark ? '#2d2948' : '#ede9fe',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <MaterialIcons
                          name="auto-awesome"
                          size={15}
                          color={colors.primary}
                        />
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      {/* Bubble Container */}
                      <View
                        style={{
                          borderRadius: 18,
                          borderTopLeftRadius: isUser ? 18 : 4,
                          borderTopRightRadius: isUser ? 4 : 18,
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          backgroundColor: isUser ? colors.primaryDark : colors.aiBubbleBg,
                          borderWidth: isUser ? 0 : 1,
                          borderColor: colors.cardBorder,
                          shadowColor: isUser ? colors.primaryDark : '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isUser ? 0.25 : isDark ? 0.2 : 0.05,
                          shadowRadius: 6,
                          elevation: 2,
                        }}
                      >
                        {renderFormattedText(message.text, isUser)}

                        {/* Timestamp */}
                        <Text
                          style={{
                            fontSize: 10,
                            marginTop: 6,
                            textAlign: 'right',
                            color: isUser ? 'rgba(255, 255, 255, 0.65)' : colors.textMuted,
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Text>
                      </View>

                      {/* Suggestions list if present on last assistant message */}
                      {message.suggestions &&
                        !isUser &&
                        isLastMessage &&
                        !isTyping && (
                          <View
                            style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: 6,
                              marginTop: 10,
                              marginLeft: 2,
                            }}
                          >
                            {message.suggestions.map((sug, sIdx) => (
                              <TouchableOpacity
                                key={sIdx}
                                onPress={() => handleActionPress(sug)}
                                activeOpacity={0.7}
                                style={{
                                  paddingHorizontal: 12,
                                  paddingVertical: 7,
                                  borderRadius: 16,
                                  backgroundColor: colors.surfaceRaised,
                                  borderWidth: 1,
                                  borderColor: isDark ? '#3b375b' : '#ddd8f3',
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: 0.05,
                                  shadowRadius: 2,
                                  elevation: 1,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: '500',
                                    color: colors.primary,
                                  }}
                                >
                                  {sug}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            {/* ── Dynamic Tool Call Execution Status Card ────────────── */}
            {isTyping && toolStatus && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#23203b' : '#f0ecff',
                  borderWidth: 1,
                  borderColor: isDark ? '#3d3663' : '#d8d0f8',
                  marginBottom: 14,
                  maxWidth: '90%',
                  alignSelf: 'flex-start',
                }}
              >
                <Animated.View style={pulseStyle}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons
                      name={getToolIcon(activeToolName) as any}
                      size={18}
                      color="white"
                    />
                  </View>
                </Animated.View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: colors.primary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Autonomous Financial Tool
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: colors.text,
                      marginTop: 1,
                    }}
                  >
                    {toolStatus}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* ── Typing Pulse Dots ──────────────────────────────────── */}
            {isTyping && !toolStatus && (
              <Animated.View
                entering={FadeIn.duration(150)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  borderTopLeftRadius: 4,
                  backgroundColor: colors.aiBubbleBg,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  alignSelf: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <Animated.View style={pulseStyle}>
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: colors.primary,
                    }}
                  />
                </Animated.View>
                <Animated.View style={pulseStyle}>
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: '#8b5cf6',
                    }}
                  />
                </Animated.View>
                <Animated.View style={pulseStyle}>
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor: '#a78bfa',
                    }}
                  />
                </Animated.View>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginLeft: 4,
                  }}
                >
                  Thinking...
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <TouchableOpacity
            onPress={scrollToBottom}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              bottom: 90,
              right: 20,
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: colors.surfaceRaised,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.cardBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* ── Modern Bottom Input Bar ───────────────────────────────── */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: isKeyboardVisible
              ? Platform.OS === 'ios'
                ? 10
                : 12
              : Platform.OS === 'ios'
              ? 20
              : 16,
            backgroundColor: colors.headerBg,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.inputBg,
              borderRadius: 24,
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === 'ios' ? 8 : 4,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.03,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Input Field */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Finia about spending, budgets, goals..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              style={{
                flex: 1,
                maxHeight: 100,
                fontSize: 14,
                color: colors.text,
                paddingHorizontal: 6,
                paddingVertical: 4,
              }}
            />

            {/* Clear Input Button */}
            {inputText.length > 0 && (
              <TouchableOpacity
                onPress={() => setInputText('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 4 }}
              >
                <MaterialIcons name="cancel" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Send Button */}
            <Animated.View style={sendBtnStyle}>
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                activeOpacity={0.8}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  overflow: 'hidden',
                  opacity: !inputText.trim() || isTyping ? 0.45 : 1,
                }}
              >
                <LinearGradient
                  colors={['#7c58ff', '#5323e6']}
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="send" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Assistant Footnote - hide when keyboard is active to preserve space */}
          {!isKeyboardVisible && (
            <Text
              style={{
                fontSize: 10,
                color: colors.textMuted,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              Finia AI coach analyzes your financial ledger in real-time.
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
