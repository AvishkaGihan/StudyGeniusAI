import * as FileSystem from "expo-file-system";
// @ts-ignore - manipulateAsync is deprecated but still functional
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { CapturedImage } from "../../utils/types";
import { appConfig } from "../../config/appConfig";

/**
 * Image Processing Service
 * Handles image manipulation, compression, and validation
 */

/**
 * Compress image for optimal OCR processing
 */
export async function compressImage(imageUri: string): Promise<string> {
  try {
    logger.info("Compressing image", { imageUri });

    const result = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: appConfig.camera.maxWidth,
            height: appConfig.camera.maxHeight,
          },
        },
      ],
      {
        compress: appConfig.camera.quality,
        format: SaveFormat.JPEG,
      }
    );

    logger.info("Image compressed successfully", {
      originalUri: imageUri,
      compressedUri: result.uri,
      width: result.width,
      height: result.height,
    });

    return result.uri;
  } catch (error) {
    logger.error("Image compression failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to compress image"
    );
  }
}

/**
 * Rotate image
 */
export async function rotateImage(
  imageUri: string,
  degrees: number
): Promise<string> {
  try {
    logger.info("Rotating image", { imageUri, degrees });

    const result = await manipulateAsync(imageUri, [{ rotate: degrees }], {
      compress: appConfig.camera.quality,
      format: SaveFormat.JPEG,
    });

    logger.info("Image rotated successfully", { newUri: result.uri });

    return result.uri;
  } catch (error) {
    logger.error("Image rotation failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to rotate image"
    );
  }
}

/**
 * Crop image to specific region
 */
export async function cropImage(
  imageUri: string,
  cropRegion: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }
): Promise<string> {
  try {
    logger.info("Cropping image", { imageUri, cropRegion });

    const result = await manipulateAsync(imageUri, [{ crop: cropRegion }], {
      compress: appConfig.camera.quality,
      format: SaveFormat.JPEG,
    });

    logger.info("Image cropped successfully", { newUri: result.uri });

    return result.uri;
  } catch (error) {
    logger.error("Image cropping failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to crop image"
    );
  }
}

/**
 * Enhance image for better OCR (adjust brightness, contrast)
 */
export async function enhanceImageForOCR(imageUri: string): Promise<string> {
  try {
    logger.info("Enhancing image for OCR", { imageUri });

    // Apply transformations to improve OCR accuracy
    const result = await manipulateAsync(
      imageUri,
      [
        // Resize if too large
        {
          resize: {
            width: appConfig.camera.maxWidth,
            height: appConfig.camera.maxHeight,
          },
        },
      ],
      {
        compress: 0.9, // High quality for OCR
        format: SaveFormat.JPEG,
      }
    );

    logger.info("Image enhanced successfully", { newUri: result.uri });

    return result.uri;
  } catch (error) {
    logger.error("Image enhancement failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to enhance image"
    );
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imageUri: string
): Promise<{ width: number; height: number }> {
  try {
    // Use manipulateAsync with no operations just to get dimensions
    const result = await manipulateAsync(imageUri, [], {
      format: SaveFormat.JPEG,
    });

    return {
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error("Failed to get image dimensions", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to read image dimensions"
    );
  }
}

/**
 * Validate image file
 */
export async function validateImage(imageUri: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    if (!fileInfo.exists) {
      return {
        isValid: false,
        error: "Image file does not exist",
      };
    }

    // Check file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (fileInfo.size && fileInfo.size > maxSizeBytes) {
      return {
        isValid: false,
        error: "Image file is too large (max 10MB)",
      };
    }

    // Check if we can read image dimensions (validates it's a valid image)
    try {
      await getImageDimensions(imageUri);
    } catch {
      return {
        isValid: false,
        error: "Invalid image file format",
      };
    }

    return { isValid: true };
  } catch (error) {
    logger.error("Image validation failed", { error, imageUri });
    return {
      isValid: false,
      error: "Failed to validate image",
    };
  }
}

/**
 * Convert image to base64 (for API transmission if needed)
 */
export async function imageToBase64(imageUri: string): Promise<string> {
  try {
    logger.info("Converting image to base64", { imageUri });

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: "base64" as any,
    });

    logger.info("Image converted to base64", {
      base64Length: base64.length,
    });

    return base64;
  } catch (error) {
    logger.error("Base64 conversion failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to convert image to base64"
    );
  }
}

/**
 * Save image to app's document directory
 */
export async function saveImageToDocuments(
  imageUri: string,
  filename: string
): Promise<string> {
  try {
    logger.info("Saving image to documents", { imageUri, filename });

    const documentDirectory = (FileSystem as any).documentDirectory;
    if (!documentDirectory) {
      throw new Error("Document directory not available");
    }

    const destination = `${documentDirectory}${filename}`;

    await FileSystem.copyAsync({
      from: imageUri,
      to: destination,
    });

    logger.info("Image saved to documents", { destination });

    return destination;
  } catch (error) {
    logger.error("Failed to save image", { error, imageUri });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save image");
  }
}

/**
 * Delete temporary image files
 */
export async function deleteTempImages(imageUris: string[]): Promise<void> {
  try {
    logger.info("Deleting temporary images", { count: imageUris.length });

    for (const uri of imageUris) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (error) {
        logger.warn("Failed to delete temp image", { uri, error });
        // Continue with other deletions even if one fails
      }
    }

    logger.info("Temporary images deleted");
  } catch (error) {
    logger.error("Failed to delete temp images", { error });
    // Don't throw error for cleanup operations
  }
}

/**
 * Prepare image for OCR (compress, enhance, validate)
 */
export async function prepareImageForOCR(
  imageUri: string
): Promise<CapturedImage> {
  try {
    logger.info("Preparing image for OCR", { imageUri });

    // Validate image first
    const validation = await validateImage(imageUri);
    if (!validation.isValid) {
      throw new AppError(
        ErrorCode.IMAGE_PROCESSING_ERROR,
        validation.error || "Invalid image"
      );
    }

    // Enhance and compress
    const enhancedUri = await enhanceImageForOCR(imageUri);

    // Get dimensions
    const dimensions = await getImageDimensions(enhancedUri);

    const capturedImage: CapturedImage = {
      uri: enhancedUri,
      width: dimensions.width,
      height: dimensions.height,
    };

    logger.info("Image prepared for OCR", capturedImage);

    return capturedImage;
  } catch (error) {
    logger.error("Image preparation failed", { error, imageUri });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to prepare image for OCR"
    );
  }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  imageUri: string,
  size: number = 200
): Promise<string> {
  try {
    logger.info("Creating thumbnail", { imageUri, size });

    const result = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: size,
            height: size,
          },
        },
      ],
      {
        compress: 0.7,
        format: SaveFormat.JPEG,
      }
    );

    logger.info("Thumbnail created", { uri: result.uri });

    return result.uri;
  } catch (error) {
    logger.error("Thumbnail creation failed", { error, imageUri });
    throw new AppError(
      ErrorCode.IMAGE_PROCESSING_ERROR,
      "Failed to create thumbnail"
    );
  }
}
