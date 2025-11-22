import React from "react";
import { View, StyleSheet as RNStyleSheet } from "react-native";

interface CropOverlayProps {
  aspectRatio?: number;
  testID?: string;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({
  aspectRatio = 3 / 4,
  testID,
}) => {
  // Return empty overlay - no frame or guides
  return <View style={overlayStyles.container} pointerEvents="none" testID={testID} />;
};

const overlayStyles = RNStyleSheet.create({
  container: {
    ...RNStyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});
