import assert from 'node:assert/strict';

import { __publicQueryCacheTestUtils, getStablePublicQueryKey } from './publicPersistence';

const {
  getPublicQueryCacheRule,
  getPublicQueryCacheEntryId,
  getPublicQueryCacheOverflowIds,
  isValidPublicQueryCacheEntry,
} = __publicQueryCacheTestUtils;

const stableA = getStablePublicQueryKey(['origin', 'banner', 'list', { colorType: '', pid: 3 }]);
const stableB = getStablePublicQueryKey(['origin', 'banner', 'list', { pid: 3, colorType: '' }]);
const stableWithoutUndefined = getStablePublicQueryKey([
  'origin',
  'banner',
  'list',
  { colorType: '', pid: 3, ignored: undefined },
]);

assert.equal(stableA, stableB);
assert.equal(stableA, stableWithoutUndefined);
assert.equal(getPublicQueryCacheEntryId('op7:main:zh', ['questions']), 'op7:main:zh:["questions"]');

const validEntry = {
  id: 'op7:main:zh:["questions"]',
  queryKey: ['questions'],
  data: { ok: true },
  updatedAt: 1000,
  expiresAt: Date.now() + 10_000,
  version: 2,
  scope: 'op7:main:zh',
};

assert.equal(isValidPublicQueryCacheEntry(validEntry, 'op7:main:zh', Date.now()), true);
assert.equal(
  isValidPublicQueryCacheEntry({ ...validEntry, scope: 'op7:main:en' }, 'op7:main:zh', Date.now()),
  false,
);
assert.equal(
  isValidPublicQueryCacheEntry({ ...validEntry, version: 1 }, 'op7:main:zh', Date.now()),
  false,
);
assert.equal(
  isValidPublicQueryCacheEntry({ ...validEntry, expiresAt: 1 }, 'op7:main:zh', Date.now()),
  false,
);
assert.equal(
  isValidPublicQueryCacheEntry(
    { ...validEntry, id: 'private', queryKey: ['pay', 'channels'] },
    'op7:main:zh',
    Date.now(),
  ),
  false,
);

assert.ok(getPublicQueryCacheRule(['origin', 'website', 'customerConfiguration', 1]));
assert.ok(getPublicQueryCacheRule(['origin', 'contacts']));
assert.ok(getPublicQueryCacheRule(['origin', 'region', 'data']));
assert.ok(getPublicQueryCacheRule(['origin', 'champion', 'hot', 1]));
assert.ok(getPublicQueryCacheRule(['fb', 'sport', 'recommend', '1', 'home', 'away']));
assert.equal(getPublicQueryCacheRule(['securityCenter']), undefined);
assert.equal(getPublicQueryCacheRule(['center', 'unreadMessage']), undefined);
assert.equal(getPublicQueryCacheRule(['transaction', 'record', 'deposit', {}]), undefined);

const overflowIds = getPublicQueryCacheOverflowIds(
  Array.from({ length: 82 }).map((_, index) => ({
    ...validEntry,
    id: `id-${index}`,
    updatedAt: index,
  })),
);

assert.deepEqual(overflowIds, ['id-1', 'id-0']);
