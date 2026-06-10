import type { FC } from '../../../lib/teact/teact';
import { memo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useLang from '../../../hooks/useLang';
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
  const lang = useLang();

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
        <h2 className="credits-title">{lang('ClashgramClientTitle')}</h2>
        <p className="credits-subtitle">{lang('ClashgramCreditsEnhancedClient')}</p>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">{lang('ClashgramCreditsSupportHeader')}</h3>
        
        <ListItem
          icon="bug"
          narrow
          multiline
          onClick={() => openUrl({ url: 'https://t.me/letmesolo_her' })}
        >
          <span className="title">{lang('ClashgramCreditsBugsTitle')}</span>
          <span className="subtitle" dir="auto">{lang('ClashgramCreditsBugsSub')}</span>
        </ListItem>

        <ListItem
          icon="channel"
          narrow
          multiline
          onClick={() => openUrl({ url: 'https://t.me/clashgramclient' })}
        >
          <span className="title">{lang('ClashgramCreditsChannelTitle')}</span>
          <span className="subtitle" dir="auto">{lang('ClashgramCreditsChannelSub')}</span>
        </ListItem>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">{lang('ClashgramCreditsInfoHeader')}</h3>
        <ListItem
          icon="info"
          narrow
          multiline
          inactive
        >
          <span className="title">{lang('ClashgramCreditsVersionTitle')}</span>
          <span className="subtitle" dir="auto">Clashgram 3.0</span>
        </ListItem>
        <ListItem
          icon="heart"
          narrow
          multiline
          inactive
        >
          <span className="title">{lang('ClashgramCreditsMadeWithLove')}</span>
          <span className="subtitle" dir="auto">{lang('ClashgramCreditsThankYou')}</span>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(SettingsCredits);
