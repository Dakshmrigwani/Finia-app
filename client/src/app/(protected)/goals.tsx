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
} from "react-native-reanimated";
import { useTheme } from "../../context/themeContext";

const goalData = [
  {
    id: "1",
    title: "Europe Trip 2024",
    saved: 80000,
    total: 200000,
    percentage: 40,
    started: "AUG 2023",
    timeLeft: "4 MONTHS LEFT",
    status: "ON TRACK",
    icon: "flight",
    color: "#6c47ff",
  },
  {
    id: "2",
    title: "Emergency Fund",
    saved: 45000,
    total: 50000,
    percentage: 90,
    started: "JAN 2023",
    timeLeft: "ALMOST REACHED",
    status: "ON TRACK",
    icon: "warning",
    color: "#6c47ff",
  },
  {
    id: "3",
    title: "Pro Setup Update",
    saved: 0,
    total: 100000,
    percentage: 0,
    started: "DEC 2023",
    timeLeft: "MISSED DEPOSIT",
    status: "BEHIND",
    icon: "computer",
    color: "#ef4444",
  },
];

export default function GoalsScreen() {
  const { isDark } = useTheme();
  const fadeIn = useSharedValue(0);

  const colors = {
    background: isDark ? "#0f172a" : "#fcf8ff",
    card: isDark ? "#1e293b" : "#ffffff",
    surfaceLow: isDark ? "#1e1e3d" : "#f3f0ff",
    textMain: isDark ? "#f8fafc" : "#1e1b4b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    primary: "#6c47ff",
    success: "#10b981",
    danger: "#ef4444",
    border: isDark ? "#334155" : "#e2e0fc",
  };

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <Animated.View style={animatedStyle} className="px-6">
          
          {/* Summary Header */}
          <View className="mt-6 mb-8">
            <Text className="text-4xl font-bold mb-2" style={{ color: colors.textMain }}>Your Goals</Text>
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>₹1,25,000</Text>
              <Text className="text-lg font-medium ml-2" style={{ color: colors.textSecondary }}>/ ₹3,50,000 saved</Text>
            </View>
            <View className="flex-row mt-3">
              <View className="flex-row items-center mr-4">
                <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                <Text className="text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>3 ACTIVE GOALS</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                <Text className="text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>1 BEHIND SCHEDULE</Text>
              </View>
            </View>
          </View>

          {/* Goal Cards */}
          {goalData.map((goal) => (
            <View key={goal.id} className="mb-10">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center mr-4">
                    <MaterialIcons name={goal.icon as any} size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text className="text-xl font-bold" style={{ color: colors.textMain }}>{goal.title}</Text>
                    <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>₹{goal.saved.toLocaleString()} / ₹{goal.total.toLocaleString()}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold" style={{ color: colors.primary }}>{goal.percentage}%</Text>
                  <View className="flex-row items-center">
                    <Ionicons 
                      name={goal.status === "ON TRACK" ? "checkmark-circle" : "alert-circle"} 
                      size={14} 
                      color={goal.status === "ON TRACK" ? colors.success : colors.danger} 
                    />
                    <Text className="text-[10px] font-bold ml-1" style={{ color: goal.status === "ON TRACK" ? colors.success : colors.danger }}>
                      {goal.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <View className="h-full rounded-full" style={{ width: `${goal.percentage || 2}%`, backgroundColor: goal.color }} />
              </View>
              
              <View className="flex-row justify-between mt-3">
                <Text className="text-[10px] font-bold text-slate-400">STARTED {goal.started}</Text>
                <Text className="text-[10px] font-bold text-slate-400">{goal.timeLeft}</Text>
              </View>
            </View>
          ))}

          {/* Action Buttons */}
          <TouchableOpacity className="w-full py-5 rounded-3xl border-2 border-dashed items-center mb-4" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center">
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text className="font-bold ml-1" style={{ color: colors.primary }}>Add Goal</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-full py-5 rounded-3xl items-center mb-10" style={{ backgroundColor: colors.primary }}>
            <View className="flex-row items-center">
              <Ionicons name="bulb-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Add ₹1,000/month to stay on track</Text>
            </View>
          </TouchableOpacity>

          {/* Performance Card */}
          <View className="p-8 rounded-[40px] mb-10" style={{ backgroundColor: colors.surfaceLow }}>
            <Text className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: colors.textSecondary }}>Performance</Text>
            <Text className="text-2xl font-medium leading-9" style={{ color: colors.textMain }}>
              You’re ahead of <Text style={{ color: colors.primary, fontWeight: 'bold' }}>84% of users</Text> in your savings bracket.
            </Text>
            
            <View className="flex-row items-center mt-6">
              <View className="flex-row">
                {[1, 2, 3].map((i) => (
                  <View key={i} className="w-10 h-10 rounded-full border-4 border-white -mr-3" style={{ backgroundColor: '#94a3b8' }} />
                ))}
              </View>
              <Text className="ml-6 text-sm font-medium" style={{ color: colors.textSecondary }}>Join the top 10% elite savers</Text>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}