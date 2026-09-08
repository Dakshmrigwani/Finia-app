import { apiClient } from './client';

export interface DeviceContactItem {
  name: string;
  phoneNumbers?: Array<{ number?: string; digits?: string; label?: string } | string>;
  emails?: Array<{ email?: string; label?: string } | string>;
}

export interface ContactSyncResponse {
  totalReceived: number;
  contactsProcessed: number;
  newContactsCreated: number;
  sharedContactsFound: number;
}

export interface SavedContact {
  id: string;
  name: string;
  phoneNumber: string;
  emails: string[];
  contactId: string;
  sources: string[];
  isShared: boolean;
  sourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetContactsResponse {
  results: SavedContact[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Sync device contacts from Expo to backend.
 * Handles phone normalization and links multi-user sources.
 */
export async function syncContacts(contacts: DeviceContactItem[]): Promise<ContactSyncResponse> {
  const { data } = await apiClient.post('/contacts/sync', { contacts });
  return data.data;
}

export interface ContactFilters {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get paginated contacts saved for the authenticated user.
 */
export async function getContacts(params?: ContactFilters): Promise<GetContactsResponse> {
  const { data } = await apiClient.get('/contacts', { params });
  return data.data;
}
