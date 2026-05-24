import type { ApiSessionData } from '../api/types';
import type { DcId, SharedSessionData } from '../types';

import {
  DC_IDS,
  DEBUG,
  IS_SCREEN_LOCKED_CACHE_KEY,
  SESSION_ACCOUNT_PREFIX,
  SESSION_LEGACY_USER_KEY,
} from '../config';
import { mirrorSessionKeys, removeSessionMirrorKeys } from '../clshgram/storageGuard';
import { ACCOUNT_SLOT, storeAccountData, writeSlotSession } from './multiaccount';

import SafeSessionManager from './SafeSessionManager';

const safeSessionManager = new SafeSessionManager({
  accountSlot: ACCOUNT_SLOT,
  shouldReadLegacySession: !ACCOUNT_SLOT,
});

export function hasStoredSession() {
  if (checkSessionLocked()) {
    return true;
  }

  return Boolean(loadStoredSession());
}

export function storeSession(sessionData: ApiSessionData) {
  const {
    mainDcId, keys, isTest,
  } = sessionData;

  const currentSlotData = loadSlotSession(ACCOUNT_SLOT);
  const newSlotData: SharedSessionData = {
    ...currentSlotData,
    dcId: mainDcId,
    isTest,
  };

  Object.keys(keys).map(Number).forEach((dcId) => {
    newSlotData[`dc${dcId as DcId}_auth_key`] = keys[dcId];
  });

  if (!ACCOUNT_SLOT) {
    storeLegacySession(sessionData, currentSlotData?.userId);
  }

  writeSlotSession(ACCOUNT_SLOT, newSlotData);
  void mirrorSessionKeys(ACCOUNT_SLOT);
}

function storeLegacySession(sessionData: ApiSessionData, currentUserId?: string) {
  const {
    mainDcId, keys, isTest,
  } = sessionData;

  localStorage.setItem(SESSION_LEGACY_USER_KEY, JSON.stringify({
    dcID: mainDcId,
    id: currentUserId,
    test: isTest,
  }));
  localStorage.setItem('dc', String(mainDcId));
  Object.keys(keys).map(Number).forEach((dcId) => {
    localStorage.setItem(`dc${dcId}_auth_key`, keys[dcId]);
  });
}

export function clearStoredSession(slot?: number) {
  if (!slot) {
    clearStoredLegacySession();
  }

  localStorage.removeItem(`${SESSION_ACCOUNT_PREFIX}${slot || 1}`);
  void removeSessionMirrorKeys(slot, !slot);
}

function clearStoredLegacySession() {
  [
    SESSION_LEGACY_USER_KEY,
    'dc',
    ...DC_IDS.map((dcId) => `dc${dcId}_auth_key`),
    ...DC_IDS.map((dcId) => `dc${dcId}_hash`),
    ...DC_IDS.map((dcId) => `dc${dcId}_server_salt`),
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function loadStoredSession(): ApiSessionData | undefined {
  return safeSessionManager.validateAndLoadSession();
}

export function loadSlotSession(slot: number | undefined): SharedSessionData | undefined {
  try {
    const data = JSON.parse(localStorage.getItem(`${SESSION_ACCOUNT_PREFIX}${slot || 1}`) || '{}') as SharedSessionData;
    if (!data.dcId) return undefined;
    return data;
  } catch (e) {
    return undefined;
  }
}

export function updateSessionUserId(currentUserId: string) {
  const slotData = loadSlotSession(ACCOUNT_SLOT);
  if (!slotData) return;
  storeAccountData(ACCOUNT_SLOT, { userId: currentUserId });
}

export function importTestSession() {
  const sessionJson = process.env.TEST_SESSION!;
  try {
    const sessionData = JSON.parse(sessionJson) as ApiSessionData & { userId: string };
    storeLegacySession(sessionData, sessionData.userId);
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load test session', err);
    }
  }
}

export function checkSessionLocked() {
  return localStorage.getItem(IS_SCREEN_LOCKED_CACHE_KEY) === 'true';
}
