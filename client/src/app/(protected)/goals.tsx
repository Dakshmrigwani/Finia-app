import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "../../context/themeContext";
import { useGoals } from "../../queries/goal/useGoals";
import { useCreateGoalMutation } from "../../mutations/goals/useCreateGoalMutation";
import { useUpdateGoalMutation } from "../../mutations/goals/useUpdateGoalMutation";
import { useDeleteGoalMutation } from "../../mutations/goals/useDeleteGoalMutation";

type GoalType =
  | "EMERGENCY_FUND"
  | "VACATION"
  | "CAR"
  | "HOME"
  | "GADGET"
  | "EDUCATION"
  | "INVESTMENT"
  | "CUSTOM";

const GOAL_TYPES: { label: string; value: GoalType; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { label: "Emergency", value: "EMERGENCY_FUND", icon: "warning" },
  { label: "Vacation", value: "VACATION", icon: "flight" },
  { label: "Car", value: "CAR", icon: "directions-car" },
  { label: "Home", value: "HOME", icon: "home" },
  { label: "Gadget", value: "GADGET", icon: "computer" },
  { label: "Education", value: "EDUCATION", icon: "school" },
  { label: "Investment", value: "INVESTMENT", icon: "trending-up" },
  { label: "Custom", value: "CUSTOM", icon: "stars" },
];

const CURRENCY_SYMBOL = "₹";
const formatCurrency = (value: number) => `${CURRENCY_SYMBOL}${value.toLocaleString("en-IN")}`;

export default function GoalsScreen() {
  const { isDark } = useTheme();
  const fadeIn = useSharedValue(0);

  // Queries & Mutations
  const { data: goals = [], isLoading, error, refetch, isRefetching } = useGoals();
  const createGoalMutation = useCreateGoalMutation();
  const updateGoalMutation = useUpdateGoalMutation();
  const deleteGoalMutation = useDeleteGoalMutation();

  const onRefresh = async () => {
    await refetch();
  };

  // Filtering
  const [selectedYear, setSelectedYear] = useState<string>("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Form State
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentSavedAmount, setCurrentSavedAmount] = useState("");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());
  const [targetMonth, setTargetMonth] = useState("12"); // Dec default
  const [goalType, setGoalType] = useState<GoalType>("CUSTOM");

  const colors = {
    background: isDark ? "#0f172a" : "#faf9ff",
    card: isDark ? "#1e293b" : "#ffffff",
    surfaceLow: isDark ? "#241f3a" : "#f2effc",
    iconBg: isDark ? "#334155" : "#f1edfc",
    trackBg: isDark ? "#334155" : "#ece7fb",
    textMain: isDark ? "#f8fafc" : "#1e1b2e",
    textSecondary: isDark ? "#94a3b8" : "#6b6478",
    textFaint: isDark ? "#64748b" : "#94a3b8",
    border: isDark ? "#334155" : "#e6e1f7",
    primary: "#6C47FF",
    success: isDark ? "#34d399" : "#10b981",
    danger: isDark ? "#f87171" : "#ef4444",
    avatarBg: isDark ? "#475569" : "#cbd5e1",
    inputBg: isDark ? "#0f172a" : "#f8f6ff",
  };

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  // Get available years for filtering dynamically based on goal targetDate
  const availableYears = ["All", ...Array.from(new Set(goals.map((g) => {
    const d = new Date(g.targetDate);
    return isNaN(d.getTime()) ? "" : d.getFullYear().toString();
  }).filter(Boolean)))].sort();

  // Filter goals
  const filteredGoals = goals.filter((goal) => {
    if (selectedYear === "All") return true;
    const year = new Date(goal.targetDate).getFullYear().toString();
    return year === selectedYear;
  });

  // Calculate statistics
  const totalSaved = filteredGoals.reduce((sum, g) => sum + g.currentSavedAmount, 0);
  const totalTarget = filteredGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const activeGoalsCount = filteredGoals.length;
  const behindGoalsCount = filteredGoals.filter((g) => g.status === "BEHIND").length;

  const handleOpenAddModal = () => {
    setEditingGoalId(null);
    setGoalName("");
    setTargetAmount("");
    setCurrentSavedAmount("");
    setTargetYear(new Date().getFullYear().toString());
    setTargetMonth("12");
    setGoalType("CUSTOM");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: typeof goals[0]) => {
    setEditingGoalId(goal.id);
    setGoalName(goal.goalName);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentSavedAmount(goal.currentSavedAmount.toString());
    const dateObj = new Date(goal.targetDate);
    if (!isNaN(dateObj.getTime())) {
      setTargetYear(dateObj.getFullYear().toString());
      setTargetMonth((dateObj.getMonth() + 1).toString().padStart(2, "0"));
    }
    setGoalType((goal.goalType as GoalType) || "CUSTOM");
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteGoalMutation.mutate(id, {
            onSuccess: () => {
              Alert.alert("Success", "Goal deleted successfully.");
            },
            onError: (err: any) => {
              Alert.alert("Error", err.message || "Failed to delete goal.");
            },
          });
        },
      },
    ]);
  };

  const handleSubmit = () => {
    if (!goalName.trim()) {
      Alert.alert("Validation Error", "Goal Name is required.");
      return;
    }
    const targetAmt = parseFloat(targetAmount);
    if (isNaN(targetAmt) || targetAmt <= 0) {
      Alert.alert("Validation Error", "Target Amount must be a positive number.");
      return;
    }
    const savedAmt = currentSavedAmount ? parseFloat(currentSavedAmount) : 0;
    if (isNaN(savedAmt) || savedAmt < 0) {
      Alert.alert("Validation Error", "Saved Amount cannot be negative.");
      return;
    }

    const isoDateStr = `${targetYear}-${targetMonth.padStart(2, "0")}-15T00:00:00.000Z`;

    const payload = {
      goalName: goalName.trim(),
      goalType,
      targetAmount: targetAmt,
      currentSavedAmount: savedAmt,
      targetDate: isoDateStr,
    };

    if (editingGoalId) {
      updateGoalMutation.mutate(
        { id: editingGoalId, payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            Alert.alert("Success", "Goal updated successfully.");
          },
          onError: (err: any) => {
            Alert.alert("Error", err.message || "Failed to update goal.");
          },
        }
      );
    } else {
      createGoalMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          Alert.alert("Success", "Goal created successfully.");
        },
        onError: (err: any) => {
          Alert.alert("Error", err.message || "Failed to create goal.");
        },
      });
    }
  };

  const getIconForType = (type: string): keyof typeof MaterialIcons.glyphMap => {
    const match = GOAL_TYPES.find((t) => t.value === type);
    return match ? match.icon : "stars";
  };

  const getStatusColor = (goal: typeof goals[0]) => {
    const pct = goal.targetAmount > 0 ? (goal.currentSavedAmount / goal.targetAmount) * 100 : 0;
    if (goal.status === "BEHIND") return colors.danger;
    if (pct >= 100) return colors.success;
    return colors.primary;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
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
        <Animated.View style={animatedStyle} className="px-5">
          {/* Summary Header */}
          <View className="mt-4 mb-4">
            <Text className="text-2xl font-bold mb-1" style={{ color: colors.textMain }}>
              Your Goals
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {formatCurrency(totalSaved)}
              </Text>
              <Text className="text-sm font-medium ml-2" style={{ color: colors.textSecondary }}>
                / {formatCurrency(totalTarget)} saved
              </Text>
            </View>
            <View className="flex-row mt-2.5">
              <View className="flex-row items-center mr-4">
                <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colors.success }} />
                <Text className="text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                  {activeGoalsCount} ACTIVE GOALS
                </Text>
              </View>
              {behindGoalsCount > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: colors.danger }} />
                  <Text className="text-[10px] font-bold uppercase" style={{ color: colors.textSecondary }}>
                    {behindGoalsCount} BEHIND SCHEDULE
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Year Filter ScrollView */}
          <View className="mb-6">
            <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
              Filter by Year
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    className="px-4 py-2 rounded-full mr-2"
                    style={{
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{ color: isSelected ? "#ffffff" : colors.textSecondary }}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Goal Cards */}
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} className="my-10" />
          ) : error ? (
            <View className="my-10 items-center">
              <Text style={{ color: colors.danger }}>Failed to load goals.</Text>
            </View>
          ) : filteredGoals.length === 0 ? (
            <View className="my-10 items-center">
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                No goals found for {selectedYear === "All" ? "any year" : selectedYear}.
              </Text>
            </View>
          ) : (
            filteredGoals.map((goal) => {
              const percentage = Math.min(
                100,
                Math.round(goal.targetAmount > 0 ? (goal.currentSavedAmount / goal.targetAmount) * 100 : 0)
              );
              const started = percentage > 0;
              const dateObj = new Date(goal.targetDate);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()
                : "N/A";

              const statusColor = getStatusColor(goal);

              return (
                <View key={goal.id} className="mb-7 p-4 rounded-2xl" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-row items-center flex-1 pr-3">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: colors.iconBg }}
                      >
                        <MaterialIcons name={getIconForType(goal.goalType)} size={20} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: colors.textMain }}>
                          {goal.goalName}
                        </Text>
                        <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                          {formatCurrency(goal.currentSavedAmount)} / {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                        {percentage}%
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={goal.status === "BEHIND" ? "alert-circle" : "checkmark-circle"}
                          size={13}
                          color={statusColor}
                        />
                        <Text className="text-[10px] font-bold ml-1" style={{ color: statusColor }}>
                          {goal.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: colors.trackBg }}>
                    {started && (
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${percentage}%`, backgroundColor: statusColor }}
                      />
                    )}
                  </View>

                  <View className="flex-row justify-between mt-2.5 items-center">
                    <Text className="text-[10px] font-bold" style={{ color: colors.textFaint }}>
                      TARGET {formattedDate}
                    </Text>

                    {/* Actions */}
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleOpenEditModal(goal)}
                        className="p-1 mr-2"
                      >
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteGoal(goal.id)}
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={handleOpenAddModal}
            className="w-full py-4 rounded-2xl border-2 border-dashed items-center mb-3"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text className="font-bold ml-1 text-sm" style={{ color: colors.primary }}>
                Add Goal
              </Text>
            </View>
          </TouchableOpacity>

          {/* Performance Card */}
          <View className="p-5 rounded-2xl mb-20" style={{ backgroundColor: colors.surfaceLow }}>
            <Text
              className="text-[10px] font-bold tracking-widest uppercase mb-3"
              style={{ color: colors.textSecondary }}
            >
              Performance
            </Text>
            <Text className="text-lg font-medium leading-7" style={{ color: colors.textMain }}>
              You're ahead of <Text style={{ color: colors.primary, fontWeight: "bold" }}>84% of users</Text> in your
              savings bracket.
            </Text>

            <View className="flex-row items-center mt-5">
              <View className="flex-row">
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    className="w-9 h-9 rounded-full -mr-2.5"
                    style={{ backgroundColor: colors.avatarBg, borderWidth: 3, borderColor: colors.surfaceLow }}
                  />
                ))}
              </View>
              <Text className="ml-5 text-xs font-medium" style={{ color: colors.textSecondary }}>
                Join the top 10% elite savers
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="p-6 rounded-t-[32px]"
            style={{ backgroundColor: colors.card, minHeight: 480 }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold" style={{ color: colors.textMain }}>
                {editingGoalId ? "Edit Goal" : "Add Goal"}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Goal Name */}
              <View className="mb-4">
                <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                  Goal Name
                </Text>
                <TextInput
                  value={goalName}
                  onChangeText={setGoalName}
                  placeholder="e.g. Buy MacBook Pro"
                  placeholderTextColor={colors.textFaint}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textMain,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              {/* Target Amount */}
              <View className="mb-4">
                <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                  Target Amount ({CURRENCY_SYMBOL})
                </Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="e.g. 180000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textFaint}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textMain,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              {/* Current Saved */}
              <View className="mb-4">
                <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                  Current Saved ({CURRENCY_SYMBOL})
                </Text>
                <TextInput
                  value={currentSavedAmount}
                  onChangeText={setCurrentSavedAmount}
                  placeholder="e.g. 45000"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textFaint}
                  className="px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textMain,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>

              {/* Target Date (Year / Month) */}
              <View className="mb-4 flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                    Target Year
                  </Text>
                  <TextInput
                    value={targetYear}
                    onChangeText={setTargetYear}
                    placeholder="2027"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textFaint}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textMain,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                    Target Month (01-12)
                  </Text>
                  <TextInput
                    value={targetMonth}
                    onChangeText={setTargetMonth}
                    placeholder="12"
                    keyboardType="numeric"
                    maxLength={2}
                    placeholderTextColor={colors.textFaint}
                    className="px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textMain,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                </View>
              </View>

              {/* Goal Type Category */}
              <View className="mb-6">
                <Text className="text-xs font-bold mb-2 uppercase" style={{ color: colors.textSecondary }}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                  {GOAL_TYPES.map((type) => {
                    const isSelected = goalType === type.value;
                    return (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() => setGoalType(type.value)}
                        className="px-4 py-2.5 rounded-full mr-2 flex-row items-center"
                        style={{
                          backgroundColor: isSelected ? colors.primary : colors.inputBg,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <MaterialIcons
                          name={type.icon}
                          size={14}
                          color={isSelected ? "#ffffff" : colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          className="text-xs font-bold"
                          style={{ color: isSelected ? "#ffffff" : colors.textSecondary }}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                className="w-full py-4 rounded-2xl items-center"
                style={{ backgroundColor: colors.primary }}
              >
                {createGoalMutation.isPending || updateGoalMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {editingGoalId ? "Save Changes" : "Create Goal"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}