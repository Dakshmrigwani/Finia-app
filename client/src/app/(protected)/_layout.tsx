import React, { useState } from "react";
import { Tabs } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useColorScheme,
  Platform,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTheme } from "../../context/themeContext";
import { LinearGradient } from "expo-linear-gradient";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
const TAB_ICON_SIZE = 24;

export default function ProtectedLayout() {
  const systemTheme = useColorScheme();
  const { isDark, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === "dark");
  const router = useRouter();
  const handleToggleTheme = () => {
    toggleTheme();
    setIsDarkMode((prev) => !prev);
  };

  const ACTIVE_COLOR = "#6c47ff";
  const INACTIVE_COLOR = isDark ? "#a5a3c0" : "#797588";
  const TAB_BG = isDark ? "#1a1a2e" : "#ffffff";
  const BORDER_COLOR = isDark ? "#2f2e43" : "#e2e0fc";
  const SCREEN_BG = isDark ? "#0f172a" : "#fcf8ff";

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: route.name !== "aichat", // Hide header for aichat screen
        headerTitle: route.name === "index" ? "Hello Daksh" : route.name,
        headerRight: () => (
          <View style={{ flexDirection: "row", gap: 12, marginRight: 15 }}>
            <TouchableOpacity
              onPress={() => router.push("/(common)/notification")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "#3d3b54" : "#f5f2ff",
              }}
            >
              <MaterialCommunityIcons
                name="bell"
                size={20}
                color={ACTIVE_COLOR}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleTheme}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "#3d3b54" : "#f5f2ff",
              }}
            >
              <MaterialIcons
                name={isDark ? "light-mode" : "dark-mode"}
                size={20}
                color={ACTIVE_COLOR}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(common)/profile")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "#3d3b54" : "#f5f2ff",
              }}
            >
              <MaterialIcons name="person" size={20} color={ACTIVE_COLOR} />
            </TouchableOpacity>
          </View>
        ),

        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          bottom: 40,
          left: 16,
          right: 16,
          height: 60,
          paddingTop: 10,
          borderRadius: 36,
          backgroundColor: TAB_BG,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
        },

        headerStyle: {
          backgroundColor: TAB_BG,
          borderBottomColor: BORDER_COLOR,
          borderBottomWidth: 1,
        },

        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          textTransform: "capitalize",
          color: isDark ? "#e2e0fc" : "#1e1b4b",
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <MaterialCommunityIcons
                name="view-grid"
                size={TAB_ICON_SIZE}
                color={color}
              />
              <Text
                style={{
                  color,
                  fontSize: 8,
                  width: 40,
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                OVERVIEW
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <MaterialCommunityIcons
                name="wallet-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
              <Text
                style={{
                  color,
                  fontSize: 8,
                  fontWeight: "bold",
                  marginTop: 2,
                  width: 50,
                }}
              >
                Transactions
              </Text>
            </View>
          ),
        }}
      />

      {/* THE NOTCHED ASK AI CENTER TAB */}
      <Tabs.Screen
        name="aichat"
        options={{
          headerShown: false, // Explicitly hide header for AI chat
           tabBarStyle: { display: 'none' },
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={{ top: -35, alignItems: "center" }}
              activeOpacity={0.9}
            >
              <View
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 40,
                  backgroundColor: SCREEN_BG,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 34,
                    backgroundColor: TAB_BG,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LinearGradient
                    colors={[ACTIVE_COLOR, "#5323e6"]}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: ACTIVE_COLOR,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Octicons name="dependabot" size={26} color="white" />
                  </LinearGradient>
                </View>
              </View>
              <Text
                style={{
                  color: ACTIVE_COLOR,
                  fontSize: 8,
                  fontWeight: "900",
                  marginTop: -2,
                }}
              >
                ASK AI
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="savings"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <MaterialIcons
                name="savings"
                size={TAB_ICON_SIZE}
                color={color}
              />
              <Text
                style={{ color, fontSize: 8, fontWeight: "bold", marginTop: 2 }}
              >
                Savings
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="items-center">
              <Ionicons
                name="calculator-outline"
                size={TAB_ICON_SIZE}
                color={color}
              />
              <Text
                style={{ color, fontSize: 8, fontWeight: "bold", marginTop: 2 }}
              >
                goals
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
