import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { SettingsScreens } from '../../../types';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import useLang from '../../../hooks/useLang';

import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramGhostModeRead?: boolean;
  clashgramGhostModeTyping?: boolean;
  clashgramGhostModeStories?: boolean;
  clashgramSendSilently?: boolean;
  clashgramLocalPremium?: boolean;
};

const SettingsClashgramStealth = ({
  clashgramGhostModeRead,
  clashgramGhostModeTyping,
  clashgramGhostModeStories,
  clashgramSendSilently,
  clashgramLocalPremium,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption } = getActions();
  const lang = useLang();

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-item">
          <h4 className="settings-item-header">{lang('ClashgramStealthOptions')}</h4>

          <Checkbox
            label={lang('ClashgramHideReadReceipts')}
            subLabel={lang('ClashgramHideReadReceiptsSub')}
            checked={Boolean(clashgramGhostModeRead)}
            onCheck={() => setSharedSettingOption({ clashgramGhostModeRead: !clashgramGhostModeRead })}
          />

          <Checkbox
            label={lang('ClashgramHideStoryViews')}
            subLabel={lang('ClashgramHideStoryViewsSub')}
            checked={Boolean(clashgramGhostModeStories)}
            onCheck={() => setSharedSettingOption({ clashgramGhostModeStories: !clashgramGhostModeStories })}
          />

          <Checkbox
            label={lang('ClashgramHideTypingStatus')}
            subLabel={lang('ClashgramHideTypingStatusSub')}
            checked={Boolean(clashgramGhostModeTyping)}
            onCheck={() => setSharedSettingOption({ clashgramGhostModeTyping: !clashgramGhostModeTyping })}
          />


          <Checkbox
            label={lang('ClashgramAlwaysSendSilently')}
            subLabel={lang('ClashgramAlwaysSendSilentlySub')}
            checked={Boolean(clashgramSendSilently)}
            onCheck={() => setSharedSettingOption({ clashgramSendSilently: !clashgramSendSilently })}
          />

          <div style="margin-top: 1.5rem;">
            <h4 className="settings-item-subheader">{lang('ClashgramSystemSecurity')}</h4>
            <ListItem
              icon="lock"
              narrow
              onClick={() => getActions().openSettingsScreen({ screen: SettingsScreens.ClashgramPasscode })}
            >
              <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
                <span
                  className="title"
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
                >
                  {lang('ClashgramConfigurePasscodeSettings')}
                </span>
                <span
                  className="subtitle"
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
                >
                  {lang('ClashgramConfigurePasscodeSettingsSub')}
                </span>
              </div>
            </ListItem>
          </div>

          <div style="margin-top: 1rem;">
            <Checkbox
              label={lang('ClashgramLocalPremium')}
              subLabel={lang('ClashgramLocalPremiumSub')}
              checked={Boolean(clashgramLocalPremium)}
              onCheck={() => setSharedSettingOption({ clashgramLocalPremium: !clashgramLocalPremium })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const {
      clashgramGhostModeRead,
      clashgramGhostModeTyping,
      clashgramGhostModeStories,
      clashgramSendSilently,
      clashgramLocalPremium,
    } = selectSharedSettings(global);

    return {
      clashgramGhostModeRead,
      clashgramGhostModeTyping,
      clashgramGhostModeStories,
      clashgramSendSilently,
      clashgramLocalPremium,
    };
  },
)(SettingsClashgramStealth));
