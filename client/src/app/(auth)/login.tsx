import React, { memo, useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { spacing } from "../../utils/styles";
import { useLogin } from "../../hooks/Auth/useLogin";
import { Logger } from "../../utils/logger";
import { PermissionsOptionCard } from "../../components/PermissionsOptionCard";
import { usePermissionsContext } from "../../context/permissionsContext";

type LoginInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  isPassword?: boolean;
  type?: KeyboardTypeOptions;
  showPassword: boolean;
  onTogglePassword: () => void;
};

const LoginInput = memo(
  ({
    label,
    value,
    onChangeText,
    icon,
    isPassword = false,
    type = "default",
    showPassword,
    onTogglePassword,
  }: LoginInputProps) => {
    return (
      <View className="mb-5">
        <Text className="text-[12px] font-medium text-slate-500 mb-2 ml-1 uppercase tracking-widest">
          {label}
        </Text>
        <View
          className="flex-row items-center h-14 px-4 rounded-2xl bg-white border border-slate-100"
          style={{ elevation: 1 }}
        >
          <Ionicons name={icon} size={20} color="#94a3b8" />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter your ${label.toLowerCase()}`}
            placeholderTextColor="#cbd5e1"
            secureTextEntry={isPassword && !showPassword}
            keyboardType={type}
            autoCapitalize="none"
            className="flex-1 h-full ml-3 text-slate-900 text-base"
          />
          {isPassword && (
            <TouchableOpacity onPress={onTogglePassword}>
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
  },
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const loginMutation = useLogin();
  const { requestAll } = usePermissionsContext();

  useEffect(() => {
    // Run once on mount — triggers native OS permission dialogs
    const timer = setTimeout(() => {
      requestAll();
    }, 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      Logger.error("Login screen submit failed", error);
    }
  };

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
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          <View>
            {/* Header */}
            <View className="items-center mb-10">
             
              <Text className="text-3xl font-bold text-slate-900 mt-6 tracking-tight">
                Welcome back
              </Text>
              <Text className="text-slate-500 mt-2 text-center text-base">
                Log in to manage your assets securely
              </Text>
            </View>

            {/* Form */}
            <View>
              <LoginInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                type="email-address"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((value) => !value)}
              />
              <LoginInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((value) => !value)}
              />

              <TouchableOpacity
                className="align-end self-end mb-6"
                onPress={() => router.push("/(auth)/forgotPassword")}
              >
                <Text className="text-indigo-600 font-semibold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <PermissionsOptionCard />

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleLogin}
                disabled={loginMutation.isLoading}
                className="h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-200"
              >
                <LinearGradient
                  colors={["#6366f1", "#4f46e5"]}
                  className="flex-1 items-center justify-center"
                >
                  {loginMutation.isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
          </View>
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
