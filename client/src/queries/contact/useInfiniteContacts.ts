import { useInfiniteQuery } from "@tanstack/react-query";
import { getContacts, type ContactFilters } from "../../api/contact.api";
import { queryKeys } from "../../constants/queryKeys";

const PAGE_LIMIT = 20;

export function useInfiniteContacts(params: Omit<ContactFilters, "page" | "limit"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.contact.list(params),
    queryFn: ({ pageParam = 1 }) =>
      getContacts({ ...params, page: pageParam as number, limit: PAGE_LIMIT }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}
