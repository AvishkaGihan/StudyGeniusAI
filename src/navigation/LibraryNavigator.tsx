import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DecksListScreen from "../screens/library/DecksListScreen";
import DeckDetailScreen from "../screens/library/DeckDetailScreen";
import StudyModeScreen from "../screens/library/StudyModeScreen";

export type LibraryStackParamList = {
  DecksList: undefined;
  DeckDetail: {
    deckId: string;
  };
  StudyMode: {
    deckId: string;
  };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export const LibraryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DecksList" component={DecksListScreen} />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="StudyMode"
        component={StudyModeScreen}
        options={{
          presentation: "fullScreenModal",
          gestureEnabled: true,
          gestureDirection: "vertical",
        }}
      />
    </Stack.Navigator>
  );
};
