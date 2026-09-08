export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...queryKeys.auth.all, "currentUser"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },
  onboarding: {
    all: ["onboarding"] as const,
  },
  budget: {
    all: ["budget"] as const,
    list: () => [...queryKeys.budget.all, "list"] as const,
  },
  goal: {
    all: ["goal"] as const,
    list: () => [...queryKeys.goal.all, "list"] as const,
  },
  transaction: {
    all: ["transaction"] as const,
    list: (filters?: object) =>
      [...queryKeys.transaction.all, "list", filters ?? {}] as const,
    detail: (id: string) =>
      [...queryKeys.transaction.all, "detail", id] as const,
  },
  contact: {
    all: ["contact"] as const,
    list: (filters?: object) =>
      [...queryKeys.contact.all, "list", filters ?? {}] as const,
  },
} as const;
