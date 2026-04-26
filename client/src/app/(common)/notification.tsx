import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../context/themeContext";
import { spacing } from "../../utils/styles";

const notifications = [
  {
    id: "1",
    type: "SMART GROUPING",
    title: "You made 3 Amazon purchases today totaling ₹4,500",
    time: "Just now",
    icon: "sparkles",
    color: "#6366f1",
    hasAction: true,
  },
  {
    id: "2",
    type: "SPEND ALERT",
    title: "You spent ₹2,000 on food today",
    subtitle: "That’s higher than your daily average.",
    time: "2h ago",
    icon: "bell-ring",
    color: "#ef4444",
  },
  {
    id: "3",
    type: "WEALTH INSIGHT",
    title: "Your coffee spend is ₹12,000/year",
    insight: "Switching to home brew could save ₹8k.",
    time: "5h ago",
    icon: "star",
    color: "#10b981",
  },
];

export default function NotificationsScreen() {
  const { isDark } = useTheme();
  const fadeIn = useSharedValue(0);

  const colors = {
    background: isDark ? "#0f172a" : "#fcf8ff",
    card: isDark ? "#1e293b" : "#ffffff",
    textMain: isDark ? "#f8fafc" : "#1e1b4b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    primary: "#6c47ff",
    border: isDark ? "#334155" : "#f1f5f9",
  };

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 600 });
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background , paddingTop: spacing.xl }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Sub-navigation Tabs */}
      <View className="flex-row px-6 mb-6 gap-6">
        {["All", "Alerts", "Insights", "Digest"].map((tab, i) => (
          <TouchableOpacity key={tab} className="pb-2" style={{ borderBottomWidth: i === 0 ? 2 : 0, borderBottomColor: colors.primary }}>
            <Text className="font-bold text-sm" style={{ color: i === 0 ? colors.primary : colors.textSecondary }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Animated.View style={{ opacity: fadeIn }} className="px-6">
          
          {/* Notification Cards */}
          {notifications.map((item) => (
            <View 
              key={item.id} 
              className="p-6 rounded-[32px] mb-4 border" 
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: item.color + "15" }}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold tracking-widest" style={{ color: item.color }}>{item.type}</Text>
                    <Text className="text-[10px]" style={{ color: colors.textSecondary }}>{item.time}</Text>
                  </View>
                </View>
              </View>
              
              <Text className="text-base font-bold leading-6 mb-2" style={{ color: colors.textMain }}>{item.title}</Text>
              {item.subtitle && <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>{item.subtitle}</Text>}
              
              {item.insight && (
                <View className="flex-row items-center p-4 rounded-2xl mt-2" style={{ backgroundColor: "#10b98110" }}>
                  <View className="w-1 h-8 rounded bg-emerald-500 mr-3" />
                  <Text className="text-sm font-medium flex-1" style={{ color: "#065f46" }}>{item.insight}</Text>
                </View>
              )}

              {item.hasAction && (
                <TouchableOpacity className="mt-4 py-3 rounded-2xl items-center bg-slate-50 border border-slate-100">
                  <Text className="text-xs font-bold text-slate-600">Review transactions</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Premium Financial Health Card */}
          <LinearGradient
            colors={["#6366f1", "#4f46e5"]}
            className="p-8 rounded-[40px] mt-4 shadow-xl"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-center text-white font-bold tracking-widest text-sm mb-6">FINANCIAL HEALTH</Text>
            
            <View className="items-center justify-center mb-6">
              <View className="w-40 h-40 items-center justify-center">
                <View className="absolute w-full h-full rounded-full border-[8px] border-white/20" />
                <View 
                  className="absolute w-full h-full rounded-full border-[8px] border-white" 
                  style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }}
                />
                <View className="items-center">
                  <Text className="text-5xl font-bold text-white">82</Text>
                  <Text className="text-[10px] font-bold text-white/70 tracking-widest uppercase">Optimum</Text>
                </View>
              </View>
            </View>

            <View className="h-[1px] w-full bg-white/20 mb-6" />
            <Text className="text-center text-white/90 text-sm font-medium leading-5">
              Your spend behavior is currently 15% better than your peer group.
            </Text>
          </LinearGradient>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}