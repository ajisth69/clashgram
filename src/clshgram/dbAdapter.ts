import {
  createStore,
  del,
  get,
  keys as getKeys,
  set,
} from 'idb-keyval';

const STORAGE_GUARD_DB_NAME = 'clashgram-storage-guard';
const STORAGE_GUARD_STORE_NAME = 'session-vault';

let vault: ReturnType<typeof createStore> | undefined;

export function openIndexedDBVault() {
  if (!vault) {
    vault = createStore(STORAGE_GUARD_DB_NAME, STORAGE_GUARD_STORE_NAME);
  }

  return vault;
}

export function getIndexedDBKey<T = string>(key: string) {
  return get<T>(key, openIndexedDBVault());
}

export function setIndexedDBKey<T = string>(key: string, value: T) {
  return set(key, value, openIndexedDBVault());
}

export function removeIndexedDBKey(key: string) {
  return del(key, openIndexedDBVault());
}

export function getIndexedDBKeys() {
  return getKeys(openIndexedDBVault());
}
