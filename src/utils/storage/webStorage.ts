type WebStorageArea = 'local' | 'session';

const getStorage = (area: WebStorageArea): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const getString = (area: WebStorageArea, key: string): string | null => {
  const storage = getStorage(area);
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const setString = (area: WebStorageArea, key: string, value: string): boolean => {
  const storage = getStorage(area);
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const remove = (area: WebStorageArea, key: string): boolean => {
  const storage = getStorage(area);
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const getJSON = <T>(area: WebStorageArea, key: string, fallback: T): T => {
  const raw = getString(area, key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const setJSON = (area: WebStorageArea, key: string, value: unknown): boolean => {
  try {
    return setString(area, key, JSON.stringify(value));
  } catch {
    return false;
  }
};

export const safeGetLocalString = (key: string): string | null => getString('local', key);

export const safeSetLocalString = (key: string, value: string): boolean =>
  setString('local', key, value);

export const safeRemoveLocal = (key: string): boolean => remove('local', key);

export const safeGetLocalJSON = <T>(key: string, fallback: T): T => getJSON('local', key, fallback);

export const safeSetLocalJSON = (key: string, value: unknown): boolean =>
  setJSON('local', key, value);

export const safeGetSessionString = (key: string): string | null => getString('session', key);

export const safeSetSessionString = (key: string, value: string): boolean =>
  setString('session', key, value);

export const safeRemoveSession = (key: string): boolean => remove('session', key);

export const safeGetSessionJSON = <T>(key: string, fallback: T): T =>
  getJSON('session', key, fallback);

export const safeSetSessionJSON = (key: string, value: unknown): boolean =>
  setJSON('session', key, value);
