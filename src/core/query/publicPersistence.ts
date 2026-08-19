import type { Query, QueryClient, QueryKey } from '@tanstack/react-query';

const DB_NAME = 'multisite-spa-public-query-cache';
const DB_VERSION = 1;
const STORE_NAME = 'queries';
const CACHE_VERSION = 1;
const RESTORE_TIMEOUT_MS = 800;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

type PublicQueryCacheEntry = {
  id: string;
  queryKey: QueryKey;
  data: unknown;
  updatedAt: number;
  expiresAt: number;
  version: number;
};

type PublicQueryCacheRule = {
  ttl: number;
  match: (queryKey: QueryKey) => boolean;
};

const isBrowser = () => typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

const stableKey = (queryKey: QueryKey): string => JSON.stringify(queryKey);

const publicQueryCacheRules: PublicQueryCacheRule[] = [
  { ttl: 6 * HOUR, match: (key) => stableKey(key) === '["origin","home","list"]' },
  { ttl: 6 * HOUR, match: (key) => stableKey(key) === '["origin","infoSlide"]' },
  { ttl: 6 * HOUR, match: (key) => key[0] === 'website' && key[1] === 'getCarouselResourceSlots' },
  { ttl: 5 * MINUTE, match: (key) => stableKey(key) === '["origin","website","switch","list"]' },
  {
    ttl: 10 * MINUTE,
    match: (key) => key[0] === 'origin' && key[1] === 'notice' && key[2] === 'fbList',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) => key[0] === 'fb' && key[1] === 'match' && key[2] === 'statistical',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) => key[0] === 'origin' && key.slice(1, 5).join('|') === 'sport|list|by|type',
  },
  { ttl: 30 * 1000, match: (key) => key[0] === 'fb' && key[1] === 'match' && key[2] === 'getList' },
  {
    ttl: 2 * MINUTE,
    match: (key) =>
      key[0] === 'fb' && key[1] === 'match' && key[2] === 'getListByPopularEventsLive',
  },
  { ttl: 24 * HOUR, match: (key) => stableKey(key) === '["helpToolsList"]' },
  { ttl: 24 * HOUR, match: (key) => stableKey(key) === '["questions"]' },
  { ttl: 24 * HOUR, match: (key) => stableKey(key) === '["virtualCurrencyTutorialList"]' },
  { ttl: 24 * HOUR, match: (key) => key[0] === 'virtualCurrencyTutorial' },
  { ttl: 24 * HOUR, match: (key) => key[0] === 'tutorialContent' },
];

function getPublicQueryCacheRule(queryKey: QueryKey): PublicQueryCacheRule | undefined {
  return publicQueryCacheRules.find((rule) => rule.match(queryKey));
}

function openPublicQueryCacheDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openPublicQueryCacheDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = run(transaction.objectStore(STORE_NAME));

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

function removePublicQueryCacheEntry(id: string): Promise<unknown> {
  return withStore('readwrite', (store) => store.delete(id));
}

function savePublicQueryCacheEntry(entry: PublicQueryCacheEntry): Promise<unknown> {
  return withStore('readwrite', (store) => store.put(entry));
}

function getAllPublicQueryCacheEntries(): Promise<PublicQueryCacheEntry[]> {
  return withStore('readonly', (store) => store.getAll());
}

function isPersistableQuery(query: Query): boolean {
  const rule = getPublicQueryCacheRule(query.queryKey);
  if (!rule) return false;
  if (query.state.status !== 'success') return false;
  if (query.state.data === undefined) return false;
  return true;
}

function persistPublicQuery(query: Query): void {
  if (!isBrowser() || !isPersistableQuery(query)) return;

  const rule = getPublicQueryCacheRule(query.queryKey);
  if (!rule) return;

  const updatedAt = query.state.dataUpdatedAt || Date.now();
  const entry: PublicQueryCacheEntry = {
    id: stableKey(query.queryKey),
    queryKey: query.queryKey,
    data: query.state.data,
    updatedAt,
    expiresAt: updatedAt + rule.ttl,
    version: CACHE_VERSION,
  };

  void savePublicQueryCacheEntry(entry).catch(() => undefined);
}

export async function restorePublicQueryCache(queryClient: QueryClient): Promise<void> {
  if (!isBrowser()) return;

  const restore = async () => {
    const entries = await getAllPublicQueryCacheEntries();
    const now = Date.now();

    await Promise.all(
      entries.map(async (entry) => {
        const rule = getPublicQueryCacheRule(entry.queryKey);
        if (!rule || entry.version !== CACHE_VERSION || entry.expiresAt <= now) {
          await removePublicQueryCacheEntry(entry.id).catch(() => undefined);
          return;
        }

        queryClient.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.updatedAt });
      }),
    );
  };

  await Promise.race([
    restore().catch(() => undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, RESTORE_TIMEOUT_MS);
    }),
  ]);
}

export function subscribePublicQueryCache(queryClient: QueryClient): () => void {
  if (!isBrowser()) return () => undefined;

  return queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return;
    const query = event.query as unknown as Query;
    persistPublicQuery(query);
  });
}
