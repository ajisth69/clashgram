import type { ActionReturnType } from '../../types';

import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { addActionHandler, setGlobal } from '../..';
import { updateTabState } from '../../reducers/tabs';
import { selectTabState } from '../../selectors';

addActionHandler('openFrozenAccountModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    isFrozenAccountModalOpen: true,
  }, tabId);
});

addActionHandler('closeFrozenAccountModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    isFrozenAccountModalOpen: false,
  }, tabId);
});

addActionHandler('openDeleteAccountModal', (global, actions, payload): ActionReturnType => {
  const { days, tabId = getCurrentTabId() } = payload || {};
  if (!days) return;

  global = updateTabState(global, {
    ...selectTabState(global, tabId),
    deleteAccountModal: {
      selfDestructAccountDays: days,
    },
  }, tabId);
  setGlobal(global);
});

addActionHandler('closeDeleteAccountModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    deleteAccountModal: undefined,
  }, tabId);
});

addActionHandler('openAgeVerificationModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    isAgeVerificationModalOpen: true,
  }, tabId);
});

addActionHandler('closeAgeVerificationModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    isAgeVerificationModalOpen: false,
  }, tabId);
});

addActionHandler('openLocalTranscribeModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    localTranscribeModal: {
      isOpen: true,
      progress: 0,
    },
  }, tabId);
});

addActionHandler('closeLocalTranscribeModal', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};

  return updateTabState(global, {
    localTranscribeModal: undefined,
  }, tabId);
});

addActionHandler('updateLocalTranscribeProgress', (global, actions, payload): ActionReturnType => {
  const { progress, tabId = getCurrentTabId() } = payload || {};

  const currentModal = selectTabState(global, tabId).localTranscribeModal;
  if (!currentModal) return undefined;

  return updateTabState(global, {
    localTranscribeModal: {
      ...currentModal,
      progress,
    },
  }, tabId);
});
