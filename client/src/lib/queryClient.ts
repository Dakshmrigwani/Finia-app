import { QueryClient } from '@tanstack/react-query';
import { mutationDefaults, queryDefaults } from '../utils/query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: queryDefaults,
    mutations: mutationDefaults,
  },
});
