import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView as ExpoCameraView, CameraType } from "expo-camera";
import { CaptureStackParamList } from "../../utils/types";
import { useCamera } from "../../hooks/useCamera";
import { CameraView } from "../../components/camera/CameraView";
import { CropOverlay } from "../../components/camera/CropOverlay";
import { CameraControls } from "../../components/camera/CameraControls";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type CameraScreenNavigationProp = NativeStackNavigationProp<
  CaptureStackParamList,
  "Camera"
>;

/**
 * CameraScreen
 * Camera interface for capturing textbook photos
 */
export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const cameraRef = useRef<ExpoCameraView>(null);

  const {
    hasPermission,
    cameraType,
    isReady,
    requestPermission,
    toggleCameraType,
    pickFromGallery,
    onCameraReady,
  } = useCamera();

  const [isCapturing, setIsCapturing] = useState(false);

  /**
   * Capture photo
   */
  const handleCapture = async () => {
    if (!cameraRef.current || !isReady) {
      logger.warn("Camera not ready");
      return;
    }

    try {
      setIsCapturing(true);
      logger.logUserAction("photo_capture_started");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      logger.logUserAction("photo_captured", { uri: photo.uri });

      // Navigate to OCR preview
      navigation.navigate("OCRPreview", { imageUri: photo.uri });
    } catch (error) {
      logger.error("Photo capture failed", { error });
      Alert.alert(
        "Capture Failed",
        "Failed to capture photo. Please try again."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Open gallery
   */
  const handleOpenGallery = async () => {
    try {
      logger.logUserAction("gallery_opened");

      const imageUri = await pickFromGallery();

      if (imageUri) {
        logger.logUserAction("image_selected_from_gallery", { uri: imageUri });
        navigation.navigate("OCRPreview", { imageUri });
      }
    } catch (error) {
      logger.error("Gallery selection failed", { error });
      Alert.alert("Error", "Failed to select image from gallery.");
    }
  };

  /**
   * Request permission if not granted
   */
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to scan textbooks. Please enable it in your device settings.",
        [{ text: "OK" }]
      );
    }
  };

  // Loading state
  if (hasPermission === null) {
    return <LoadingSpinner fullScreen message="Initializing camera..." />;
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionMessage}>
          StudyGenius needs access to your camera to scan textbook pages.
        </Text>
        <Button
          onPress={handleRequestPermission}
          style={styles.permissionButton}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        cameraType={cameraType as CameraType | "front" | "back"}
        onReady={onCameraReady}
        style={styles.camera}
      />

      {/* Crop Overlay */}
      <CropOverlay aspectRatio={4 / 3} />

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Align textbook page within the frame
        </Text>
      </View>

      {/* Camera Controls */}
      <CameraControls
        onCapture={handleCapture}
        onFlipCamera={toggleCameraType}
        onOpenGallery={handleOpenGallery}
        disabled={isCapturing || !isReady}
      />

      {/* Capturing indicator */}
      {isCapturing && (
        <View style={styles.capturingOverlay}>
          <LoadingSpinner message="Capturing..." />
        </View>
      )}
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

  instructionsContainer: {
    position: "absolute",
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
  },

  instructionsText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    textAlign: "center",
    backgroundColor: colors.overlay.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },

  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.dark,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background.default,
  },

  permissionEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },

  permissionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  permissionMessage: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  permissionButton: {
    minWidth: 200,
  },
});

export default CameraScreen;
