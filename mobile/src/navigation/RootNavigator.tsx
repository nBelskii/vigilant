import React from "react";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../screens/DashboardScreen";
import { MapScreen } from "../screens/MapScreen";
import { DigestScreen } from "../screens/DigestScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SubscriptionScreen } from "../screens/SubscriptionScreen";
import { TrendsScreen } from "../screens/TrendsScreen";
import { AddressCheckScreen } from "../screens/AddressCheckScreen";
import { CustomTabBar } from "./CustomTabBar";
import { navigationRef } from "./navigationRef";
import { THEME } from "../theme/theme";

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.colors.background,
    card: THEME.colors.surface,
    border: THEME.colors.border,
    primary: THEME.colors.primary,
    text: THEME.colors.textPrimary,
  },
};

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
      <ProfileStack.Screen name="Trends" component={TrendsScreen} />
      <ProfileStack.Screen name="AddressCheck" component={AddressCheckScreen} />
    </ProfileStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Digest" component={DigestScreen} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
