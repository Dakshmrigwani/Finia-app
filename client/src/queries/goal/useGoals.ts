import { useQuery } from "@tanstack/react-query";
import { getGoals } from "../../api/goal.api";
import { queryKeys } from "../../constants/queryKeys";

export function useGoals(enabled = true) {
  return useQuery({
    queryKey: queryKeys.goal.list(),
    queryFn: getGoals,
    enabled,
  });
}
