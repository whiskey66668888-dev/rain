import { AsyncLocalStorage } from 'node:async_hooks';

type SsrRequestContext = {
  origin: string;
};

const ssrRequestContext = new AsyncLocalStorage<SsrRequestContext>();

export function runWithSsrRequestOrigin<T>(origin: string, callback: () => T): T {
  return ssrRequestContext.run({ origin }, callback);
}

export function getSsrRequestOrigin(): string | undefined {
  return ssrRequestContext.getStore()?.origin;
}

globalThis.__getSsrRequestOrigin = getSsrRequestOrigin;
