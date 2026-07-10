import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useTheme } from "../../context/themeContext";
import { useBudgets } from "../../hooks/Savings/useBudgets";
import type { Budget } from "../../api/budget.api";
import { useCreateBudgetMutation } from "../../mutations/savings/useCreateBudgetMutation";
import { useDeleteBudgetMutation } from "../../mutations/savings/useDeleteBudgetMutation";
import { useUpdateBudgetMutation } from "../../mutations/savings/useUpdateBudgetMutation";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type BudgetStatus = "OVER BUDGET" | "NEAR LIMIT" | "UNDER BUDGET";

type Category = {
  id: string;
  name: string;
  spent: number;
  total: number;
  status: BudgetStatus;
  icon: keyof typeof MaterialIcons.glyphMap;
  originalBudget: Budget;
};

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  groceries: "restaurant",
  food: "restaurant",
  dining: "restaurant",
  transport: "directions-car",
  transportation: "directions-car",
  utilities: "bolt",
  entertainment: "theater-comedy",
  shopping: "shopping-bag",
  health: "local-hospital",
  education: "school",
  housing: "home",
  insurance: "security",
  salary: "account-balance",
  income: "account-balance",
  investment: "trending-up",
  savings: "savings",
  other: "category",
};

function getIcon(category: string): keyof typeof MaterialIcons.glyphMap {
  const key = category.toLowerCase().trim();
  return CATEGORY_ICONS[key] ?? "category";
}

function computeStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return "UNDER BUDGET";
  const ratio = spent / limit;
  if (ratio > 1) return "OVER BUDGET";
  if (ratio >= 0.8) return "NEAR LIMIT";
  return "UNDER BUDGET";
}

function toCategory(b: Budget): Category {
  return {
    id: b.id,
    name: b.category,
    spent: b.amount,
    total: b.limit,
    status: computeStatus(b.amount, b.limit),
    icon: getIcon(b.category),
    originalBudget: b,
  };
}

const RING_SIZE = 72;
const RING_STROKE = 8;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

// Helper to get past 6 months
const getMonthList = () => {
  const list = [];
  const date = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    list.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      month: d.getMonth(),
      year: d.getFullYear(),
      isCurrent: i === 0,
    });
  }
  return list;
};

export default function BudgetScreen() {
  const { isDark } = useTheme();
const {
  data: budgets,
  isLoading,
  refetch,
  isRefetching,
} = useBudgets();
  const monthList = useMemo(() => getMonthList(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthList[0]);

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form fields
  const [categoryInput, setCategoryInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [limitInput, setLimitInput] = useState("");

  const createBudgetMutation = useCreateBudgetMutation();
  const deleteBudgetMutation = useDeleteBudgetMutation();
  const updateBudgetMutation = useUpdateBudgetMutation();

  // Filter budgets based on chosen month/year
  const filteredBudgets = useMemo(() => {
    return (budgets ?? []).filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === selectedMonth.month && d.getFullYear() === selectedMonth.year;
    });
  }, [budgets, selectedMonth]);

  const categories = useMemo(() => filteredBudgets.map(toCategory), [filteredBudgets]);

  const totalBudget = useMemo(
    () => categories.reduce((s, c) => s + c.total, 0),
    [categories],
  );
  const totalSpent = useMemo(
    () => categories.reduce((s, c) => s + c.spent, 0),
    [categories],
  );
  const percentUsed = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const fadeInAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  const colors = {
    background: isDark ? "#0f172a" : "#faf9ff",
    card: isDark ? "#1e293b" : "#ffffff",
    surfaceLow: isDark ? "#241f3a" : "#f2effc",
    trackBg: isDark ? "#334155" : "#ece7fb",
    iconBg: isDark ? "#334155" : "#f1edfc",
    textMain: isDark ? "#f8fafc" : "#1e1b2e",
    textSecondary: isDark ? "#94a3b8" : "#6b6478",
    border: isDark ? "#334155" : "#e6e1f7",
    primary: "#6C47FF",
    teal: "#00C896",
    success: isDark ? "#34d399" : "#10b981",
    warning: isDark ? "#fbbf24" : "#d97706",
    danger: isDark ? "#f87171" : "#ef4444",
  };

  const statusStyle = (status: BudgetStatus) => {
    switch (status) {
      case "OVER BUDGET":
        return { text: colors.danger, bar: colors.danger };
      case "NEAR LIMIT":
        return { text: colors.warning, bar: colors.warning };
      default:
        return { text: colors.success, bar: colors.teal };
    }
  };

  useEffect(() => {
    fadeInAnim.value = withTiming(1, { duration: 500 });
    progressAnim.value = withTiming(percentUsed, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    return () => {
      cancelAnimation(fadeInAnim);
      cancelAnimation(progressAnim);
    };
  }, [percentUsed]);

  const mainStyle = useAnimatedStyle(() => ({ opacity: fadeInAnim.value }));

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progressAnim.value),
  }));

  const handleOpenAddModal = () => {
    if (!selectedMonth.isCurrent) {
      Alert.alert("Locked", "You can only manage budgets for the current month.");
      return;
    }
    setCategoryInput("");
    setAmountInput("");
    setLimitInput("");
    setModalVisible(true);
  };

  const handleOpenEditModal = (budget: Budget) => {
    if (!selectedMonth.isCurrent) {
      Alert.alert("Locked", "You can only edit budgets for the current month.");
      return;
    }
    setSelectedBudget(budget);
    setCategoryInput(budget.category);
    setAmountInput(budget.amount.toString());
    setLimitInput(budget.limit.toString());
    setEditModalVisible(true);
  };

  const handleConfirmDelete = (id: string) => {
    if (!selectedMonth.isCurrent) {
      Alert.alert("Locked", "You can only delete budgets for the current month.");
      return;
    }
    Alert.alert("Delete Budget", "Are you sure you want to delete this budget?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBudgetMutation.mutate(id),
      },
    ]);
  };

  const handleAddBudget = async () => {
    if (!categoryInput.trim() || !limitInput.trim()) {
      Alert.alert("Error", "Please fill in category and limit.");
      return;
    }
    try {
      await createBudgetMutation.mutateAsync({
        category: categoryInput.trim(),
        amount: amountInput.trim() ? parseFloat(amountInput) : 0,
        limit: parseFloat(limitInput),
      });
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create budget.");
    }
  };

  const handleEditBudget = async () => {
    if (!selectedBudget) return;
    if (!categoryInput.trim() || !limitInput.trim()) {
      Alert.alert("Error", "Please fill in category and limit.");
      return;
    }
    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        payload: {
          category: categoryInput.trim(),
          amount: amountInput.trim() ? parseFloat(amountInput) : 0,
          limit: parseFloat(limitInput),
        },
      });
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update budget.");
    }
  };
const onRefresh = async () => {
  await refetch();
};
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Month Selector Header */}
      <View className="pt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 px-5"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {monthList.map((m, idx) => {
            const isSelected = selectedMonth.month === m.month && selectedMonth.year === m.year;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedMonth(m)}
                className="mr-3 px-5 py-2.5 rounded-full border"
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isSelected ? "#fff" : colors.textMain }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="relative flex-1"
         refreshControl={
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={onRefresh}
      tintColor={colors.primary}          // iOS
      colors={[colors.primary]}           // Android
      progressBackgroundColor={colors.card}
    />
  }
      >
        <Animated.View style={mainStyle} className="items-center px-5">
          <View className="w-full flex-row items-center justify-between mb-5">
            <View className="flex-1 pr-4">
              <Text
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: colors.textSecondary }}
              >
                {selectedMonth.isCurrent ? "Total Monthly Budget" : `Budget for ${selectedMonth.label}`}
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.textMain }}
              >
                ${totalSpent.toLocaleString()}{" "}
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontWeight: "500",
                    fontSize: 15,
                  }}
                >
                  of ${totalBudget.toLocaleString()}
                </Text>
              </Text>
            </View>

            <View style={{ width: RING_SIZE, height: RING_SIZE }}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  stroke={colors.trackBg}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_R}
                  stroke={colors.primary}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animatedProps={ringProps}
                  rotation="-90"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View
                style={{
                  position: "absolute",
                  width: RING_SIZE,
                  height: RING_SIZE,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.primary }}
                >
                  {Math.round(percentUsed * 100)}%
                </Text>
              </View>
            </View>
          </View>

          <View
            className="w-full p-5 rounded-2xl mb-6"
            style={{ backgroundColor: colors.surfaceLow }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <MaterialIcons name="auto-awesome" size={16} color="#fff" />
                </View>
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.textMain }}
                >
                  AI Insight
                </Text>
              </View>
              <View
                className="px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.card }}
              >
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: colors.primary }}
                >
                  Verified
                </Text>
              </View>
            </View>
            <Text
              className="text-sm leading-5 mb-4"
              style={{ color: colors.textSecondary }}
            >
              {categories.length === 0
                ? "No budgets yet. Create one to start tracking your spending."
                : "Your spending in the dining category is 15% lower than last month, suggesting a shift toward home-prepared meals."}
            </Text>
            {selectedMonth.isCurrent && (
              <TouchableOpacity
                onPress={handleOpenAddModal}
                className="py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-xs uppercase tracking-widest text-white">
                  Add Budget Category
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {categories.length > 0 ? (
            <View className="w-full">
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.textMain }}
                >
                  Categories
                </Text>
              </View>

              {categories.map((item) => {
                const s = statusStyle(item.status);
                const pct = Math.min((item.spent / item.total) * 100, 100);
                return (
                  <View key={item.id} className="flex-row items-center mb-5">
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: colors.iconBg }}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1.5">
                        <Text
                          className="text-sm font-bold"
                          style={{ color: colors.textMain }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className="text-xs font-bold"
                          style={{ color: colors.textMain }}
                        >
                          ${item.spent} / ${item.total}
                        </Text>
                      </View>
                      <View
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.trackBg }}
                      >
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: s.bar }}
                        />
                      </View>
                      <Text
                        className="text-[10px] font-bold mt-1"
                        style={{ color: s.text }}
                      >
                        {item.status}
                      </Text>
                    </View>
                    {selectedMonth.isCurrent && (
                      <View className="flex-row items-center ml-4 gap-2">
                        <TouchableOpacity onPress={() => handleOpenEditModal(item.originalBudget)}>
                          <MaterialIcons name="edit" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDelete(item.id)}>
                          <MaterialIcons name="delete" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center py-10">
              <MaterialIcons name="info-outline" size={48} color={colors.textSecondary} />
              <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
                No budgets recorded for {selectedMonth.label}.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button (Only show for current month) */}
      {selectedMonth.isCurrent && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenAddModal}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-black/35"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Budget Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-[10px] p-6 pb-10"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.textMain }}>
                Add New Budget
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Category Name
            </Text>
            <TextInput
              placeholder="e.g. Shopping, Dining"
              placeholderTextColor={colors.textSecondary}
              value={categoryInput}
              onChangeText={setCategoryInput}
              className="h-12 px-4 rounded-xl mb-4 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Monthly Budget Limit ($)
            </Text>
            <TextInput
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={limitInput}
              onChangeText={setLimitInput}
              className="h-12 px-4 rounded-xl mb-4 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Amount Spent So Far ($)
            </Text>
            <TextInput
              placeholder="e.g. 1000 (Optional)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              className="h-12 px-4 rounded-xl mb-6 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <TouchableOpacity
              onPress={handleAddBudget}
              disabled={createBudgetMutation.isPending}
              className="h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              {createBudgetMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-base text-white">Create Budget</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="rounded-t-[10px] p-6 pb-10"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.textMain }}>
                Edit Budget Category
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Category Name
            </Text>
            <TextInput
              placeholder="e.g. Shopping, Dining"
              placeholderTextColor={colors.textSecondary}
              value={categoryInput}
              onChangeText={setCategoryInput}
              className="h-12 px-4 rounded-xl mb-4 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Monthly Budget Limit ($)
            </Text>
            <TextInput
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={limitInput}
              onChangeText={setLimitInput}
              className="h-12 px-4 rounded-xl mb-4 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textSecondary }}>
              Amount Spent So Far ($)
            </Text>
            <TextInput
              placeholder="e.g. 1000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              className="h-12 px-4 rounded-xl mb-6 border text-sm"
              style={{
                color: colors.textMain,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            />

            <TouchableOpacity
              onPress={handleEditBudget}
              disabled={updateBudgetMutation.isPending}
              className="h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              {updateBudgetMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-bold text-base text-white">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
