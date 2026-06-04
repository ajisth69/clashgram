import type { ApiSessionData } from '../api/types';

import {
  DC_IDS,
  SESSION_ACCOUNT_PREFIX,
  SESSION_LEGACY_USER_KEY,
} from '../config';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

type SessionCandidate = {
  mainDcId?: unknown;
  keys?: Record<number, unknown>;
  isTest?: unknown;
};

type SafeSessionManagerOptions = {
  localStorage?: StorageLike;
  sessionStorage?: StorageLike;
  accountSlot?: number;
  shouldReadLegacySession?: boolean;
};

type SafeClientLifecycle = {
  connect?: () => Promise<void>;
  disconnect?: () => void | Promise<void>;
  destroy?: () => void | Promise<void>;
};

type SafeConnectParams<TClient extends SafeClientLifecycle> = {
  sessionData?: ApiSessionData;
  createClient: (sessionData?: ApiSessionData) => TClient;
  connect?: (client: TClient, sessionData?: ApiSessionData) => Promise<void>;
  onCleanUnauthenticatedState: () => void | Promise<void>;
  onTransportError?: (error: unknown) => void;
  startupErrorLimit?: number;
  shouldRetryClean?: boolean;
};

type BackgroundTaskParams = {
  label: string;
  run: (signal: AbortSignal) => Promise<void>;
  onTransportError?: (error: unknown) => void;
};

type SessionValidationResult = {
  sessionData?: ApiSessionData;
  reason?: string;
};

const AUTH_KEY_HEX_LENGTH = 512;
const DEFAULT_STARTUP_ERROR_LIMIT = 2;
const STARTUP_ERROR_COUNT_KEY = 'clashgram:safe-session:startup-error-count';

const RE_TIMEOUT_UPPER = /\bTIMEOUT\b/i;
const RE_TIMEOUT = /timeout/i;
const RE_HTTP_STREAM_CLOSED = /HttpStream was closed/i;
const RE_WEB_SOCKET_CLOSED = /WebSocket was closed/i;
const RE_WEB_SOCKET_TIMEOUT = /WebSocket connection timeout/i;
const RE_WS_CODE_1006 = /code\s*1006/i;
const RE_ABNORMAL_CLOSURE = /abnormal closure/i;
const RE_NETWORK_ERROR = /network\s*error/i;
const RE_SECURE_SOCKET = /secure socket/i;
const RE_SSL = /\bssl\b/i;
const RE_CANNOT_SEND_DISCONNECTED = /Cannot send requests while disconnected/i;
const RE_FAILED_TO_FETCH = /failed to fetch/i;
const RE_LOAD_FAILED = /load failed/i;
const RE_CONNECTION_REFUSED = /connection refused/i;
const RE_DNS = /dns_/i;
const RE_LEGACY_AUTH_DC_KEY = /^dc[1-5]_(auth_key|hash|server_salt)$/;
const RE_AUTH_KEY_HEX = /^[\da-f]+$/i;

export default class SafeSessionManager {
  private readonly localStorage?: StorageLike;
  private readonly sessionStorage?: StorageLike;
  private readonly accountSlot?: number;
  private readonly shouldReadLegacySession: boolean;
  private readonly abortControllers = new Set<AbortController>();
  private readonly cleanupCallbacks = new Set<() => void | Promise<void>>();

  private startupErrorCount = 0;

  constructor(options: SafeSessionManagerOptions = {}) {
    const {
      localStorage = SafeSessionManager.getStorage('localStorage'),
      sessionStorage = SafeSessionManager.getStorage('sessionStorage'),
      accountSlot,
      shouldReadLegacySession = true,
    } = options;

    this.localStorage = localStorage;
    this.sessionStorage = sessionStorage;
    this.accountSlot = accountSlot;
    this.shouldReadLegacySession = shouldReadLegacySession;
  }

  enforceTransportOptions<T extends Record<string, unknown>>(options: T) {
    return {
      ...options,
      useWSS: true,
      shouldAllowHttpTransport: false,
      shouldForceHttpTransport: false,
    } as T & {
      useWSS: true;
      shouldAllowHttpTransport: false;
      shouldForceHttpTransport: false;
    };
  }

  validateAndLoadSession(explicitSessionData?: ApiSessionData) {
    const explicit = this.validateSessionData(explicitSessionData);
    if (explicit.sessionData) {
      this.resetStartupErrorCount();
      return explicit.sessionData;
    }

    const stored = this.validateStoredSession();
    if (stored.sessionData) {
      this.resetStartupErrorCount();
      return stored.sessionData;
    }

    if (explicit.reason || stored.reason) {
      this.purgeBadSessionKeys();
    }

    return undefined;
  }

  async connectSafely<TClient extends SafeClientLifecycle>({
    sessionData: explicitSessionData,
    createClient,
    connect,
    onCleanUnauthenticatedState,
    onTransportError,
    startupErrorLimit = DEFAULT_STARTUP_ERROR_LIMIT,
    shouldRetryClean = true,
  }: SafeConnectParams<TClient>) {
    const sessionData = this.validateAndLoadSession(explicitSessionData);
    if (explicitSessionData && !sessionData) {
      await onCleanUnauthenticatedState();
    }

    const client = createClient(sessionData);

    try {
      await this.connectClient(client, connect, sessionData);
      this.resetStartupErrorCount();

      return { client, sessionData, didRecover: false };
    } catch (error) {
      if (!this.isRecoverableTransportError(error) || !sessionData) {
        throw error;
      }

      onTransportError?.(error);
      throw error;
    }
  }

  runBackgroundTask({
    label,
    run,
    onTransportError,
  }: BackgroundTaskParams) {
    const controller = new AbortController();
    this.abortControllers.add(controller);

    void (async () => {
      try {
        await run(controller.signal);
      } catch (error) {
        if (controller.signal.aborted) return;

        if (this.isRecoverableTransportError(error)) {
          onTransportError?.(error);
          await this.terminateBackgroundTasks();
          return;
        }

        // eslint-disable-next-line no-console
        console.error(`[SafeSessionManager] Background task failed: ${label}`, error);
      } finally {
        this.abortControllers.delete(controller);
      }
    })();

    return () => {
      controller.abort();
      this.abortControllers.delete(controller);
    };
  }

  registerCleanup(callback: () => void | Promise<void>) {
    this.cleanupCallbacks.add(callback);

    return () => {
      this.cleanupCallbacks.delete(callback);
    };
  }

  async terminateBackgroundTasks() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();

    await Promise.allSettled(
      [...this.cleanupCallbacks].map((callback) => Promise.resolve().then(callback)),
    );
  }

  async purgeAndReset(onCleanUnauthenticatedState?: () => void | Promise<void>) {
    await this.terminateBackgroundTasks();
    this.purgeBadSessionKeys();
    await onCleanUnauthenticatedState?.();
  }

  purgeBadSessionKeys() {
    this.removeKnownSessionKeys(this.localStorage);
    this.removeKnownSessionKeys(this.sessionStorage);
    this.resetStartupErrorCount();
  }

  isRecoverableTransportError(error: unknown) {
    const text = this.getErrorText(error);

    return (
      RE_TIMEOUT_UPPER.test(text)
      || RE_TIMEOUT.test(text)
      || RE_HTTP_STREAM_CLOSED.test(text)
      || RE_WEB_SOCKET_CLOSED.test(text)
      || RE_WEB_SOCKET_TIMEOUT.test(text)
      || RE_WS_CODE_1006.test(text)
      || RE_ABNORMAL_CLOSURE.test(text)
      || RE_NETWORK_ERROR.test(text)
      || RE_SECURE_SOCKET.test(text)
      || RE_SSL.test(text)
      || RE_CANNOT_SEND_DISCONNECTED.test(text)
      || RE_FAILED_TO_FETCH.test(text)
      || RE_LOAD_FAILED.test(text)
      || RE_CONNECTION_REFUSED.test(text)
      || RE_DNS.test(text)
    );
  }

  private async connectClient<TClient extends SafeClientLifecycle>(
    client: TClient,
    connect: SafeConnectParams<TClient>['connect'],
    sessionData?: ApiSessionData,
  ) {
    if (connect) {
      await connect(client, sessionData);
      return;
    }

    await client.connect?.();
  }

  private async forceCleanUnauthenticatedState<TClient extends SafeClientLifecycle>(
    client: TClient | undefined,
    onCleanUnauthenticatedState: () => void | Promise<void>,
  ) {
    await Promise.allSettled([
      client?.disconnect?.(),
      client?.destroy?.(),
      this.terminateBackgroundTasks(),
    ]);

    this.purgeBadSessionKeys();
    await onCleanUnauthenticatedState();
  }

  private validateStoredSession(): SessionValidationResult {
    const accountSession = this.validateAccountSlotSession();
    if (accountSession.sessionData || accountSession.reason) return accountSession;

    if (!this.shouldReadLegacySession) return {};

    return this.validateLegacySession();
  }

  private validateAccountSlotSession(): SessionValidationResult {
    if (!this.localStorage) return {};

    const accountKey = `${SESSION_ACCOUNT_PREFIX}${this.accountSlot || 1}`;
    const raw = this.localStorage.getItem(accountKey);
    if (!raw) return {};

    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      const hasSessionFields = Boolean(data.dcId) || DC_IDS.some((dcId) => {
        return data[`dc${dcId}_auth_key`] !== undefined;
      });

      if (!hasSessionFields) return {};

      const keys: Record<number, unknown> = {};
      for (const dcId of DC_IDS) {
        const key = data[`dc${dcId}_auth_key`];
        if (key !== undefined) {
          keys[dcId] = key;
        }
      }

      return this.validateSessionData({
        mainDcId: data.dcId,
        keys,
        isTest: data.isTest,
      });
    } catch {
      return { reason: `Malformed account session JSON in ${accountKey}` };
    }
  }

  private validateLegacySession(): SessionValidationResult {
    if (!this.localStorage) return {};

    const rawUserAuth = this.localStorage.getItem(SESSION_LEGACY_USER_KEY);
    if (!rawUserAuth) return {};

    try {
      const userAuth = JSON.parse(rawUserAuth) as Record<string, unknown>;
      const keys: Record<number, unknown> = {};

      for (const dcId of DC_IDS) {
        const rawKey = this.localStorage.getItem(`dc${dcId}_auth_key`);
        if (!rawKey) continue;

        try {
          keys[dcId] = JSON.parse(rawKey);
        } catch {
          keys[dcId] = rawKey;
        }
      }

      return this.validateSessionData({
        mainDcId: userAuth.dcID,
        keys,
        isTest: userAuth.test,
      });
    } catch {
      return { reason: 'Malformed legacy session JSON' };
    }
  }

  private validateSessionData(sessionData?: SessionCandidate): SessionValidationResult {
    if (!sessionData) return {};

    const mainDcId = Number(sessionData.mainDcId);
    if (!DC_IDS.includes(mainDcId as any)) {
      return { reason: 'Invalid main DC id' };
    }

    const entries = Object.entries(sessionData.keys || {});
    if (!entries.length) return { reason: 'Missing auth keys' };

    const keys: Record<number, string> = {};
    for (const [dcIdRaw, authKey] of entries) {
      const dcId = Number(dcIdRaw);

      if (!DC_IDS.includes(dcId as any)) {
        return { reason: `Invalid auth key DC id: ${dcIdRaw}` };
      }

      if (!this.isValidAuthKeyHex(authKey)) {
        return { reason: `Invalid auth key for DC ${dcId}` };
      }

      keys[dcId] = authKey.toLowerCase();
    }

    if (!keys[mainDcId]) {
      return { reason: 'Missing auth key for main DC' };
    }

    return {
      sessionData: {
        mainDcId,
        keys,
        isTest: sessionData.isTest === true ? true : undefined,
      },
    };
  }

  private isValidAuthKeyHex(value: unknown): value is string {
    return (
      typeof value === 'string'
      && value.length === AUTH_KEY_HEX_LENGTH
      && RE_AUTH_KEY_HEX.test(value)
    );
  }

  private bumpStartupErrorCount() {
    if (!this.sessionStorage) {
      this.startupErrorCount += 1;
      return this.startupErrorCount;
    }

    const current = Number(this.sessionStorage.getItem(STARTUP_ERROR_COUNT_KEY) || 0);
    const next = Number.isFinite(current) ? current + 1 : 1;
    this.sessionStorage.setItem(STARTUP_ERROR_COUNT_KEY, String(next));
    this.startupErrorCount = next;

    return next;
  }

  private resetStartupErrorCount() {
    this.startupErrorCount = 0;
    this.sessionStorage?.removeItem(STARTUP_ERROR_COUNT_KEY);
  }

  private removeKnownSessionKeys(storage?: StorageLike) {
    if (!storage) return;

    const accountKey = `${SESSION_ACCOUNT_PREFIX}${this.accountSlot || 1}`;
    this.getStorageKeys(storage).forEach((key) => {
      if (
        key === accountKey
        || key === 'session'
        || key === 'stringSession'
        || key === 'gramjs-session'
        || key.startsWith('gramjs:session')
        || key.startsWith('clashgram:session')
        || (
          this.shouldReadLegacySession
          && (
            key === SESSION_LEGACY_USER_KEY
            || key === 'dc'
            || RE_LEGACY_AUTH_DC_KEY.test(key)
          )
        )
      ) {
        storage.removeItem(key);
      }
    });
  }

  private getStorageKeys(storage: StorageLike) {
    return Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter(Boolean);
  }

  private getErrorText(error: unknown) {
    if (error instanceof Error) {
      return `${error.name}: ${error.message} ${error.stack || ''}`;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  private static getStorage(name: 'localStorage' | 'sessionStorage') {
    try {
      const scope = globalThis as unknown as Record<string, StorageLike | undefined>;
      return scope[name];
    } catch {
      return undefined;
    }
  }
}
