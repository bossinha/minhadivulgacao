/**
 * Safe Storage Utilities
 * Prevents DOMException / SecurityError crashes in Private Browsing Mode (iOS Safari),
 * in-app webviews (WhatsApp, Instagram, Facebook), and restricted iframe environments.
 */

const memoryStore: Record<string, string> = {};

export function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // Fallback to memoryStore
  }
  return memoryStore[key] ?? null;
}

export function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {}
  memoryStore[key] = value;
}

export function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
  delete memoryStore[key];
}

export function safeSessionStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
    }
  } catch (e) {}
  return memoryStore[`session_${key}`] ?? null;
}

export function safeSessionStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch (e) {}
  memoryStore[`session_${key}`] = value;
}

export function safeSessionStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (e) {}
  delete memoryStore[`session_${key}`];
}
