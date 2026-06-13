import type {
  ApiUpdateAuthorizationError,
  ApiUpdateAuthorizationState,
  ApiUpdateConnectionState,
  ApiUpdateCurrentUser,
  ApiUpdatePasskeyOption,
  ApiUpdateServerTimeOffset,
  ApiUpdateSession,
  ApiUpdateUserAlreadyAuthorized,
} from '../../../api/types';
import type { LangCode } from '../../../types';
import type { RequiredGlobalActions } from '../../index';
import type { ActionReturnType, GlobalState } from '../../types';

import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { getShippingError, shouldClosePaymentModal } from '../../../util/getReadableErrorText';
import { getAccountsInfo, getAccountSlotUrl } from '../../../util/multiaccount';
import { oldSetLanguage } from '../../../util/oldLangProvider';
import { clearWebTokenAuth } from '../../../util/routing';
import { setServerTimeOffset } from '../../../util/serverTime';
import { hasStoredSession, updateSessionUserId } from '../../../util/sessions';
import { forceWebsync } from '../../../util/websync';
import { syncAndVerifySessionKeys } from '../../../clshgram/storageGuard';
import {
  addActionHandler, getActions, getGlobal, setGlobal,
} from '../../index';
import {
  getOpenedShortpollChannelIds,
  resetOpenedChannelShortpollState,
  syncOpenedShortpollChannelIds,
} from '../../openedChannelShortpoll';
import { updateUser, updateUserFullInfo } from '../../reducers';
import { updateAuth } from '../../reducers/auth';
import { updateTabState } from '../../reducers/tabs';
import { selectTabState } from '../../selectors';
import { selectSharedSettings } from '../../selectors/sharedState';

const BROKEN_RECONNECT_BASE_DELAY = 1000;
const BROKEN_RECONNECT_MAX_DELAY = 10000;

let brokenReconnectTimer: ReturnType<typeof setTimeout> | undefined;
let brokenReconnectAttempt = 0;

addActionHandler('apiUpdate', (global, actions, update): ActionReturnType => {
  switch (update['@type']) {
    case 'updateApiReady':
      onUpdateApiReady(global);
      break;

    case 'updateAuthorizationState':
      onUpdateAuthorizationState(global, update);
      break;

    case 'updateAuthorizationError':
      onUpdateAuthorizationError(global, update);
      break;

    case 'updateUserAlreadyAuthorized':
      onUpdateUserAlreadyAuthorized(global, update);
      break;

    case 'updateWebAuthTokenFailed':
      onUpdateWebAuthTokenFailed(global);
      break;

    case 'updatePasskeyOption':
      onUpdatePasskeyOption(global, update);
      break;

    case 'updateConnectionState':
      onUpdateConnectionState(global, actions, update);
      break;

    case 'updateSession':
      onUpdateSession(global, actions, update);
      break;

    case 'updateServerTimeOffset':
      onUpdateServerTimeOffset(update);
      break;

    case 'updateCurrentUser':
      onUpdateCurrentUser(global, update);
      break;

    case 'requestReconnectApi':
      global = { ...global, isSynced: false };
      setGlobal(global);

      onUpdateConnectionState(global, actions, {
        '@type': 'updateConnectionState',
        connectionState: 'connectionStateConnecting',
      });
      actions.initApi();
      break;

    case 'requestSync':
      resetOpenedChannelShortpollState();
      syncOpenedShortpollChannelIds(global);
      actions.sync();
      break;

    case 'updateFetchingDifference':
      global = { ...global, isFetchingDifference: update.isFetching };
      setGlobal(global);
      break;

    case 'error': {
      Object.values(global.byTabId).forEach(({ id: tabId }) => {
        const paymentShippingError = getShippingError(update.error);
        if (paymentShippingError) {
          actions.addPaymentError({ error: paymentShippingError, tabId });
        } else if (shouldClosePaymentModal(update.error)) {
          actions.closePaymentModal({ tabId });
        } else if (actions.showDialog) {
          actions.showDialog({ data: { type: 'error', ...update.error }, tabId });
        }
      });

      break;
    }

    case 'notSupportedInFrozenAccount': {
      actions.showNotification({
        title: {
          key: 'NotificationTitleNotSupportedInFrozenAccount',
        },
        message: {
          key: 'NotificationMessageNotSupportedInFrozenAccount',
        },
        tabId: getCurrentTabId(),
      });
      break;
    }
  }
});

function onUpdateApiReady<T extends GlobalState>(global: T) {
  void oldSetLanguage(selectSharedSettings(global).language as LangCode);
}

function onUpdateAuthorizationState<T extends GlobalState>(global: T, update: ApiUpdateAuthorizationState) {
  const wasAuthReady = global.auth.state === 'authorizationStateReady';
  const authState = update.authorizationState;

  global = updateAuth(global, {
    state: authState,
    isLoading: false,
  });
  setGlobal(global);
  global = getGlobal();

  switch (authState) {
    case 'authorizationStateLoggingOut':
      void forceWebsync(false);

      global = updateAuth(global, {
        isLoggingOut: true,
      });
      setGlobal(global);
      break;
    case 'authorizationStateWaitCode':
      global = updateAuth(global, {
        isCodeViaApp: update.isCodeViaApp,
      });
      setGlobal(global);
      break;
    case 'authorizationStateWaitPassword':
      global = updateAuth(global, {
        hint: update.hint,
      });

      if (update.noReset) {
        global = updateAuth(global, {
          hasWebAuthTokenPasswordRequired: true,
        });
      }

      setGlobal(global);
      break;
    case 'authorizationStateWaitQrCode':
      global = updateAuth(global, {
        isLoadingQrCode: false,
        qrCode: update.qrCode,
      });
      setGlobal(global);
      break;
    case 'authorizationStateReady': {
      if (wasAuthReady) {
        break;
      }

      void forceWebsync(true);

      global = updateAuth(global, {
        isLoggingOut: false,
      });
      Object.values(global.byTabId).forEach(({ id: tabId }) => {
        global = updateTabState(global, {
          inactiveReason: undefined,
        }, tabId);
      });
      setGlobal(global);

      break;
    }
  }
}

function onUpdateAuthorizationError<T extends GlobalState>(global: T, update: ApiUpdateAuthorizationError) {
  if (update.errorCode === 'PASSKEY_CREDENTIAL_NOT_FOUND') {
    getActions().showNotification({
      message: update.errorKey,
      tabId: getCurrentTabId(),
    });
    return;
  }

  global = updateAuth(global, {
    errorKey: update.errorKey,
  });
  setGlobal(global);
}

function onUpdateUserAlreadyAuthorized<T extends GlobalState>(global: T, update: ApiUpdateUserAlreadyAuthorized) {
  const { userId } = update;
  if (global.currentUserId === userId) return;

  const accounts = getAccountsInfo();
  const slot = Object.entries(accounts).find(([_, info]) => info.userId === userId)?.[0];
  if (!slot) return;
  const url = getAccountSlotUrl(Number(slot));
  window.location.replace(url);
}

function onUpdateWebAuthTokenFailed<T extends GlobalState>(global: T) {
  clearWebTokenAuth();

  global = updateAuth(global, {
    hasWebAuthTokenFailed: true,
  });
  setGlobal(global);
}

function onUpdatePasskeyOption<T extends GlobalState>(global: T, update: ApiUpdatePasskeyOption) {
  global = updateAuth(global, {
    passkeyOption: update.option,
  });
  setGlobal(global);
}

function onUpdateConnectionState<T extends GlobalState>(
  global: T, actions: RequiredGlobalActions, update: ApiUpdateConnectionState,
) {
  const { connectionState } = update;

  const tabState = selectTabState(global, getCurrentTabId());
  if (connectionState === 'connectionStateReady' && tabState.isMasterTab && tabState.multitabNextAction) {
    // @ts-ignore
    actions[tabState.multitabNextAction.action](tabState.multitabNextAction.payload);
    actions.clearMultitabNextAction({ tabId: tabState.id });
  }

  if (connectionState === global.connectionState) {
    return;
  }

  if (connectionState === 'connectionStateReady') {
    clearBrokenReconnectTimer();
    brokenReconnectAttempt = 0;
  }

  global = {
    ...global,
    connectionState,
  };
  setGlobal(global);

  if (global.isSynced) {
    const channelStackIds = getOpenedShortpollChannelIds(global);

    if (connectionState === 'connectionStateReady' && tabState.isMasterTab && channelStackIds.length) {
      channelStackIds.forEach((chatId) => {
        actions.requestChannelDifference({ chatId });
      });
    }
  }

  if (connectionState === 'connectionStateBroken') {
    if (update.isTerminal) {
      if (global.auth.state === 'authorizationStateReady') {
        actions.signOut({ forceInitApi: true });
      }
    } else {
      scheduleStorageSafeReconnect(actions);
    }
  }
}

function scheduleStorageSafeReconnect(actions: RequiredGlobalActions) {
  if (brokenReconnectTimer) {
    return;
  }

  const delay = Math.min(
    BROKEN_RECONNECT_BASE_DELAY * 2 ** brokenReconnectAttempt,
    BROKEN_RECONNECT_MAX_DELAY,
  );
  brokenReconnectAttempt += 1;

  brokenReconnectTimer = setTimeout(() => {
    brokenReconnectTimer = undefined;
    void reconnectWithoutClearingSession(actions);
  }, delay);
}

async function reconnectWithoutClearingSession(actions: RequiredGlobalActions) {
  const didRecover = await syncAndVerifySessionKeys().catch(() => false);
  if (!didRecover && !hasStoredSession()) {
    const global = getGlobal();
    if (global.auth.state === 'authorizationStateReady') {
      actions.signOut({ forceInitApi: true });
    }
    return;
  }

  let global = getGlobal();
  global = {
    ...global,
    isSynced: false,
    connectionState: 'connectionStateConnecting',
  };
  setGlobal(global);

  actions.initApi();
}

function clearBrokenReconnectTimer() {
  if (!brokenReconnectTimer) {
    return;
  }

  clearTimeout(brokenReconnectTimer);
  brokenReconnectTimer = undefined;
}

function onUpdateSession<T extends GlobalState>(global: T, actions: RequiredGlobalActions, update: ApiUpdateSession) {
  const { sessionData } = update;
  const { rememberMe, state } = global.auth;
  const isEmpty = !sessionData || !sessionData.mainDcId;

  const isTest = sessionData?.isTest;
  if (isTest) {
    global = {
      ...global,
      config: {
        ...global.config,
        isTestServer: isTest,
      },
    };
    setGlobal(global);
  }

  if (!rememberMe || state !== 'authorizationStateReady' || isEmpty) {
    return;
  }

  actions.saveSession({ sessionData });
}

function onUpdateServerTimeOffset(update: ApiUpdateServerTimeOffset) {
  setServerTimeOffset(update.serverTimeOffset);
}

function onUpdateCurrentUser<T extends GlobalState>(global: T, update: ApiUpdateCurrentUser) {
  const { currentUser, currentUserFullInfo } = update;

  global = {
    ...updateUser(global, currentUser.id, currentUser),
    currentUserId: currentUser.id,
  };
  global = updateUserFullInfo(global, currentUser.id, currentUserFullInfo);
  setGlobal(global);

  updateSessionUserId(currentUser.id);
}
