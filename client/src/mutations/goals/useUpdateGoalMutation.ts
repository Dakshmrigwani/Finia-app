import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGoal, type GoalPayload } from "../../api/goal.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

type UpdateGoalArgs = {
  id: string;
  payload: Partial<GoalPayload>;
};

export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateGoalArgs) => {
      if (payload.goalName !== undefined && !payload.goalName.trim()) {
        throw new Error("Goal Name cannot be empty.");
      }
      if (payload.targetAmount !== undefined && payload.targetAmount <= 0) {
        throw new Error("Target Amount must be greater than zero.");
      }
      if (payload.currentSavedAmount !== undefined && payload.currentSavedAmount < 0) {
        throw new Error("Current Saved Amount cannot be negative.");
      }

      return updateGoal(id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.goal.list() });
    },
    onError: (error) => {
      Logger.error("Update goal mutation failed", error);
    },
  });
}
