import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGoal } from "../../api/goal.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.goal.list() });
    },
    onError: (error) => {
      Logger.error("Delete goal mutation failed", error);
    },
  });
}
