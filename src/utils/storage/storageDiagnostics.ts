export type StorageEstimateInfo = {
  quota?: number;
  usage?: number;
  usageRatio?: number;
};

export type StorageDiagnostics = {
  indexedDbAvailable: boolean;
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  estimate: StorageEstimateInfo | null;
};

function canUseStorage(area: 'localStorage' | 'sessionStorage'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storage = window[area];
    const key = '__storage_diagnostics__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function getStorageDiagnostics(): Promise<StorageDiagnostics> {
  const estimate =
    typeof navigator !== 'undefined' && navigator.storage?.estimate
      ? await navigator.storage
          .estimate()
          .then((value) => ({
            quota: value.quota,
            usage: value.usage,
            usageRatio: value.quota && value.usage ? value.usage / value.quota : undefined,
          }))
          .catch(() => null)
      : null;

  return {
    indexedDbAvailable: typeof indexedDB !== 'undefined',
    localStorageAvailable: canUseStorage('localStorage'),
    sessionStorageAvailable: canUseStorage('sessionStorage'),
    estimate,
  };
}
