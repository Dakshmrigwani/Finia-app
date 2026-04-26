import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type TimeRangeType = "week" | "month" | "year";

type CategoryAnalytic = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const categoryData: CategoryAnalytic[] = [
  {
    category: "Food",
    amount: 842.1,
    percentage: 24,
    color: "#d97706",
    icon: "restaurant",
  },
  {
    category: "Shopping",
    amount: 1240.0,
    percentage: 36,
    color: "#2563eb",
    icon: "shopping-bag",
  },
  {
    category: "Travel",
    amount: 420.5,
    percentage: 12,
    color: "#059669",
    icon: "flight",
  },
  {
    category: "Entertainment",
    amount: 380.0,
    percentage: 11,
    color: "#7c3aed",
    icon: "theaters",
  },
  {
    category: "Bills",
    amount: 599.4,
    percentage: 17,
    color: "#e11d48",
    icon: "receipt",
  },
];

const monthlyData = [
  { month: "Jan", expense: 2400, income: 3800 },
  { month: "Feb", expense: 1398, income: 2210 },
  { month: "Mar", expense: 9800, income: 2290 },
  { month: "Apr", expense: 3908, income: 2000 },
  { month: "May", expense: 4800, income: 2181 },
  { month: "Jun", expense: 3800, income: 2500 },
];

/**
 * Analytics Screen
 * Displays spending analytics, insights, and trends
 */
export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [timeRange, setTimeRange] = useState<TimeRangeType>("month");

  const { width } = Dimensions.get("window");
  const chartHeight = 200;
  const maxValue = 10000;

  // Calculate chart values
  const getChartBarHeight = (value: number) => (value / maxValue) * chartHeight;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#1a1a2e]" : "bg-[#fcf8ff]"}`}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        className={`px-5 pt-4 pb-4 border-b ${isDark ? "border-[#2f2e43]" : "border-[#e2e0fc]"}`}
      >
        <Text
          className={`text-2xl font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
        >
          Analytics
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        {/* Time Range Selector */}
        <View className="px-5 py-4 flex-row gap-2">
          {["week", "month", "year"].map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range as TimeRangeType)}
              className={`px-4 py-2 rounded-full border ${
                timeRange === range
                  ? isDark
                    ? "bg-[#5323e6] border-[#6c47ff]"
                    : "bg-[#6c47ff] border-[#5323e6]"
                  : isDark
                    ? "bg-[#2f2e43] border-[#3d3b54]"
                    : "bg-white border-[#e2e0fc]"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  timeRange === range
                    ? "text-white"
                    : isDark
                      ? "text-[#a5a3c0]"
                      : "text-[#797588]"
                }`}
              >
                {range === "week"
                  ? "This Week"
                  : range === "month"
                    ? "This Month"
                    : "This Year"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View className="px-5 py-4 gap-3">
          {/* Total Spending */}
          <LinearGradient
            colors={["#6c47ff", "#5323e6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 flex-row items-center justify-between"
          >
            <View>
              <Text className="text-white/80 text-sm font-label uppercase tracking-wider">
                Total Spending
              </Text>
              <Text className="text-white text-3xl font-headline font-bold mt-2">
                $3,482.00
              </Text>
            </View>
            <View className="w-16 h-16 rounded-2xl bg-white/20 items-center justify-center backdrop-blur-md">
              <MaterialIcons name="trending-down" size={32} color="white" />
            </View>
          </LinearGradient>

          {/* Average Daily Spending */}
          <View
            className={`rounded-2xl p-6 flex-row items-center justify-between ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
            style={{
              shadowColor: "#1a1a2e",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <View>
              <Text
                className={`text-sm font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
              >
                Average Daily
              </Text>
              <Text
                className={`text-2xl font-headline font-bold mt-2 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
              >
                $112.33
              </Text>
            </View>
            <View
              className={`w-16 h-16 rounded-2xl ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"} items-center justify-center`}
            >
              <MaterialIcons
                name="calendar-today"
                size={32}
                color={isDark ? "#a5a3c0" : "#797588"}
              />
            </View>
          </View>
        </View>

        {/* Spending Trend Chart */}
        <View className="px-5 py-4">
          <Text
            className={`text-lg font-headline font-bold mb-4 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            Spending Trend
          </Text>
          <View
            className={`rounded-2xl p-4 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
            style={{
              shadowColor: "#1a1a2e",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <View
              style={{ height: chartHeight + 40 }}
              className="flex-row items-flex-end justify-around mb-4"
            >
              {monthlyData.map((data, index) => (
                <View key={index} className="items-center flex-1">
                  <View
                    style={{ height: getChartBarHeight(data.expense) }}
                    className="w-6 rounded-t-lg bg-gradient-to-t from-[#5323e6] to-[#6c47ff] mb-2"
                  />
                  <Text
                    className={`text-[10px] font-label ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                  >
                    {data.month}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-4 items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#5323e6]" />
                <Text
                  className={`text-xs font-label ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                >
                  Expenses
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#006c4f]" />
                <Text
                  className={`text-xs font-label ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                >
                  Income
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View className="px-5 py-4">
          <Text
            className={`text-lg font-headline font-bold mb-4 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            Spending by Category
          </Text>
          <View className="gap-3">
            {categoryData.map((category, index) => (
              <View
                key={index}
                className={`rounded-xl p-4 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
                style={{
                  shadowColor: "#1a1a2e",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <MaterialIcons
                        name={category.icon}
                        size={20}
                        color={category.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                      >
                        {category.category}
                      </Text>
                      <Text
                        className={`text-xs ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                      >
                        ${category.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`font-headline font-bold text-sm ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                  >
                    {category.percentage}%
                  </Text>
                </View>
                <View
                  className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-[#3d3b54]" : "bg-[#f5f2ff]"}`}
                >
                  <View
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View className="px-5 py-4">
          <Text
            className={`text-lg font-headline font-bold mb-4 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            Insights
          </Text>
          <View className="gap-3">
            <View
              className={`rounded-xl p-4 flex-row gap-3 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm border-l-4 border-[#006c4f]`}
              style={{
                shadowColor: "#1a1a2e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <MaterialIcons name="check-circle" size={24} color="#006c4f" />
              <View className="flex-1">
                <Text
                  className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                >
                  Great job!
                </Text>
                <Text
                  className={`text-xs mt-1 leading-relaxed ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                >
                  You spent 22% less this month compared to last month.
                </Text>
              </View>
            </View>

            <View
              className={`rounded-xl p-4 flex-row gap-3 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm border-l-4 border-[#d97706]`}
              style={{
                shadowColor: "#1a1a2e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <MaterialIcons name="lightbulb" size={24} color="#d97706" />
              <View className="flex-1">
                <Text
                  className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                >
                  Tip
                </Text>
                <Text
                  className={`text-xs mt-1 leading-relaxed ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                >
                  Shopping is your top category. Consider setting a budget for
                  it.
                </Text>
              </View>
            </View>

            <View
              className={`rounded-xl p-4 flex-row gap-3 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm border-l-4 border-[#2563eb]`}
              style={{
                shadowColor: "#1a1a2e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <MaterialIcons name="info" size={24} color="#2563eb" />
              <View className="flex-1">
                <Text
                  className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
                >
                  Average Spending
                </Text>
                <Text
                  className={`text-xs mt-1 leading-relaxed ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
                >
                  Your daily average is $112.33. You have spent $2,456 so far.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
