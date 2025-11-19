import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraScreen from "../screens/capture/CameraScreen";
import OCRPreviewScreen from "../screens/capture/OCRPreviewScreen";
import CardGenerationScreen from "../screens/capture/CardGenerationScreen";
import CardReviewScreen from "../screens/capture/CardReviewScreen";

export type CaptureStackParamList = {
  Camera: undefined;
  OCRPreview: {
    photoUri: string;
  };
  CardGeneration: {
    ocrText: string;
    photoUri: string;
  };
  CardReview: {
    deckId?: string;
    generatedCards: any[];
  };
};

const Stack = createNativeStackNavigator<CaptureStackParamList>();

export const CaptureNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen
        name="OCRPreview"
        component={OCRPreviewScreen}
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="CardGeneration"
        component={CardGenerationScreen}
        options={{
          presentation: "card",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="CardReview"
        component={CardReviewScreen}
        options={{
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
};
