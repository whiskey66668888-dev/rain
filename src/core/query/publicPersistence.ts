import type { Query, QueryClient, QueryKey } from '@tanstack/react-query';

const DB_NAME = 'multisite-spa-public-query-cache';
const DB_VERSION = 1;
const STORE_NAME = 'queries';
const CACHE_VERSION = 2;
const RESTORE_TIMEOUT_MS = 800;
const MAX_CACHE_ENTRIES = 80;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

type PublicQueryCacheEntry = {
  id: string;
  queryKey: QueryKey;
  data: unknown;
  updatedAt: number;
  expiresAt: number;
  version: number;
  scope: string;
};

type PublicQueryCacheRule = {
  ttl: number;
  match: (queryKey: QueryKey) => boolean;
};

const isBrowser = () => typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

function normalizeQueryKeyValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeQueryKeyValue);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Object.prototype.toString.call(value) === '[object Object]') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        const next = (value as Record<string, unknown>)[key];
        if (next !== undefined) {
          result[key] = normalizeQueryKeyValue(next);
        }
        return result;
      }, {});
  }

  return value;
}

export function getStablePublicQueryKey(queryKey: QueryKey): string {
  return JSON.stringify(normalizeQueryKeyValue(queryKey));
}

function getCurrentLanguageScope(): string {
  if (!isBrowser()) return 'server';

  const firstPathSegment = window.location.pathname.split('/').filter(Boolean)[0];
  return firstPathSegment && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(firstPathSegment)
    ? firstPathSegment
    : 'default';
}

function getCurrentPublicQueryCacheScope(): string {
  return [__SITE_ID__, __BUILD_ENV__, getCurrentLanguageScope()].join(':');
}

function getPublicQueryCacheEntryId(scope: string, queryKey: QueryKey): string {
  return `${scope}:${getStablePublicQueryKey(queryKey)}`;
}

const publicQueryCacheRules: PublicQueryCacheRule[] = [
  { ttl: 6 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["origin","home","list"]' },
  { ttl: 6 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["origin","infoSlide"]' },
  { ttl: 6 * HOUR, match: (key) => key[0] === 'website' && key[1] === 'getCarouselResourceSlots' },
  {
    ttl: 6 * HOUR,
    match: (key) => key[0] === 'origin' && key[1] === 'banner' && key[2] === 'list',
  },
  { ttl: 6 * HOUR, match: (key) => key[0] === 'origin' && key[1] === 'loginBanner' },
  {
    ttl: 6 * HOUR,
    match: (key) => getStablePublicQueryKey(key) === '["origin","website","setting"]',
  },
  { ttl: 6 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["origin","contacts"]' },
  { ttl: 24 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["origin","region","data"]' },
  {
    ttl: 6 * HOUR,
    match: (key) =>
      key[0] === 'origin' && key[1] === 'website' && key[2] === 'customerConfiguration',
  },
  {
    ttl: 6 * HOUR,
    match: (key) => getStablePublicQueryKey(key) === '["origin","website","switch","list"]',
  },
  { ttl: 6 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["sponsorList"]' },
  { ttl: 30 * MINUTE, match: (key) => getStablePublicQueryKey(key) === '["discountType"]' },
  { ttl: 10 * MINUTE, match: (key) => key[0] === 'discountList' },
  { ttl: 10 * MINUTE, match: (key) => getStablePublicQueryKey(key) === '["hotEventList"]' },
  { ttl: 10 * MINUTE, match: (key) => getStablePublicQueryKey(key) === '["hotEventInfo"]' },
  {
    ttl: 10 * MINUTE,
    match: (key) => key[0] === 'origin' && key[1] === 'notice' && key[2] === 'fbList',
  },
  {
    ttl: 10 * MINUTE,
    match: (key) => key[0] === 'origin' && key[1] === 'notice' && key[2] === 'list',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) => key[0] === 'fb' && key[1] === 'match' && key[2] === 'statistical',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) => key[0] === 'origin' && key.slice(1, 5).join('|') === 'sport|list|by|type',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) => key[0] === 'origin' && key[1] === 'champion' && key[2] === 'hot',
  },
  { ttl: 30 * 1000, match: (key) => key[0] === 'fb' && key[1] === 'match' && key[2] === 'getList' },
  {
    ttl: 60 * 1000,
    match: (key) => key[0] === 'fb' && key[1] === 'sport' && key[2] === 'recommend',
  },
  {
    ttl: 2 * MINUTE,
    match: (key) =>
      key[0] === 'fb' && key[1] === 'match' && key[2] === 'getListByPopularEventsLive',
  },
  { ttl: 24 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["helpToolsList"]' },
  { ttl: 24 * HOUR, match: (key) => getStablePublicQueryKey(key) === '["questions"]' },
  {
    ttl: 24 * HOUR,
    match: (key) => getStablePublicQueryKey(key) === '["virtualCurrencyTutorialList"]',
  },
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

function isValidPublicQueryCacheEntry(
  entry: PublicQueryCacheEntry,
  scope: string,
  now: number,
): boolean {
  return (
    entry.scope === scope &&
    entry.version === CACHE_VERSION &&
    entry.expiresAt > now &&
    getPublicQueryCacheRule(entry.queryKey) !== undefined
  );
}

async function removePublicQueryCacheEntries(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => removePublicQueryCacheEntry(id).catch(() => undefined)));
}

function getPublicQueryCacheOverflowIds(entries: PublicQueryCacheEntry[]): string[] {
  if (entries.length <= MAX_CACHE_ENTRIES) return [];

  return entries
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(MAX_CACHE_ENTRIES)
    .map((entry) => entry.id);
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
  const scope = getCurrentPublicQueryCacheScope();
  const entry: PublicQueryCacheEntry = {
    id: getPublicQueryCacheEntryId(scope, query.queryKey),
    queryKey: query.queryKey,
    data: query.state.data,
    updatedAt,
    expiresAt: updatedAt + rule.ttl,
    version: CACHE_VERSION,
    scope,
  };

  void savePublicQueryCacheEntry(entry).catch(() => undefined);
}

export async function restorePublicQueryCache(queryClient: QueryClient): Promise<void> {
  if (!isBrowser()) return;

  const restore = async () => {
    const entries = await getAllPublicQueryCacheEntries();
    const now = Date.now();
    const scope = getCurrentPublicQueryCacheScope();
    const validEntries = entries.filter((entry) => isValidPublicQueryCacheEntry(entry, scope, now));
    const invalidIds = entries
      .filter((entry) => !isValidPublicQueryCacheEntry(entry, scope, now))
      .map((entry) => entry.id);
    const overflowIds = getPublicQueryCacheOverflowIds(validEntries);

    await removePublicQueryCacheEntries([...new Set([...invalidIds, ...overflowIds])]);

    validEntries
      .filter((entry) => !overflowIds.includes(entry.id))
      .forEach((entry) => {
        queryClient.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.updatedAt });
      });
  };

  await Promise.race([
    restore().catch(() => undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, RESTORE_TIMEOUT_MS);
    }),
  ]);
}

export const __publicQueryCacheTestUtils = {
  getStablePublicQueryKey,
  getPublicQueryCacheRule,
  getPublicQueryCacheEntryId,
  isValidPublicQueryCacheEntry,
  getPublicQueryCacheOverflowIds,
};

export function subscribePublicQueryCache(queryClient: QueryClient): () => void {
  if (!isBrowser()) return () => undefined;

  return queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated') return;
    const query = event.query as unknown as Query;
    persistPublicQuery(query);
  });
}
