import { TNewsMsgItem } from '@/apis/origin/msgCenter/newsInbox';
import { TNewsInboxChildItem } from '@/apis/origin/msgCenter/newsInboxChild';
import {
  getIndexedDbCacheEntries,
  getIndexedDbCacheEntry,
  pruneIndexedDbCacheEntries,
  removeIndexedDbCacheEntries,
  removeIndexedDbCacheEntry,
  saveIndexedDbCacheEntry,
  type IndexedDbCacheConfig,
  type IndexedDbCacheEntry,
} from '@/utils/storage/indexedDbCache';
import type { RootState } from '../index';

const DB_CONFIG: IndexedDbCacheConfig = {
  dbName: 'multisite-spa-message-center-cache',
  dbVersion: 1,
  storeName: 'message-center',
};

const CACHE_VERSION = 1;
const MESSAGE_CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_MESSAGE_LIST_ITEMS = 50;
const MAX_MESSAGE_CACHE_ENTRY_BYTES = 300 * 1024;

type MessageCenterCacheCategory = 'inbox' | 'outbox' | 'inbox-child';

const MESSAGE_CENTER_CACHE_LIMITS: Record<MessageCenterCacheCategory, number> = {
  inbox: 20,
  outbox: 20,
  'inbox-child': 100,
};

type MessageCenterCacheEntry<TData> = IndexedDbCacheEntry<MessageCenterCacheCategory> & {
  data: TData;
  scope: string;
  version: number;
  dataSize: number;
};

export function getMessageCenterCacheScope(state: RootState): string | null {
  if (!state.user.userInfo.isLogin) return null;

  const memberId = state.user.memberInfo.id;
  const loginName = state.user.userInfo.loginName.trim();
  const memberScope = memberId ? `member:${memberId}` : loginName ? `login:${loginName}` : '';
  if (!memberScope) return null;

  return [__SITE_ID__, __BUILD_ENV__, memberScope].join(':');
}

function getMessageCenterCacheEntryId(
  scope: string,
  category: MessageCenterCacheCategory,
  key = 'list',
): string {
  return `${scope}:${category}:${key}`;
}

function isValidMessageCenterCacheEntry<TData>(
  entry: MessageCenterCacheEntry<TData> | undefined,
  scope: string,
  category: MessageCenterCacheCategory,
  now = Date.now(),
): entry is MessageCenterCacheEntry<TData> {
  return (
    !!entry &&
    entry.scope === scope &&
    entry.category === category &&
    entry.version === CACHE_VERSION &&
    entry.dataSize <= MAX_MESSAGE_CACHE_ENTRY_BYTES &&
    entry.expiresAt > now
  );
}

async function pruneMessageCenterCache(): Promise<void> {
  const entries = await getIndexedDbCacheEntries<MessageCenterCacheEntry<unknown>>(DB_CONFIG);
  await pruneIndexedDbCacheEntries(DB_CONFIG, entries, MESSAGE_CENTER_CACHE_LIMITS);
}

function getSerializedByteLength(value: unknown): number | null {
  try {
    const serialized = JSON.stringify(value);
    if (typeof Blob !== 'undefined') return new Blob([serialized]).size;
    return serialized.length;
  } catch {
    return null;
  }
}

function getMessageTimestamp(value: { addTime?: string; id: number }): number {
  const time = value.addTime ? new Date(value.addTime).getTime() : NaN;
  return Number.isFinite(time) ? time : value.id;
}

function limitMessageList<TItem extends { addTime?: string; id: number }>(items: TItem[]): TItem[] {
  return items
    .slice()
    .sort((a, b) => getMessageTimestamp(b) - getMessageTimestamp(a))
    .slice(0, MAX_MESSAGE_LIST_ITEMS);
}

async function readMessageCenterCache<TData>(
  scope: string,
  category: MessageCenterCacheCategory,
  key?: string,
): Promise<TData | null> {
  const id = getMessageCenterCacheEntryId(scope, category, key);
  const entry = await getIndexedDbCacheEntry<MessageCenterCacheEntry<TData>>(DB_CONFIG, id);
  return isValidMessageCenterCacheEntry(entry, scope, category) ? entry.data : null;
}

async function writeMessageCenterCache<TData>(
  scope: string,
  category: MessageCenterCacheCategory,
  data: TData,
  key?: string,
): Promise<void> {
  const now = Date.now();
  const dataSize = getSerializedByteLength(data);
  if (dataSize === null || dataSize > MAX_MESSAGE_CACHE_ENTRY_BYTES) return;

  const entry: MessageCenterCacheEntry<TData> = {
    id: getMessageCenterCacheEntryId(scope, category, key),
    category,
    data,
    dataSize,
    scope,
    version: CACHE_VERSION,
    updatedAt: now,
    expiresAt: now + MESSAGE_CACHE_TTL_MS,
  };

  await saveIndexedDbCacheEntry(DB_CONFIG, entry);
  await pruneMessageCenterCache();
}

async function removeMessageCenterCache(
  scope: string,
  category: MessageCenterCacheCategory,
  key?: string,
): Promise<void> {
  await removeIndexedDbCacheEntry(DB_CONFIG, getMessageCenterCacheEntryId(scope, category, key));
}

export async function removeMessageCenterScopeCache(scope: string): Promise<void> {
  const entries = await getIndexedDbCacheEntries<MessageCenterCacheEntry<unknown>>(DB_CONFIG);
  await removeIndexedDbCacheEntries(
    DB_CONFIG,
    entries.filter((entry) => entry.scope === scope).map((entry) => entry.id),
  );
}

export const readInboxCache = (scope: string): Promise<TNewsMsgItem[] | null> =>
  readMessageCenterCache<TNewsMsgItem[]>(scope, 'inbox');

export const writeInboxCache = (scope: string, data: TNewsMsgItem[]): Promise<void> =>
  writeMessageCenterCache(scope, 'inbox', limitMessageList(data));

export const removeInboxCache = (scope: string): Promise<void> =>
  removeMessageCenterCache(scope, 'inbox');

export const readOutboxCache = (scope: string): Promise<TNewsMsgItem[] | null> =>
  readMessageCenterCache<TNewsMsgItem[]>(scope, 'outbox');

export const writeOutboxCache = (scope: string, data: TNewsMsgItem[]): Promise<void> =>
  writeMessageCenterCache(scope, 'outbox', limitMessageList(data));

export const removeOutboxCache = (scope: string): Promise<void> =>
  removeMessageCenterCache(scope, 'outbox');

export const readInboxChildCache = (
  scope: string,
  id: number,
): Promise<TNewsInboxChildItem[] | null> =>
  readMessageCenterCache<TNewsInboxChildItem[]>(scope, 'inbox-child', String(id));

export const writeInboxChildCache = (
  scope: string,
  id: number,
  data: TNewsInboxChildItem[],
): Promise<void> =>
  writeMessageCenterCache(scope, 'inbox-child', limitMessageList(data), String(id));

export const __messageCenterCacheTestUtils = {
  getSerializedByteLength,
  limitMessageList,
};
