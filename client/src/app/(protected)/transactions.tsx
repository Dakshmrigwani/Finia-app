import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";

type TransactionItem = {
  id: string;
  name: string;
  date: string;
  amount: number;
  category: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  categoryColor: string;
  categoryBg: string;
  type: "expense" | "income";
};

type FilterType = "all" | "expense" | "income";

const sampleTransactions: TransactionItem[] = [
  {
    id: "1",
    name: "Starbucks Reserve",
    date: "Today • 08:45 AM",
    amount: -12.4,
    category: "Food",
    icon: "local-cafe",
    categoryColor: "#d97706",
    categoryBg: "#fef3c7",
    type: "expense",
  },
  {
    id: "2",
    name: "Apple Store",
    date: "Yesterday • 04:20 PM",
    amount: -199.0,
    category: "Shopping",
    icon: "shopping-bag",
    categoryColor: "#2563eb",
    categoryBg: "#dbeafe",
    type: "expense",
  },
  {
    id: "3",
    name: "Uber Central",
    date: "Oct 22 • 09:12 PM",
    amount: -34.2,
    category: "Travel",
    icon: "directions-car",
    categoryColor: "#059669",
    categoryBg: "#d1fae5",
    type: "expense",
  },
  {
    id: "4",
    name: "Salary Deposit",
    date: "Oct 21 • 12:00 AM",
    amount: 4200.0,
    category: "Income",
    icon: "account-balance-wallet",
    categoryColor: "#006c4f",
    categoryBg: "#60fcc6",
    type: "income",
  },
  {
    id: "5",
    name: "ConEd Electric",
    date: "Oct 20 • 10:15 AM",
    amount: -145.0,
    category: "Bills",
    icon: "bolt",
    categoryColor: "#e11d48",
    categoryBg: "#ffe4e6",
    type: "expense",
  },
  {
    id: "6",
    name: "Netflix Subscription",
    date: "Oct 19 • 02:00 AM",
    amount: -15.99,
    category: "Entertainment",
    icon: "theaters",
    categoryColor: "#7c3aed",
    categoryBg: "#ede9fe",
    type: "expense",
  },
  {
    id: "7",
    name: "Grocery Store",
    date: "Oct 18 • 06:30 PM",
    amount: -87.5,
    category: "Food",
    icon: "local-grocery-store",
    categoryColor: "#d97706",
    categoryBg: "#fef3c7",
    type: "expense",
  },
  {
    id: "8",
    name: "Freelance Project",
    date: "Oct 17 • 03:15 PM",
    amount: 500.0,
    category: "Income",
    icon: "work",
    categoryColor: "#059669",
    categoryBg: "#d1fae5",
    type: "income",
  },
];

/**
 * Transactions Screen
 * Displays detailed transaction history with filtering and search functionality
 */
export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = sampleTransactions.filter((transaction) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "expense" && transaction.type === "expense") ||
      (filter === "income" && transaction.type === "income");
    const matchesSearch =
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalExpense = sampleTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIncome = sampleTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`flex-row items-center justify-between p-4 rounded-xl ${isDark ? "bg-[#2f2e43]" : "bg-white"} mb-3 shadow-sm`}
      style={{
        shadowColor: "#1a1a2e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center"
          style={{ backgroundColor: item.categoryBg }}
        >
          <MaterialIcons
            name={item.icon}
            size={22}
            color={item.categoryColor}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            {item.name}
          </Text>
          <Text
            className={`text-xs ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
          >
            {item.date}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`font-headline font-bold ${
            item.amount > 0
              ? "text-[#006c4f]"
              : isDark
                ? "text-[#f2efff]"
                : "text-[#1a1a2e]"
          }`}
        >
          {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <View
          className="px-2 py-0.5 rounded-full mt-1"
          style={{ backgroundColor: item.categoryBg }}
        >
          <Text
            className="text-[9px] font-label font-bold uppercase"
            style={{ color: item.categoryColor }}
          >
            {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          Transactions
        </Text>
      </View>

      {/* Summary Cards */}
      <View className="px-5 py-4 flex-row gap-3">
        <View
          className={`flex-1 rounded-2xl p-4 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
          style={{
            shadowColor: "#1a1a2e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="trending-down" size={18} color="#ab0413" />
            <Text
              className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
            >
              Total Spent
            </Text>
          </View>
          <Text
            className={`text-xl font-headline font-bold ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          >
            ${totalExpense.toFixed(2)}
          </Text>
        </View>
        <View
          className={`flex-1 rounded-2xl p-4 ${isDark ? "bg-[#2f2e43]" : "bg-white"} shadow-sm`}
          style={{
            shadowColor: "#1a1a2e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="trending-up" size={18} color="#006c4f" />
            <Text
              className={`text-xs font-label uppercase tracking-wider ${isDark ? "text-[#a5a3c0]" : "text-[#484556]"}`}
            >
              Total Income
            </Text>
          </View>
          <Text className={`text-xl font-headline font-bold text-[#006c4f]`}>
            ${totalIncome.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 pb-4">
        <View
          className={`flex-row items-center rounded-xl px-4 ${isDark ? "bg-[#2f2e43]" : "bg-white"} border ${isDark ? "border-[#3d3b54]" : "border-[#e2e0fc]"}`}
          style={{
            shadowColor: "#1a1a2e",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 1,
          }}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={isDark ? "#a5a3c0" : "#797588"}
          />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? "#a5a3c0" : "#a0a0a0"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`flex-1 px-3 py-3 ${isDark ? "text-[#f2efff]" : "text-[#1a1a2e]"}`}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View className="px-5 pb-4 flex-row gap-2">
        {["all", "expense", "income"].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            onPress={() => setFilter(filterOption as FilterType)}
            className={`px-4 py-2 rounded-full border ${
              filter === filterOption
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
                filter === filterOption
                  ? "text-white"
                  : isDark
                    ? "text-[#a5a3c0]"
                    : "text-[#797588]"
              }`}
            >
              {filterOption === "all"
                ? "All"
                : filterOption === "expense"
                  ? "Expenses"
                  : "Income"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons
            name="receipt-long"
            size={48}
            color={isDark ? "#a5a3c0" : "#c9c3d9"}
          />
          <Text
            className={`text-center mt-4 font-headline font-bold ${isDark ? "text-[#a5a3c0]" : "text-[#797588]"}`}
          >
            No transactions found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
