/**
 * localStorage Abstraction Layer
 *
 * Provides type-safe localStorage operations with error handling, quota detection,
 * and JSON serialization. Prevents data loss from quota exceeded errors.
 *
 * @module lib/storage/localStorage
 */

/**
 * localStorage quota warning threshold (80% of estimated 5MB)
 */
const QUOTA_WARNING_THRESHOLD = 0.8;

/**
 * Estimated localStorage quota (5MB in bytes)
 */
const ESTIMATED_QUOTA = 5 * 1024 * 1024;

/**
 * Storage error types
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PARSE_ERROR = 'PARSE_ERROR',
  SERIALIZE_ERROR = 'SERIALIZE_ERROR',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

/**
 * Storage error class
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available
 *
 * @returns True if localStorage is available and functional
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate current localStorage usage
 *
 * Estimates storage usage by summing the byte length of all keys and values.
 *
 * @returns Object with used bytes, estimated quota, and percentage used
 */
export function getStorageUsage(): { used: number; quota: number; percentage: number } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, quota: ESTIMATED_QUOTA, percentage: 0 };
  }

  let used = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      const value = localStorage.getItem(key);
      if (value) {
        // Calculate byte length (approximate for UTF-16)
        used += key.length + value.length;
      }
    }
  }

  // Convert characters to bytes (approximate: 2 bytes per character for UTF-16)
  const usedBytes = used * 2;
  const percentage = usedBytes / ESTIMATED_QUOTA;

  return { used: usedBytes, quota: ESTIMATED_QUOTA, percentage };
}

/**
 * Check if storage is approaching quota limit
 *
 * @returns True if storage usage exceeds 80% threshold
 */
export function isApproachingQuota(): boolean {
  const { percentage } = getStorageUsage();
  return percentage >= QUOTA_WARNING_THRESHOLD;
}

/**
 * Get item from localStorage with type safety and error handling
 *
 * @template T - Type of the stored value
 * @param key - localStorage key
 * @param defaultValue - Default value if key not found or parse fails
 * @returns Parsed value or default value
 * @throws {StorageError} If localStorage is not available or parsing fails critically
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, returning default value');
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage item "${key}":`, error);
    throw new StorageError(
      StorageErrorType.PARSE_ERROR,
      `Failed to parse localStorage item "${key}"`,
      error
    );
  }
}

/**
 * Set item in localStorage with type safety and error handling
 *
 * @template T - Type of the value to store
 * @param key - localStorage key
 * @param value - Value to store (will be JSON serialized)
 * @throws {StorageError} If localStorage is not available, quota exceeded, or serialization fails
 */
export function setItem<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError(
      StorageErrorType.NOT_AVAILABLE,
      'localStorage is not available'
    );
  }

  try {
    const serialized = JSON.stringify(value);

    try {
      localStorage.setItem(key, serialized);

      // Check quota after successful write
      if (isApproachingQuota()) {
        console.warn(
          'localStorage approaching quota limit (>80%). Consider clearing completed tasks.'
        );
      }
    } catch (error) {
      // Check if quota exceeded
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22)
      ) {
        const { used, quota, percentage } = getStorageUsage();
        throw new StorageError(
          StorageErrorType.QUOTA_EXCEEDED,
          `localStorage quota exceeded. Used: ${(used / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB (${(percentage * 100).toFixed(1)}%)`,
          error
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Serialization error
    console.error(`Failed to serialize value for key "${key}":`, error);
    throw new StorageError(
      StorageErrorType.SERIALIZE_ERROR,
      `Failed to serialize value for key "${key}"`,
      error
    );
  }
}

/**
 * Remove item from localStorage
 *
 * @param key - localStorage key to remove
 */
export function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot remove item');
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item "${key}":`, error);
  }
}

/**
 * Clear all items from localStorage
 *
 * WARNING: This will remove ALL localStorage data, including data from other features.
 */
export function clear(): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, cannot clear');
    return;
  }

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Check if a key exists in localStorage
 *
 * @param key - localStorage key to check
 * @returns True if key exists
 */
export function hasItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  return localStorage.getItem(key) !== null;
}

/**
 * Get all keys from localStorage
 *
 * @returns Array of all localStorage keys
 */
export function getAllKeys(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  return Object.keys(localStorage);
}

/**
 * Get storage info for debugging
 *
 * @returns Object with storage statistics and availability status
 */
export function getStorageInfo(): {
  available: boolean;
  used: number;
  quota: number;
  percentage: number;
  keys: string[];
  approachingQuota: boolean;
} {
  const available = isLocalStorageAvailable();
  const { used, quota, percentage } = getStorageUsage();
  const keys = getAllKeys();
  const approachingQuota = isApproachingQuota();

  return {
    available,
    used,
    quota,
    percentage,
    keys,
    approachingQuota,
  };
}
