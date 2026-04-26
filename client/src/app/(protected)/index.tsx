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
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { spacing } from "../../utils/styles";
import { useNavigation } from "expo-router";
import { useTheme } from "../../context/themeContext";

const recentTransactions = [
  { id: "1", name: "Apple Store", time: "Today, 2:45 PM", amount: -1299.0, category: "TECHNOLOGY" },
  { id: "2", name: "Acme Corp Dividends", time: "Yesterday", amount: 420.5, category: "INVESTMENT" },
  { id: "3", name: "Equinox Fitness", time: "Oct 24", amount: -215.0, category: "LIFESTYLE" },
  { id: "4", name: "Whole Foods Market", time: "Oct 23", amount: -82.14, category: "GROCERIES" },
];

const topCategories = [
  { id: "1", name: "Shopping", amount: 1240.0, icon: "shopping-bag", color: "#6366f1" },
  { id: "2", name: "Food", amount: 842.1, icon: "restaurant", color: "#f59e0b" },
  { id: "3", name: "Travel", amount: 420.5, icon: "flight", color: "#10b981" },
  { id: "4", name: "Bills", amount: 980.0, icon: "receipt", color: "#ef4444" },
];

export default function HomeScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();

  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const marqueePos = useSharedValue(0);

  const colors = {
    background: isDark ? "#0f172a" : "#ffffff",
    card: isDark ? "#1e293b" : "#ffffff",
    surfaceLow: isDark ? "#334155" : "#f8fafc",
    textMain: isDark ? "#f8fafc" : "#1e293b",
    textSecondary: isDark ? "#94a3b8" : "#64748b",
    primary: "#6366f1",
    success: "#10b981",
    border: isDark ? "#334155" : "#f1f5f9",
  };

  useEffect(() => {
    fadeInAnim.value = withTiming(1, { duration: 600 });
    slideUpAnim.value = withTiming(0, { duration: 500 });
    
    // Marquee Animation
    marqueePos.value = withRepeat(
      withTiming(-400, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(marqueePos);
    };
  }, []);

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueePos.value }],
  }));

  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Marquee AI Insight */}
      <View className="py-2 overflow-hidden border-y" style={{ backgroundColor: colors.surfaceLow, borderColor: colors.border }}>
        <Animated.View style={[marqueeStyle, { flexDirection: 'row' }]}>
          <Text className="font-bold text-[10px] uppercase tracking-widest mr-10" style={{ color: colors.primary }}>
            ✨ AI INSIGHT: You saved 12% more on utilities this month compared to September. 
          </Text>
          <Text className="font-bold text-[10px] uppercase tracking-widest mr-10" style={{ color: colors.primary }}>
            ✨ FINIA: Market volatility is low, consider rebalancing your tech vault.
          </Text>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Animated.View style={mainContainerStyle}>
          
          {/* Wealth Score Circle */}
          <View className="items-center justify-center py-8">
            <View className="w-64 h-64 items-center justify-center">
              <View className="absolute w-full h-full rounded-full border-[3px]" style={{ borderColor: colors.border }} />
              <View className="absolute w-full h-full rounded-full border-[4px]"
                style={{ borderColor: colors.primary, borderBottomColor: "transparent", borderLeftColor: "transparent", transform: [{ rotate: "45deg" }] }}
              />
              <View className="items-center">
                <Text className="font-bold tracking-widest text-[10px] mb-1" style={{ color: colors.textSecondary }}>WEALTH SCORE</Text>
                <Text className="text-7xl font-bold" style={{ color: colors.textMain }}>842</Text>
              </View>
            </View>
          </View>

          {/* Top Categories Horizontal */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center px-6 mb-4">
              <Text className="text-xl font-bold" style={{ color: colors.textMain }}>Top Categories</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 10 }}>
              {topCategories.map((cat) => (
                <View key={cat.id} className="mr-4 p-4 rounded-3xl border min-w-[140px]" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                  <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: cat.color + '20' }}>
                    <MaterialIcons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: colors.textSecondary }}>{cat.name}</Text>
                  <Text className="text-lg font-bold" style={{ color: colors.textMain }}>${cat.amount.toFixed(0)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recent Activity */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-end mb-6">
              <Text className="text-2xl font-bold" style={{ color: colors.textMain }}>Recent Activity</Text>
              <TouchableOpacity><Text className="font-bold text-[10px] tracking-widest uppercase" style={{ color: colors.primary }}>VIEW ALL</Text></TouchableOpacity>
            </View>

            {recentTransactions.map((item) => (
              <View key={item.id} className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-lg font-semibold" style={{ color: colors.textMain }}>{item.name}</Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-[10px] font-bold tracking-wider uppercase" style={{ color: colors.textSecondary }}>{item.category}</Text>
                    <View className="w-1 h-1 rounded-full bg-gray-300 mx-2" />
                    <Text className="text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>{item.time}</Text>
                  </View>
                </View>
                <Text className="text-xl font-medium" style={{ color: item.amount > 0 ? colors.success : colors.textMain }}>
                  {item.amount > 0 ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* All Categories Option Button */}
            <TouchableOpacity className="w-full py-4 rounded-2xl border items-center flex-row justify-center" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <MaterialCommunityIcons name="shape-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text className="font-bold text-[11px] tracking-widest uppercase" style={{ color: colors.textSecondary }}>View All Categories</Text>
            </TouchableOpacity>
          </View>

          {/* Allocation */}
          <View className="px-6 mt-6">
            <Text className="text-2xl font-bold mb-6" style={{ color: colors.textMain }}>Allocation</Text>
            {[{ label: "LIQUID CAPITAL", val: "$42,850.00", change: "2.4%" }, { label: "VAULTED ASSETS", val: "$128,400.00", change: "0.8%" }].map((item, idx) => (
              <View key={idx} className="rounded-3xl p-6 mb-4 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSecondary }}>{item.label}</Text>
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold" style={{ color: colors.textMain }}>{item.val}</Text>
                  <View className="flex-row items-center ml-3 bg-emerald-50 px-2 py-0.5 rounded">
                    <Ionicons name="caret-up" size={10} color={colors.success} />
                    <Text className="font-bold text-[10px] ml-0.5" style={{ color: colors.success }}>{item.change}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}