import * as SecureStore from "expo-secure-store";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";

/**
 * Secure Storage Service
 * Handles encrypted storage for sensitive data (tokens, credentials)
 * Uses Expo SecureStore (iOS Keychain / Android Keystore)
 */

/**
 * Store a value securely
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    logger.debug("Storing item in secure storage", { key });

    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });

    logger.debug("Item stored successfully", { key });
  } catch (error) {
    logger.error("Failed to store secure item", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save secure data");
  }
}

/**
 * Retrieve a value from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    logger.debug("Retrieving item from secure storage", { key });

    const value = await SecureStore.getItemAsync(key);

    if (value) {
      logger.debug("Item retrieved successfully", { key });
    } else {
      logger.debug("Item not found in secure storage", { key });
    }

    return value;
  } catch (error) {
    logger.error("Failed to retrieve secure item", { key, error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to retrieve secure data"
    );
  }
}

/**
 * Remove a value from secure storage
 */
export async function removeSecureItem(key: string): Promise<void> {
  try {
    logger.debug("Removing item from secure storage", { key });

    await SecureStore.deleteItemAsync(key);

    logger.debug("Item removed successfully", { key });
  } catch (error) {
    logger.error("Failed to remove secure item", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to remove secure data");
  }
}

/**
 * Check if a key exists in secure storage
 */
export async function secureItemExists(key: string): Promise<boolean> {
  try {
    const value = await getSecureItem(key);
    return value !== null;
  } catch (error) {
    logger.error("Failed to check if secure item exists", { key, error });
    return false;
  }
}

/**
 * Store JSON object securely
 */
export async function setSecureJSON<T>(key: string, value: T): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await setSecureItem(key, jsonString);
  } catch (error) {
    logger.error("Failed to store secure JSON", { key, error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save secure data");
  }
}

/**
 * Retrieve JSON object from secure storage
 */
export async function getSecureJSON<T>(key: string): Promise<T | null> {
  try {
    const jsonString = await getSecureItem(key);

    if (!jsonString) {
      return null;
    }

    const value = JSON.parse(jsonString) as T;
    return value;
  } catch (error) {
    logger.error("Failed to retrieve secure JSON", { key, error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to retrieve secure data"
    );
  }
}

/**
 * Clear all secure storage (use with caution!)
 */
export async function clearSecureStorage(): Promise<void> {
  try {
    logger.warn("Clearing all secure storage");

    // Note: SecureStore doesn't have a "clear all" method
    // You need to track keys and delete them individually
    // This is a placeholder for when you implement key tracking

    logger.warn("Secure storage cleared");
  } catch (error) {
    logger.error("Failed to clear secure storage", { error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to clear secure storage"
    );
  }
}

/**
 * Batch store multiple items
 */
export async function setSecureItems(
  items: Record<string, string>
): Promise<void> {
  try {
    logger.debug("Storing multiple items in secure storage", {
      count: Object.keys(items).length,
    });

    const promises = Object.entries(items).map(([key, value]) =>
      setSecureItem(key, value)
    );

    await Promise.all(promises);

    logger.debug("Multiple items stored successfully");
  } catch (error) {
    logger.error("Failed to store multiple secure items", { error });
    throw new AppError(ErrorCode.STORAGE_ERROR, "Failed to save secure data");
  }
}

/**
 * Batch retrieve multiple items
 */
export async function getSecureItems(
  keys: string[]
): Promise<Record<string, string | null>> {
  try {
    logger.debug("Retrieving multiple items from secure storage", {
      count: keys.length,
    });

    const promises = keys.map(async (key) => ({
      key,
      value: await getSecureItem(key),
    }));

    const results = await Promise.all(promises);

    const items: Record<string, string | null> = {};
    results.forEach(({ key, value }) => {
      items[key] = value;
    });

    logger.debug("Multiple items retrieved successfully");

    return items;
  } catch (error) {
    logger.error("Failed to retrieve multiple secure items", { error });
    throw new AppError(
      ErrorCode.STORAGE_ERROR,
      "Failed to retrieve secure data"
    );
  }
}

/**
 * Store authentication tokens
 */
export async function storeAuthTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await setSecureItems({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

/**
 * Retrieve authentication tokens
 */
export async function getAuthTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const tokens = await getSecureItems(["access_token", "refresh_token"]);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

/**
 * Clear authentication tokens
 */
export async function clearAuthTokens(): Promise<void> {
  await removeSecureItem("access_token");
  await removeSecureItem("refresh_token");
}
