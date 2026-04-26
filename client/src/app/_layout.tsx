import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAppInit } from "../hooks/useAppInit";
import { RootState, store } from "../store";
import { queryClient } from "../lib/queryClient";
import { ThemeProvider } from "../context/themeContext";

// Keep splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady } = useAppInit();
  const hasOnboarded = useSelector(
    (state: RootState) => state.app.hasOnboarded,
  );
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!isReady) return;

    void SplashScreen.hideAsync();

    const inProtected = segments[0] === "(protected)";
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    /**
     * Navigation Flow:
     * 1. If not onboarded → Show onboarding screens
     * 2. If onboarded but no token → Show login/auth screens
     * 3. If onboarded & has token → Show protected (dashboard with tabs)
     */

    if (!hasOnboarded) {
      if (!inOnboarding && !inProtected) {
        // router.replace("/(onboarding)");
        router.replace("/(protected)"); // testing bypass
      }
    } else if (!token) {
      // User is onboarded but not authenticated
      if (!inAuth) {
        router.replace("/(auth)/login");
      }
    } else if (token && !inProtected) {
      // User is authenticated, redirect to protected area (Tabs layout)
      // Note: Use just "/(protected)" not "/(protected)/index" for Tabs
      router.replace("/(protected)");
    }
  }, [isReady, hasOnboarded, token, segments, router]);

  if (!isReady) return null;

  return <Slot />;
}
