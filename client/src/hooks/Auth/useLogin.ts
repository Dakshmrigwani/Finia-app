import { useLoginMutation } from '../../mutations/auth/useLoginMutation';

export const useLogin = () => {
  const mutation = useLoginMutation();

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
