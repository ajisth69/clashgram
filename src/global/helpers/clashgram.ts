import { MAIN_IDB_STORE } from '../../util/browser/idb';
import type { ApiMessage } from '../../api/types';

export function saveClashgramMessage(chatId: string, messageId: number, message: ApiMessage) {
  const key = `clashgram_msg_${chatId}_${messageId}`;
  return MAIN_IDB_STORE.set(key, {
    savedAt: Date.now(),
    message,
  });
}
