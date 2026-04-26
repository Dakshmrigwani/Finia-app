import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  type KeyboardTypeOptions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Link, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../../store/Slices/authSlice";
import { spacing } from "../../utils/styles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);
  const buttonScale = useSharedValue(1);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15 });

    return () => {
      cancelAnimation(contentOpacity);
      cancelAnimation(contentTranslateY);
      cancelAnimation(buttonScale);
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    buttonScale.value = withSequence(withSpring(0.95), withSpring(1));
    setIsLoading(true);

    try {
      /**
       * TODO: API Integration
       * Replace this mock with actual API call:
       *
       * const response = await fetch('YOUR_API_URL/login', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({ email, password })
       * });
       *
       * const data = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(data.message || 'Login failed');
       * }
       *
       * // Save token and user data to Redux
       * dispatch(setToken(data.token));
       * dispatch(setUser(data.user));
       */

      // Mock API call - simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful login response
      const mockToken = "mock-jwt-token-" + Date.now();
      const mockUser = {
        id: "1",
        email: email,
        name: email.split("@")[0],
      };

      // Dispatch actions to update Redux state
      dispatch(setToken(mockToken));
      dispatch(setUser(mockUser));

      // Navigation will be handled automatically by root layout useEffect
      // when token state changes in Redux
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      // TODO: Show error toast/alert to user
      setIsLoading(false);
    }
  };

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  type RenderInputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    isPassword?: boolean;
    type?: KeyboardTypeOptions;
    fieldKey: "email" | "password";
  };

  // Reusable Input Component for a sober look
  const RenderInput = ({
    label,
    value,
    onChangeText,
    icon,
    isPassword = false,
    type = "default",
    fieldKey,
  }: RenderInputProps) => (
    <View className="mb-5">
      <Text className="text-[12px] font-medium text-slate-500 mb-2 ml-1 uppercase tracking-widest">
        {label}
      </Text>
      <View
        className={`flex-row items-center h-14 px-4 rounded-2xl bg-white border ${
          focusedField === fieldKey
            ? "border-indigo-500 shadow-sm"
            : "border-slate-100"
        }`}
        style={focusedField === fieldKey ? { elevation: 2 } : {}}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focusedField === fieldKey ? "#6366f1" : "#94a3b8"}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="#cbd5e1"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={type}
          autoCapitalize="none"
          className="flex-1 h-full ml-3 text-slate-900 text-base"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#94a3b8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      style={{ paddingTop: spacing.xl }}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          <Animated.View style={animatedContentStyle}>
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-16 h-16 bg-indigo-600 rounded-3xl items-center justify-center shadow-xl shadow-indigo-200">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={32}
                  color="white"
                />
              </View>
              <Text className="text-3xl font-bold text-slate-900 mt-6 tracking-tight">
                Welcome back
              </Text>
              <Text className="text-slate-500 mt-2 text-center text-base">
                Log in to manage your assets securely
              </Text>
            </View>

            {/* Form */}
            <View>
              <RenderInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                type="email-address"
                fieldKey="email"
              />
              <RenderInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                isPassword
                fieldKey="password"
              />

              <TouchableOpacity
                className="align-end self-end mb-8"
                onPress={() => router.push("/(auth)/forgotPassword")}
              >
                <Text className="text-indigo-600 font-semibold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-200"
                >
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    className="flex-1 items-center justify-center"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-lg">
                        Sign In
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-10">
              <View className="flex-1 h-[1px] bg-slate-200" />
              <Text className="mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Partner Login
              </Text>
              <View className="flex-1 h-[1px] bg-slate-200" />
            </View>

            {/* Social Options */}
            <View className="flex-row gap-4 mb-8">
              <TouchableOpacity className="flex-1 h-14 bg-white border border-slate-100 rounded-2xl items-center justify-center flex-row shadow-sm">
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text className="ml-2 font-semibold text-slate-700">
                  Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 h-14 bg-white border border-slate-100 rounded-2xl items-center justify-center flex-row shadow-sm">
                <Ionicons name="call-outline" size={20} color="#6366f1" />
                <Text className="ml-2 font-semibold text-slate-700">Phone</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="items-center mb-6">
              <Text className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/(auth)/signup"
                  className="text-indigo-600 font-bold"
                >
                  Create one
                </Link>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Security Badge */}
      <View className="pb-4 items-center">
        <View className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full">
          <Ionicons name="shield-checkmark" size={12} color="#64748b" />
          <Text className="ml-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            AES-256 Encrypted Connection
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
