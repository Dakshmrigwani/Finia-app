import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { storageKeys } from "../constants/storageKeys";
import { Logger } from "../utils/logger";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export type ApiErrorPayload = {
  message: string;
  status?: number;
  data?: unknown;
};

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor({ message, status, data }: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Extend axios config to carry a retry flag
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Bare axios instance for the refresh call itself — must NOT go through
// the response interceptor below, or a failed refresh recurses into itself.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Single-flight lock: only one refresh call in flight at a time,
// every other 401'd request awaits the same promise.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(storageKeys.refreshToken);
    if (!refreshToken) {
      throw new ApiError({ message: "No refresh token available", status: 401 });
    }

    try {
      const { data } = await refreshClient.post("/auth/refresh", { refreshToken });
      // Adjust these field names to match your backend's actual response shape
      const newAccessToken: string = data.accessToken;
      const newRefreshToken: string | undefined = data.refreshToken;

      await SecureStore.setItemAsync(storageKeys.authToken, newAccessToken);
      if (newRefreshToken) {
        await SecureStore.setItemAsync(storageKeys.refreshToken, newRefreshToken);
      }

      return newAccessToken;
    } catch (err) {
      // Refresh token is dead — clear everything, caller decides what to do next
      await SecureStore.deleteItemAsync(storageKeys.authToken);
      await SecureStore.deleteItemAsync(storageKeys.refreshToken);
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(storageKeys.authToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    // Attempt refresh-and-retry exactly once per request
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        Logger.error("Token refresh failed", refreshError as Error, {
          url: originalRequest.url,
        });
        // Session is dead. Fire an event or callback here so the app
        // can redirect to /(auth)/login — this file has no router access.
        throw new ApiError({
          message: "Session expired. Please log in again.",
          status: 401,
        });
      }
    }

    let message = error.message || "Request failed";

    if (responseData && typeof responseData === "object" && "message" in responseData) {
      const backendMessage = (responseData as Record<string, unknown>).message;
      if (typeof backendMessage === "string") {
        message = backendMessage;
      }
    }

    Logger.error("API request failed", error, {
      status,
      url: error.config?.url,
      method: error.config?.method,
    });

    throw new ApiError({
      message,
      status,
      data: responseData,
    });
  },
);