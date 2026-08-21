export type IndexedDbCacheEntry<TCategory extends string = string> = {
  id: string;
  category: TCategory;
  updatedAt: number;
  expiresAt: number;
};

export type IndexedDbCacheConfig = {
  dbName: string;
  dbVersion: number;
  storeName: string;
};

const isIndexedDbAvailable = () =>
  typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

function openIndexedDbCache(config: IndexedDbCacheConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(config.dbName, config.dbVersion);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(config.storeName)) {
        db.createObjectStore(config.storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

export function withIndexedDbCacheStore<T>(
  config: IndexedDbCacheConfig,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openIndexedDbCache(config).then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(config.storeName, mode);
        const request = run(transaction.objectStore(config.storeName));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error('IndexedDB transaction failed'));
        };
      }),
  );
}

export function getIndexedDbCacheEntries<TEntry extends IndexedDbCacheEntry>(
  config: IndexedDbCacheConfig,
): Promise<TEntry[]> {
  return withIndexedDbCacheStore(config, 'readonly', (store) => store.getAll());
}

export function getIndexedDbCacheEntry<TEntry extends IndexedDbCacheEntry>(
  config: IndexedDbCacheConfig,
  id: string,
): Promise<TEntry | undefined> {
  return withIndexedDbCacheStore(config, 'readonly', (store) => store.get(id));
}

export function saveIndexedDbCacheEntry<TEntry extends IndexedDbCacheEntry>(
  config: IndexedDbCacheConfig,
  entry: TEntry,
): Promise<unknown> {
  return withIndexedDbCacheStore(config, 'readwrite', (store) => store.put(entry));
}

export function removeIndexedDbCacheEntry(
  config: IndexedDbCacheConfig,
  id: string,
): Promise<unknown> {
  return withIndexedDbCacheStore(config, 'readwrite', (store) => store.delete(id));
}

export async function removeIndexedDbCacheEntries(
  config: IndexedDbCacheConfig,
  ids: string[],
): Promise<void> {
  await Promise.all(ids.map((id) => removeIndexedDbCacheEntry(config, id).catch(() => undefined)));
}

export function getExpiredIndexedDbCacheIds<TEntry extends IndexedDbCacheEntry>(
  entries: TEntry[],
  now = Date.now(),
): string[] {
  return entries.filter((entry) => entry.expiresAt <= now).map((entry) => entry.id);
}

export function getIndexedDbCacheOverflowIds<
  TCategory extends string,
  TEntry extends IndexedDbCacheEntry<TCategory>,
>(entries: TEntry[], categoryLimits: Record<TCategory, number>): string[] {
  const ids: string[] = [];
  const entriesByCategory = new Map<TCategory, TEntry[]>();

  entries.forEach((entry) => {
    const bucket = entriesByCategory.get(entry.category) ?? [];
    bucket.push(entry);
    entriesByCategory.set(entry.category, bucket);
  });

  entriesByCategory.forEach((categoryEntries, category) => {
    const limit = categoryLimits[category];
    if (limit === undefined || categoryEntries.length <= limit) return;

    ids.push(
      ...categoryEntries
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(limit)
        .map((entry) => entry.id),
    );
  });

  return ids;
}

export async function pruneIndexedDbCacheEntries<
  TCategory extends string,
  TEntry extends IndexedDbCacheEntry<TCategory>,
>(
  config: IndexedDbCacheConfig,
  entries: TEntry[],
  categoryLimits: Record<TCategory, number>,
  now = Date.now(),
): Promise<void> {
  const expiredIds = getExpiredIndexedDbCacheIds(entries, now);
  const validEntries = entries.filter((entry) => entry.expiresAt > now);
  const overflowIds = getIndexedDbCacheOverflowIds(validEntries, categoryLimits);

  await removeIndexedDbCacheEntries(config, [...new Set([...expiredIds, ...overflowIds])]);
}
