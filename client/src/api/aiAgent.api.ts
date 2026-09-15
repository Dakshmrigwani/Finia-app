import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { storageKeys } from '../constants/storageKeys';

/**
 * AI Agent Service REST API Client
 * Interfaces with FastAPI Python backend (server/ai)
 */

export function getAIApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_AI_API_URL) {
    return process.env.EXPO_PUBLIC_AI_API_URL.replace(/\/$/, '');
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      return `${parsed.protocol}//${parsed.hostname}:8000/api/v1`;
    } catch {
      // fallback below
    }
  }

  return 'http://localhost:8000/api/v1';
}

export const aiApiClient = axios.create({
  baseURL: getAIApiBaseUrl(),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

aiApiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(storageKeys.authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AIConversationSummary {
  id: string;
  title: string;
  user_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model_name?: string | null;
  tokens_used?: number | null;
  tool_calls?: Array<Record<string, unknown>>;
  created_at: string;
  updated_at?: string;
}

export interface AIConversationDetail extends AIConversationSummary {
  messages: AIMessage[];
}

export interface AIConversationListResponse {
  items: AIConversationSummary[];
  total: number;
}

export interface AIMessageListResponse {
  items: AIMessage[];
  total: number;
}

export interface AIHealthStatus {
  status: string;
  timestamp: string;
  services?: Record<string, string>;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of conversations for current user
 */
export async function getAIConversations(
  skip = 0,
  limit = 50,
  includeArchived = false
): Promise<AIConversationListResponse> {
  const { data } = await aiApiClient.get<AIConversationListResponse>('/conversations', {
    params: { skip, limit, include_archived: includeArchived },
  });
  return data;
}

/**
 * Create a new conversation session
 */
export async function createAIConversation(title?: string): Promise<AIConversationSummary> {
  const { data } = await aiApiClient.post<AIConversationSummary>('/conversations', {
    title: title || 'New Conversation',
  });
  return data;
}

/**
 * Get conversation details with full message history
 */
export async function getAIConversation(conversationId: string): Promise<AIConversationDetail> {
  const { data } = await aiApiClient.get<AIConversationDetail>(`/conversations/${conversationId}`);
  return data;
}

/**
 * Update conversation title or archive state
 */
export async function updateAIConversation(
  conversationId: string,
  updates: { title?: string; is_archived?: boolean }
): Promise<AIConversationSummary> {
  const { data } = await aiApiClient.patch<AIConversationSummary>(
    `/conversations/${conversationId}`,
    updates
  );
  return data;
}

/**
 * Archive conversation
 */
export async function archiveAIConversation(conversationId: string): Promise<AIConversationSummary> {
  const { data } = await aiApiClient.post<AIConversationSummary>(
    `/conversations/${conversationId}/archive`
  );
  return data;
}

/**
 * Delete conversation and its messages
 */
export async function deleteAIConversation(conversationId: string): Promise<void> {
  await aiApiClient.delete(`/conversations/${conversationId}`);
}

/**
 * Get messages of a conversation
 */
export async function getAIConversationMessages(
  conversationId: string,
  skip = 0,
  limit = 100
): Promise<AIMessageListResponse> {
  const { data } = await aiApiClient.get<AIMessageListResponse>(
    `/conversations/${conversationId}/messages`,
    {
      params: { skip, limit },
    }
  );
  return data;
}

/**
 * Health check for AI agent service
 */
export async function checkAIHealth(): Promise<AIHealthStatus> {
  const { data } = await aiApiClient.get<AIHealthStatus>('/health');
  return data;
}

/**
 * Stream chat response directly from POST /api/v1/agent/chat (SSE)
 */
export async function sendAIChatStream(
  message: string,
  callbacks: {
    onDelta: (chunk: string) => void;
    onComplete: () => void;
    onError: (err: string) => void;
  }
): Promise<() => void> {
  const token = await SecureStore.getItemAsync(storageKeys.authToken);
  const baseUrl = getAIApiBaseUrl();
  const url = `${baseUrl}/agent/chat`;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'text/event-stream');

  let processedIndex = 0;
  let buffer = '';

  xhr.onprogress = () => {
    const raw = xhr.responseText.slice(processedIndex);
    processedIndex = xhr.responseText.length;
    buffer += raw;

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      if (line.startsWith('data:')) {
        let dataContent = line.slice(5);
        if (dataContent.startsWith(' ')) {
          dataContent = dataContent.slice(1);
        }
        if (dataContent.startsWith('[ERROR]')) {
          callbacks.onError(dataContent.replace('[ERROR]', '').trim());
          return;
        }
        if (dataContent.length > 0) {
          callbacks.onDelta(dataContent);
        }
      }
    }
  };

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      const remainingLine = buffer.replace(/\r$/, '');
      if (remainingLine.startsWith('data:')) {
        let remaining = remainingLine.slice(5);
        if (remaining.startsWith(' ')) {
          remaining = remaining.slice(1);
        }
        if (remaining.length > 0 && !remaining.startsWith('[ERROR]')) {
          callbacks.onDelta(remaining);
        }
      }
      callbacks.onComplete();
    } else {
      let errMsg = `Request failed (${xhr.status})`;
      try {
        const parsed = JSON.parse(xhr.responseText);
        if (parsed.detail) errMsg = parsed.detail;
        if (parsed.message) errMsg = parsed.message;
      } catch {}
      callbacks.onError(errMsg);
    }
  };

  xhr.onerror = () => {
    callbacks.onError('Network connection failed. Could not reach ' + url);
  };

  xhr.ontimeout = () => {
    callbacks.onError('Request timed out. Please verify AI backend is active.');
  };

  xhr.timeout = 45000;
  xhr.send(JSON.stringify({ message }));

  return () => {
    try {
      xhr.abort();
    } catch {}
  };
}
