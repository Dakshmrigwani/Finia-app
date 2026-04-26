import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

const TAB_ICON_SIZE = 24;
const ACTIVE_COLOR = "#3b82f6";
const INACTIVE_COLOR = "#9ca3af";

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
          borderTopColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          fontWeight: "500",
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="dashboard"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="receipt-long"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="bar-chart"
              size={TAB_ICON_SIZE}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={TAB_ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
