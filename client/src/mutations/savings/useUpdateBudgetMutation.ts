import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBudget, type BudgetPayload } from "../../api/budget.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

type UpdatePayload = {
  id: string;
  payload: Partial<BudgetPayload>;
};

export function useUpdateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePayload) => {
      if (payload.category !== undefined && !payload.category.trim()) {
        throw new Error("Category cannot be empty.");
      }
      if (payload.amount !== undefined && payload.amount < 0) {
        throw new Error("Amount must be positive.");
      }
      if (payload.limit !== undefined && payload.limit <= 0) {
        throw new Error("Limit must be greater than zero.");
      }

      return updateBudget(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budget.list() });
    },
    onError: (error) => {
      Logger.error("Update budget mutation failed", error);
    },
  });
}
