import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../api/auth.api";
import { queryKeys } from "../../constants/queryKeys";

export function useCurrentUser(enabled = false) {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: getCurrentUser,
    enabled,
  });
}
