import { useBudgets as useBudgetsQuery } from "../../queries/budget/useBudgets";

export const useBudgets = (enabled = true) => {
  const query = useBudgetsQuery(enabled);

  return {
    ...query,
    isLoading: query.isLoading,
  };
};
