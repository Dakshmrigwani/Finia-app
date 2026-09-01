import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/themeContext";
import { useTransactions } from "../../queries/transaction/useTransactions";
import { useUpdateTransactionMutation } from "../../mutations/transaction/useUpdateTransactionMutation";
import {
  type Transaction,
  type TransactionFilters,
  type TransactionType,
  type TransactionDirection,
  type TransactionCategory,
  type TransactionRecurrence,
  type TransactionUpdatePayload,
  CATEGORIES_BY_TYPE,
  ALL_CATEGORIES,
} from "../../api/transaction.api";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCY = "₹";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TYPE_OPTIONS: { label: string; value: TransactionType | "" }[] = [
  { label: "All Types", value: "" },
  { label: "Fixed", value: "FIXED" },
  { label: "Recurring", value: "RECURRING" },
  { label: "Variable", value: "VARIABLE" },
  { label: "Wealth Movement", value: "WEALTH_MOVEMENT" },
];

const DIRECTION_OPTIONS: { label: string; value: TransactionDirection | "" }[] = [
  { label: "All Directions", value: "" },
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
  { label: "Transfer", value: "TRANSFER" },
];

const RECURRENCES: { label: string; value: TransactionRecurrence }[] = [
  { label: "None", value: "NONE" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Yearly", value: "YEARLY" },
];

const ALL_TYPES: TransactionType[] = ["FIXED", "RECURRING", "VARIABLE", "WEALTH_MOVEMENT"];

type ViewMode = "insights" | "all";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryIcon(cat: TransactionCategory): keyof typeof MaterialIcons.glyphMap {
  const map: Record<TransactionCategory, keyof typeof MaterialIcons.glyphMap> = {
    RENT: "home", MORTGAGE: "home", INSURANCE: "security",
    SUBSCRIPTION: "subscriptions", EMI: "credit-card",
    SALARY: "account-balance-wallet", UTILITIES: "bolt", INTERNET: "wifi",
    MOBILE_PLAN: "smartphone", GYM: "fitness-center", STREAMING: "theaters",
    SIP: "trending-up", FOOD: "restaurant", SHOPPING: "shopping-bag",
    ENTERTAINMENT: "sports-esports", TRAVEL: "flight",
    HEALTHCARE: "local-hospital", FUEL: "local-gas-station",
    TRANSFER: "swap-horiz", INVESTMENT: "show-chart", WITHDRAWAL: "money-off",
    TOP_UP: "add-circle", DIVIDEND: "payments", OTHER: "receipt",
  };
  return map[cat] ?? "receipt";
}

function categoryColors(dir: TransactionDirection): { icon: string; bg: string } {
  if (dir === "INCOME") return { icon: "#006c4f", bg: "#d1fae5" };
  if (dir === "TRANSFER") return { icon: "#2563eb", bg: "#dbeafe" };
  return { icon: "#7c3aed", bg: "#ede9fe" };
}

function formatAmount(amount: string, dir: TransactionDirection): string {
  const num = parseFloat(amount);
  const f = CURRENCY + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (dir === "INCOME") return "+" + f;
  if (dir === "TRANSFER") return f;
  return "-" + f;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function capitalize(s: string): string {
  return s.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

type DropdownOption<T extends string> = { label: string; value: T };

type DropdownProps<T extends string> = {
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onSelect: (v: T) => void;
  isDark: boolean;
};

function Dropdown<T extends string>({ label, options, value, onSelect, isDark }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const card = isDark ? "#2f2e43" : "#ffffff";
  const border = isDark ? "#3d3b54" : "#e2e0fc";
  const textPrimary = isDark ? "#f2efff" : "#1a1a2e";
  const textSecondary = isDark ? "#a5a3c0" : "#797588";
  const accent = "#6c47ff";
  const popupBg = isDark ? "#1e1d35" : "#ffffff";

  return (
    <View style={{ flex: 1, minWidth: 120 }}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: card,
          borderWidth: 1,
          borderColor: value ? accent : border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 6,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: textSecondary, fontSize: 9, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 1 }}>
            {label}
          </Text>
          <Text style={{ color: value ? accent : textPrimary, fontSize: 12, fontWeight: "600" as const }} numberOfLines={1}>
            {selected?.label ?? label}
          </Text>
        </View>
        <MaterialIcons name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={value ? accent : textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={{ backgroundColor: popupBg, borderRadius: 20, overflow: "hidden", width: "100%", maxWidth: 340 }}>
            <View style={{ paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: border }}>
              <Text style={{ color: textPrimary, fontWeight: "700" as const, fontSize: 15 }}>{label}</Text>
            </View>
            <ScrollView style={{ maxHeight: 320 }} bounces={false}>
              {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <TouchableOpacity
                    key={opt.value || "__none__"}
                    onPress={() => { onSelect(opt.value); setOpen(false); }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 18,
                      paddingVertical: 13,
                      borderBottomWidth: 1,
                      borderBottomColor: border,
                      backgroundColor: isActive ? (isDark ? "#2a2845" : "#f5f2ff") : "transparent",
                    }}
                  >
                    <Text style={{ color: isActive ? accent : textPrimary, fontWeight: isActive ? ("700" as const) : ("400" as const), fontSize: 14 }}>
                      {opt.label}
                    </Text>
                    {isActive && <MaterialIcons name="check" size={18} color={accent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Top 5 Row ────────────────────────────────────────────────────────────────

type Top5RowProps = {
  rank: number;
  item: Transaction;
  isDark: boolean;
  onPress: (t: Transaction) => void;
};

function Top5Row({ rank, item, isDark, onPress }: Top5RowProps) {
  const colors = categoryColors(item.direction);
  const icon = categoryIcon(item.category);
  const textPrimary = isDark ? "#f2efff" : "#1a1a2e";
  const textSecondary = isDark ? "#a5a3c0" : "#797588";
  const amtColor = item.direction === "INCOME" ? "#006c4f" : item.direction === "TRANSFER" ? "#2563eb" : "#ab0413";

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.75}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 12,
      }}
    >
      <Text style={{ color: textSecondary, fontSize: 13, fontWeight: "700" as const, width: 18, textAlign: "center" as const }}>
        {rank}
      </Text>
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <MaterialIcons name={icon} size={18} color={colors.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: textPrimary, fontWeight: "600" as const, fontSize: 13 }} numberOfLines={1}>{item.title}</Text>
        <Text style={{ color: textSecondary, fontSize: 11, marginTop: 1 }}>{capitalize(item.category)}</Text>
      </View>
      <Text style={{ color: amtColor, fontWeight: "700" as const, fontSize: 13 }}>
        {formatAmount(item.amount, item.direction)}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

type EditModalProps = {
  visible: boolean;
  transaction: Transaction | null;
  isDark: boolean;
  onClose: () => void;
  onSave: (id: string, payload: TransactionUpdatePayload) => void;
  isSaving: boolean;
};

function EditModal({ visible, transaction, isDark, onClose, onSave, isSaving }: EditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<TransactionType>("FIXED");
  const [direction, setDirection] = useState<TransactionDirection>("EXPENSE");
  const [category, setCategory] = useState<TransactionCategory>("OTHER");
  const [recurrence, setRecurrence] = useState<TransactionRecurrence>("NONE");

  React.useEffect(() => {
    if (transaction) {
      setTitle(transaction.title ?? "");
      setDescription(transaction.description ?? "");
      setNote(transaction.note ?? "");
      setType(transaction.type);
      setDirection(transaction.direction);
      setCategory(transaction.category);
      setRecurrence(transaction.recurrence);
    }
  }, [transaction]);

  React.useEffect(() => {
    const valid = CATEGORIES_BY_TYPE[type];
    if (!valid.includes(category)) setCategory(valid[0]);
  }, [type]);

  const availableCategories = CATEGORIES_BY_TYPE[type];

  const bg = isDark ? "#1a1a2e" : "#fcf8ff";
  const card = isDark ? "#2f2e43" : "#ffffff";
  const border = isDark ? "#3d3b54" : "#e2e0fc";
  const textPrimary = isDark ? "#f2efff" : "#1a1a2e";
  const textSecondary = isDark ? "#a5a3c0" : "#797588";
  const accent = "#6c47ff";

  const labelStyle = { color: textSecondary, fontSize: 11, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.7, marginTop: 16 };
  const inputStyle = { backgroundColor: card, borderColor: border, color: textPrimary, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 6, fontSize: 14 };

  function SelectRow<T extends string>({ options, value, onSelect }: { options: { label: string; value: T }[]; value: T; onSelect: (v: T) => void }) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8, backgroundColor: value === opt.value ? accent : isDark ? "#2f2e43" : "#f5f2ff", borderColor: value === opt.value ? accent : border }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600" as const, color: value === opt.value ? "#fff" : textSecondary }}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  function handleSave() {
    if (!transaction) return;
    if (!title.trim()) { Alert.alert("Validation", "Title cannot be empty."); return; }
    onSave(transaction.id, { title: title.trim(), description: description.trim() || null, note: note.trim() || null, type, direction, category, recurrence });
  }

  if (!transaction) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%", paddingBottom: Platform.OS === "ios" ? 40 : 24 }}>
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: border }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: border }}>
            <Text style={{ color: textPrimary, fontSize: 17, fontWeight: "700" as const }}>Edit Transaction</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={22} color={textSecondary} /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={labelStyle}>Title</Text>
            <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="Transaction title" placeholderTextColor={textSecondary} maxLength={255} />
            <Text style={labelStyle}>Description</Text>
            <TextInput style={[inputStyle, { minHeight: 72, textAlignVertical: "top" as const }]} value={description} onChangeText={setDescription} placeholder="Optional description" placeholderTextColor={textSecondary} multiline maxLength={1000} />
            <Text style={labelStyle}>Note</Text>
            <TextInput style={[inputStyle, { minHeight: 72, textAlignVertical: "top" as const }]} value={note} onChangeText={setNote} placeholder="Optional note" placeholderTextColor={textSecondary} multiline maxLength={2000} />
            <Text style={labelStyle}>Type</Text>
            <SelectRow<TransactionType> options={ALL_TYPES.map((t) => ({ label: capitalize(t), value: t }))} value={type} onSelect={setType} />
            <Text style={labelStyle}>Direction</Text>
            <SelectRow<TransactionDirection> options={[{ label: "Income", value: "INCOME" as const }, { label: "Expense", value: "EXPENSE" as const }, { label: "Transfer", value: "TRANSFER" as const }]} value={direction} onSelect={setDirection} />
            <Text style={labelStyle}>Category</Text>
            <SelectRow<TransactionCategory> options={availableCategories.map((c) => ({ label: capitalize(c), value: c }))} value={category} onSelect={setCategory} />
            <Text style={labelStyle}>Recurrence</Text>
            <SelectRow<TransactionRecurrence> options={RECURRENCES} value={recurrence} onSelect={setRecurrence} />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 8 }}>
              <TouchableOpacity onPress={onClose} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" as const, backgroundColor: isDark ? "#2f2e43" : "#f5f2ff", borderWidth: 1, borderColor: border }}>
                <Text style={{ color: textSecondary, fontWeight: "700" as const, fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: "center" as const, backgroundColor: accent, opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontWeight: "700" as const, fontSize: 15 }}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Transactions Screen
 * — Dropdown filters (Type, Direction, Category)
 * — Month/Year picker
 * — "Insights" view: Top 5 Spent + Top 5 Received for the month
 * — "All Transactions" view: infinite-scroll full list
 * — Edit bottom-sheet on tap
 */
export default function TransactionsScreen() {
  const { isDark } = useTheme();
  const now = new Date();

  // ── Date (only sent when selected by user) ──
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // ── Filters ──
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<TransactionDirection | "">("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | "">("");

  // ── View mode ──
  const [viewMode, setViewMode] = useState<ViewMode>("insights");

  // ── UI state ──
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(text), 400);
  };

  // ── Category options depend on type ──
  const categoryOptions: { label: string; value: TransactionCategory | "" }[] = useMemo(() => {
    const cats: TransactionCategory[] = typeFilter ? CATEGORIES_BY_TYPE[typeFilter] : ALL_CATEGORIES;
    return [{ label: "All Categories", value: "" }, ...cats.map((c) => ({ label: capitalize(c), value: c as TransactionCategory }))];
  }, [typeFilter]);

  React.useEffect(() => {
    if (categoryFilter && typeFilter) {
      const valid = CATEGORIES_BY_TYPE[typeFilter];
      if (!valid.includes(categoryFilter as TransactionCategory)) setCategoryFilter("");
    }
  }, [typeFilter]);

  // ── Filters for the current view ──
  // Only parameters explicitly passed / selected by user are included
  const insightFilters = useMemo(() => {
    const f: TransactionFilters = {
      sortBy: "amount:desc",
      limit: 100, // load enough to compute top 5
    };
    if (selectedMonth !== undefined) f.month = selectedMonth;
    if (selectedYear !== undefined) f.year = selectedYear;
    return f;
  }, [selectedMonth, selectedYear]);

  const allFilters = useMemo(() => {
    const f: TransactionFilters = {
      sortBy: "date:desc",
    };
    if (debouncedSearch.trim()) f.search = debouncedSearch.trim();
    if (directionFilter) f.direction = directionFilter;
    if (typeFilter) f.type = typeFilter;
    if (categoryFilter) f.category = categoryFilter;
    if (selectedMonth !== undefined) f.month = selectedMonth;
    if (selectedYear !== undefined) f.year = selectedYear;
    return f;
  }, [debouncedSearch, directionFilter, typeFilter, categoryFilter, selectedMonth, selectedYear]);

  // ── Insight query (always month-scoped) ──
  const insightQuery = useTransactions(insightFilters);
  // ── All-transactions query ──
  const allQuery = useTransactions(allFilters);

  const insightTransactions = useMemo(() => insightQuery.data?.pages.flatMap((p) => p.results) ?? [], [insightQuery.data]);
  const allTransactions = useMemo(() => allQuery.data?.pages.flatMap((p) => p.results) ?? [], [allQuery.data]);
  const totalRecords = allQuery.data?.pages[0]?.totalRecords ?? 0;

  // ── Top 5 Spent (expense, sorted by amount desc) ──
  const top5Spent = useMemo(() =>
    [...insightTransactions]
      .filter((t) => t.direction === "EXPENSE")
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5),
    [insightTransactions]
  );

  // ── Top 5 Received (income, sorted by amount desc) ──
  const top5Received = useMemo(() =>
    [...insightTransactions]
      .filter((t) => t.direction === "INCOME")
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5),
    [insightTransactions]
  );

  // ── Summary totals ──
  const { totalIncome, totalExpense } = useMemo(() => {
    let inc = 0; let exp = 0;
    insightTransactions.forEach((t) => {
      const amt = parseFloat(t.amount);
      if (t.direction === "INCOME") inc += amt;
      else if (t.direction === "EXPENSE") exp += amt;
    });
    return { totalIncome: inc, totalExpense: exp };
  }, [insightTransactions]);

  // ── Mutation ──
  const updateMutation = useUpdateTransactionMutation();

  const handleSave = useCallback((id: string, payload: TransactionUpdatePayload) => {
    updateMutation.mutate({ id, payload }, {
      onSuccess: () => setEditingTransaction(null),
      onError: (err: unknown) => Alert.alert("Error", err instanceof Error ? err.message : "Failed to update transaction"),
    });
  }, [updateMutation]);

  // ── Colors ──
  const bg = isDark ? "#1a1a2e" : "#fcf8ff";
  const card = isDark ? "#2f2e43" : "#ffffff";
  const border = isDark ? "#3d3b54" : "#e2e0fc";
  const textPrimary = isDark ? "#f2efff" : "#1a1a2e";
  const textSecondary = isDark ? "#a5a3c0" : "#797588";
  const accent = "#6c47ff";

  const years = useMemo(() => { const y = now.getFullYear(); return [y - 2, y - 1, y, y + 1]; }, []);

  // ── Render transaction item (used in "all" mode) ──
  const renderItem = useCallback(({ item }: { item: Transaction }) => {
    const colors = categoryColors(item.direction);
    const icon = categoryIcon(item.category);
    const amtStr = formatAmount(item.amount, item.direction);
    const amtColor = item.direction === "INCOME" ? "#006c4f" : item.direction === "TRANSFER" ? "#2563eb" : isDark ? "#f2efff" : "#1a1a2e";

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setEditingTransaction(item)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, backgroundColor: card, marginBottom: 10, shadowColor: "#1a1a2e", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
            <MaterialIcons name={icon} size={22} color={colors.icon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textPrimary, fontWeight: "700" as const, fontSize: 14 }} numberOfLines={1}>{item.title}</Text>
            <Text style={{ color: textSecondary, fontSize: 12, marginTop: 1 }}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: amtColor, fontWeight: "700" as const, fontSize: 14 }}>{amtStr}</Text>
          <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 4 }}>
            <Text style={{ color: colors.icon, fontSize: 9, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
              {capitalize(item.category)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isDark, card, textPrimary, textSecondary]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  // ── Shared header (search + dropdowns + month picker + view toggle) ──
  const SharedHeader = useCallback(() => (
    <View style={{ paddingTop: 4, paddingBottom: 8 }}>
      {/* Summary Cards */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1, borderRadius: 20, padding: 16, backgroundColor: card, shadowColor: "#1a1a2e", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <MaterialIcons name="trending-down" size={16} color="#ab0413" />
            <Text style={{ color: textSecondary, fontSize: 9, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.8 }}>Spent</Text>
          </View>
          <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "800" as const }}>
            {CURRENCY}{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={{ flex: 1, borderRadius: 20, padding: 16, backgroundColor: card, shadowColor: "#1a1a2e", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <MaterialIcons name="trending-up" size={16} color="#006c4f" />
            <Text style={{ color: textSecondary, fontSize: 9, fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.8 }}>Income</Text>
          </View>
          <Text style={{ color: "#006c4f", fontSize: 18, fontWeight: "800" as const }}>
            {CURRENCY}{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Month/Year Picker and Clear */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <TouchableOpacity
          onPress={() => setShowMonthPicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: card,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: selectedMonth !== undefined || selectedYear !== undefined ? accent : border,
            gap: 6,
          }}
        >
          <MaterialIcons
            name="calendar-today"
            size={15}
            color={selectedMonth !== undefined || selectedYear !== undefined ? accent : textSecondary}
          />
          <Text
            style={{
              color: selectedMonth !== undefined || selectedYear !== undefined ? accent : textPrimary,
              fontWeight: "700" as const,
              fontSize: 13,
            }}
          >
            {selectedMonth !== undefined && selectedYear !== undefined
              ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
              : selectedYear !== undefined
                ? `${selectedYear}`
                : "All Time"}
          </Text>
          <MaterialIcons name="expand-more" size={17} color={textSecondary} />
        </TouchableOpacity>

        {(selectedMonth !== undefined || selectedYear !== undefined) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedMonth(undefined);
              setSelectedYear(undefined);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#2f2e43" : "#f0eeff",
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 6,
              gap: 4,
            }}
          >
            <MaterialIcons name="close" size={14} color={textSecondary} />
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "600" as const }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdowns row */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        <Dropdown<TransactionDirection | "">
          label="Direction"
          options={DIRECTION_OPTIONS}
          value={directionFilter}
          onSelect={setDirectionFilter}
          isDark={isDark}
        />
        <Dropdown<TransactionType | "">
          label="Type"
          options={TYPE_OPTIONS}
          value={typeFilter}
          onSelect={setTypeFilter}
          isDark={isDark}
        />
        <Dropdown<TransactionCategory | "">
          label="Category"
          options={categoryOptions}
          value={categoryFilter}
          onSelect={(v) => setCategoryFilter(v)}
          isDark={isDark}
        />
      </View>

      {/* View Mode Toggle */}
      <View style={{ flexDirection: "row", backgroundColor: isDark ? "#2f2e43" : "#f0eeff", borderRadius: 14, padding: 4, marginBottom: 4 }}>
        <TouchableOpacity
          onPress={() => setViewMode("insights")}
          style={{ flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center", backgroundColor: viewMode === "insights" ? accent : "transparent" }}
        >
          <Text style={{ color: viewMode === "insights" ? "#fff" : textSecondary, fontWeight: "700" as const, fontSize: 12 }}>
            ⚡ Insights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("all")}
          style={{ flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center", backgroundColor: viewMode === "all" ? accent : "transparent" }}
        >
          <Text style={{ color: viewMode === "all" ? "#fff" : textSecondary, fontWeight: "700" as const, fontSize: 12 }}>
            All Transactions
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [card, border, textPrimary, textSecondary, isDark, accent, totalExpense, totalIncome, selectedMonth, selectedYear, directionFilter, typeFilter, categoryFilter, categoryOptions, viewMode]);

  // ── Insights view content ──
  const InsightsContent = useCallback(() => {
    if (insightQuery.isLoading) {
      return <View style={{ paddingTop: 40, alignItems: "center" }}><ActivityIndicator color={accent} size="large" /></View>;
    }

    const periodSubtitle =
      selectedMonth !== undefined && selectedYear !== undefined
        ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
        : selectedYear !== undefined
          ? `${selectedYear}`
          : "All Time";

    const sectionCard = { backgroundColor: card, borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: "#1a1a2e", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 };
    const sectionTitle = { fontWeight: "700" as const, fontSize: 14, color: textPrimary, marginBottom: 2 };
    const sectionSub = { fontSize: 11, color: textSecondary, marginBottom: 12 };

    return (
      <View>
        {/* Top 5 Spent */}
        <View style={sectionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "#ffe4e6", alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="trending-down" size={16} color="#ab0413" />
            </View>
            <View>
              <Text style={sectionTitle}>Top 5 Spent</Text>
              <Text style={sectionSub}>{periodSubtitle}</Text>
            </View>
          </View>
          {top5Spent.length === 0 ? (
            <Text style={{ color: textSecondary, fontSize: 13, textAlign: "center", paddingVertical: 16 }}>No expense transactions found</Text>
          ) : (
            top5Spent.map((t, i) => (
              <View key={t.id}>
                <Top5Row rank={i + 1} item={t} isDark={isDark} onPress={setEditingTransaction} />
                {i < top5Spent.length - 1 && <View style={{ height: 1, backgroundColor: border, marginLeft: 30 }} />}
              </View>
            ))
          )}
        </View>

        {/* Top 5 Received */}
        <View style={sectionCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center" }}>
              <MaterialIcons name="trending-up" size={16} color="#006c4f" />
            </View>
            <View>
              <Text style={sectionTitle}>Top 5 Received</Text>
              <Text style={sectionSub}>{periodSubtitle}</Text>
            </View>
          </View>
          {top5Received.length === 0 ? (
            <Text style={{ color: textSecondary, fontSize: 13, textAlign: "center", paddingVertical: 16 }}>No income transactions found</Text>
          ) : (
            top5Received.map((t, i) => (
              <View key={t.id}>
                <Top5Row rank={i + 1} item={t} isDark={isDark} onPress={setEditingTransaction} />
                {i < top5Received.length - 1 && <View style={{ height: 1, backgroundColor: border, marginLeft: 30 }} />}
              </View>
            ))
          )}
        </View>

        {/* CTA to view all */}
        <TouchableOpacity
          onPress={() => setViewMode("all")}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: accent, marginBottom: 8 }}
        >
          <MaterialIcons name="list" size={18} color={accent} />
          <Text style={{ color: accent, fontWeight: "700" as const, fontSize: 14 }}>View All Transactions</Text>
        </TouchableOpacity>
      </View>
    );
  }, [insightQuery.isLoading, card, border, textPrimary, textSecondary, isDark, accent, selectedMonth, selectedYear, top5Spent, top5Received]);

  // ── All-transactions list sub-components ──
  const ListFooter = useCallback(() => {
    if (allQuery.isFetchingNextPage) return <View style={{ paddingVertical: 20, alignItems: "center" }}><ActivityIndicator color={accent} /></View>;
    if (!allQuery.hasNextPage && allTransactions.length > 0)
      return <Text style={{ textAlign: "center", color: textSecondary, fontSize: 12, paddingVertical: 16 }}>All {totalRecords} transactions loaded</Text>;
    return null;
  }, [allQuery.isFetchingNextPage, allQuery.hasNextPage, allTransactions.length, totalRecords, textSecondary]);

  const ListEmpty = useCallback(() => {
    if (allQuery.isLoading) return <View style={{ alignItems: "center", paddingTop: 40 }}><ActivityIndicator color={accent} size="large" /></View>;
    if (allQuery.isError) return (
      <View style={{ alignItems: "center", paddingTop: 40 }}>
        <MaterialIcons name="error-outline" size={48} color={textSecondary} />
        <Text style={{ color: textSecondary, marginTop: 12, fontWeight: "700" as const }}>Failed to load</Text>
        <TouchableOpacity onPress={() => allQuery.refetch()} style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: accent }}>
          <Text style={{ color: "#fff", fontWeight: "700" as const }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View style={{ alignItems: "center", paddingTop: 40 }}>
        <MaterialIcons name="receipt-long" size={48} color={textSecondary} />
        <Text style={{ color: textSecondary, marginTop: 12, fontWeight: "700" as const }}>No transactions found</Text>
        <Text style={{ color: textSecondary, fontSize: 12, marginTop: 4 }}>Try adjusting your filters</Text>
      </View>
    );
  }, [allQuery.isLoading, allQuery.isError, textSecondary, allQuery.refetch]);

  // ── Unified ListHeader component ──
  const ListHeader = useCallback(() => (
    <>
      <SharedHeader />
      {viewMode === "insights" ? (
        <InsightsContent />
      ) : (
        <Text style={{ color: textSecondary, fontSize: 12, marginBottom: 10 }}>
          {totalRecords} transaction{totalRecords !== 1 ? "s" : ""}
        </Text>
      )}
    </>
  ), [SharedHeader, InsightsContent, viewMode, textSecondary, totalRecords]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: card, borderRadius: 14, borderWidth: 1, borderColor: border, paddingHorizontal: 14, shadowColor: "#1a1a2e", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}>
          <MaterialIcons name="search" size={20} color={textSecondary} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={textSecondary}
            value={searchText}
            onChangeText={handleSearchChange}
            style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 12, color: textPrimary, fontSize: 14 }}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(""); setDebouncedSearch(""); }}>
              <MaterialIcons name="close" size={18} color={textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FlatList — shows items only in "all" mode, but header is always shown */}
      <FlatList
        data={viewMode === "all" ? allTransactions : []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={viewMode === "all" ? ListFooter : null}
        ListEmptyComponent={viewMode === "all" ? ListEmpty : null}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130, flexGrow: 1 }}
        onEndReached={() => {
          if (viewMode === "all" && allQuery.hasNextPage && !allQuery.isFetchingNextPage) allQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={(viewMode === "insights" ? insightQuery.isRefetching : allQuery.isRefetching)}
            onRefresh={() => { insightQuery.refetch(); allQuery.refetch(); }}
            tintColor={accent}
            colors={[accent]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Month / Year Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={{ backgroundColor: isDark ? "#2f2e43" : "#fff", borderRadius: 24, padding: 24, width: "86%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ color: textPrimary, fontWeight: "800" as const, fontSize: 16 }}>Select Period</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <MaterialIcons name="close" size={20} color={textSecondary} />
              </TouchableOpacity>
            </View>

            {/* All Time (No Date filter) */}
            <TouchableOpacity
              onPress={() => {
                setSelectedMonth(undefined);
                setSelectedYear(undefined);
                setShowMonthPicker(false);
              }}
              style={{
                paddingVertical: 10,
                alignItems: "center",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedMonth === undefined && selectedYear === undefined ? accent : border,
                backgroundColor: selectedMonth === undefined && selectedYear === undefined ? accent : "transparent",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: selectedMonth === undefined && selectedYear === undefined ? "#fff" : textSecondary,
                  fontWeight: "700" as const,
                  fontSize: 13,
                }}
              >
                All Time (No Date Filter)
              </Text>
            </TouchableOpacity>

            {/* Year selection */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700" as const, textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: 0.5 }}>
              Year
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {years.map((y) => {
                const isActive = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setSelectedYear(isActive ? undefined : y)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isActive ? accent : border,
                      backgroundColor: isActive ? accent : "transparent",
                    }}
                  >
                    <Text style={{ color: isActive ? "#fff" : textSecondary, fontWeight: "700" as const }}>{y}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month selection */}
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: "700" as const, textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: 0.5 }}>
              Month
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {MONTHS.map((m, idx) => {
                const mNum = idx + 1;
                const isActive = selectedMonth === mNum;
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => {
                      setSelectedMonth(isActive ? undefined : mNum);
                      if (!selectedYear) setSelectedYear(now.getFullYear());
                      setShowMonthPicker(false);
                    }}
                    style={{
                      width: "29%",
                      paddingVertical: 9,
                      alignItems: "center",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isActive ? accent : border,
                      backgroundColor: isActive ? accent : "transparent",
                    }}
                  >
                    <Text style={{ color: isActive ? "#fff" : textSecondary, fontWeight: "700" as const, fontSize: 12 }}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Bottom Sheet */}
      <EditModal
        visible={!!editingTransaction}
        transaction={editingTransaction}
        isDark={isDark}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSave}
        isSaving={updateMutation.isPending}
      />
    </SafeAreaView>
  );
}
