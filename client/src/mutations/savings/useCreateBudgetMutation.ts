import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBudget, type BudgetPayload } from "../../api/budget.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useCreateBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetPayload) => {
      if (!payload.category.trim()) throw new Error("Category is required.");
      if (payload.amount < 0) throw new Error("Amount must be positive.");
      if (payload.limit <= 0) throw new Error("Limit must be greater than zero.");

      return createBudget(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budget.list() });
    },
    onError: (error) => {
      Logger.error("Create budget mutation failed", error);
    },
  });
}
