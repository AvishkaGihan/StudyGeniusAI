import React from "react";
import { View, StyleSheet as RNStyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CropOverlayProps {
  aspectRatio?: number;
  testID?: string;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({
  aspectRatio = 4 / 3,
  testID,
}) => {
  const cropHeight = SCREEN_WIDTH / aspectRatio;
  const verticalMargin = (SCREEN_HEIGHT - cropHeight) / 2;

  return (
    <View style={overlayStyles.container} pointerEvents="none" testID={testID}>
      {/* Top overlay */}
      <View style={[overlayStyles.overlay, { height: verticalMargin }]} />

      {/* Crop area */}
      <View style={{ height: cropHeight }}>
        <View style={overlayStyles.cropArea}>
          {/* Corner guides */}
          <View style={[overlayStyles.corner, overlayStyles.topLeft]} />
          <View style={[overlayStyles.corner, overlayStyles.topRight]} />
          <View style={[overlayStyles.corner, overlayStyles.bottomLeft]} />
          <View style={[overlayStyles.corner, overlayStyles.bottomRight]} />
        </View>
      </View>

      {/* Bottom overlay */}
      <View style={[overlayStyles.overlay, { height: verticalMargin }]} />
    </View>
  );
};

const overlayStyles = RNStyleSheet.create({
  container: {
    ...RNStyleSheet.absoluteFillObject,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cropArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: colors.primary.main,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});
