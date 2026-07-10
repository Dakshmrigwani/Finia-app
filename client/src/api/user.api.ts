import { apiClient } from "./client";
import type { AuthUser } from "./auth.api";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getUserProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>("/user/profile");
  return data.data;
}
