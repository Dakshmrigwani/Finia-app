/**
 * Agent WebSocket Client for Finia AI Coach
 * Connects to the FastAPI LangGraph streaming endpoint (/api/v1/ws/agent)
 */

export interface ToolCallEventData {
  tool_name: string;
  label: string;
  args?: Record<string, unknown> | string;
  tool_call_id: string;
}

export interface ToolResultEventData {
  tool_call_id: string;
  content: string;
  duration_ms?: number;
}

export interface TextDeltaEventData {
  index?: number;
  content: string;
}

export interface ConversationCreatedEventData {
  conversation_id: string;
}

export interface UserPromptEventData {
  content: string;
}

export interface FinalResultEventData {
  output: string;
}

export interface CompleteEventData {
  conversation_id?: string;
  timings?: {
    message_to_model_ms?: number;
    final_tool_to_text_ms?: number;
    total_duration_ms?: number;
    [key: string]: number | undefined;
  };
}

export type WsConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface AgentWsCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: string) => void;
  onStatusChange?: (status: WsConnectionStatus) => void;
  onConversationCreated?: (data: ConversationCreatedEventData) => void;
  onUserPrompt?: (data: UserPromptEventData) => void;
  onModelRequestStart?: () => void;
  onToolCall?: (data: ToolCallEventData) => void;
  onToolResult?: (data: ToolResultEventData) => void;
  onTextDelta?: (data: TextDeltaEventData) => void;
  onFinalResult?: (data: FinalResultEventData) => void;
  onComplete?: (data: CompleteEventData) => void;
}

export class AgentWsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: AgentWsCallbacks = {};
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isExplicitlyClosed = false;
  private status: WsConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(customUrl?: string) {
    if (customUrl) {
      this.url = customUrl;
    } else if (process.env.EXPO_PUBLIC_AI_WS_URL) {
      this.url = process.env.EXPO_PUBLIC_AI_WS_URL;
    } else {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/v1';
      try {
        const parsed = new URL(apiUrl);
        const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
        this.url = `${protocol}//${parsed.hostname}:8000/api/v1/ws/agent`;
      } catch {
        this.url = 'ws://localhost:8000/api/v1/ws/agent';
      }
    }
  }

  public getStatus(): WsConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: WsConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.callbacks.onStatusChange?.(newStatus);
    }
  }

  public setCallbacks(callbacks: AgentWsCallbacks) {
    this.callbacks = callbacks;
  }

  public connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.callbacks.onOpen?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          const type = parsed?.type;
          const data = parsed?.data;

          switch (type) {
            case 'conversation_created':
              this.callbacks.onConversationCreated?.(data);
              break;
            case 'user_prompt':
              this.callbacks.onUserPrompt?.(data);
              break;
            case 'model_request_start':
              this.callbacks.onModelRequestStart?.();
              break;
            case 'tool_call':
              this.callbacks.onToolCall?.(data);
              break;
            case 'tool_result':
              this.callbacks.onToolResult?.(data);
              break;
            case 'text_delta':
              this.callbacks.onTextDelta?.(data);
              break;
            case 'final_result':
              this.callbacks.onFinalResult?.(data);
              break;
            case 'complete':
              this.callbacks.onComplete?.(data);
              break;
            case 'error':
              this.callbacks.onError?.(data?.message || 'Unknown agent error');
              break;
            default:
              break;
          }
        } catch {
          // Ignore invalid parse
        }
      };

      this.ws.onerror = () => {
        this.setStatus('disconnected');
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.callbacks.onClose?.();

        if (!this.isExplicitlyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch {
      this.setStatus('disconnected');
    }
  }

  public sendMessage(
    message: string,
    options?: {
      conversation_id?: string;
      user_id?: string;
      history?: Array<{ role: string; content: string }>;
    }
  ): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      return false;
    }

    const payload = {
      message,
      conversation_id: options?.conversation_id,
      user_id: options?.user_id,
      history: options?.history,
    };

    this.ws.send(JSON.stringify(payload));
    return true;
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }
}
