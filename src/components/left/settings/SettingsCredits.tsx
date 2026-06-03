import type { FC } from '../../../lib/teact/teact';
import { memo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import useHistoryBack from '../../../hooks/useHistoryBack';
import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import ListItem from '../../ui/ListItem';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

const SettingsCredits: FC<OwnProps> = ({
  isActive,
  onReset,
}) => {
  const { openUrl } = getActions();

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  return (
    <div className="settings-content custom-scroll">
      <div className="settings-content-header no-border settings-credits-banner">
        <AnimatedIconWithPreview
          tgsUrl={LOCAL_TGS_URLS.Congratulations}
          size={160}
          className="credits-duck"
          nonInteractive
          noLoop={false}
        />
        <h2 className="credits-title">Clashgram Client</h2>
        <p className="credits-subtitle">Enhanced Telegram Client</p>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Support & Updates</h3>
        
        <ListItem
          icon="bug"
          narrow
          multiline
          onClick={() => openUrl({ url: 'https://t.me/letmesolo_her' })}
        >
          <span className="title">Bugs, Updates & Reports</span>
          <span className="subtitle" dir="auto">Contact @letmesolo_her for support</span>
        </ListItem>

        <ListItem
          icon="channel"
          narrow
          multiline
          onClick={() => openUrl({ url: 'https://t.me/clashgramclient' })}
        >
          <span className="title">Official Channel</span>
          <span className="subtitle" dir="auto">Join t.me/clashgramclient for updates</span>
        </ListItem>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Client Info</h3>
        <ListItem
          icon="info"
          narrow
          multiline
          inactive
        >
          <span className="title">Version</span>
          <span className="subtitle" dir="auto">Clashgram 3.0</span>
        </ListItem>
        <ListItem
          icon="heart"
          narrow
          multiline
          inactive
        >
          <span className="title">Made with Love</span>
          <span className="subtitle" dir="auto">Thank you for choosing Clashgram!</span>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(SettingsCredits);
