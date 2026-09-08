import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Notification, NotificationResponse } from "expo-notifications";
import {
  Notifications,
  setupNotificationHandler,
  registerForPushNotificationsAsync,
  sendPushNotification,
  sendLocalNotification,
  PushNotificationPayload,
} from "../utils/notification.utils";

// Initialize notification handler settings safely on module import
try {
  setupNotificationHandler();
} catch (e) {
  console.warn("[setupNotificationHandler]", e);
}

export interface NotificationContextType {
  expoPushToken: string;
  notification: Notification | undefined;
  response: NotificationResponse | undefined;
  error: string | null;
  sendNotification: (payload: Omit<PushNotificationPayload, "to"> & { to?: string }) => Promise<void>;
  triggerLocalNotification: (title: string, body: string, data?: Record<string, any>) => Promise<string>;
  refetchPushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  const [response, setResponse] = useState<NotificationResponse | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setError(null);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      }
    } catch (err: any) {
      console.warn("[Notification Token Error]:", err?.message || String(err));
      setError(err?.message || String(err));
      setExpoPushToken("");
    }
  };

  useEffect(() => {
    fetchToken();

    if (!Notifications) return;

    try {
      const notificationListener = Notifications.addNotificationReceivedListener((incoming) => {
        setNotification(incoming);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener((resp) => {
        setResponse(resp);
        console.log("[Notification Response Received]:", resp);
      });

      return () => {
        notificationListener?.remove?.();
        responseListener?.remove?.();
      };
    } catch (e) {
      console.warn("[Notification Listener Error]:", e);
    }
  }, []);

  const handleSendNotification = async (
    payload: Omit<PushNotificationPayload, "to"> & { to?: string }
  ) => {
    const targetToken = payload.to || expoPushToken;
    if (!targetToken) {
      console.warn("Cannot send push notification: Expo Push Token is missing.");
      return;
    }
    await sendPushNotification({
      ...payload,
      to: targetToken,
    });
  };

  const handleTriggerLocalNotification = async (
    title: string,
    body: string,
    data?: Record<string, any>
  ) => {
    return await sendLocalNotification(title, body, data);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        response,
        error,
        sendNotification: handleSendNotification,
        triggerLocalNotification: handleTriggerLocalNotification,
        refetchPushToken: fetchToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
