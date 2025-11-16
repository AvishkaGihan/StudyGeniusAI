import * as FileSystem from "expo-file-system";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";

/**
 * File System Service
 * Handles file operations for temporary and permanent storage
 */

// Fallback directory constants since they may not be exported in current version
const DOCUMENT_DIR = (FileSystem as any).documentDirectory || "";
const CACHE_DIR = (FileSystem as any).cacheDirectory || "";

// Encoding type definition
type EncodingType = "utf8" | "base64" | undefined;

/**
 * Get app's document directory
 */
export function getDocumentDirectory(): string {
  if (!DOCUMENT_DIR) {
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Document directory not available"
    );
  }
  return DOCUMENT_DIR;
}

/**
 * Get app's cache directory
 */
export function getCacheDirectory(): string {
  if (!CACHE_DIR) {
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Cache directory not available"
    );
  }
  return CACHE_DIR;
}

/**
 * Write file to file system
 */
export async function writeFile(
  path: string,
  content: string,
  encoding: EncodingType = "utf8"
): Promise<void> {
  try {
    logger.debug("Writing file", { path });

    await FileSystem.writeAsStringAsync(path, content, { encoding });

    logger.debug("File written successfully", { path });
  } catch (error) {
    logger.error("Failed to write file", { path, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to write file");
  }
}

/**
 * Read file from file system
 */
export async function readFile(
  path: string,
  encoding: EncodingType = "utf8"
): Promise<string> {
  try {
    logger.debug("Reading file", { path });

    const content = await FileSystem.readAsStringAsync(path, { encoding });

    logger.debug("File read successfully", { path, length: content.length });

    return content;
  } catch (error) {
    logger.error("Failed to read file", { path, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to read file");
  }
}

/**
 * Delete file from file system
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    logger.debug("Deleting file", { path });

    await FileSystem.deleteAsync(path, { idempotent: true });

    logger.debug("File deleted successfully", { path });
  } catch (error) {
    logger.error("Failed to delete file", { path, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to delete file");
  }
}

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch (error) {
    logger.error("Failed to check file existence", { path, error });
    return false;
  }
}

/**
 * Get file information
 */
export async function getFileInfo(
  path: string
): Promise<FileSystem.FileInfo | null> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? info : null;
  } catch (error) {
    logger.error("Failed to get file info", { path, error });
    return null;
  }
}

/**
 * Copy file
 */
export async function copyFile(from: string, to: string): Promise<void> {
  try {
    logger.debug("Copying file", { from, to });

    await FileSystem.copyAsync({ from, to });

    logger.debug("File copied successfully", { from, to });
  } catch (error) {
    logger.error("Failed to copy file", { from, to, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to copy file");
  }
}

/**
 * Move file
 */
export async function moveFile(from: string, to: string): Promise<void> {
  try {
    logger.debug("Moving file", { from, to });

    await FileSystem.moveAsync({ from, to });

    logger.debug("File moved successfully", { from, to });
  } catch (error) {
    logger.error("Failed to move file", { from, to, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to move file");
  }
}

/**
 * Create directory
 */
export async function createDirectory(path: string): Promise<void> {
  try {
    logger.debug("Creating directory", { path });

    await FileSystem.makeDirectoryAsync(path, { intermediates: true });

    logger.debug("Directory created successfully", { path });
  } catch (error) {
    logger.error("Failed to create directory", { path, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to create directory");
  }
}

/**
 * List directory contents
 */
export async function listDirectory(path: string): Promise<string[]> {
  try {
    logger.debug("Listing directory", { path });

    const files = await FileSystem.readDirectoryAsync(path);

    logger.debug("Directory listed successfully", {
      path,
      count: files.length,
    });

    return files;
  } catch (error) {
    logger.error("Failed to list directory", { path, error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to list directory contents"
    );
  }
}

/**
 * Delete directory and all contents
 */
export async function deleteDirectory(path: string): Promise<void> {
  try {
    logger.debug("Deleting directory", { path });

    await FileSystem.deleteAsync(path, { idempotent: true });

    logger.debug("Directory deleted successfully", { path });
  } catch (error) {
    logger.error("Failed to delete directory", { path, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to delete directory");
  }
}

/**
 * Get total storage space used
 */
export async function getTotalStorageUsed(): Promise<number> {
  try {
    const documentDir = getDocumentDirectory();
    const cacheDir = getCacheDirectory();

    const docInfo = await FileSystem.getInfoAsync(documentDir);
    const cacheInfo = await FileSystem.getInfoAsync(cacheDir);

    const docSize = docInfo.exists && "size" in docInfo ? docInfo.size : 0;
    const cacheSize =
      cacheInfo.exists && "size" in cacheInfo ? cacheInfo.size : 0;

    return (docSize || 0) + (cacheSize || 0);
  } catch (error) {
    logger.error("Failed to get total storage used", { error });
    return 0;
  }
}

/**
 * Clear cache directory
 */
export async function clearCache(): Promise<void> {
  try {
    logger.info("Clearing cache directory");

    const cacheDir = getCacheDirectory();
    const files = await listDirectory(cacheDir);

    for (const file of files) {
      try {
        await deleteFile(`${cacheDir}${file}`);
      } catch (error) {
        logger.warn("Failed to delete cache file", { file, error });
        // Continue with other files
      }
    }

    logger.info("Cache directory cleared", { filesDeleted: files.length });
  } catch (error) {
    logger.error("Failed to clear cache", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to clear cache");
  }
}

/**
 * Save temporary image (to cache directory)
 */
export async function saveTempImage(
  imageUri: string,
  filename: string
): Promise<string> {
  try {
    logger.debug("Saving temporary image", { filename });

    const cacheDir = getCacheDirectory();
    const destination = `${cacheDir}${filename}`;

    await copyFile(imageUri, destination);

    logger.debug("Temporary image saved", { destination });

    return destination;
  } catch (error) {
    logger.error("Failed to save temporary image", { filename, error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to save temporary image"
    );
  }
}

/**
 * Save permanent image (to document directory)
 */
export async function savePermanentImage(
  imageUri: string,
  filename: string
): Promise<string> {
  try {
    logger.debug("Saving permanent image", { filename });

    const docDir = getDocumentDirectory();
    const destination = `${docDir}${filename}`;

    await copyFile(imageUri, destination);

    logger.debug("Permanent image saved", { destination });

    return destination;
  } catch (error) {
    logger.error("Failed to save permanent image", { filename, error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to save permanent image"
    );
  }
}

/**
 * Clean up old temporary files (older than specified days)
 */
export async function cleanOldTempFiles(
  olderThanDays: number = 7
): Promise<void> {
  try {
    logger.info("Cleaning old temporary files", { olderThanDays });

    const cacheDir = getCacheDirectory();
    const files = await listDirectory(cacheDir);

    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let deletedCount = 0;

    for (const file of files) {
      try {
        const filePath = `${cacheDir}${file}`;
        const info = await getFileInfo(filePath);

        if (
          info &&
          "modificationTime" in info &&
          info.modificationTime !== undefined
        ) {
          const fileAge = now - info.modificationTime * 1000;

          if (fileAge > maxAge) {
            await deleteFile(filePath);
            deletedCount++;
          }
        }
      } catch (error) {
        logger.warn("Failed to process temp file", { file, error });
        // Continue with other files
      }
    }

    logger.info("Old temporary files cleaned", { deletedCount });
  } catch (error) {
    logger.error("Failed to clean old temp files", { error });
    // Don't throw - this is a cleanup operation
  }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(extension: string = "jpg"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}_${random}.${extension}`;
}
