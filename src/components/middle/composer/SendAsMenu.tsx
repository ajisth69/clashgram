import type { FC } from '../../../lib/teact/teact';
import { memo, useEffect, useRef, useMemo } from '../../../lib/teact/teact';
import { getActions, getGlobal } from '../../../global';

import type { ApiSendAsPeerId } from '../../../api/types';

import { IS_TOUCH_ENV } from '../../../util/browser/windowEnvironment';
import buildClassName from '../../../util/buildClassName';
import setTooltipItemVisible from '../../../util/setTooltipItemVisible';

import useLastCallback from '../../../hooks/useLastCallback';
import useMouseInside from '../../../hooks/useMouseInside';
import useOldLang from '../../../hooks/useOldLang';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

import Avatar from '../../common/Avatar';
import FullNameTitle from '../../common/FullNameTitle';
import Icon from '../../common/icons/Icon';
import ListItem from '../../ui/ListItem';
import Menu from '../../ui/Menu';

import './SendAsMenu.scss';

export type OwnProps = {
  isOpen: boolean;
  chatId?: string;
  selectedSendAsId?: string;
  sendAsPeerIds?: ApiSendAsPeerId[];
  isCurrentUserPremium?: boolean;
  onClose: () => void;
};

const SendAsMenu: FC<OwnProps> = ({
  isOpen,
  chatId,
  selectedSendAsId,
  sendAsPeerIds,
  isCurrentUserPremium,
  onClose,
}) => {
  const { saveDefaultSendAs, showNotification } = getActions();

  // No need for expensive global updates on users and chats, so we avoid them
  const usersById = getGlobal().users.byId;
  const chatsById = getGlobal().chats.byId;

  const lang = useOldLang();
  const containerRef = useRef<HTMLDivElement>();

  const combinedSendAsPeerIds = useMemo(() => {
    if (!sendAsPeerIds) return undefined;

    const ids = new Set(sendAsPeerIds.map((p) => p.id));
    const result = [...sendAsPeerIds];

    if (chatsById) {
      Object.values(chatsById).forEach((chat) => {
        if (
          chat &&
          chat.isCreator &&
          chat.type === 'chatTypeChannel' &&
          (chat.hasUsername || (chat.usernames && chat.usernames.some((u) => u.isActive))) &&
          !ids.has(chat.id)
        ) {
          result.push({
            id: chat.id,
            isPremium: true,
          });
          ids.add(chat.id);
        }
      });
    }

    return result;
  }, [sendAsPeerIds, chatsById]);

  const [handleMouseEnter, handleMouseLeave, markMouseInside] = useMouseInside(isOpen, onClose, undefined);

  useEffect(() => {
    if (isOpen) {
      markMouseInside();
    }
  }, [isOpen, markMouseInside]);

  const handleUserSelect = useLastCallback((id: string) => {
    onClose();
    saveDefaultSendAs({ chatId: chatId!, sendAsId: id });
  });

  const selectedSendAsIndex = useKeyboardNavigation({
    isActive: isOpen,
    items: combinedSendAsPeerIds,
    onSelect: handleUserSelect,
    shouldSelectOnTab: true,
    shouldSaveSelectionOnUpdateItems: true,
    onClose,
  });

  useEffect(() => {
    setTooltipItemVisible('.chat-item-clickable', selectedSendAsIndex, containerRef);
  }, [selectedSendAsIndex]);

  useEffect(() => {
    if (combinedSendAsPeerIds && !combinedSendAsPeerIds.length) {
      onClose();
    }
  }, [combinedSendAsPeerIds, onClose]);

  return (
    <Menu
      isOpen={isOpen}
      positionX="left"
      positionY="bottom"
      onClose={onClose}
      className="SendAsMenu"
      onCloseAnimationEnd={onClose}
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
      noCloseOnBackdrop={!IS_TOUCH_ENV}
      noCompact
    >
      <div className="send-as-title" dir="auto">{lang('SendMessageAsTitle')}</div>
      {usersById && chatsById && combinedSendAsPeerIds?.map(({ id, isPremium }, index) => {
        const user = usersById[id];
        const chat = chatsById[id];
        const peer = user || chat;

        const handleClick = () => {
          if (!isPremium || isCurrentUserPremium) {
            handleUserSelect(id);
          } else {
            showNotification({
              message: lang('SelectSendAsPeerPremiumHint'),
              actionText: lang('Open'),
              action: {
                action: 'openPremiumModal',
                payload: {},
              },
            });
          }
        };

        const avatarClassName = buildClassName(selectedSendAsId === id && 'selected');

        return (
          <ListItem
            key={id}
            className="SendAsItem chat-item-clickable scroll-item with-avatar"

            onClick={handleClick}
            focus={selectedSendAsIndex === index}
            rightElement={!isCurrentUserPremium && isPremium
              && <Icon name="lock-badge" className="send-as-icon-locked" />}
          >
            <Avatar
              size="small"
              peer={peer}
              className={avatarClassName}
            />
            <div className="info">
              {peer && <FullNameTitle peer={peer} noFake />}
              <span className="subtitle">
                {user
                  ? lang('VoipGroupPersonalAccount')
                  : lang('Subscribers', chat?.membersCount, 'i')}
              </span>
            </div>
          </ListItem>
        );
      })}
    </Menu>
  );
};

export default memo(SendAsMenu);
