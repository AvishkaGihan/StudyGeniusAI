import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  CameraView as ExpoCameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import { colors } from "../../theme/colors";

interface CameraViewProps {
  cameraType: CameraType | "front" | "back";
  onReady: () => void;
  style?: any;
  testID?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  cameraType,
  onReady,
  style,
  testID,
}) => {
  const cameraRef = useRef<ExpoCameraView>(null);

  const facing =
    typeof cameraType === "string"
      ? cameraType
      : cameraType === 1
        ? "front"
        : "back";

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={onReady}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  camera: {
    flex: 1,
  },
});
