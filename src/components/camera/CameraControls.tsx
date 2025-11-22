import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet as CameraStyles,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

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
      <SafeAreaView style={controlStyles.safeArea}>
        <View style={controlStyles.controlsRow}>
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
      </SafeAreaView>
    </View>
  );
};

const controlStyles = CameraStyles.create({
  container: {
    backgroundColor: colors.glass.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 0,
  },
  safeArea: {
    width: "100%",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
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
