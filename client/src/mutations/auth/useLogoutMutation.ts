import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { queryKeys } from "../../constants/queryKeys";
import { storageKeys } from "../../constants/storageKeys";
import { logout } from "../../store/Slices/authSlice";
import { Logger } from "../../utils/logger";

export function useLogoutMutation() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync(storageKeys.authToken);
      await SecureStore.deleteItemAsync(storageKeys.refreshToken);
    },
    onSuccess: async () => {
      dispatch(logout());
      queryClient.setQueryData(queryKeys.auth.currentUser(), null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      Logger.error("Logout mutation failed", error);
    },
  });
}
