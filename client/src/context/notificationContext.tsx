import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as Notifications from "expo-notifications";
import {
  setupNotificationHandler,
  registerForPushNotificationsAsync,
  sendPushNotification,
  sendLocalNotification,
  PushNotificationPayload,
} from "../utils/notification.utils";

// Initialize notification handler settings on module import
setupNotificationHandler();

export interface NotificationContextType {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  response: Notifications.NotificationResponse | undefined;
  error: string | null;
  sendNotification: (payload: Omit<PushNotificationPayload, "to"> & { to?: string }) => Promise<void>;
  triggerLocalNotification: (title: string, body: string, data?: Record<string, any>) => Promise<string>;
  refetchPushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const [response, setResponse] = useState<Notifications.NotificationResponse | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setError(null);
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
      setExpoPushToken("");
    }
  };

  useEffect(() => {
    fetchToken();

    const notificationListener = Notifications.addNotificationReceivedListener((incoming) => {
      setNotification(incoming);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((resp) => {
      setResponse(resp);
      console.log("[Notification Response Received]:", resp);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
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
