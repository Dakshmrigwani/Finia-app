import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactions, type TransactionFilters } from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";

const PAGE_LIMIT = 10;

export function useTransactions(filters: Omit<TransactionFilters, "page" | "limit"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.transaction.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      getTransactions({ ...filters, page: pageParam as number, limit: PAGE_LIMIT }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}
