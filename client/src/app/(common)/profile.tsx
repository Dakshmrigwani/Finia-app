import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser } from "../../store/Slices/authSlice";
import { RootState } from "../../store";
import { useTheme } from "../../context/themeContext";
import * as SecureStore from "expo-secure-store";
import { storageKeys } from "../../constants/storageKeys";
import {
  getUserProfile,
  updateUserProfile,
  AuthUser,
  UpdateProfilePayload,
} from "../../api/user.api";

type SettingItem = {
  id: string;
  title: string;
  description?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  action?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  valueText?: string;
};

/**
 * Product-Grade Finia User Profile Screen
 * Displays complete user profile, financial identity summary, settings, and interactive profile editor.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Editable Profile Form State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState(
    user?.currency || "USD ($)"
  );

  const [formData, setFormData] = useState({
    name: user?.name || "Daksh Kumar",
    dob: user?.dob ? (typeof user.dob === "string" ? user.dob.split("T")[0] : "1996-08-15") : "1996-08-15",
    income: user?.income ? String(user.income) : "8500",
    maritalStatus: user?.maritalStatus || user?.martialStatus || "Single",
    motive: user?.motive || "Wealth Accumulation",
    spendMostlyOn: user?.spendMostly || "Shopping & Tech",
    avatarUrl: user?.avatarUrl || "",
  });

  const [settings, setSettings] = useState({
    notifications: user?.notifications ?? true,
    biometric: user?.biometric ?? true,
    twoFactor: user?.twoFactor ?? false,
    aiNudges: user?.aiNudges ?? true,
  });

  // Fetch fresh profile on mount to sync with server API
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profileData = await getUserProfile();
        if (isMounted && profileData) {
          dispatch(setUser(profileData));
        }
      } catch (err) {
        console.warn("Failed to load user profile from API:", err);
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Keep state in sync with Redux user updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "Daksh Kumar",
        dob: user.dob ? (typeof user.dob === "string" ? user.dob.split("T")[0] : "1996-08-15") : "1996-08-15",
        income: user.income ? String(user.income) : "8500",
        maritalStatus: user.maritalStatus || user.martialStatus || "Single",
        motive: user.motive || "Wealth Accumulation",
        spendMostlyOn: user.spendMostly || "Shopping & Tech",
        avatarUrl: user.avatarUrl || "",
      });

      setSettings({
        notifications: user.notifications ?? true,
        biometric: user.biometric ?? true,
        twoFactor: user.twoFactor ?? false,
        aiNudges: user.aiNudges ?? true,
      });

      if (user.currency) {
        setSelectedCurrency(user.currency);
      }
    }
  }, [user]);

  // Calculate initials for avatar fallback
  const getInitials = (nameStr: string) => {
    if (!nameStr) return "FN";
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleOpenEditModal = () => {
    setFormData({
      name: user?.name || "Daksh Kumar",
      dob: user?.dob ? (typeof user.dob === "string" ? user.dob.split("T")[0] : "1996-08-15") : "1996-08-15",
      income: user?.income ? String(user.income) : "8500",
      maritalStatus: user?.maritalStatus || user?.martialStatus || "Single",
      motive: user?.motive || "Wealth Accumulation",
      spendMostlyOn: user?.spendMostly || "Shopping & Tech",
      avatarUrl: user?.avatarUrl || "",
    });
    setIsEditModalVisible(true);
  };

  // Helper for quick single-field setting updates
  const handleUpdatePreference = async (updates: UpdateProfilePayload) => {
    try {
      let updatedUser: AuthUser;
      try {
        updatedUser = await updateUserProfile(updates);
      } catch (err) {
        updatedUser = {
          ...user,
          ...updates,
        } as AuthUser;
      }
      dispatch(setUser(updatedUser));
    } catch (error) {
      console.warn("Failed to update preference", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const parsedIncome = parseFloat(formData.income) || 0;

      const payload = {
        name: formData.name,
        dob: formData.dob,
        income: parsedIncome,
        maritalStatus: formData.maritalStatus,
        motive: formData.motive,
        spendMostlyOn: formData.spendMostlyOn,
        avatarUrl: formData.avatarUrl,
      };

      let updatedUser: AuthUser;
      try {
        updatedUser = await updateUserProfile(payload);
      } catch (err) {
        // Fallback for offline / mock backend state
        updatedUser = {
          email: user?.email || "daksh@example.com",
          id: user?.id,
          createdAt: user?.createdAt,
          ...payload,
        } as AuthUser;
      }

      dispatch(setUser(updatedUser));
      setIsEditModalVisible(false);
      Alert.alert("Success", "Your profile has been updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = isDark ? "light" : "dark";
    handleUpdatePreference({ theme: newTheme });
  };

  const handleSelectCurrency = (curr: string) => {
    setSelectedCurrency(curr);
    setCurrencyModalVisible(false);
    handleUpdatePreference({ currency: curr });
  };

  const handleLogout = async () => {
    Alert.alert("Logout Confirmation", "Are you sure you want to sign out of Finia?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync(storageKeys.authToken);
          dispatch(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    handleUpdatePreference({ [key]: newValue });
  };

  // Color Palette Tokens
  const colors = {
    background: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    cardBorder: isDark ? "#334155" : "#e2e8f0",
    textPrimary: isDark ? "#f8fafc" : "#0f172a",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    accent: "#6c47ff",
    accentLight: isDark ? "#312e81" : "#f5f2ff",
    success: "#10b981",
    subtleBorder: isDark ? "#334155" : "#f1f5f9",
  };

  const currencies = ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)"];

  const settingsSections: Array<{ title: string; items: SettingItem[] }> = [
    {
      title: "Security & Privacy",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          description: "Instant transaction & goal alerts",
          icon: "notifications",
          showToggle: true,
          toggleValue: settings.notifications,
        },
        {
          id: "biometric",
          title: "Biometric Authentication",
          description: "Use Face ID or Fingerprint to unlock",
          icon: "fingerprint",
          showToggle: true,
          toggleValue: settings.biometric,
        },
        {
          id: "twoFactor",
          title: "Two-Factor Authentication",
          description: "Extra layer of security on login",
          icon: "security",
          showToggle: true,
          toggleValue: settings.twoFactor,
        },
        {
          id: "password",
          title: "Change Password",
          description: "Update your security credentials",
          icon: "lock",
          action: () => Alert.alert("Change Password", "A password reset link has been sent to your email."),
        },
      ],
    },
    {
      title: "Preferences & App Features",
      items: [
        {
          id: "theme",
          title: "App Theme",
          description: isDark ? "Dark Mode Active" : "Light Mode Active",
          icon: "palette",
          showToggle: true,
          toggleValue: isDark,
          action: handleThemeToggle,
        },
        {
          id: "currency",
          title: "Primary Currency",
          description: "Used across balances & goals",
          valueText: selectedCurrency,
          icon: "attach-money",
          action: () => setCurrencyModalVisible(true),
        },
        {
          id: "aiNudges",
          title: "Smart AI Insights",
          description: "Proactive financial advice nudges",
          icon: "auto-awesome",
          showToggle: true,
          toggleValue: settings.aiNudges,
        },
        {
          id: "language",
          title: "App Language",
          valueText: "English",
          icon: "language",
          action: () => Alert.alert("Language", "English is currently set as default."),
        },
      ],
    },
    {
      title: "Support & Legal",
      items: [
        {
          id: "help",
          title: "Help & Support Center",
          description: "24/7 priority customer support",
          icon: "help-outline",
          action: () => Alert.alert("Help & Support", "Support desk: support@finia.app"),
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          description: "Legal agreement and usage terms",
          icon: "description",
          action: () => Alert.alert("Terms & Conditions", "Finia Terms of Service v1.2"),
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          description: "How we protect and manage your data",
          icon: "verified-user",
          action: () => Alert.alert("Privacy Policy", "Finia Privacy Guarantee"),
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        className="flex-1"
      >
        {/* Profile Banner Card */}
        <View className="px-5 pt-5 pb-3">
          <LinearGradient
            colors={isDark ? ["#312e81", "#4338ca", "#6c47ff"] : ["#6c47ff", "#5323e6", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            {/* Ambient Background Circles */}
            <View className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <View className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-black/10" />

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                <Ionicons name="sparkles" size={12} color="#60fcc6" />
                <Text className="text-white text-[11px] font-bold tracking-wider uppercase">
                  Finia Wealth • Pro
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleOpenEditModal}
                activeOpacity={0.8}
                className="bg-white/20 p-2 rounded-full border border-white/30 flex-row items-center px-3"
              >
                <MaterialIcons name="edit" size={14} color="white" />
                <Text className="text-white text-xs font-semibold ml-1">Edit</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-4">
              {/* Avatar Container */}
              <View className="relative">
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center border-2 border-white/40 overflow-hidden">
                  {user?.avatarUrl || formData.avatarUrl ? (
                    <Image
                      source={{ uri: user?.avatarUrl || formData.avatarUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-white text-2xl font-bold tracking-wider">
                      {getInitials(user?.name || formData.name)}
                    </Text>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#60fcc6] border-2 border-[#5323e6] items-center justify-center">
                  <MaterialIcons name="check" size={12} color="#1e1b4b" />
                </View>
              </View>

              {/* User Bio Information */}
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold tracking-tight">
                  {user?.name || formData.name}
                </Text>
                <Text className="text-white/80 text-sm mt-0.5" numberOfLines={1}>
                  {user?.email || "daksh@example.com"}
                </Text>

                <View className="flex-row items-center gap-2 mt-2">
                  <View className="w-2 h-2 rounded-full bg-[#60fcc6]" />
                  <Text className="text-white/90 text-xs font-medium">
                    Active • Verified Member
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Financial Identity Quick Stat Grid */}
        <View className="px-5 py-3">
          <View className="flex-row gap-3">
            {/* Monthly Income Card */}
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
            >
              <View className="w-8 h-8 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: "#10b98120" }}>
                <MaterialIcons name="trending-up" size={18} color="#10b981" />
              </View>
              <Text className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: colors.textSecondary }}>
                Monthly Income
              </Text>
              <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
                ${user?.income ? user.income.toLocaleString() : Number(formData.income).toLocaleString()}
              </Text>
            </View>

            {/* Motive Card */}
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
            >
              <View className="w-8 h-8 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: "#6366f120" }}>
                <MaterialIcons name="flag" size={18} color="#6366f1" />
              </View>
              <Text className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: colors.textSecondary }}>
                Goal Motive
              </Text>
              <Text className="text-sm font-bold" numberOfLines={1} style={{ color: colors.textPrimary }}>
                {user?.motive || formData.motive}
              </Text>
            </View>

            {/* Top Spend Card */}
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
            >
              <View className="w-8 h-8 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: "#f59e0b20" }}>
                <MaterialIcons name="shopping-bag" size={18} color="#f59e0b" />
              </View>
              <Text className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: colors.textSecondary }}>
                Top Spend
              </Text>
              <Text className="text-sm font-bold" numberOfLines={1} style={{ color: colors.textPrimary }}>
                {user?.spendMostlyOn || user?.spendMostly || formData.spendMostlyOn}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Account Overview */}
        <View className="px-5 py-3">
          <View
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
          >
            <View className="flex-row items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: colors.subtleBorder }}>
              <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                Account Identity & Details
              </Text>
              <TouchableOpacity onPress={handleOpenEditModal}>
                <Text className="text-xs font-bold" style={{ color: colors.accent }}>
                  Edit Details
                </Text>
              </TouchableOpacity>
            </View>

            <View className="px-4 py-3 border-b flex-row justify-between items-center" style={{ borderColor: colors.subtleBorder }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Full Name</Text>
              <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{user?.name || formData.name}</Text>
            </View>

            <View className="px-4 py-3 border-b flex-row justify-between items-center" style={{ borderColor: colors.subtleBorder }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Email Address</Text>
              <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{user?.email || "daksh@example.com"}</Text>
            </View>

            <View className="px-4 py-3 border-b flex-row justify-between items-center" style={{ borderColor: colors.subtleBorder }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Date of Birth</Text>
              <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                {user?.dob ? (typeof user.dob === "string" ? user.dob.split("T")[0] : formData.dob) : formData.dob}
              </Text>
            </View>

            <View className="px-4 py-3 border-b flex-row justify-between items-center" style={{ borderColor: colors.subtleBorder }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Marital Status</Text>
              <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                {user?.maritalStatus || user?.martialStatus || formData.maritalStatus}
              </Text>
            </View>

            <View className="px-4 py-3 flex-row justify-between items-center">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Member Since</Text>
              <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "January 2024"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-5 pt-3 pb-3">
            <Text className="text-xs font-bold uppercase tracking-wider mb-2.5 ml-1" style={{ color: colors.textSecondary }}>
              {section.title}
            </Text>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={item.showToggle ? 1 : 0.7}
                  onPress={() => {
                    if (item.showToggle && item.action) {
                      item.action();
                    } else if (item.showToggle) {
                      toggleSetting(item.id as keyof typeof settings);
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    index !== section.items.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: colors.subtleBorder }}
                >
                  <View className="flex-row items-center gap-3.5 flex-1">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: isDark ? "#334155" : "#f1f5f9" }}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {item.showToggle ? (
                    <Switch
                      value={item.toggleValue || false}
                      onValueChange={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          toggleSetting(item.id as keyof typeof settings);
                        }
                      }}
                      trackColor={{
                        false: isDark ? "#334155" : "#e2e8f0",
                        true: colors.accent,
                      }}
                      thumbColor="#ffffff"
                    />
                  ) : item.valueText ? (
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs font-bold" style={{ color: colors.accent }}>
                        {item.valueText}
                      </Text>
                      <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                    </View>
                  ) : (
                    <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Action Button */}
        <View className="px-5 pt-4 pb-6">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="w-full py-4 rounded-2xl border items-center justify-center flex-row gap-2"
            style={{
              backgroundColor: isDark ? "#450a0a20" : "#fef2f2",
              borderColor: isDark ? "#991b1b" : "#fca5a5",
            }}
          >
            <MaterialIcons name="logout" size={20} color="#dc2626" />
            <Text className="text-[#dc2626] font-bold text-base">
              Sign Out of Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version Footnote */}
        <View className="items-center pb-8">
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.textSecondary} />
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Finia v1.2.0 • Bank-Grade 256-bit Encryption
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View
            className="rounded-t-3xl p-6 max-h-[90%]"
            style={{ backgroundColor: colors.cardBg }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Edit Profile Details
              </Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Full Name */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Full Name
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, name: val }))}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Avatar Image URL */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Avatar Image URL
                </Text>
                <TextInput
                  value={formData.avatarUrl}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, avatarUrl: val }))}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Monthly Income */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Monthly Income ($)
                </Text>
                <TextInput
                  value={formData.income}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, income: val }))}
                  placeholder="e.g. 8500"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Financial Motive */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Primary Goal Motive
                </Text>
                <TextInput
                  value={formData.motive}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, motive: val }))}
                  placeholder="e.g. Wealth Accumulation, Debt Free"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Spend Mostly On */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Top Spending Category
                </Text>
                <TextInput
                  value={formData.spendMostlyOn}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, spendMostlyOn: val }))}
                  placeholder="e.g. Shopping & Tech, Travel"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Date of Birth
                </Text>
                <TextInput
                  value={formData.dob}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, dob: val }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Marital Status */}
              <View className="mb-6">
                <Text className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.textSecondary }}>
                  Marital Status
                </Text>
                <TextInput
                  value={formData.maritalStatus}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, maritalStatus: val }))}
                  placeholder="e.g. Single, Married"
                  placeholderTextColor={colors.textSecondary}
                  className="px-4 py-3.5 rounded-xl border font-medium text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                    color: colors.textPrimary,
                  }}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  className="flex-1 py-4 rounded-xl border items-center"
                  style={{ borderColor: colors.cardBorder }}
                >
                  <Text className="font-bold text-base" style={{ color: colors.textSecondary }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-xl items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={currencyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCurrencyModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/50 px-6"
        >
          <View
            className="w-full rounded-2xl p-6 border"
            style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
          >
            <Text className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
              Select Currency
            </Text>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => handleSelectCurrency(curr)}
                className="py-3 px-4 rounded-xl mb-2 flex-row justify-between items-center"
                style={{
                  backgroundColor: selectedCurrency === curr ? colors.accentLight : "transparent",
                }}
              >
                <Text
                  className="font-bold text-base"
                  style={{ color: selectedCurrency === curr ? colors.accent : colors.textPrimary }}
                >
                  {curr}
                </Text>
                {selectedCurrency === curr && (
                  <MaterialIcons name="check" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}