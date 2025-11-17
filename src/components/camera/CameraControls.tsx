import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet as CameraStyles,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";

interface CameraControlsProps {
  onCapture: () => void;
  onFlipCamera: () => void;
  onOpenGallery: () => void;
  disabled?: boolean;
  testID?: string;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onFlipCamera,
  onOpenGallery,
  disabled = false,
  testID,
}) => {
  return (
    <View style={controlStyles.container} testID={testID}>
      {/* Gallery button */}
      <TouchableOpacity
        onPress={onOpenGallery}
        disabled={disabled}
        style={controlStyles.iconButton}
        activeOpacity={0.7}
      >
        <Text style={controlStyles.iconText}>🖼️</Text>
      </TouchableOpacity>

      {/* Capture button */}
      <TouchableOpacity
        onPress={onCapture}
        disabled={disabled}
        style={[
          controlStyles.captureButton,
          disabled && controlStyles.disabled,
        ]}
        activeOpacity={0.7}
      >
        <View style={controlStyles.captureInner} />
      </TouchableOpacity>

      {/* Flip camera button */}
      <TouchableOpacity
        onPress={onFlipCamera}
        disabled={disabled}
        style={controlStyles.iconButton}
        activeOpacity={0.7}
      >
        <Text style={controlStyles.iconText}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
};

const controlStyles = CameraStyles.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text.primary,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.main,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface.main,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  disabled: {
    opacity: 0.5,
  },
});
