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
} as const;
