import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router"; // ← back to Slot
import * as SplashScreen from "expo-splash-screen";
import { Provider, useSelector } from "react-redux";
import { useAppInit } from "../hooks/useAppInit";
import { RootState, store } from "../store";
import { ThemeProvider } from "../context/themeContext";
import { NotificationProvider } from "../context/notificationContext";
import { PermissionsProvider } from "../context/permissionsContext";
import { Logger } from "../utils/logger";
import { QueryProvider } from "../providers/QueryProvider";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <QueryProvider>
            <PermissionsProvider>
              <RootNavigator />
            </PermissionsProvider>
          </QueryProvider>
        </NotificationProvider>
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
  Logger.debug("Route guard evaluated", {
    segment: segments[0],
    hasToken: Boolean(token),
    hasOnboarded,
    inProtected,
    inAuth,
    inOnboarding,
    inCommon,
  });

  if (token) {
    // Authenticated user always belongs in the protected area
    if (!inProtected && !inCommon) {
      router.replace('/(protected)');
    }
  } else if (!hasOnboarded) {
    // New user — allow onboarding wizard and auth screens (signup/OTP)
    if (!inOnboarding && !inAuth && !inCommon) {
      router.replace('/(onboarding)');
    }
  } else {
    // Has onboarded but no token — send to login
    if (!inAuth && !inCommon) {
      router.replace("/(auth)/login");
    }
  }
}, [isReady, hasOnboarded, token, segments, router]);

  if (!isReady) return null;

  return <Slot />; // ← Slot is correct here, each group owns its own navigator
}
