import browser from 'webextension-polyfill';

export interface ExtensionStorageSchema {
  theme: 'light' | 'dark' | 'system';
  copilotEnabled: boolean;
  userApiKey?: string;
  savedNotes: string[];
}

const DEFAULT_STORAGE: ExtensionStorageSchema = {
  theme: 'system',
  copilotEnabled: true,
  userApiKey: '',
  savedNotes: [],
};

/**
 * Type-safe abstraction over browser extension local storage.
 * Follows Single Responsibility and Interface Segregation principles.
 */
export class ExtensionStorage {
  /**
   * Retrieves a value from local storage by key.
   */
  static async get<K extends keyof ExtensionStorageSchema>(key: K): Promise<ExtensionStorageSchema[K]> {
    try {
      const result = await browser.storage.local.get(key);
      if (result && result[key] !== undefined) {
        return result[key] as ExtensionStorageSchema[K];
      }
      return DEFAULT_STORAGE[key];
    } catch (error) {
      console.error(`[ExtensionStorage] Failed to get key: ${key}`, error);
      return DEFAULT_STORAGE[key];
    }
  }

  /**
   * Saves a value to local storage.
   */
  static async set<K extends keyof ExtensionStorageSchema>(key: K, value: ExtensionStorageSchema[K]): Promise<void> {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`[ExtensionStorage] Failed to set key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Retrieves the entire extension storage.
   */
  static async getAll(): Promise<ExtensionStorageSchema> {
    try {
      const result = await browser.storage.local.get(null);
      return {
        ...DEFAULT_STORAGE,
        ...result,
      } as ExtensionStorageSchema;
    } catch (error) {
      console.error('[ExtensionStorage] Failed to get all storage', error);
      return DEFAULT_STORAGE;
    }
  }

  /**
   * Clears the local storage and resets it to defaults.
   */
  static async clear(): Promise<void> {
    try {
      await browser.storage.local.clear();
      await browser.storage.local.set(DEFAULT_STORAGE);
    } catch (error) {
      console.error('[ExtensionStorage] Failed to clear storage', error);
      throw error;
    }
  }
}
