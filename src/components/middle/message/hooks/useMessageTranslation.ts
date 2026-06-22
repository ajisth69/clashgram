import { useEffect } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import type { ChatTranslatedMessages, TranslationTone } from '../../../../types';

import { getTranslationCacheKey, parseTranslationCacheKey } from '../../../../util/keys/translationKey';
import { throttle } from '../../../../util/schedulers';

const MESSAGE_LIMIT_PER_REQUEST = 20;
const THROTTLE_DELAY = 150;
const PENDING_TRANSLATIONS = new Map<string, Map<string, number[]>>();
const PENDING_MARK_ACTIONS = new Map<string, { chatId: string, messageIds: number[], toLanguageCode: string, tone?: TranslationTone }>();
const VISIBLE_MESSAGE_IDS = new Map<string, Set<number>>();
const PREV_VIEWPORT_LIMITS = new Map<string, { minVisible: number, maxVisible: number }>();
const SCROLL_DIRECTIONS = new Map<string, 'up' | 'down' | undefined>();

const throttledMarkPending = throttle(() => {
  const { markMessagesTranslationPending } = getActions();
  PENDING_MARK_ACTIONS.forEach((action) => {
    markMessagesTranslationPending(action);
  });
  PENDING_MARK_ACTIONS.clear();
}, 50);

export default function useMessageTranslation(
  chatTranslations: ChatTranslatedMessages | undefined,
  chatId?: string,
  messageId?: number,
  requestedLanguageCode?: string,
  tone?: TranslationTone,
  isViewportVisible?: boolean,
) {
  const cacheKey = requestedLanguageCode ? getTranslationCacheKey(requestedLanguageCode, tone) : undefined;
  const messageTranslation = cacheKey && messageId
    ? chatTranslations?.byLangCode[cacheKey]?.[messageId] : undefined;

  const { isPending, text, translatedButtons } = messageTranslation || {};

  useEffect(() => {
    if (!chatId || !messageId || !cacheKey || !requestedLanguageCode) return;

    if (!text && isPending === undefined) {
      addPendingTranslation(chatId, messageId, requestedLanguageCode, tone, isViewportVisible);
    }
  }, [chatId, text, isPending, messageId, cacheKey, requestedLanguageCode, tone, isViewportVisible]);

  useEffect(() => {
    if (!chatId || !messageId) return;

    const visibleSet = VISIBLE_MESSAGE_IDS.get(chatId) || new Set<number>();
    if (isViewportVisible) {
      visibleSet.add(messageId);
    } else {
      visibleSet.delete(messageId);
    }
    VISIBLE_MESSAGE_IDS.set(chatId, visibleSet);

    throttledProcessPending();

    return () => {
      const set = VISIBLE_MESSAGE_IDS.get(chatId);
      if (set) {
        set.delete(messageId);
        if (set.size === 0) {
          VISIBLE_MESSAGE_IDS.delete(chatId);
        }
      }
    };
  }, [chatId, messageId, isViewportVisible]);

  if (!chatId || !messageId) {
    return {
      isPending: false,
      translatedText: undefined,
      translatedButtons: undefined,
    };
  }

  return {
    isPending,
    translatedText: text,
    translatedButtons,
  };
}

const throttledProcessPending = throttle(processPending, THROTTLE_DELAY);

function processPending() {
  const { translateMessages } = getActions();
  let hasUnprocessed = false;

  PENDING_TRANSLATIONS.forEach((chats, cacheKey) => {
    const { languageCode, tone } = parseTranslationCacheKey(cacheKey);

    chats.forEach((messageIds, chatId) => {
      sortMessageIdsByPriority(chatId, messageIds);

      const messageIdsToTranslate = messageIds.slice(0, MESSAGE_LIMIT_PER_REQUEST);

      if (messageIdsToTranslate.length < messageIds.length) {
        hasUnprocessed = true;
      }

      translateMessages({ chatId, messageIds: messageIdsToTranslate, toLanguageCode: languageCode, tone });

      removePendingTranslations(chatId, messageIdsToTranslate, cacheKey);
    });
  });

  if (hasUnprocessed) {
    throttledProcessPending();
  }
}

function addPendingTranslation(
  chatId: string,
  messageId: number,
  toLanguageCode: string,
  tone?: TranslationTone,
  isViewportVisible?: boolean,
) {
  const cacheKey = getTranslationCacheKey(toLanguageCode, tone);
  const languageTranslations = PENDING_TRANSLATIONS.get(cacheKey) || new Map<string, number[]>();
  const messageIds = languageTranslations.get(chatId) || [];

  const index = messageIds.indexOf(messageId);
  if (index !== -1) {
    if (isViewportVisible && index > 0) {
      messageIds.splice(index, 1);
      messageIds.unshift(messageId);
      languageTranslations.set(chatId, messageIds);
      const actionKey = `${chatId}-${toLanguageCode}-${tone || ''}`;
      PENDING_MARK_ACTIONS.set(actionKey, { chatId, messageIds: [...messageIds], toLanguageCode, tone });
      throttledMarkPending();
      throttledProcessPending();
    }
    return;
  }

  if (isViewportVisible) {
    messageIds.unshift(messageId);
  } else {
    messageIds.push(messageId);
  }
  languageTranslations.set(chatId, messageIds);
  PENDING_TRANSLATIONS.set(cacheKey, languageTranslations);

  const actionKey = `${chatId}-${toLanguageCode}-${tone || ''}`;
  PENDING_MARK_ACTIONS.set(actionKey, { chatId, messageIds: [...messageIds], toLanguageCode, tone });
  throttledMarkPending();

  throttledProcessPending();
}

function sortMessageIdsByPriority(chatId: string, messageIds: number[]) {
  const visibleSet = VISIBLE_MESSAGE_IDS.get(chatId);
  if (!visibleSet || visibleSet.size === 0) {
    return;
  }

  let minVisible = Infinity;
  let maxVisible = -Infinity;
  visibleSet.forEach((id) => {
    if (id < minVisible) minVisible = id;
    if (id > maxVisible) maxVisible = id;
  });

  if (minVisible === Infinity || maxVisible === -Infinity) {
    return;
  }

  const prev = PREV_VIEWPORT_LIMITS.get(chatId);
  let direction = SCROLL_DIRECTIONS.get(chatId);

  if (prev) {
    if (maxVisible > prev.maxVisible && minVisible >= prev.minVisible) {
      direction = 'down';
    } else if (minVisible < prev.minVisible && maxVisible <= prev.maxVisible) {
      direction = 'up';
    }
    if (direction) {
      SCROLL_DIRECTIONS.set(chatId, direction);
    }
  }
  PREV_VIEWPORT_LIMITS.set(chatId, { minVisible, maxVisible });

  messageIds.sort((a, b) => {
    let distA = 0;
    if (a < minVisible) {
      distA = minVisible - a;
      if (direction === 'down') {
        distA *= 2.0;
      }
    } else if (a > maxVisible) {
      distA = a - maxVisible;
      if (direction === 'up') {
        distA *= 2.0;
      }
    }

    let distB = 0;
    if (b < minVisible) {
      distB = minVisible - b;
      if (direction === 'down') {
        distB *= 2.0;
      }
    } else if (b > maxVisible) {
      distB = b - maxVisible;
      if (direction === 'up') {
        distB *= 2.0;
      }
    }

    return distA - distB;
  });
}

function removePendingTranslations(
  chatId: string,
  messageIds: number[],
  cacheKey: string,
) {
  const languageTranslations = PENDING_TRANSLATIONS.get(cacheKey);
  if (!languageTranslations?.size) {
    PENDING_TRANSLATIONS.delete(cacheKey);
    return;
  }

  const oldMessageIds = languageTranslations.get(chatId);
  if (!oldMessageIds?.length) {
    languageTranslations.delete(chatId);
    return;
  }

  const newMessageIds = oldMessageIds.filter((id) => !messageIds.includes(id));

  if (!newMessageIds?.length) {
    languageTranslations.delete(chatId);
    if (!languageTranslations.size) {
      PENDING_TRANSLATIONS.delete(cacheKey);
    }
    return;
  }

  languageTranslations.set(chatId, newMessageIds);
}
