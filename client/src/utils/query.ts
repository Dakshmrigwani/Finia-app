import type { DefaultOptions } from "@tanstack/react-query";

export const queryDefaults = {
  staleTime: 1000 * 60,
  gcTime: 1000 * 60 * 10,
  retry: (failureCount: number, error: unknown) => {
    const status = typeof error === "object" && error && "status" in error ? error.status : undefined;

    if (typeof status === "number" && status >= 400 && status < 500) {
      return false;
    }

    return failureCount < 2;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  networkMode: "online",
  refetchOnReconnect: true,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  throwOnError: false,
} satisfies NonNullable<DefaultOptions["queries"]>;

export const mutationDefaults = {
  networkMode: "online",
  throwOnError: false,
} satisfies NonNullable<DefaultOptions["mutations"]>;
