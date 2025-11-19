import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import { CaptureNavigator, CaptureStackParamList } from "./CaptureNavigator";
import { LibraryNavigator, LibraryStackParamList } from "./LibraryNavigator";
import { SettingsNavigator, SettingsStackParamList } from "./SettingsNavigator";
import TutorChatScreen from "../screens/tutor/TutorChatScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type AppBottomTabParamList = {
  CaptureTab: {
    screen: keyof CaptureStackParamList;
  };
  LibraryTab: {
    screen: keyof LibraryStackParamList;
  };
  TutorTab: undefined;
  SettingsTab: {
    screen: keyof SettingsStackParamList;
  };
};

const Tab = createBottomTabNavigator<AppBottomTabParamList>();

export const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarStyle: {
          backgroundColor: "#1e293b",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="CaptureTab"
        component={CaptureNavigator}
        options={{
          title: "Capture",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
        initialParams={{
          screen: "Camera",
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryNavigator}
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="library" color={color} size={size} />
          ),
        }}
        initialParams={{
          screen: "DecksList",
        }}
      />
      <Tab.Screen
        name="TutorTab"
        component={TutorChatScreen}
        options={{
          title: "Tutor",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
        initialParams={{
          screen: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};
