import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budget.all }),
      ]);
    },
    onError: (error) => {
      Logger.error("Delete transaction mutation failed", error);
    },
  });
}
