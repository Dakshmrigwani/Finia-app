import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
  cancelAnimation,
} from "react-native-reanimated";
import { spacing } from "../../utils/styles";

type Transaction = {
  id: string;
  name: string;
  time: string;
  amount: number;
  category: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  categoryColor: string;
  categoryBg: string;
};

type Category = {
  id: string;
  name: string;
  amount: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
};

const recentTransactions: Transaction[] = [
  {
    id: "1",
    name: "Starbucks Reserve",
    time: "Today • 08:45 AM",
    amount: -12.4,
    category: "Food",
    icon: "local-cafe",
    categoryColor: "#d97706",
    categoryBg: "#fef3c7",
  },
  {
    id: "2",
    name: "Apple Store",
    time: "Yesterday • 04:20 PM",
    amount: -199.0,
    category: "Shopping",
    icon: "shopping-bag",
    categoryColor: "#2563eb",
    categoryBg: "#dbeafe",
  },
  {
    id: "3",
    name: "Uber Central",
    time: "Oct 22 • 09:12 PM",
    amount: -34.2,
    category: "Travel",
    icon: "directions-car",
    categoryColor: "#059669",
    categoryBg: "#d1fae5",
  },
  {
    id: "4",
    name: "Salary Deposit",
    time: "Oct 21 • 12:00 AM",
    amount: 4200.0,
    category: "Income",
    icon: "account-balance-wallet",
    categoryColor: "#006c4f",
    categoryBg: "#60fcc6",
  },
  {
    id: "5",
    name: "ConEd Electric",
    time: "Oct 20 • 10:15 AM",
    amount: -145.0,
    category: "Bills",
    icon: "bolt",
    categoryColor: "#e11d48",
    categoryBg: "#ffe4e6",
  },
];

const topCategories: Category[] = [
  {
    id: "1",
    name: "Food",
    amount: 842.1,
    icon: "restaurant",
    color: "#d97706",
    bgColor: "#fef3c7",
  },
  {
    id: "2",
    name: "Shopping",
    amount: 1240.0,
    icon: "shopping-bag",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  {
    id: "3",
    name: "Travel",
    amount: 420.5,
    icon: "flight",
    color: "#059669",
    bgColor: "#d1fae5",
  },
  {
    id: "4",
    name: "Bills",
    amount: 980.0,
    icon: "receipt",
    color: "#e11d48",
    bgColor: "#ffe4e6",
  },
];

/**
 * Home Screen - Dashboard
 * Displays wealth score, spending summary, recent transactions, and insights
 */
export default function HomeScreen() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  // Animation values
  const fadeInAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(30);
  const wealthScoreAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(0);
  const fabScale = useSharedValue(1);

  // Colors based on theme
  const colors = {
    background: isDark ? "#1a1a2e" : "#fcf8ff",
    surface: isDark ? "#2f2e43" : "#ffffff",
    surfaceLow: isDark ? "#3d3b54" : "#f5f2ff",
    text: isDark ? "#f2efff" : "#1a1a2e",
    textVariant: isDark ? "#a5a3c0" : "#484556",
    outline: isDark ? "#49466a" : "#c9c3d9",
    primary: "#5323e6",
    primaryContainer: "#6c47ff",
    secondary: "#006c4f",
    secondaryContainer: "#60fcc6",
    tertiary: "#ab0413",
  };

  useEffect(() => {
    // Entrance animations
    fadeInAnim.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    slideUpAnim.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    wealthScoreAnim.value = withTiming(78, { duration: 1500 });
    progressAnim.value = withTiming(0.65, { duration: 1000 });

    // Pulse animation for floating elements
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.5, { duration: 2000 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(slideUpAnim);
      cancelAnimation(wealthScoreAnim);
      cancelAnimation(progressAnim);
      cancelAnimation(pulseAnim);
      cancelAnimation(fabScale);
    };
  }, []);

  const handleFabPress = () => {
    fabScale.value = withSequence(withSpring(0.9), withSpring(1));
    console.log("FAB pressed - Open AI chat");
  };

  // Animated styles
  const mainContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const wealthScoreStyle = useAnimatedStyle(() => ({
    opacity: wealthScoreAnim.value > 0 ? 1 : 0,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const pulseGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnim.value, [0, 0.5, 1], [0.95, 1.05, 0.95]);
    const opacity = interpolate(pulseAnim.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { transform: [{ scale }], opacity };
  });

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#1a1a2e]" : "bg-[#fcf8ff]"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top App Bar */}
      <View
        className={`flex-row justify-between items-center px-5 pt-4 pb-3 ${isDark ? "bg-[#1a1a2e]/80" : "bg-[#fcf8ff]/80"} backdrop-blur-xl border-b ${isDark ? "border-[#2f2e43]" : "border-[#e2e0fc]"}`}
      >
        <View className="flex-row items-center gap-3">
          <LinearGradient
            colors={["#6c47ff", "#5323e6"]}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Text className="text-white font-bold text-sm">F</Text>
          </LinearGradient>
          <Text
            className={`text-xl font-headline font-bold tracking-tight ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            Finia
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setIsDark(!isDark)}
            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
          >
            <MaterialIcons
              name={isDark ? "light-mode" : "dark-mode"}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
          >
            <MaterialIcons
              name="notifications-none"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
      >
        <Animated.View style={mainContainerStyle} className="px-5 pt-6">
          {/* Greeting Section */}
          <View className="mb-6">
            <Text
              className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
            >
              {formatDate()}
            </Text>
            <Text
              className={`text-3xl font-headline font-extrabold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
            >
              {getGreeting()}, Daksh 👋
            </Text>
          </View>

          {/* Bento Grid */}
          <View className="flex-row flex-wrap gap-5 mb-6">
            {/* Wealth Score Card */}
            <View
              className={`flex-1 ${isDark ? "bg-[#2f2e43]" : "bg-white"} rounded-2xl p-6 shadow-md relative overflow-hidden`}
              style={{
                shadowColor: "#1a1a2e",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.04,
                shadowRadius: 40,
                elevation: 4,
              }}
            >
              <View
                className={`absolute inset-0 ${isDark ? "bg-[#006c4f]/5" : "bg-[#60fcc6]/10"}`}
              />

              {/* Animated Wealth Score Circle */}
              <View className="items-center justify-center relative">
                <View className="w-36 h-36 items-center justify-center">
                  <View className="absolute w-full h-full">
                    <View className="w-full h-full rounded-full border-8 border-[#e2e0fc]" />
                    <View
                      className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-[#006c4f]"
                      style={{
                        transform: [{ rotate: "-90deg" }],
                        clipPath: "inset(0 0 0 50%)",
                      }}
                    />
                  </View>
                  <Animated.View
                    style={wealthScoreStyle}
                    className="items-center"
                  >
                    <Text
                      className={`text-4xl font-headline font-extrabold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                    >
                      78
                    </Text>
                    <Text
                      className={`text-[10px] font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                    >
                      Wealth Score
                    </Text>
                  </Animated.View>
                </View>
                <Text
                  className={`text-xs text-center mt-4 ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                >
                  Your financial health is{" "}
                  <Text className="text-[#006c4f] font-bold">Stable</Text>
                </Text>
              </View>
            </View>

            {/* Right Column */}
            <View className="flex-1 gap-4">
              {/* AI Insight Card */}
              <LinearGradient
                colors={["#6c47ff", "#5323e6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-5 relative overflow-hidden"
              >
                <Animated.View
                  style={pulseGlowStyle}
                  className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"
                />
                <View className="flex-row items-start gap-3">
                  <View className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <MaterialIcons
                      name="auto-awesome"
                      size={20}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-headline font-bold text-base">
                      Finia Insight
                    </Text>
                    <Text className="text-white/80 text-xs mt-1 leading-relaxed">
                      You spent 22% less this week — your best in 2 months.
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Spending Summary */}
              <View
                className={`rounded-2xl p-5 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-md`}
                style={{
                  shadowColor: "#1a1a2e",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.04,
                  shadowRadius: 24,
                  elevation: 3,
                }}
              >
                <Text
                  className={`text-[10px] font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                >
                  This Month Spend
                </Text>
                <View className="flex-row items-baseline gap-2 mt-1">
                  <Text
                    className={`text-2xl font-headline font-extrabold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                  >
                    $3,482.00
                  </Text>
                  <Text className="text-[#ab0413] font-bold text-xs">
                    +8% vs last month
                  </Text>
                </View>
                <View className="mt-3 h-2 w-full bg-[#e2e0fc] rounded-full overflow-hidden">
                  <Animated.View
                    style={progressBarStyle}
                    className="h-full bg-[#6c47ff] rounded-full"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row flex-wrap gap-3 mb-8">
            {[
              { icon: "add-circle", label: "Add", color: colors.primary },
              {
                icon: "chat-bubble",
                label: "Ask Finia",
                color: colors.secondary,
              },
              { icon: "flag", label: "Goals", color: "#6c47ff" },
              {
                icon: "notifications-active",
                label: "Alerts",
                color: colors.tertiary,
              },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                className={`flex-1 items-center py-3 rounded-xl ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
              >
                <MaterialIcons
                  name={action.icon as any}
                  size={24}
                  color={action.color}
                />
                <Text
                  className={`text-[10px] font-label font-bold uppercase mt-1 tracking-tighter ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Categories */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-lg font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
              >
                Top Categories
              </Text>
              <TouchableOpacity>
                <Text className="text-[#5323e6] text-sm font-semibold">
                  Details
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row gap-3"
            >
              {topCategories.map((category) => (
                <View
                  key={category.id}
                  className={`flex-row items-center gap-3 px-4 py-3 rounded-xl ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm min-w-[150px]`}
                  style={{
                    shadowColor: "#1a1a2e",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    elevation: 2,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: category.bgColor }}
                  >
                    <MaterialIcons
                      name={category.icon}
                      size={20}
                      color={category.color}
                    />
                  </View>
                  <View>
                    <Text
                      className={`text-[9px] font-label font-bold uppercase ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                    >
                      {category.name}
                    </Text>
                    <Text
                      className={`font-headline font-bold text-sm ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                    >
                      ${category.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recent Transactions */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={`text-lg font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
              >
                Recent Activity
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text
                  className={`text-sm ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                >
                  View all
                </Text>
                <MaterialIcons
                  name="arrow-forward"
                  size={16}
                  color={isDark ? "#a5a3c0" : "#484556"}
                />
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {recentTransactions.map((transaction) => (
                <Animated.View
                  key={transaction.id}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
                  style={{
                    shadowColor: "#1a1a2e",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-11 h-11 rounded-xl items-center justify-center ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
                    >
                      <MaterialIcons
                        name={transaction.icon}
                        size={22}
                        color={isDark ? "#a5a3c0" : "#1a1a2e"}
                      />
                    </View>
                    <View>
                      <Text
                        className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                      >
                        {transaction.name}
                      </Text>
                      <Text
                        className={`text-xs ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
                      >
                        {transaction.time}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`font-headline font-bold ${transaction.amount > 0 ? "text-[#006c4f]" : isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount.toFixed(2)}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: transaction.categoryBg }}
                    >
                      <Text
                        className="text-[9px] font-label font-bold uppercase"
                        style={{ color: transaction.categoryColor }}
                      >
                        {transaction.category}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={fabStyle}
        className="absolute bottom-28 right-6 z-40"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFabPress}
          className="w-14 h-14 rounded-full items-center justify-center shadow-xl"
          style={{
            shadowColor: "#5323e6",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={["#6c47ff", "#5323e6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full h-full rounded-full items-center justify-center"
          >
            <MaterialIcons name="chat" size={26} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
