import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as NotificationsType from "expo-notifications";

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
}

export const isExpoGoAndroid =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
  Platform.OS === "android";

let Notifications: typeof NotificationsType | null = null;
if (!isExpoGoAndroid) {
  try {
    Notifications = require("expo-notifications");
  } catch (err) {
    console.warn("[Notifications] Failed to load expo-notifications:", err);
  }
}

export { Notifications };

// Configure default notification presentation behavior
export function setupNotificationHandler() {
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn("[Notification Handler Error]:", err);
  }
}

function handleRegistrationError(errorMessage: string) {
  console.warn("[Notification Registration Error]:", errorMessage);
}

/**
 * Register for Expo Push Notifications
 * Configures Android notification channel & retrieves Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (isExpoGoAndroid || !Notifications) {
    console.warn(
      "[Notifications] Android push notifications (remote notifications) were removed from Expo Go in SDK 53+. Use a development build (npx expo run:android) to test remote push notifications."
    );
    return undefined;
  }

  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (e) {
      console.warn("[Notification Channel Error]:", e);
    }
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    handleRegistrationError("Permission not granted to get push token for push notification!");
    return undefined;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError("Project ID not found in Expo configuration.");
    return undefined;
  }

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log("[Notification Token]:", pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
    return undefined;
  }
}

/**
 * Send Remote Push Notification via Expo Push Service API
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<void> {
  const message = {
    to: payload.to,
    sound: payload.sound || "default",
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

/**
 * Trigger Immediate Local Notification
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string> {
  if (!Notifications) {
    console.warn("[Notifications] Local notifications not available in this environment.");
    return "";
  }
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: "default",
    },
    trigger: null,
  });
}
