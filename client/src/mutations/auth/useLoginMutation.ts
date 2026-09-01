import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { login, type LoginPayload } from "../../api/auth.api";
import { queryKeys } from "../../constants/queryKeys";
import { storageKeys } from "../../constants/storageKeys";
import { setToken, setUser } from "../../store/Slices/authSlice";
import { Logger } from "../../utils/logger";

export function useLoginMutation() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => {
      if (!payload.email.trim() || !payload.password.trim()) {
        throw new Error("Email and password are required.");
      }

      return login(payload);
    },
    onSuccess: async (data) => {
      console.log("Login successful:", data);
      await SecureStore.setItemAsync(storageKeys.authToken, data.tokens.access.token);

      if (data.tokens.refresh.token) {
        await SecureStore.setItemAsync(storageKeys.refreshToken, data.tokens.refresh.token);
      }

      dispatch(setToken(data.tokens.access.token));
      dispatch(setUser(data.user));
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      router.replace("/(protected)");
    },
    onError: (error) => {
      Logger.error("Login mutation failed", error);
    },
  });
}
