import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { CACHE_EXPIRY } from "../../utils/constants";

/**
 * Async Storage Service
 * Handles persistent local storage for non-sensitive data (cache, settings)
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Store a value in AsyncStorage
 */
export async function setItem(key: string, value: string): Promise<void> {
  try {
    logger.debug("Storing item in AsyncStorage", { key });

    await AsyncStorage.setItem(key, value);

    logger.debug("Item stored successfully", { key });
  } catch (error) {
    logger.error("Failed to store item", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save data");
  }
}

/**
 * Retrieve a value from AsyncStorage
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    logger.debug("Retrieving item from AsyncStorage", { key });

    const value = await AsyncStorage.getItem(key);

    if (value) {
      logger.debug("Item retrieved successfully", { key });
    } else {
      logger.debug("Item not found", { key });
    }

    return value;
  } catch (error) {
    logger.error("Failed to retrieve item", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to retrieve data");
  }
}

/**
 * Remove a value from AsyncStorage
 */
export async function removeItem(key: string): Promise<void> {
  try {
    logger.debug("Removing item from AsyncStorage", { key });

    await AsyncStorage.removeItem(key);

    logger.debug("Item removed successfully", { key });
  } catch (error) {
    logger.error("Failed to remove item", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to remove data");
  }
}

/**
 * Store JSON object
 */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await setItem(key, jsonString);
  } catch (error) {
    logger.error("Failed to store JSON", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save data");
  }
}

/**
 * Retrieve JSON object
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const jsonString = await getItem(key);

    if (!jsonString) {
      return null;
    }

    const value = JSON.parse(jsonString) as T;
    return value;
  } catch (error) {
    logger.error("Failed to retrieve JSON", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to retrieve data");
  }
}

/**
 * Store data with expiration time (cache)
 */
export async function setCachedItem<T>(
  key: string,
  data: T,
  expiryMs: number = CACHE_EXPIRY.LONG
): Promise<void> {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiryMs,
    };

    await setJSON(key, cacheItem);
    logger.debug("Cached item stored", { key, expiryMs });
  } catch (error) {
    logger.error("Failed to store cached item", { key, error });
    throw new AppError(ErrorCode.CACHE_ERROR, "Failed to cache data");
  }
}

/**
 * Retrieve cached data (returns null if expired)
 */
export async function getCachedItem<T>(key: string): Promise<T | null> {
  try {
    const cacheItem = await getJSON<CacheItem<T>>(key);

    if (!cacheItem) {
      logger.debug("Cache miss", { key });
      return null;
    }

    // Check if expired
    if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
      logger.debug("Cache expired", { key });
      await removeItem(key);
      return null;
    }

    logger.debug("Cache hit", { key });
    return cacheItem.data;
  } catch (error) {
    logger.error("Failed to retrieve cached item", { key, error });
    return null;
  }
}

/**
 * Clear all AsyncStorage
 */
export async function clearStorage(): Promise<void> {
  try {
    logger.warn("Clearing all AsyncStorage");

    await AsyncStorage.clear();

    logger.warn("AsyncStorage cleared");
  } catch (error) {
    logger.error("Failed to clear storage", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to clear storage");
  }
}

/**
 * Get all keys in AsyncStorage
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return Array.from(keys);
  } catch (error) {
    logger.error("Failed to get all keys", { error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to retrieve storage keys"
    );
  }
}

/**
 * Batch store multiple items
 */
export async function setMultipleItems(
  items: Array<[string, string]>
): Promise<void> {
  try {
    logger.debug("Storing multiple items", { count: items.length });

    await AsyncStorage.multiSet(items);

    logger.debug("Multiple items stored successfully");
  } catch (error) {
    logger.error("Failed to store multiple items", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save data");
  }
}

/**
 * Batch retrieve multiple items
 */
export async function getMultipleItems(
  keys: string[]
): Promise<Array<[string, string | null]>> {
  try {
    logger.debug("Retrieving multiple items", { count: keys.length });

    const items = await AsyncStorage.multiGet(keys);

    logger.debug("Multiple items retrieved successfully");

    return Array.from(items);
  } catch (error) {
    logger.error("Failed to retrieve multiple items", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to retrieve data");
  }
}

/**
 * Batch remove multiple items
 */
export async function removeMultipleItems(keys: string[]): Promise<void> {
  try {
    logger.debug("Removing multiple items", { count: keys.length });

    await AsyncStorage.multiRemove(keys);

    logger.debug("Multiple items removed successfully");
  } catch (error) {
    logger.error("Failed to remove multiple items", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to remove data");
  }
}

/**
 * Clear expired cache items
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    logger.info("Clearing expired cache items");

    const allKeys = await getAllKeys();
    const keysToRemove: string[] = [];

    // Check each key for expiration
    for (const key of allKeys) {
      try {
        const item = await getJSON<CacheItem<any>>(key);

        if (item && item.expiresAt && Date.now() > item.expiresAt) {
          keysToRemove.push(key);
        }
      } catch {
        // Skip invalid items
        continue;
      }
    }

    if (keysToRemove.length > 0) {
      await removeMultipleItems(keysToRemove);
      logger.info("Expired cache items cleared", {
        count: keysToRemove.length,
      });
    }
  } catch (error) {
    logger.error("Failed to clear expired cache", { error });
    // Don't throw - this is a cleanup operation
  }
}

/**
 * Get storage usage information
 */
export async function getStorageInfo(): Promise<{
  totalKeys: number;
  estimatedSize: number; // in bytes
}> {
  try {
    const keys = await getAllKeys();
    const items = await getMultipleItems(keys);

    let estimatedSize = 0;
    items.forEach(([key, value]) => {
      if (value) {
        // Estimate size: key length + value length (in characters, roughly bytes)
        estimatedSize += key.length + value.length;
      }
    });

    return {
      totalKeys: keys.length,
      estimatedSize,
    };
  } catch (error) {
    logger.error("Failed to get storage info", { error });
    return {
      totalKeys: 0,
      estimatedSize: 0,
    };
  }
}

/**
 * Check if storage has reached limit (AsyncStorage ~10MB limit)
 */
export async function isStorageNearLimit(): Promise<boolean> {
  try {
    const info = await getStorageInfo();
    const limitBytes = 10 * 1024 * 1024; // 10MB
    const warningThreshold = limitBytes * 0.8; // 80% of limit

    return info.estimatedSize > warningThreshold;
  } catch (error) {
    logger.error("Failed to check storage limit", { error });
    return false;
  }
}
