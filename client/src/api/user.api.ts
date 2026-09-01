import { apiClient } from "./client";

export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
  dob?: string;
  income?: number;
  maritalStatus?: string;
  martialStatus?: string;
  motive?: string;
  avatarUrl?: string;
  spendMostlyOn?: string;
  spendMostly?: string;
  currency?: string;
  theme?: string;
  notifications?: boolean;
  biometric?: boolean;
  twoFactor?: boolean;
  aiNudges?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfilePayload = {
  name?: string;
  dob?: string;
  income?: number;
  maritalStatus?: string;
  martialStatus?: string;
  motive?: string;
  avatarUrl?: string;
  spendMostlyOn?: string;
  spendMostly?: string;
  currency?: string;
  theme?: string;
  notifications?: boolean;
  biometric?: boolean;
  twoFactor?: boolean;
  aiNudges?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getUserProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>("/user/profile");
  return data.data;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await apiClient.patch<ApiResponse<AuthUser>>("/user/profile", payload);
  return data.data;
}

export async function deleteUserProfile(): Promise<void> {
  await apiClient.delete("/user/profile");
}
