import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBudget } from "../../api/budget.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useDeleteBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.budget.list() });
    },
    onError: (error) => {
      Logger.error("Delete budget mutation failed", error);
    },
  });
}
