import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "../../api/budget.api";
import { queryKeys } from "../../constants/queryKeys";

export function useBudgets(enabled = true) {
  return useQuery({
    queryKey: queryKeys.budget.list(),
    queryFn: getBudgets,
    enabled,
  });
}
