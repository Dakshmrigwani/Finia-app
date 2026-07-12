import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoal, type GoalPayload } from "../../api/goal.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GoalPayload) => {
      if (!payload.goalName.trim()) throw new Error("Goal Name is required.");
      if (payload.targetAmount <= 0) throw new Error("Target Amount must be greater than zero.");
      if (payload.currentSavedAmount !== undefined && payload.currentSavedAmount < 0) {
        throw new Error("Current Saved Amount cannot be negative.");
      }
      if (!payload.targetDate) throw new Error("Target Date is required.");

      return createGoal(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.goal.list() });
    },
    onError: (error) => {
      Logger.error("Create goal mutation failed", error);
    },
  });
}
