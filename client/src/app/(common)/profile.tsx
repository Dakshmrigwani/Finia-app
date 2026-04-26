import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/Slices/authSlice";
import { RootState } from "../../store";
import { useTheme } from "../../context/themeContext";

type SettingItem = {
  id: string;
  title: string;
  description?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  action?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
};

/**
 * Profile Screen
 * Displays user profile, settings, and account options
 */
export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [settings, setSettings] = useState({
    notifications: true,
    biometric: true,
    darkMode: isDark || false,
    twoFactor: false,
  });

  // Mock user data (fallback if not from API)
  const userData = {
    name: user?.name || "Daksh Kumar",
    email: user?.email || "daksh@example.com",
    phone: "+1 (555) 123-4567",
    memberSince: "January 2024",
    accountStatus: "Active",
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          /**
           * TODO: API Integration
           * Call logout endpoint to invalidate session on backend:
           *
           * await fetch('YOUR_API_URL/logout', {
           *   method: 'POST',
           *   headers: {
           *     'Authorization': `Bearer ${token}`,
           *     'Content-Type': 'application/json'
           *   }
           * });
           */

          // Clear auth state from Redux
          dispatch(logout());

          // Navigation will be handled by root layout useEffect
          // when token state changes to null
        },
        style: "destructive",
      },
    ]);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    /**
     * TODO: API Integration
     * Save setting preference to backend:
     *
     * await fetch('YOUR_API_URL/user/settings', {
     *   method: 'PUT',
     *   headers: {
     *     'Authorization': `Bearer ${token}`,
     *     'Content-Type': 'application/json'
     *   },
     *   body: JSON.stringify({
     *     [key]: !settings[key]
     *   })
     * });
     */
  };

  const settingsSections = [
    {
      title: "Security & Privacy",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          description: "Receive transaction alerts",
          icon: "notifications",
          showToggle: true,
          toggleValue: settings.notifications,
        },
        {
          id: "biometric",
          title: "Biometric Login",
          description: "Use fingerprint or face recognition",
          icon: "fingerprint",
          showToggle: true,
          toggleValue: settings.biometric,
        },
        {
          id: "twoFactor",
          title: "Two-Factor Authentication",
          description: "Add extra security to your account",
          icon: "security",
          showToggle: true,
          toggleValue: settings.twoFactor,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "currency",
          title: "Currency",
          description: "USD ($)",
          icon: "attach-money",
        },
        {
          id: "language",
          title: "Language",
          description: "English",
          icon: "language",
        },
        {
          id: "theme",
          title: "App Theme",
          description: isDark ? "Dark" : "Light",
          icon: "palette",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help & Support",
          description: "Get help with your account",
          icon: "help",
        },
        {
          id: "terms",
          title: "Terms & Conditions",
          description: "View our terms",
          icon: "description",
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          description: "View our privacy policy",
          icon: "lock",
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between px-4 py-3 border-b ${isDark ? "bg-[#2f2e43] border-[#3d3b54]" : "bg-white border-[#e2e0fc]"} ${index === 0 ? "rounded-t-xl" : ""}`}
      onPress={() => item.action?.()}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
        >
          <MaterialIcons
            name={item.icon}
            size={20}
            color={isDark ? "#a5a3c0" : "#5323e6"}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            {item.title}
          </Text>
          {item.description && (
            <Text
              className={`text-xs mt-0.5 ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
            >
              {item.description}
            </Text>
          )}
        </View>
      </View>
      {item.showToggle ? (
        <Switch
          value={item.toggleValue || false}
          onValueChange={() => toggleSetting(item.id as keyof typeof settings)}
          trackColor={{
            false: isDark ? "#3d3b54" : "#e2e0fc",
            true: "#6c47ff",
          }}
          thumbColor={item.toggleValue ? "#f2efff" : "#a5a3c0"}
        />
      ) : (
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={isDark ? "#a5a3c0" : "#c9c3d9"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#1a1a2e]" : "bg-[#fcf8ff]"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="flex-1"
      >
        {/* Profile Card */}
        <View className="px-5 py-6">
          <LinearGradient
            colors={["#6c47ff", "#5323e6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 flex-row items-center gap-4"
          >
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center backdrop-blur-md border border-white/30">
              <MaterialIcons name="person" size={40} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-headline font-bold">
                {userData.name}
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                {userData.email}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className="w-2 h-2 rounded-full bg-[#60fcc6]" />
                <Text className="text-white/80 text-xs">
                  {userData.accountStatus}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Account Info */}
        <View className="px-5 pb-6">
          <View
            className={`rounded-2xl overflow-hidden ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
            style={{
              shadowColor: "#1a1a2e",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <View className="px-4 py-4 border-b border-[#3d3b54]">
              <Text
                className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
              >
                Contact Information
              </Text>
            </View>
            <View className="px-4 py-3 border-b border-[#3d3b54]">
              <Text
                className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
              >
                Phone
              </Text>
              <Text
                className={`font-headline font-bold mt-1 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
              >
                {userData.phone}
              </Text>
            </View>
            <View className="px-4 py-3">
              <Text
                className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
              >
                Member Since
              </Text>
              <Text
                className={`font-headline font-bold mt-1 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
              >
                {userData.memberSince}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-5 pb-6">
            <Text
              className={`text-sm font-label uppercase tracking-wider font-bold mb-3 ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
            >
              {section.title}
            </Text>
            <View
              className={`rounded-xl overflow-hidden shadow-sm ${isDark ? "bg-[#2f2e43]" : "bg-white"}`}
              style={{
                shadowColor: "#1a1a2e",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between px-4 py-4 ${
                    index !== section.items.length - 1
                      ? `border-b ${isDark ? "border-[#3d3b54]" : "border-[#e2e0fc]"}`
                      : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={isDark ? "#a5a3c0" : "#5323e6"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                      >
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text
                          className={`text-xs mt-0.5 ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={isDark ? "#a5a3c0" : "#c9c3d9"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="px-5 pb-6">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="px-6 py-4 rounded-xl bg-[#ab0413]/10 border border-[#ab0413] items-center"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="logout" size={20} color="#ab0413" />
              <Text className="text-[#ab0413] font-headline font-bold text-center">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-6">
          <Text
            className={`text-xs ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
          >
            Finia v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
