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

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    // ✅ Safe fallback check for network errors (no response from server)
    const status = error.response?.status;
    const responseData = error.response?.data;

    let message = error.message || "Request failed";

    // ✅ Safe TypeScript verification for backend custom errors
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
