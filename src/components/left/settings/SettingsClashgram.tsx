import { memo, useState, useCallback } from '../../../lib/teact/teact';
import { getActions } from '../../../global';
import { SettingsScreens } from '../../../types';
import useLang from '../../../hooks/useLang';

import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import ListItem from '../../ui/ListItem';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

const SettingsClashgram = ({ isActive, onReset }: OwnProps) => {
  const { openSettingsScreen, resetClashgramSettings } = getActions();
  const lang = useLang();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleOpenResetConfirm = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  const handleCloseResetConfirm = useCallback(() => {
    setIsResetConfirmOpen(false);
  }, []);

  const handleConfirmReset = useCallback(() => {
    resetClashgramSettings();
    setIsResetConfirmOpen(false);
  }, [resetClashgramSettings]);

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-content-header no-border">
          <AnimatedIconWithPreview
            tgsUrl={LOCAL_TGS_URLS.Eyes}
            size={140}
            className="experimental-duck"
            nonInteractive
            noLoop={false}
          />
          <h2 style="font-weight: 600; font-size: 1.25rem; margin-top: 0.5rem;">{lang('ClashgramSettings')}</h2>
          <p className="settings-item-description pt-1" dir="auto">
            {lang('ClashgramSettingsSub')}
          </p>
        </div>

        <div className="settings-item">
          <ListItem icon="eye-crossed-outline" narrow onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramStealth })}>
            <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
              <span
                className="title"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                Clashgram
              </span>
              <span
                className="subtitle"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramStealthSub')}
              </span>
            </div>
          </ListItem>

          <ListItem icon="settings" narrow onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramGeneral })}>
            <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
              <span
                className="title"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('General')}
              </span>
              <span
                className="subtitle"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramGeneralSub')}
              </span>
            </div>
          </ListItem>

          <ListItem icon="animations" narrow onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramAppearance })}>
            <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
              <span
                className="title"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('Theme')}
              </span>
              <span
                className="subtitle"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramAppearanceSub')}
              </span>
            </div>
          </ListItem>

          <ListItem icon="group" narrow onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramChats })}>
            <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
              <span
                className="title"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('Chats')}
              </span>
              <span
                className="subtitle"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramChatsSub')}
              </span>
            </div>
          </ListItem>

          <ListItem icon="delete" narrow destructive onClick={handleOpenResetConfirm}>
            <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
              <span
                className="title"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramResetSettings')}
              </span>
              <span
                className="subtitle"
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
              >
                {lang('ClashgramResetSettingsSub')}
              </span>
            </div>
          </ListItem>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={handleCloseResetConfirm}
        confirmHandler={handleConfirmReset}
        title={lang('ClashgramResetSettings')}
        text={lang('ClashgramResetSettingsConfirm')}
        confirmLabel={lang('ClashgramResetSettings')}
        confirmIsDestructive
      />
    </div>
  );
};

export default memo(SettingsClashgram);
