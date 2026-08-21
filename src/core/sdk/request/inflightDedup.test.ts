import assert from 'node:assert/strict';

import {
  buildInflightRequestKey,
  createInflightStore,
  isInflightDedupableBody,
  normalizeRequestBody,
} from './inflightDedup';

const emptyKeyA = buildInflightRequestKey({
  method: 'post',
  url: '/api/website/home/list',
  body: undefined,
  identity: 'guest',
});
const emptyKeyB = buildInflightRequestKey({
  method: 'POST',
  url: '/api/website/home/list',
  body: {},
  identity: 'guest',
});
const emptyKeyC = buildInflightRequestKey({
  method: 'post',
  url: '/api/website/home/list',
  body: null,
  identity: 'guest',
});

assert.equal(emptyKeyA, emptyKeyB);
assert.equal(emptyKeyA, emptyKeyC);

const paramKeyA = buildInflightRequestKey({
  method: 'post',
  url: '/api/center/welfareCenter3',
  body: { status: 0, pageSize: 1, pageNumber: 1 },
  identity: 'user:alice',
});
const paramKeyB = buildInflightRequestKey({
  method: 'post',
  url: '/api/center/welfareCenter3',
  body: { pageNumber: 1, pageSize: 1, status: 0 },
  identity: 'user:alice',
});
assert.equal(paramKeyA, paramKeyB);

const guestKey = buildInflightRequestKey({
  method: 'post',
  url: '/api/website/home/list',
  body: {},
  identity: 'guest',
});
const userKey = buildInflightRequestKey({
  method: 'post',
  url: '/api/website/home/list',
  body: {},
  identity: 'user:alice',
});
assert.notEqual(guestKey, userKey);

const otherUrlKey = buildInflightRequestKey({
  method: 'post',
  url: '/api/center/getTopMustMessage',
  body: {},
  identity: 'guest',
});
assert.notEqual(emptyKeyA, otherUrlKey);

assert.equal(isInflightDedupableBody(undefined), true);
assert.equal(isInflightDedupableBody({ id: 1 }), true);
assert.equal(isInflightDedupableBody(new FormData()), false);

assert.equal(normalizeRequestBody(undefined), null);
assert.equal(normalizeRequestBody({}), null);

async function testInflightReuse(): Promise<void> {
  const store = createInflightStore();
  let factoryCalls = 0;
  const pending = store.run('k', async () => {
    factoryCalls += 1;
    return 'ok';
  });
  const reused = store.run('k', async () => {
    factoryCalls += 1;
    return 'other';
  });

  assert.equal(await pending, 'ok');
  assert.equal(await reused, 'ok');
  assert.equal(factoryCalls, 1);

  const next = await store.run('k', async () => {
    factoryCalls += 1;
    return 'next';
  });
  assert.equal(next, 'next');
  assert.equal(factoryCalls, 2);

  let errorCalls = 0;
  const failed = store.run('err', async () => {
    errorCalls += 1;
    throw new Error('boom');
  });
  const failedReuse = store.run('err', async () => {
    errorCalls += 1;
    throw new Error('other');
  });

  await assert.rejects(failed, /boom/);
  await assert.rejects(failedReuse, /boom/);
  assert.equal(errorCalls, 1);

  await assert.rejects(
    store.run('err', async () => {
      errorCalls += 1;
      throw new Error('again');
    }),
    /again/,
  );
  assert.equal(errorCalls, 2);
}

void testInflightReuse()
  .then(() => {
    console.log('inflightDedup.test.ts passed');
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
