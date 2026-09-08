import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  syncContacts,
  type DeviceContactItem,
  type ContactSyncResponse,
} from "../../api/contact.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useSyncContactsMutation() {
  const queryClient = useQueryClient();

  return useMutation<ContactSyncResponse, Error, DeviceContactItem[]>({
    mutationFn: (contacts: DeviceContactItem[]) => syncContacts(contacts),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.contact.all,
      });
    },
    onError: (error) => {
      Logger.error("Sync contacts mutation failed", error);
    },
  });
}
