import { apiClient } from "./client";
import { AuthUser, UpdateProfilePayload, updateUserProfile } from "./user.api";

export type { AuthUser, UpdateProfilePayload };
export { updateUserProfile };

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  tokens: {
    access: {
      token: string;
    };
    refresh: {
      token: string;
    };
  };
  user: AuthUser;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return data.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return data.data;
}
