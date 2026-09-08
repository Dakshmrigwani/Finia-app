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

export type TransactionSource = "PDF" | "SMS" | "BANK_API" | "MANUAL";

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
  budget?: { id: string; category: string } | null;
  note: string | null;
  source?: TransactionSource;
  importFingerprint?: string | null;
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

export type CreateTransactionPayload = {
  title: string;
  description?: string | null;
  amount: number;
  type: TransactionType;
  direction: TransactionDirection;
  category: TransactionCategory;
  date: string;
  recurrence?: TransactionRecurrence;
  note?: string | null;
  budgetId?: string | null;
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

export type PdfImportResponse = {
  success: boolean;
  totalExtracted: number;
  inserted: number;
  duplicates: number;
  failed: number;
};

export type PdfUploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

export type PaginatedTransactions = {
  results: Transaction[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export type PaginatedData = PaginatedTransactions;

type ApiResponse<T> = {
  success?: boolean;
  status?: string;
  message?: string;
  data: T;
};

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedTransactions> {
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

  const { data } = await apiClient.get<ApiResponse<PaginatedTransactions>>(
    "/transaction",
    { params }
  );
  return data.data;
}

export async function getTransactionById(
  transactionId: string
): Promise<Transaction> {
  const { data } = await apiClient.get<ApiResponse<Transaction>>(
    `/transaction/${transactionId}`
  );
  return data.data;
}

export async function createTransaction(
  payload: CreateTransactionPayload
): Promise<Transaction> {
  const { data } = await apiClient.post<ApiResponse<Transaction>>(
    "/transaction",
    payload
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

export async function deleteTransaction(
  transactionId: string
): Promise<void> {
  await apiClient.delete(`/transaction/${transactionId}`);
}

export async function importPdfStatement(
  file: PdfUploadFile | Blob | FormData
): Promise<PdfImportResponse> {
  let formData: FormData;
  if (file instanceof FormData) {
    formData = file;
  } else if ("uri" in file) {
    formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name || "statement.pdf",
      type: file.type || "application/pdf",
    } as any);
  } else {
    formData = new FormData();
    formData.append("file", file, "statement.pdf");
  }

  const { data } = await apiClient.post<ApiResponse<PdfImportResponse>>(
    "/transaction/import/pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data.data;
}
