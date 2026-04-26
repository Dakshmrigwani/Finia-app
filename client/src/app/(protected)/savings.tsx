import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useTheme } from "../../context/themeContext";

const categories = [
  { id: "1", name: "Groceries", spent: 480, total: 600, status: "UNDER BUDGET", icon: "restaurant", color: "#10b981" },
  { id: "2", name: "Transport", spent: 320, total: 250, status: "OVER BUDGET", icon: "directions-car", color: "#ef4444" },
  { id: "3", name: "Utilities", spent: 180, total: 200, status: "NEAR LIMIT", icon: "bolt", color: "#6366f1" },
  { id: "4", name: "Entertainment", spent: 260, total: 950, status: "UNDER BUDGET", icon: "theater-comedy", color: "#10b981" },
];

export default function BudgetScreen() {
  const { isDark } = useTheme();
  
  const fadeInAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  const colors = {
    background: isDark ? "#0f172a" : "#fcf8ff",
    card: isDark ? "#1e293b" : "#ffffff",
    surfaceLow: isDark ? "#334155" : "#f3f0ff",
    textMain: isDark ? "#f8fafc" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    primary: "#6366f1",
    border: isDark ? "#334155" : "#e2e0fc",
  };

  useEffect(() => {
    fadeInAnim.value = withTiming(1, { duration: 600 });
    progressAnim.value = withTiming(0.62, { duration: 1500, easing: Easing.out(Easing.cubic) });

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(progressAnim);
    };
  }, []);

  const mainStyle = useAnimatedStyle(() => ({ opacity: fadeInAnim.value }));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Animated.View style={mainStyle} className="items-center">
          
          {/* Large Budget Circle */}
          <View className="relative w-72 h-72 items-center justify-center my-8">
             <View className="absolute w-full h-full rounded-full border-[15px]" style={{ borderColor: isDark ? "#1e293b" : "#eeebff" }} />
             <View className="absolute w-full h-full rounded-full border-[15px]" 
                style={{ borderColor: colors.primary, borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '45deg' }] }} 
             />
             <View className="items-center">
                <Text className="text-7xl font-bold" style={{ color: colors.primary }}>62%</Text>
             </View>
          </View>

          <View className="items-center mb-10">
            <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSecondary }}>Total Monthly Budget</Text>
            <Text className="text-2xl font-bold" style={{ color: colors.textMain }}>$1,240 of $2,000 used</Text>
          </View>

          {/* AI Insight Card */}
          <View className="mx-6 p-8 rounded-[40px] mb-10" style={{ backgroundColor: colors.surfaceLow }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold" style={{ color: colors.textMain }}>AI Insight</Text>
              <View className="bg-indigo-100 px-3 py-1 rounded-full"><Text className="text-[10px] font-bold text-indigo-500 uppercase">Verified</Text></View>
            </View>
            <Text className="text-base leading-6 mb-6" style={{ color: colors.textSecondary }}>
              Your spending in the dining category is 15% lower than last month, suggesting a shift toward home-prepared meals.
            </Text>
            <TouchableOpacity className="bg-indigo-100 py-4 rounded-2xl items-center">
              <Text className="font-bold text-xs uppercase tracking-widest text-indigo-600">Adjust Budget</Text>
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          <View className="w-full px-6 mb-10">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold" style={{ color: colors.textMain }}>Categories</Text>
              <TouchableOpacity><Text className="text-xs font-bold text-indigo-600 uppercase">See Details</Text></TouchableOpacity>
            </View>

            {categories.map((item) => (
              <View key={item.id} className="mb-8">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mr-4">
                      <MaterialIcons name={item.icon as any} size={24} color="#475569" />
                    </View>
                    <Text className="text-lg font-bold" style={{ color: colors.textMain }}>{item.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-bold" style={{ color: colors.textMain }}>${item.spent} / ${item.total}</Text>
                    <Text className="text-[10px] font-bold" style={{ color: item.status === "OVER BUDGET" ? "#ef4444" : "#10b981" }}>{item.status}</Text>
                  </View>
                </View>
                <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <View className="h-full rounded-full" style={{ width: `${(item.spent / item.total) * 100}%`, backgroundColor: item.color }} />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}