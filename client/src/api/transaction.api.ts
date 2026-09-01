import { apiClient } from "./client";

// ─── Enum Types ────────────────────────────────────────────────────────────────

export type TransactionType =
  | "FIXED"
  | "RECURRING"
  | "VARIABLE"
  | "WEALTH_MOVEMENT";

export type TransactionDirection = "INCOME" | "EXPENSE" | "TRANSFER";

export type TransactionRecurrence =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "NONE";

export type TransactionCategory =
  // FIXED
  | "RENT"
  | "MORTGAGE"
  | "INSURANCE"
  | "SUBSCRIPTION"
  | "EMI"
  | "SALARY"
  // RECURRING
  | "UTILITIES"
  | "INTERNET"
  | "MOBILE_PLAN"
  | "GYM"
  | "STREAMING"
  | "SIP"
  // VARIABLE
  | "FOOD"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "TRAVEL"
  | "HEALTHCARE"
  | "FUEL"
  // WEALTH_MOVEMENT
  | "TRANSFER"
  | "INVESTMENT"
  | "WITHDRAWAL"
  | "TOP_UP"
  | "DIVIDEND"
  // ANY
  | "OTHER";

// ─── Category map per type ─────────────────────────────────────────────────────

export const CATEGORIES_BY_TYPE: Record<TransactionType, TransactionCategory[]> = {
  FIXED: ["RENT", "MORTGAGE", "INSURANCE", "SUBSCRIPTION", "EMI", "SALARY", "OTHER"],
  RECURRING: ["UTILITIES", "INTERNET", "MOBILE_PLAN", "GYM", "STREAMING", "SIP", "OTHER"],
  VARIABLE: ["FOOD", "SHOPPING", "ENTERTAINMENT", "TRAVEL", "HEALTHCARE", "FUEL", "OTHER"],
  WEALTH_MOVEMENT: ["TRANSFER", "INVESTMENT", "WITHDRAWAL", "TOP_UP", "DIVIDEND", "OTHER"],
};

export const ALL_CATEGORIES: TransactionCategory[] = [
  "RENT", "MORTGAGE", "INSURANCE", "SUBSCRIPTION", "EMI", "SALARY",
  "UTILITIES", "INTERNET", "MOBILE_PLAN", "GYM", "STREAMING", "SIP",
  "FOOD", "SHOPPING", "ENTERTAINMENT", "TRAVEL", "HEALTHCARE", "FUEL",
  "TRANSFER", "INVESTMENT", "WITHDRAWAL", "TOP_UP", "DIVIDEND", "OTHER",
];

// ─── Data Shape ────────────────────────────────────────────────────────────────

export type Transaction = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  amount: string;
  type: TransactionType;
  direction: TransactionDirection;
  category: TransactionCategory;
  recurrence: TransactionRecurrence;
  date: string;
  budgetId: string | null;
  budget: { id: string; category: string } | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Request / Response shapes ─────────────────────────────────────────────────

export type TransactionFilters = {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  date?: string;
  month?: number;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  type?: TransactionType | "";
  direction?: TransactionDirection | "";
  category?: TransactionCategory | "";
  budgetId?: string;
};

export type TransactionUpdatePayload = {
  title?: string;
  description?: string | null;
  note?: string | null;
  type?: TransactionType;
  direction?: TransactionDirection;
  category?: TransactionCategory;
  recurrence?: TransactionRecurrence;
  amount?: number;
  date?: string;
  budgetId?: string | null;
};

type PaginatedData = {
  results: Transaction[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedData> {
  const params: Record<string, string | number> = {};
  (Object.keys(filters) as (keyof TransactionFilters)[]).forEach((key) => {
    const val = filters[key];
    if (
      val !== undefined &&
      val !== "" &&
      val !== null &&
      !(typeof val === "number" && Number.isNaN(val))
    ) {
      params[key] = val as string | number;
    }
  });

  const { data } = await apiClient.get<ApiResponse<PaginatedData>>(
    "/transaction",
    { params }
  );
  return data.data;
}

export async function updateTransaction(
  id: string,
  payload: TransactionUpdatePayload
): Promise<Transaction> {
  const { data } = await apiClient.patch<ApiResponse<Transaction>>(
    `/transaction/${id}`,
    payload
  );
  return data.data;
}
