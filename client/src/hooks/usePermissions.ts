import { useEffect, useState, useCallback } from 'react';
import { Platform, PermissionsAndroid, Linking } from 'react-native';
import * as Contacts from 'expo-contacts/legacy';
import * as SMS from 'expo-sms';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface PermissionsState {
  contacts: PermissionStatus;
  sms: PermissionStatus;
  isLoading: boolean;
  requestContacts: () => Promise<boolean>;
  requestSMS: () => Promise<boolean>;
  requestAll: () => Promise<boolean>;
  checkStatuses: () => Promise<void>;
  openSettings: () => Promise<void>;
}

export function usePermissions(): PermissionsState {
  const [contacts, setContacts] = useState<PermissionStatus>('undetermined');
  const [sms, setSms] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(false);

  // Check current statuses on mount from OS
  const checkStatuses = useCallback(async () => {
    try {
      const { status: contactStatus } = await Contacts.getPermissionsAsync();
      setContacts(contactStatus as PermissionStatus);

      if (Platform.OS === 'android') {
        const hasSendSms = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.SEND_SMS
        );
        const hasReadSms = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        const isGranted = hasSendSms || hasReadSms;
        setSms(isGranted ? 'granted' : 'denied');
      } else {
        const available = await SMS.isAvailableAsync();
        setSms(available ? 'granted' : 'denied');
      }
    } catch (e) {
      console.warn('checkStatuses error:', e);
    }
  }, []);

  useEffect(() => {
    checkStatuses();
  }, [checkStatuses]);

  /** Request Contacts directly via mobile native prompt (no custom dialogs) */
  const requestContacts = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      const isGranted = status === 'granted';
      setContacts(isGranted ? 'granted' : 'denied');
      return isGranted;
    } catch (e) {
      console.warn('requestContacts error:', e);
      return false;
    }
  }, []);

  /** Request SMS directly via mobile native Android prompt (no custom dialogs) */
  const requestSMS = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const permissionsToRequest: any[] = [
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          PermissionsAndroid.PERMISSIONS.READ_SMS,
        ];

        const results = await PermissionsAndroid.requestMultiple(
          permissionsToRequest
        );

        const isGranted =
          results[PermissionsAndroid.PERMISSIONS.SEND_SMS] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          results[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
            PermissionsAndroid.RESULTS.GRANTED;

        setSms(isGranted ? 'granted' : 'denied');
        return isGranted;
      }

      const available = await SMS.isAvailableAsync();
      setSms(available ? 'granted' : 'denied');
      return available;
    } catch (e) {
      console.warn('requestSMS error:', e);
      return false;
    }
  }, []);

  /** Request both permissions directly with native OS dialogs */
  const requestAll = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Trigger native Contacts prompt
      const cGranted = await requestContacts();
      // 2. Trigger native SMS prompt
      const sGranted = await requestSMS();
      return cGranted && sGranted;
    } finally {
      setIsLoading(false);
    }
  }, [requestContacts, requestSMS]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (e) {
      console.warn('Failed to open settings:', e);
    }
  }, []);

  return {
    contacts,
    sms,
    isLoading,
    requestContacts,
    requestSMS,
    requestAll,
    checkStatuses,
    openSettings,
  };
}
