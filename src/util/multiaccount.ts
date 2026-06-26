import type { AccountInfo, SessionUserInfo, SharedSessionData } from '../types';

import {
  ACCOUNT_QUERY,
  DATA_BROADCAST_CHANNEL_PREFIX,
  ESTABLISH_BROADCAST_CHANNEL_PREFIX,
  GLOBAL_STATE_CACHE_PREFIX,
  MULTITAB_LOCALSTORAGE_KEY_PREFIX,
  SESSION_ACCOUNT_PREFIX,
  SESSION_LEGACY_USER_KEY,
  DC_IDS,
} from '../config';
import { mirrorLocalStorageKeys, mirrorSessionKeys } from '../clshgram/storageGuard';
import { IS_MULTIACCOUNT_SUPPORTED } from './browser/globalEnvironment';
import {
  openIndexedDBVault,
  setIndexedDBKey,
  removeIndexedDBKey,
} from '../clshgram/dbAdapter';
import { MAIN_IDB_STORE } from './browser/idb';
import { clearCacheForSlot } from './cacheApi';

export function loadSlotSession(slot: number | undefined): SharedSessionData | undefined {
  try {
    const data = JSON.parse(localStorage.getItem(`${SESSION_ACCOUNT_PREFIX}${slot || 1}`) || '{}') as SharedSessionData;
    if (!data.dcId) return undefined;
    return data;
  } catch (e) {
    return undefined;
  }
}

export function getAccountSlot(url: string) {
  const params = new URL(url).searchParams;
  const slot = params.get(ACCOUNT_QUERY);
  const slotNumber = slot ? Number(slot) : 1;
  if (!slotNumber || Number.isNaN(slotNumber) || slotNumber === 1) return undefined;
  return slotNumber;
}

const LAST_ACTIVE_SLOT_KEY = 'clashgram_last_active_account_slot';

function determineAccountSlot() {
  const workerName = typeof WorkerGlobalScope !== 'undefined' && globalThis.self instanceof WorkerGlobalScope
    ? globalThis.self.name : undefined;
  const workerAccountSlot = workerName ? Number(new URLSearchParams(workerName).get(ACCOUNT_QUERY)) : undefined;

  if (workerAccountSlot) return workerAccountSlot;
  if (!IS_MULTIACCOUNT_SUPPORTED) return undefined;

  if (typeof window !== 'undefined' && window.location) {
    const urlSlot = getAccountSlot(window.location.href);
    if (urlSlot) {
      if (loadSlotSession(urlSlot)) {
        try {
          localStorage.setItem(LAST_ACTIVE_SLOT_KEY, String(urlSlot));
        } catch (e) {}
      }
      return urlSlot;
    }
  }

  return undefined;
}

export const ACCOUNT_SLOT = determineAccountSlot();
if (typeof globalThis !== 'undefined') {
  (globalThis as any).ACCOUNT_SLOT = ACCOUNT_SLOT;
}

export const DATA_BROADCAST_CHANNEL_NAME = `${DATA_BROADCAST_CHANNEL_PREFIX}_${ACCOUNT_SLOT || 1}`;
export const ESTABLISH_BROADCAST_CHANNEL_NAME = `${ESTABLISH_BROADCAST_CHANNEL_PREFIX}_${ACCOUNT_SLOT || 1}`;
export const MULTITAB_STORAGE_KEY = `${MULTITAB_LOCALSTORAGE_KEY_PREFIX}_${ACCOUNT_SLOT || 1}`;
export const GLOBAL_STATE_CACHE_KEY = ACCOUNT_SLOT
  ? `${GLOBAL_STATE_CACHE_PREFIX}_${ACCOUNT_SLOT}` : GLOBAL_STATE_CACHE_PREFIX;

export function getAccountsInfo() {
  if (!IS_MULTIACCOUNT_SUPPORTED) return {};
  const allKeys = Object.keys(localStorage);
  const allSlots = allKeys.filter((key) => key.startsWith(SESSION_ACCOUNT_PREFIX));
  const accountInfo: Record<number, AccountInfo> = {};
  for (const key of allSlots) {
    const i = Number(key.slice(SESSION_ACCOUNT_PREFIX.length));
    const info = getAccountInfo(i);
    if (info) {
      accountInfo[i] = info;
    }
  }
  return accountInfo;
}

function getAccountInfo(slot: number): AccountInfo | undefined {
  const sessionData = loadSlotSession(slot);
  const {
    userId, avatarUri, color, emojiStatusId, firstName, lastName, isPremium, isTest, phone,
  } = sessionData || {};

  if (!userId) return undefined;

  return {
    userId,
    avatarUri,
    color,
    emojiStatusId,
    firstName,
    lastName,
    isPremium,
    isTest,
    phone,
  };
}

export function storeAccountData(slot: number | undefined, data: Partial<SessionUserInfo>) {
  const currentSlotData = loadSlotSession(slot);

  if (!currentSlotData) return;

  const updatedSharedData: SharedSessionData = {
    ...currentSlotData,
    ...data,
  };

  if (!updatedSharedData.userId) return;

  writeSlotSession(slot, updatedSharedData);
}

export function writeSlotSession(slot: number | undefined, data: SharedSessionData) {
  const sessionKey = `${SESSION_ACCOUNT_PREFIX}${slot || 1}`;
  localStorage.setItem(sessionKey, JSON.stringify(data));
  void mirrorLocalStorageKeys([sessionKey]);
}

export function getAccountSlotUrl(slot: number, forLogin?: boolean, isTest?: boolean) {
  const url = new URL(globalThis.location.href);
  if (slot !== 1) {
    url.searchParams.set(ACCOUNT_QUERY, String(slot));
  } else {
    url.searchParams.delete(ACCOUNT_QUERY);
  }

  if (isTest) {
    url.searchParams.set('test', 'true');
  } else {
    url.searchParams.delete('test');
  }

  url.hash = forLogin ? 'login' : '';
  return url.toString();
}

// Validate current version across all tabs to avoid conflicts
if (typeof window === 'object') {
  const versionChannel = new BroadcastChannel('tt-version');
  versionChannel.postMessage({ version: APP_VERSION });

  versionChannel.addEventListener('message', (event) => {
    const { version } = event.data;
    if (!version) return;
    if (semverCompare(APP_VERSION, version) === -1) {
      window.location.reload();
    }

    // If incoming version is older, send back the current version
    if (semverCompare(APP_VERSION, version) === 1) {
      versionChannel.postMessage({ version: APP_VERSION });
    }
  });
}

function semverCompare(a: string, b: string) {
  if (a.startsWith(`${b}-`)) return -1;
  if (b.startsWith(`${a}-`)) return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'case', caseFirst: 'upper' });
}

export async function reorganizeAccountSlots(): Promise<number | undefined> {
  const accounts = getAccountsInfo();
  const slots = Object.keys(accounts).map(Number).sort((a, b) => a - b);
  
  const currentSlot = getAccountSlot(globalThis.location.href) || 1;
  let newCurrentSlot = currentSlot;

  const currentSlotIdx = slots.indexOf(currentSlot);

  for (let idx = 0; idx < slots.length; idx++) {
    const oldSlot = slots[idx];
    const newSlot = idx + 1;
    if (oldSlot === newSlot) continue;

    // Move session data in localStorage
    const oldKey = `${SESSION_ACCOUNT_PREFIX}${oldSlot}`;
    const newKey = `${SESSION_ACCOUNT_PREFIX}${newSlot}`;
    const sessionData = localStorage.getItem(oldKey);
    if (sessionData) {
      localStorage.setItem(newKey, sessionData);
      localStorage.removeItem(oldKey);

      // Move multitab state in localStorage
      const oldMultitabKey = `${MULTITAB_LOCALSTORAGE_KEY_PREFIX}_${oldSlot}`;
      const newMultitabKey = `${MULTITAB_LOCALSTORAGE_KEY_PREFIX}_${newSlot}`;
      const multitabData = localStorage.getItem(oldMultitabKey);
      if (multitabData) {
        localStorage.setItem(newMultitabKey, multitabData);
        localStorage.removeItem(oldMultitabKey);
      }

      // Clear cache of slot we are overwriting, and old slot
      await clearCacheForSlot(newSlot);
      await clearCacheForSlot(oldSlot);
      
      // If we moved to slot 1, write the legacy keys as well
      if (newSlot === 1) {
        try {
          const parsed = JSON.parse(sessionData) as SharedSessionData;
          localStorage.setItem(SESSION_LEGACY_USER_KEY, JSON.stringify({
            dcID: parsed.dcId,
            id: parsed.userId,
            test: parsed.isTest,
          }));
          localStorage.setItem('dc', String(parsed.dcId));
          DC_IDS.forEach((dcId) => {
            const authKey = parsed[`dc${dcId}_auth_key` as keyof SharedSessionData];
            if (authKey) {
              localStorage.setItem(`dc${dcId}_auth_key`, authKey as string);
            } else {
              localStorage.removeItem(`dc${dcId}_auth_key`);
            }
          });
        } catch (e) {
          // ignore
        }
      }

      // Mirror to storage guard IndexedDB vault
      openIndexedDBVault();
      await setIndexedDBKey(newKey, sessionData);
      await removeIndexedDBKey(oldKey);
      if (newSlot === 1) {
        await mirrorSessionKeys(1);
      }
    }

    // Move global state cache in MAIN_IDB_STORE (IndexedDB)
    const oldCacheKey = oldSlot === 1 ? 'tt-global-state' : `tt-global-state_${oldSlot}`;
    const newCacheKey = newSlot === 1 ? 'tt-global-state' : `tt-global-state_${newSlot}`;
    try {
      const cachedState = await MAIN_IDB_STORE.get<any>(oldCacheKey);
      if (cachedState) {
        await MAIN_IDB_STORE.set(newCacheKey, cachedState);
        await MAIN_IDB_STORE.del(oldCacheKey);
      }
    } catch (e) {
      // ignore
    }
  }

  // Clear any slots that are no longer needed
  const maxSlot = Math.max(...slots, currentSlot);
  for (let i = slots.length + 1; i <= maxSlot; i++) {
    localStorage.removeItem(`${SESSION_ACCOUNT_PREFIX}${i}`);
    localStorage.removeItem(`${MULTITAB_LOCALSTORAGE_KEY_PREFIX}_${i}`);
    try {
      openIndexedDBVault();
      await removeIndexedDBKey(`${SESSION_ACCOUNT_PREFIX}${i}`);
    } catch (e) {
      // ignore
    }
    // Also delete cache key
    const cacheKey = i === 1 ? 'tt-global-state' : `tt-global-state_${i}`;
    try {
      await MAIN_IDB_STORE.del(cacheKey);
    } catch (e) {
      // ignore
    }
    // Clear caches for this slot
    await clearCacheForSlot(i);
  }

  // Determine the next slot to show:
  if (currentSlotIdx !== -1) {
    newCurrentSlot = currentSlotIdx + 1;
  } else {
    newCurrentSlot = slots.length > 0 ? 1 : currentSlot;
  }

  if (newCurrentSlot !== currentSlot || (currentSlotIdx === -1 && slots.length > 0)) {
    return newCurrentSlot;
  }

  return undefined;
}
