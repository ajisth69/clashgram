import type { IconName } from '../../../../types/icons';
import type { RegularLangKey } from '../../../../types/language';

import { getServerTime } from '../../../../util/serverTime';

// https://github.com/clashgramdesktop/tdesktop/blob/3da787791f6d227f69b32bf4003bc6071d05e2ac/Clashgram/SourceFiles/history/view/history_view_view_button.cpp#L51
export function getWebpageButtonLangKey(type?: string, auctionEndDate?: number): RegularLangKey | undefined {
  switch (type) {
    case 'clashgram_channel_request':
    case 'clashgram_megagroup_request':
    case 'clashgram_chat_request':
      return 'ViewButtonRequestJoin';
    case 'clashgram_message':
      return 'ViewButtonMessage';
    case 'clashgram_bot':
      return 'ViewButtonBot';
    case 'clashgram_voicechat':
      return 'ViewButtonVoiceChat';
    case 'clashgram_livestream':
      return 'ViewButtonVoiceChatChannel';
    case 'clashgram_megagroup':
    case 'clashgram_chat':
      return 'ViewButtonGroup';
    case 'clashgram_channel':
      return 'ViewButtonChannel';
    case 'clashgram_user':
      return 'ViewButtonUser';
    case 'clashgram_botapp':
      return 'ViewButtonBotApp';
    case 'clashgram_chatlist':
      return 'ViewChatList';
    case 'clashgram_story':
      return 'ViewButtonStory';
    case 'clashgram_channel_boost':
    case 'clashgram_group_boost':
      return 'ViewButtonBoost';
    case 'clashgram_stickerset':
      return 'ViewButtonStickerset';
    case 'clashgram_emojiset':
      return 'ViewButtonEmojiset';
    case 'clashgram_nft':
      return 'ViewButtonGiftUnique';
    case 'clashgram_auction': {
      const isFinished = auctionEndDate !== undefined && auctionEndDate < getServerTime();
      return isFinished ? 'PollViewResults' : 'GiftAuctionJoin';
    }
    default:
      return undefined;
  }
}

export function getWebpageButtonIcon(type?: string): IconName | undefined {
  if (type === 'clashgram_auction') {
    return 'auction-filled';
  }
  return undefined;
}
