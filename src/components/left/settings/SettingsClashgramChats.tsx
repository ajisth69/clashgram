import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { MAIN_THREAD_ID } from '../../../api/types';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';
import RadioGroup from '../../ui/RadioGroup';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramAntiDelete?: boolean;
  clashgramAntiEdit?: boolean;
  clashgramRetentionDays?: number;
  clashgramBypassRestrictions?: boolean;
  clashgramNoQuoteForwarding?: boolean;
  clashgramRetainKickedChats?: boolean;
  clashgramHideBlockedInGroups?: boolean;
  clashgramConfirmMedia?: boolean;
  clashgramConfirmFile?: boolean;
  clashgramConfirmGifEmoji?: boolean;
  clashgramConfirmMsg?: boolean;
  clashgramHideAllChats?: boolean;
  unreadChatIds: string[];
};

const SettingsClashgramChats = ({
  clashgramAntiDelete,
  clashgramAntiEdit,
  clashgramRetentionDays,
  clashgramBypassRestrictions,
  clashgramNoQuoteForwarding,
  clashgramRetainKickedChats,
  clashgramHideBlockedInGroups,
  clashgramConfirmMedia,
  clashgramConfirmFile,
  clashgramConfirmGifEmoji,
  clashgramConfirmMsg,
  clashgramHideAllChats,
  unreadChatIds,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption } = getActions();
  const lang = useLang();

  const handleMarkAllChatsRead = useLastCallback(() => {
    if (!unreadChatIds.length) return;
    const ids = [...unreadChatIds];
    const { markChatMessagesRead } = getActions();

    function processBatch() {
      const batch = ids.splice(0, 5);
      if (batch.length === 0) return;

      batch.forEach((chatId) => {
        markChatMessagesRead({ id: chatId });
      });

      if (ids.length > 0) {
        setTimeout(processBatch, 16);
      }
    }

    processBatch();
  });

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-item">
          <h4 className="settings-item-header">{lang('ClashgramChatControlRetention')}</h4>

          <ListItem
            narrow
            onClick={handleMarkAllChatsRead}
            style={unreadChatIds.length === 0 ? 'opacity: 0.5; pointer-events: none;' : undefined}
          >
            {lang('ClashgramMarkAllRead')}
            {' '}
            {unreadChatIds.length > 0 ? `(${unreadChatIds.length})` : ''}
          </ListItem>

          <Checkbox
            label={lang('ClashgramAntiDelete')}
            subLabel={lang('ClashgramAntiDeleteSub')}
            checked={Boolean(clashgramAntiDelete)}
            onCheck={() => setSharedSettingOption({ clashgramAntiDelete: !clashgramAntiDelete })}
          />

          <Checkbox
            label={lang('ClashgramAntiEdit')}
            subLabel={lang('ClashgramAntiEditSub')}
            checked={Boolean(clashgramAntiEdit)}
            onCheck={() => setSharedSettingOption({ clashgramAntiEdit: !clashgramAntiEdit })}
          />

          <div style="margin-top: 1rem; margin-bottom: 1rem;">
            <h4 className="settings-item-subheader">{lang('ClashgramRetentionPeriod')}</h4>
            <RadioGroup
              name="clashgramRetentionDays"
              options={[
                { label: lang('ClashgramRetentionRefresh'), value: '0' },
                { label: lang('ClashgramRetention1Day'), value: '1' },
                { label: lang('ClashgramRetention3Days'), value: '3' },
                { label: lang('ClashgramRetention7Days'), value: '7' },
              ]}
              selected={String(clashgramRetentionDays ?? 7)}
              onChange={(value) => setSharedSettingOption({ clashgramRetentionDays: Number(value) })}
            />
          </div>

          <Checkbox
            label={lang('ClashgramBypassRestrictions')}
            subLabel={lang('ClashgramBypassRestrictionsSub')}
            checked={Boolean(clashgramBypassRestrictions)}
            onCheck={() => setSharedSettingOption({ clashgramBypassRestrictions: !clashgramBypassRestrictions })}
          />

          <Checkbox
            label={lang('ClashgramNoQuoteForwarding')}
            subLabel={lang('ClashgramNoQuoteForwardingSub')}
            checked={Boolean(clashgramNoQuoteForwarding)}
            onCheck={() => setSharedSettingOption({ clashgramNoQuoteForwarding: !clashgramNoQuoteForwarding })}
          />

          <Checkbox
            label={lang('ClashgramRetainKickedChats')}
            subLabel={lang('ClashgramRetainKickedChatsSub')}
            checked={Boolean(clashgramRetainKickedChats)}
            onCheck={() => setSharedSettingOption({ clashgramRetainKickedChats: !clashgramRetainKickedChats })}
          />

          <Checkbox
            label={lang('ClashgramHideAllChats')}
            subLabel={lang('ClashgramHideAllChatsSub')}
            checked={Boolean(clashgramHideAllChats)}
            onCheck={() => setSharedSettingOption({ clashgramHideAllChats: !clashgramHideAllChats })}
          />

          <div style="margin-top: 1.5rem; margin-bottom: 0.5rem;">
            <h4 className="settings-item-subheader">{lang('ClashgramMessageFiltering')}</h4>
          </div>

          <Checkbox
            label={lang('ClashgramHideBlockedInGroups')}
            subLabel={lang('ClashgramHideBlockedInGroupsSub')}
            checked={Boolean(clashgramHideBlockedInGroups)}
            onCheck={() => setSharedSettingOption({ clashgramHideBlockedInGroups: !clashgramHideBlockedInGroups })}
          />

          <div style="margin-top: 1.5rem; margin-bottom: 0.5rem;">
            <h4 className="settings-item-subheader">{lang('ClashgramSendConfirmation')}</h4>
          </div>

          <Checkbox
            label={lang('ClashgramConfirmMedia')}
            subLabel={lang('ClashgramConfirmMediaSub')}
            checked={Boolean(clashgramConfirmMedia)}
            onCheck={() => setSharedSettingOption({ clashgramConfirmMedia: !clashgramConfirmMedia })}
          />

          <Checkbox
            label={lang('ClashgramConfirmFile')}
            subLabel={lang('ClashgramConfirmFileSub')}
            checked={Boolean(clashgramConfirmFile)}
            onCheck={() => setSharedSettingOption({ clashgramConfirmFile: !clashgramConfirmFile })}
          />

          <Checkbox
            label={lang('ClashgramConfirmGifEmoji')}
            subLabel={lang('ClashgramConfirmGifEmojiSub')}
            checked={Boolean(clashgramConfirmGifEmoji)}
            onCheck={() => setSharedSettingOption({ clashgramConfirmGifEmoji: !clashgramConfirmGifEmoji })}
          />

          <Checkbox
            label={lang('ClashgramConfirmMsg')}
            subLabel={lang('ClashgramConfirmMsgSub')}
            checked={Boolean(clashgramConfirmMsg)}
            onCheck={() => setSharedSettingOption({ clashgramConfirmMsg: !clashgramConfirmMsg })}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const {
      clashgramAntiDelete,
      clashgramAntiEdit,
      clashgramRetentionDays,
      clashgramBypassRestrictions,
      clashgramNoQuoteForwarding,
      clashgramRetainKickedChats,
      clashgramConfirmMedia,
      clashgramConfirmFile,
      clashgramConfirmGifEmoji,
      clashgramConfirmMsg,
      clashgramHideBlockedInGroups,
      clashgramHideAllChats,
    } = selectSharedSettings(global);

    const chatsById = global.chats.byId;
    const unreadChatIds = Object.keys(chatsById).filter((id) => {
      const readState = global.messages.byChatId[id]?.threadsById?.[MAIN_THREAD_ID]?.readState;
      return readState && ((readState.unreadCount || 0) > 0 || readState.hasUnreadMark);
    });

    return {
      clashgramAntiDelete,
      clashgramAntiEdit,
      clashgramRetentionDays,
      clashgramBypassRestrictions,
      clashgramNoQuoteForwarding,
      clashgramRetainKickedChats,
      clashgramConfirmMedia,
      clashgramConfirmFile,
      clashgramConfirmGifEmoji,
      clashgramConfirmMsg,
      clashgramHideBlockedInGroups,
      clashgramHideAllChats,
      unreadChatIds,
    };
  },
)(SettingsClashgramChats));
