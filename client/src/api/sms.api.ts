import { apiClient } from './client';

export interface DeviceSmsItem {
  id?: string;
  address?: string;
  body: string;
  date?: number | string;
}

export interface SmsSyncResponse {
  totalReceived: number;
  transactionsDetected: number;
  inserted: number;
  duplicates: number;
  skippedNonTransactions: number;
}

/**
 * Send device SMS messages from Expo to backend.
 * Backend filters out non-transactions (OTPs, spam, etc.) and imports valid transactions.
 */
export async function syncSmsMessages(messages: DeviceSmsItem[]): Promise<SmsSyncResponse> {
  const { data } = await apiClient.post('/sms/sync', { messages });
  return data.data;
}
