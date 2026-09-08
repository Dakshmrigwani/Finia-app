import { useQuery } from "@tanstack/react-query";
import { getContacts, type ContactFilters } from "../../api/contact.api";
import { queryKeys } from "../../constants/queryKeys";

export function useContacts(params?: ContactFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.contact.list(params),
    queryFn: () => getContacts(params),
    enabled,
  });
}
