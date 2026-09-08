import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction, type CreateTransactionPayload } from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => {
      if (!payload.title.trim()) {
        throw new Error("Transaction title is required.");
      }
      if (typeof payload.amount !== "number" || isNaN(payload.amount) || payload.amount <= 0) {
        throw new Error("Amount must be a positive number.");
      }
      return createTransaction(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budget.all }),
      ]);
    },
    onError: (error) => {
      Logger.error("Create transaction mutation failed", error);
    },
  });
}
