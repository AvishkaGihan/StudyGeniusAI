import { useState, useCallback, useEffect } from "react";
import { Camera } from "expo-camera";
import type { CameraType } from "expo-camera";
import { logger } from "../services/logger";
import { AppError, ErrorCode } from "../utils/errorHandling";

/**
 * useCamera Hook
 * Custom hook for camera permissions and operations
 */
export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const [isReady, setIsReady] = useState(false);

  /**
   * Request camera permission
   */
  const requestPermission = useCallback(async () => {
    try {
      logger.info("Requesting camera permission");

      const { status } = await Camera.requestCameraPermissionsAsync();

      const granted = status === "granted";
      setHasPermission(granted);

      if (granted) {
        logger.info("Camera permission granted");
      } else {
        logger.warn("Camera permission denied");
      }

      return granted;
    } catch (error) {
      logger.error("Failed to request camera permission", { error });
      throw new AppError(
        ErrorCode.CAMERA_PERMISSION_DENIED,
        "Failed to request camera permission"
      );
    }
  }, []);

  /**
   * Check camera permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      const granted = status === "granted";
      setHasPermission(granted);
      return granted;
    } catch (error) {
      logger.error("Failed to check camera permission", { error });
      return false;
    }
  }, []);

  /**
   * Toggle camera type (front/back)
   */
  const toggleCameraType = useCallback(() => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
    logger.info("Camera type toggled", {
      newType: cameraType === "back" ? "front" : "back",
    });
  }, [cameraType]);

  /**
   * Pick image from gallery
   */
  const pickFromGallery = useCallback(async () => {
    try {
      logger.info("User Action: gallery_opened");

      // Import expo-image-picker dynamically
      const ImagePicker = await import("expo-image-picker");

      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        logger.warn("Media library permission denied");
        throw new AppError(
          ErrorCode.CAMERA_PERMISSION_DENIED,
          "Media library permission is required to pick images"
        );
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        logger.info("Gallery selection cancelled");
        return null;
      }

      const imageUri = result.assets[0].uri;
      logger.info("Image selected from gallery", { imageUri });
      return imageUri;
    } catch (error) {
      logger.error("Failed to pick image from gallery", { error });
      throw error;
    }
  }, []);

  /**
   * Camera ready callback
   */
  const onCameraReady = useCallback(() => {
    setIsReady(true);
    logger.info("Camera ready");
  }, []);

  /**
   * Initialize camera permissions
   */
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    cameraType,
    isReady,
    requestPermission,
    checkPermission,
    toggleCameraType,
    pickFromGallery,
    onCameraReady,
  };
}

export default useCamera;
