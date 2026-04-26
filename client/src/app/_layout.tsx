import '../global.css';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAppInit } from '../hooks/useAppInit';
import { RootState, store } from '../store';
import { queryClient } from '../lib/queryClient';

// Keep splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </Provider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady } = useAppInit();
  const hasOnboarded = useSelector((state: RootState) => state.app.hasOnboarded);

  useEffect(() => {
    if (!isReady) return;

    void SplashScreen.hideAsync();

    const inProtected = segments[0] === "(protected)";
    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === '(onboarding)';

    if (!hasOnboarded) {
      if (!inOnboarding) {
        router.replace('/(onboarding)');
      }
    } else if (inAuth) {
      // Token guard is intentionally disabled for now so static protected screens
      // can be explored before auth is wired up.
      router.replace('/(protected)/index');
    } else if (!inProtected) {
      router.replace('/(auth)/login');
    }
  }, [
    isReady,
    hasOnboarded,
    segments,
    router,
  ]);

  if (!isReady) return null;

  return <Slot />;
}
