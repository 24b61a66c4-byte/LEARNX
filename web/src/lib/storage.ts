export const STORAGE_EVENT_NAME = "learnx-storage-change";

function notifyStorageChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  notifyStorageChange();
}

export function clearLocalStorage(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
  notifyStorageChange();
}

export function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 30) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

export function clearCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}
