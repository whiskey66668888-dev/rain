import { AppStore } from '.';

let globalStore: AppStore;

export function setGlobalStoreForApiRequest(store: AppStore): void {
  globalStore = store;
}

export function getGlobalStoreForApiRequest(): AppStore {
  return globalStore;
}
