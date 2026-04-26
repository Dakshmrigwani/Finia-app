import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router"; // ← back to Slot
import * as SplashScreen from "expo-splash-screen";
import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAppInit } from "../hooks/useAppInit";
import { RootState, store } from "../store";
import { queryClient } from "../lib/queryClient";
import { ThemeProvider } from "../context/themeContext";

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
  const hasOnboarded = useSelector((state: RootState) => state.app.hasOnboarded);
  const token = useSelector((state: RootState) => state.auth.token);

useEffect(() => {
  if (!isReady) return;
  void SplashScreen.hideAsync();

  const inProtected = segments[0] === "(protected)";
  const inAuth = segments[0] === "(auth)";
  const inOnboarding = segments[0] === "(onboarding)";
  const inCommon = segments[0] === "(common)";

  if (!hasOnboarded) {
    // ↓ add !inCommon here
    if (!inOnboarding && !inProtected && !inCommon) {
      router.replace("/(protected)"); // testing bypass
    }
  } else if (!token) {
    // ↓ add !inCommon here too (for when real auth is wired up)
    if (!inAuth && !inCommon) {
      router.replace("/(auth)/login");
    }
  } else if (token && !inProtected && !inCommon) {
    router.replace("/(protected)");
  }
}, [isReady, hasOnboarded, token, segments, router]);

  if (!isReady) return null;

  return <Slot />; // ← Slot is correct here, each group owns its own navigator
}