import { apiClient } from "./client";

export type BudgetPayload = {
  category: string;
  amount: number;
  limit: number;
};

export type Budget = {
  id: string;
  userId: string;
  category: string;
  amount: number;
  limit: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
  meta: unknown;
};

export async function getBudgets(): Promise<Budget[]> {
  const { data } = await apiClient.get<ApiResponse<Budget[]>>("/budget");
  return data.data;
}

export async function createBudget(payload: BudgetPayload): Promise<Budget> {
  const { data } = await apiClient.post<ApiResponse<Budget>>("/budget", payload);
  return data.data;
}

export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/budget/${id}/`);
}

export async function updateBudget(id: string, payload: Partial<BudgetPayload>): Promise<Budget> {
  const { data } = await apiClient.patch<ApiResponse<Budget>>(`/budget/${id}/`, payload);
  return data.data;
}
