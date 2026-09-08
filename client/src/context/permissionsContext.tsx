import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { usePermissions, PermissionsState } from '../hooks/usePermissions';
import { useDeviceSync } from '../hooks/useDeviceSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_ASKED_KEY = 'finia_permissions_asked';
const PERMISSIONS_CARD_DISMISSED_KEY = 'finia_permissions_card_dismissed';

export interface PermissionsContextType extends PermissionsState {
  resetPermissionsAsked: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

/** Wraps the app and provides native permissions state */
export function PermissionsProvider({ children }: { children: ReactNode }) {
  const permissions = usePermissions();
  const { syncDeviceContacts } = useDeviceSync();

  // Track previous contacts status to detect the grant transition
  const prevContactsRef = useRef(permissions.contacts);

  const resetPermissionsAsked = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PERMISSIONS_ASKED_KEY);
      await AsyncStorage.removeItem(PERMISSIONS_CARD_DISMISSED_KEY);
      await permissions.checkStatuses();
    } catch (e) {
      console.warn('Failed to reset permissions asked key:', e);
    }
  }, [permissions]);

  useEffect(() => {
    const initPermissions = async () => {
      try {
        await AsyncStorage.removeItem(PERMISSIONS_ASKED_KEY);
        await permissions.checkStatuses();
      } catch (e) {
        console.warn('initPermissions error:', e);
      }
    };

    initPermissions();
  }, []);

  // Auto-sync contacts when permission transitions to 'granted'
  useEffect(() => {
    const prev = prevContactsRef.current;
    const current = permissions.contacts;

    if (prev !== 'granted' && current === 'granted') {
      // Permission was just granted — sync silently in background
      syncDeviceContacts().catch(() => {
        // Silently ignore — sync will retry on next login
      });
    }

    prevContactsRef.current = current;
  }, [permissions.contacts, syncDeviceContacts]);

  return (
    <PermissionsContext.Provider
      value={{
        ...permissions,
        resetPermissionsAsked,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

/** Consume permissions state anywhere in the tree. */
export function usePermissionsContext(): PermissionsContextType {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error(
      'usePermissionsContext must be used inside a <PermissionsProvider>'
    );
  }
  return ctx;
}

