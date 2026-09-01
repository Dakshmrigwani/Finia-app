import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransaction, type TransactionUpdatePayload } from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

type Args = {
  id: string;
  payload: TransactionUpdatePayload;
};

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Args) => updateTransaction(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transaction.all,
      });
    },
    onError: (error) => {
      Logger.error("Update transaction mutation failed", error);
    },
  });
}
