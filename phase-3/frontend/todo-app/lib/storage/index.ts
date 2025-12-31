/**
 * Storage Utilities Export
 *
 * Central export file for localStorage abstraction utilities.
 *
 * @module lib/storage
 */

export {
  isLocalStorageAvailable,
  getStorageUsage,
  isApproachingQuota,
  getItem,
  setItem,
  removeItem,
  clear,
  hasItem,
  getAllKeys,
  getStorageInfo,
  StorageError,
  StorageErrorType,
} from './localStorage';
