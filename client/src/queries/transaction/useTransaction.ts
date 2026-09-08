import { useQuery } from "@tanstack/react-query";
import { getTransactionById } from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";

export function useTransaction(id?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.transaction.detail(id ?? ""),
    queryFn: () => getTransactionById(id!),
    enabled: enabled && !!id,
  });
}
