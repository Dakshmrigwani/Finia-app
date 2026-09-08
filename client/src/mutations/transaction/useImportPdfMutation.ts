import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  importPdfStatement,
  type PdfUploadFile,
  type PdfImportResponse,
} from "../../api/transaction.api";
import { queryKeys } from "../../constants/queryKeys";
import { Logger } from "../../utils/logger";

export function useImportPdfMutation() {
  const queryClient = useQueryClient();

  return useMutation<PdfImportResponse, Error, PdfUploadFile | Blob | FormData>({
    mutationFn: (file: PdfUploadFile | Blob | FormData) => importPdfStatement(file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transaction.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budget.all }),
      ]);
    },
    onError: (error) => {
      Logger.error("PDF statement import mutation failed", error);
    },
  });
}
