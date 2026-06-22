import { useCallback, useEffect, useState } from '../lib/teact/teact';

const STORAGE_KEY = 'hiddenMessages';
const CHATS_STORAGE_KEY = 'clashgramHiddenChatIds';
const MAX_HIDDEN_MESSAGES_PER_CHAT = 500;

type HiddenMessagesMap = Record<string, number[]>; // chatId -> messageIds

let hiddenMap: HiddenMessagesMap = {};
const messageListeners = new Map<string, Set<() => void>>();

function loadFromStorage(): HiddenMessagesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as HiddenMessagesMap;
  } catch {
    return {};
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenMap));
  } catch {
    // Ignore storage errors
  }
}

// Initialize messages map
hiddenMap = loadFromStorage();

function addMessageListener(chatId: string, messageId: number, listener: () => void) {
  const key = `${chatId}_${messageId}`;
  if (!messageListeners.has(key)) {
    messageListeners.set(key, new Set());
  }
  messageListeners.get(key)!.add(listener);
}

function removeMessageListener(chatId: string, messageId: number, listener: () => void) {
  const key = `${chatId}_${messageId}`;
  const set = messageListeners.get(key);
  if (set) {
    set.delete(listener);
    if (set.size === 0) {
      messageListeners.delete(key);
    }
  }
}

function emitMessageChange(chatId: string, messageId: number) {
  const key = `${chatId}_${messageId}`;
  const set = messageListeners.get(key);
  if (set) {
    set.forEach((listener) => listener());
  }
}

export function isMessageHiddenRaw(chatId: string, messageId: number): boolean {
  return hiddenMap[chatId]?.includes(messageId) ?? false;
}

export function toggleHiddenMessage(chatId: string, messageId: number) {
  const current = hiddenMap[chatId] || [];
  const index = current.indexOf(messageId);
  let nextIds: number[];
  if (index >= 0) {
    nextIds = current.filter((id) => id !== messageId);
  } else {
    nextIds = [...current, messageId];
    if (nextIds.length > MAX_HIDDEN_MESSAGES_PER_CHAT) {
      nextIds.shift();
    }
  }
  hiddenMap = {
    ...hiddenMap,
    [chatId]: nextIds,
  };
  saveToStorage();
  emitMessageChange(chatId, messageId);
}

// Cross-tab message hidden syncing
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      hiddenMap = loadFromStorage();
      messageListeners.forEach((set, key) => {
        set.forEach((listener) => listener());
      });
    }
  });
}

// Memory cache of hidden chat IDs
let cachedHiddenChatIds: string[] | undefined;
const hiddenChatsListeners = new Set<() => void>();

export function getHiddenChatIds(): string[] {
  if (cachedHiddenChatIds === undefined) {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHATS_STORAGE_KEY) || '[]');
      if (Array.isArray(parsed)) {
        cachedHiddenChatIds = parsed.map(String);
      } else {
        cachedHiddenChatIds = [];
      }
    } catch {
      cachedHiddenChatIds = [];
    }
  }
  return cachedHiddenChatIds;
}

export function toggleHiddenChat(chatId: string) {
  const current = getHiddenChatIds();
  let nextHidden: string[];
  if (current.includes(chatId)) {
    nextHidden = current.filter((id) => id !== chatId);
  } else {
    nextHidden = [...current, chatId];
  }
  try {
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(nextHidden));
  } catch {
    // Ignore quota errors
  }
  cachedHiddenChatIds = nextHidden;
  emitHiddenChatsChange();
}

export function addHiddenChatsListener(listener: () => void) {
  hiddenChatsListeners.add(listener);
}

export function removeHiddenChatsListener(listener: () => void) {
  hiddenChatsListeners.delete(listener);
}

function emitHiddenChatsChange() {
  hiddenChatsListeners.forEach((listener) => listener());
}

// Cross-tab hidden chat syncing
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CHATS_STORAGE_KEY) {
      cachedHiddenChatIds = undefined;
      emitHiddenChatsChange();
    }
  });
}

export default function useHiddenMessages(chatId?: string, messageId?: number) {
  const [isHidden, setIsHidden] = useState(
    () => (chatId && messageId ? isMessageHiddenRaw(chatId, messageId) : false),
  );

  useEffect(() => {
    if (chatId && messageId) {
      setIsHidden(isMessageHiddenRaw(chatId, messageId));
    } else {
      setIsHidden(false);
    }
  }, [chatId, messageId]);

  useEffect(() => {
    if (!chatId || !messageId) return undefined;
    const handler = () => {
      setIsHidden(isMessageHiddenRaw(chatId, messageId));
    };
    addMessageListener(chatId, messageId, handler);
    return () => {
      removeMessageListener(chatId, messageId, handler);
    };
  }, [chatId, messageId]);

  const toggle = useCallback(() => {
    if (chatId && messageId) {
      toggleHiddenMessage(chatId, messageId);
    }
  }, [chatId, messageId]);

  return { isHidden, toggle };
}

export function useIsMessageHidden(chatId?: string, messageId?: number): boolean {
  const [isHidden, setIsHidden] = useState(
    () => (chatId && messageId ? isMessageHiddenRaw(chatId, messageId) : false),
  );

  useEffect(() => {
    if (chatId && messageId) {
      setIsHidden(isMessageHiddenRaw(chatId, messageId));
    } else {
      setIsHidden(false);
    }
  }, [chatId, messageId]);

  useEffect(() => {
    if (!chatId || !messageId) return undefined;
    const handler = () => {
      setIsHidden(isMessageHiddenRaw(chatId, messageId));
    };
    addMessageListener(chatId, messageId, handler);
    return () => {
      removeMessageListener(chatId, messageId, handler);
    };
  }, [chatId, messageId]);

  return isHidden;
}
