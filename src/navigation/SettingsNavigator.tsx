import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/settings/ProfileScreen";
import PreferencesScreen from "../screens/settings/PreferencesScreen";
import HelpScreen from "../screens/settings/HelpScreen";

export type SettingsStackParamList = {
  Profile: undefined;
  Preferences: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
};
