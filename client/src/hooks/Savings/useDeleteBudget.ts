import { useDeleteBudgetMutation } from "../../mutations/savings/useDeleteBudgetMutation";

export const useDeleteBudget = () => {
  const mutation = useDeleteBudgetMutation();

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
