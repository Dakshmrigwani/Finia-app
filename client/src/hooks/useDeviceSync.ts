import { useState } from 'react';
import * as Contacts from 'expo-contacts/legacy';
import { useQueryClient } from '@tanstack/react-query';
import { syncContacts, ContactSyncResponse } from '../api/contact.api';
import { syncSmsMessages, DeviceSmsItem, SmsSyncResponse } from '../api/sms.api';
import { queryKeys } from '../constants/queryKeys';
import { Logger } from '../utils/logger';

export function useDeviceSync() {
  const queryClient = useQueryClient();
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);
  const [isSyncingSms, setIsSyncingSms] = useState(false);
  const [lastContactSyncResult, setLastContactSyncResult] = useState<ContactSyncResponse | null>(null);
  const [lastSmsSyncResult, setLastSmsSyncResult] = useState<SmsSyncResponse | null>(null);

  /**
   * Reads all contacts from device via expo-contacts and syncs them to Finia backend.
   */
  const syncDeviceContacts = async (): Promise<ContactSyncResponse | null> => {
    setIsSyncingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Logger.warn('Contacts permission not granted for sync');
        return null;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (!data || data.length === 0) {
        return null;
      }

      const formattedContacts = data
        .filter((c) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => ({
          name: c.name,
          phoneNumbers: c.phoneNumbers?.map((p) => ({
            number: p.number,
            digits: p.digits,
            label: p.label,
          })),
          emails: c.emails?.map((e) => ({
            email: e.email,
            label: e.label,
          })),
        }));

      const result = await syncContacts(formattedContacts);
      setLastContactSyncResult(result);
      await queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
      return result;
    } catch (error) {
      Logger.error('Failed to sync device contacts', error as Error);
      throw error;
    } finally {
      setIsSyncingContacts(false);
    }
  };

  /**
   * Syncs a list of SMS messages to Finia backend to extract only transactions.
   */
  const syncDeviceSms = async (messages: DeviceSmsItem[]): Promise<SmsSyncResponse | null> => {
    if (!messages || messages.length === 0) return null;

    setIsSyncingSms(true);
    try {
      const result = await syncSmsMessages(messages);
      setLastSmsSyncResult(result);
      return result;
    } catch (error) {
      Logger.error('Failed to sync SMS transactions', error as Error);
      throw error;
    } finally {
      setIsSyncingSms(false);
    }
  };

  return {
    syncDeviceContacts,
    syncDeviceSms,
    isSyncingContacts,
    isSyncingSms,
    lastContactSyncResult,
    lastSmsSyncResult,
  };
}
