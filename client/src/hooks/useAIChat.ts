import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { sendAIChatStream, checkAIHealth } from '../api/aiAgent.api';
import type { RootState } from '../store';

export type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  toolUsed?: string;
};

interface UseAIChatOptions {
  initialMessages?: ChatMessage[];
  userId?: string;
  revealIntervalMs?: number; // default ~14ms
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export function useAIChat(options: UseAIChatOptions = {}) {
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const resolvedUserId = options.userId || reduxUser?.id;

  const {
    initialMessages = [],
    revealIntervalMs = 14,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [activeToolName, setActiveToolName] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  // Buffer queue for smooth typewriter reveal
  const charQueueRef = useRef<string[]>([]);
  const drainTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStreamCompleteRef = useRef(false);
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Current assistant message ID being typed
  const activeMessageIdRef = useRef<string | null>(null);
  const lastUserPromptRef = useRef<string | null>(null);

  // Stop character reveal drain interval
  const stopDraining = useCallback(() => {
    if (drainTimerRef.current) {
      clearInterval(drainTimerRef.current);
      drainTimerRef.current = null;
    }
  }, []);

  // Start draining characters from queue at fixed interval (~14ms)
  const startDraining = useCallback(() => {
    if (drainTimerRef.current) return;

    drainTimerRef.current = setInterval(() => {
      if (charQueueRef.current.length > 0) {
        // Adaptive drain pace: if queue backlog is large, drain more characters per tick
        const count =
          charQueueRef.current.length > 60
            ? 4
            : charQueueRef.current.length > 30
            ? 3
            : charQueueRef.current.length > 10
            ? 2
            : 1;

        const chars = charQueueRef.current.splice(0, count).join('');
        const msgId = activeMessageIdRef.current;

        if (msgId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === msgId ? { ...msg, text: msg.text + chars } : msg
            )
          );
        }
      } else if (isStreamCompleteRef.current) {
        // Queue is fully drained and server stream is completed
        stopDraining();
        setIsTyping(false);
        activeMessageIdRef.current = null;
        setToolStatus(null);
        setActiveToolName(null);
      }
    }, revealIntervalMs);
  }, [revealIntervalMs, stopDraining]);

  // Check health of AI service on mount
  useEffect(() => {
    let isMounted = true;

    checkAIHealth()
      .then(() => {
        if (isMounted) setConnectionStatus('connected');
      })
      .catch(() => {
        if (isMounted) setConnectionStatus('disconnected');
      });

    return () => {
      isMounted = false;
      stopDraining();
      if (abortStreamRef.current) {
        abortStreamRef.current();
      }
    };
  }, [stopDraining]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const trimmed = text.trim();
      lastUserPromptRef.current = trimmed;

      // Abort previous in-flight request if any
      if (abortStreamRef.current) {
        abortStreamRef.current();
        abortStreamRef.current = null;
      }

      // Add user message to UI state
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text: trimmed,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setToolStatus('Finia is thinking...');
      setActiveToolName(null);
      isStreamCompleteRef.current = false;
      charQueueRef.current = [];
      activeMessageIdRef.current = null;

      try {
        const cancelFn = await sendAIChatStream(trimmed, {
          onDelta: (chunk) => {
            setConnectionStatus('connected');
            setToolStatus(null);

            // Create assistant placeholder message on first token
            if (!activeMessageIdRef.current) {
              const newMsgId = `ai-${Date.now()}`;
              activeMessageIdRef.current = newMsgId;
              setMessages((prev) => [
                ...prev,
                {
                  id: newMsgId,
                  text: '',
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
            }

            charQueueRef.current.push(...chunk.split(''));
            startDraining();
          },
          onComplete: () => {
            isStreamCompleteRef.current = true;
            setToolStatus(null);
            setActiveToolName(null);

            // If no characters queued or already drained, end immediately
            if (charQueueRef.current.length === 0) {
              stopDraining();
              setIsTyping(false);
              activeMessageIdRef.current = null;
            }
          },
          onError: (err) => {
            stopDraining();
            setIsTyping(false);
            setToolStatus(null);
            setActiveToolName(null);

            const activeId = activeMessageIdRef.current;
            if (activeId) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === activeId && !m.text.trim()
                    ? {
                        ...m,
                        text: "I'm having trouble analyzing your request right now. Please try again.",
                      }
                    : m
                )
              );
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  id: `err-${Date.now()}`,
                  text:
                    err && !err.toLowerCase().includes('websocket')
                      ? err
                      : "Unable to connect to Finia AI service. Please make sure the AI backend is running.",
                  isUser: false,
                  timestamp: new Date(),
                },
              ]);
            }
          },
        });

        abortStreamRef.current = cancelFn;
      } catch (err: any) {
        setIsTyping(false);
        setToolStatus(null);
        setConnectionStatus('disconnected');
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            text: "Could not send message. Please verify network connection.",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [isTyping, startDraining, stopDraining]
  );

  const startNewChat = useCallback(
    (welcomeText?: string, suggestions?: string[]) => {
      stopDraining();
      if (abortStreamRef.current) {
        abortStreamRef.current();
        abortStreamRef.current = null;
      }
      charQueueRef.current = [];
      activeMessageIdRef.current = null;
      setIsTyping(false);
      setToolStatus(null);
      setActiveToolName(null);
      setConversationId(null);

      const defaultWelcome =
        welcomeText ||
        "Hello! I'm Finia, your AI financial coach. Ask me anything about your budgets, recent transactions, spending patterns, or savings goals!";

      setMessages([
        {
          id: `welcome-${Date.now()}`,
          text: defaultWelcome,
          isUser: false,
          timestamp: new Date(),
          suggestions: suggestions || [
            "Can I afford dinner tonight?",
            "How are my budgets looking?",
            "Review my recent transactions",
            "What's my spending summary this month?",
          ],
        },
      ]);
    },
    [stopDraining]
  );

  const retryLastMessage = useCallback(() => {
    if (lastUserPromptRef.current && !isTyping) {
      sendMessage(lastUserPromptRef.current);
    }
  }, [isTyping, sendMessage]);

  return {
    messages,
    isTyping,
    toolStatus,
    activeToolName,
    connectionStatus,
    conversationId,
    sendMessage,
    setMessages,
    startNewChat,
    retryLastMessage,
  };
}
