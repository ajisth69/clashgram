import {
  ACCOUNT_QUERY,
  DC_IDS,
  IS_SCREEN_LOCKED_CACHE_KEY,
  SESSION_ACCOUNT_PREFIX,
  SESSION_LEGACY_USER_KEY,
} from '../config';
import {
  getIndexedDBKey,
  getIndexedDBKeys,
  openIndexedDBVault,
  removeIndexedDBKey,
  setIndexedDBKey,
} from './dbAdapter';

const STORAGE_READY_RETRIES = 12;
const STORAGE_READY_DELAY_MS = 25;
const SESSION_CLEAR_TOMBSTONE_KEY = 'clashgram:storage-guard:session-cleared';

const COMPAT_AUTH_SIGNATURE_KEYS = [
  'clashgram_auth_session',
  'tg_session_id',
  'dc_options',
  'session',
  'stringSession',
  'gramjs-session',
];

const LEGACY_CONNECTION_KEYS = [
  SESSION_LEGACY_USER_KEY,
  'dc',
  ...DC_IDS.flatMap((dcId) => [
    `dc${dcId}_auth_key`,
    `dc${dcId}_hash`,
    `dc${dcId}_server_salt`,
  ]),
];

let lastGuardRun: Promise<boolean> | undefined;

export const secureBrowserStorage = async (): Promise<boolean> => {
  if (navigator.storage && navigator.storage.persist) {
    const alreadyPersistent = await navigator.storage.persisted();
    if (alreadyPersistent) return true;
    return navigator.storage.persist();
  }
  return false;
};

export const syncAndVerifySessionKeys = async (slot = getCurrentAccountSlot()): Promise<boolean> => {
  lastGuardRun = runStorageGuard(slot);
  return lastGuardRun;
};

export function getLastStorageGuardRun() {
  return lastGuardRun;
}

export function mirrorSessionKeys(slot = getCurrentAccountSlot()) {
  return mirrorLocalStorageKeys(getProtectedSessionKeys(slot, true));
}

export async function mirrorLocalStorageKeys(keys: string[]) {
  try {
    openIndexedDBVault();

    const entries = keys
      .map((key) => [key, getLocalStorageValue(key)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

    await Promise.all(entries.map(([key, value]) => setIndexedDBKey(key, value)));
    if (entries.length) {
      removeLocalStorageValue(SESSION_CLEAR_TOMBSTONE_KEY);
    }
  } catch {
    // IndexedDB can be disabled independently from localStorage; local session remains authoritative.
  }
}

export async function removeSessionMirrorKeys(slot = getCurrentAccountSlot(), shouldIncludeLegacy = !slot) {
  setLocalStorageValue(SESSION_CLEAR_TOMBSTONE_KEY, String(Date.now()));
  await purgeSessionMirrorKeys(slot, shouldIncludeLegacy);
}

async function purgeSessionMirrorKeys(slot: number | undefined, shouldIncludeLegacy: boolean) {
  try {
    openIndexedDBVault();
    await Promise.all(getProtectedSessionKeys(slot, shouldIncludeLegacy).map(removeIndexedDBKey));
  } catch {
    // Best effort cleanup; explicit localStorage removal still prevents the active session from loading.
  }
}

async function runStorageGuard(slot: number | undefined) {
  if (getLocalStorageValue(IS_SCREEN_LOCKED_CACHE_KEY) === 'true') {
    return true;
  }

  await Promise.allSettled([
    secureBrowserStorage(),
    waitForLocalStorageProbe(),
  ]);
  openIndexedDBVault();

  const hasPhysicalLocalSignature = hasLocalAuthSignature(slot);
  if (!hasPhysicalLocalSignature && getLocalStorageValue(SESSION_CLEAR_TOMBSTONE_KEY)) {
    await purgeSessionMirrorKeys(slot, !slot);
    return false;
  }

  if (!hasPhysicalLocalSignature) {
    // eslint-disable-next-line no-console
    console.warn('LocalStorage session empty during build shift. Running IndexedDB recovery lookup...');

    const didRecover = await recoverSessionKeysFromIndexedDB(slot);
    if (didRecover) {
      // eslint-disable-next-line no-console
      console.log('Session recovered smoothly from secondary vault. Update logout prevented.');
      return true;
    }

    return false;
  }

  await mirrorSessionKeys(slot);
  return true;
}

async function waitForLocalStorageProbe() {
  for (let i = 0; i < STORAGE_READY_RETRIES; i++) {
    try {
      const probeKey = '__clashgram_storage_guard_probe__';
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
      return;
    } catch {
      await pause(STORAGE_READY_DELAY_MS);
    }
  }
}

async function recoverSessionKeysFromIndexedDB(slot: number | undefined) {
  let didRecover = false;

  for (const key of await getRecoverableIndexedDBKeys(slot)) {
    if (getLocalStorageValue(key)) continue;

    const value = await getIndexedDBValue(key);
    if (!value) continue;

    setLocalStorageValue(key, value);
    didRecover = true;
  }

  return didRecover && (hasLocalAuthSignature(slot) || hasAnyLocalAccountAuthSignature());
}

async function getRecoverableIndexedDBKeys(slot: number | undefined) {
  const requestedKeys = getProtectedSessionKeys(slot, true);
  const vaultKeys = await getIndexedDBKeysSafe();
  const recoverableVaultKeys = vaultKeys
    .filter((key): key is string => typeof key === 'string')
    .filter(isRecoverableVaultSessionKey);

  return Array.from(new Set([...requestedKeys, ...recoverableVaultKeys]));
}

function isRecoverableVaultSessionKey(key: string) {
  return (
    key.startsWith(SESSION_ACCOUNT_PREFIX)
    || LEGACY_CONNECTION_KEYS.includes(key)
    || COMPAT_AUTH_SIGNATURE_KEYS.includes(key)
  );
}

function hasLocalAuthSignature(slot: number | undefined) {
  const accountSession = getLocalStorageValue(getAccountSessionKey(slot));
  if (hasAccountAuthSignature(accountSession)) {
    return true;
  }

  const legacyUserAuth = getLocalStorageValue(SESSION_LEGACY_USER_KEY);
  const legacyDc = getLocalStorageValue('dc');
  const hasLegacyAuthKey = DC_IDS.some((dcId) => Boolean(getLocalStorageValue(`dc${dcId}_auth_key`)));
  if (legacyUserAuth && legacyDc && hasLegacyAuthKey) {
    return true;
  }

  return COMPAT_AUTH_SIGNATURE_KEYS.some((key) => Boolean(getLocalStorageValue(key)));
}

function hasAccountAuthSignature(value: string | undefined) {
  if (!value) return false;

  try {
    const data = JSON.parse(value) as Record<string, unknown>;
    return Boolean(data.dcId) && DC_IDS.some((dcId) => Boolean(data[`dc${dcId}_auth_key`]));
  } catch {
    return false;
  }
}

function hasAnyLocalAccountAuthSignature() {
  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(SESSION_ACCOUNT_PREFIX))
      .some((key) => hasAccountAuthSignature(getLocalStorageValue(key)));
  } catch {
    return false;
  }
}

function getProtectedSessionKeys(slot: number | undefined, shouldIncludeLegacy: boolean) {
  return [
    getAccountSessionKey(slot),
    ...(shouldIncludeLegacy ? LEGACY_CONNECTION_KEYS : []),
    ...COMPAT_AUTH_SIGNATURE_KEYS,
  ];
}

function getAccountSessionKey(slot: number | undefined) {
  return `${SESSION_ACCOUNT_PREFIX}${slot || 1}`;
}

function getCurrentAccountSlot() {
  try {
    const slot = new URL(globalThis.location.href).searchParams.get(ACCOUNT_QUERY);
    const slotNumber = slot ? Number(slot) : 1;
    return !slotNumber || Number.isNaN(slotNumber) || slotNumber === 1 ? undefined : slotNumber;
  } catch {
    return undefined;
  }
}

function getLocalStorageValue(key: string) {
  try {
    return localStorage.getItem(key) || undefined;
  } catch {
    return undefined;
  }
}

function setLocalStorageValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // App startup will continue unauthenticated if localStorage is not writable.
  }
}

function removeLocalStorageValue(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore unavailable localStorage.
  }
}

async function getIndexedDBValue(key: string) {
  try {
    return await getIndexedDBKey<string>(key);
  } catch {
    return undefined;
  }
}

async function getIndexedDBKeysSafe() {
  try {
    return await getIndexedDBKeys();
  } catch {
    return [];
  }
}

function pause(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
