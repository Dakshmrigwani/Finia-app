import { apiClient } from "./client";

export type GoalPayload = {
  goalName: string;
  goalType?: string;
  coverImage?: string;
  targetAmount: number;
  currentSavedAmount?: number;
  targetDate: string; // ISO String
  smartSaverEnabled?: boolean;
  automationMinBalance?: number;
  automationFrequency?: string;
};

export type Goal = {
  id: string;
  userId: string;
  goalName: string;
  goalType: string;
  coverImage?: string;
  targetAmount: number;
  currentSavedAmount: number;
  targetDate: string; // ISO String
  projectedCompletionDate?: string;
  status: string;
  smartSaverEnabled: boolean;
  automationMinBalance?: number;
  automationFrequency?: string;
  createdVia: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getGoals(): Promise<Goal[]> {
  const { data } = await apiClient.get<ApiResponse<Goal[]>>("/goal");
  return data.data;
}

export async function createGoal(payload: GoalPayload): Promise<Goal> {
  const { data } = await apiClient.post<ApiResponse<Goal>>("/goal", payload);
  return data.data;
}

export async function updateGoal(id: string, payload: Partial<GoalPayload>): Promise<Goal> {
  const { data } = await apiClient.patch<ApiResponse<Goal>>(`/goal/${id}`, payload);
  return data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goal/${id}`);
}
