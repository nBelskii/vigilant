import React from "react";
import { NavigationContainer, DarkTheme, Theme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { MapScreen } from "../screens/MapScreen";
import { DigestScreen } from "../screens/DigestScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.brandEnd,
    text: colors.text,
  },
};

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Map: { focused: "map", unfocused: "map-outline" },
  Digest: { focused: "calendar", unfocused: "calendar-outline" },
  Alerts: { focused: "warning", unfocused: "warning-outline" },
  Profile: { focused: "person-circle", unfocused: "person-circle-outline" },
};

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.brandEnd,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icon = ICONS[route.name];
            return <Ionicons name={focused ? icon.focused : icon.unfocused} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Digest" component={DigestScreen} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
