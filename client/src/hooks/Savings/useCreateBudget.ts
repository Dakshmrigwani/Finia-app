import { useCreateBudgetMutation } from "../../mutations/savings/useCreateBudgetMutation";

export const useCreateBudget = () => {
  const mutation = useCreateBudgetMutation();

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
