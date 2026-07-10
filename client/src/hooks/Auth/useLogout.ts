import { useLoginMutation } from '../../mutations/auth/useLoginMutation';

export const useLogout = () => {
  const mutation = useLoginMutation();

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
