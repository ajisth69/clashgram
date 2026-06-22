import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import useLang from '../../../hooks/useLang';

import Checkbox from '../../ui/Checkbox';
import RadioGroup from '../../ui/RadioGroup';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramWhisperModel?: 'tiny' | 'base' | 'small';
  clashgramWhisperTask?: 'transcribe' | 'translate';
  clashgramVoiceChangerEnabled?: boolean;
};

const SettingsClashgramGeneral = ({
  clashgramWhisperModel,
  clashgramWhisperTask,
  clashgramVoiceChangerEnabled,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption } = getActions();
  const lang = useLang();

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-item">
          <h4 className="settings-item-header">{lang('ClashgramSpeechMediaModels')}</h4>

          <h4 className="settings-item-subheader">{lang('ClashgramWhisperModelHeader')}</h4>
          <RadioGroup
            name="clashgramWhisperModel"
            options={[
              { label: lang('ClashgramWhisperTiny'), value: 'tiny' },
              { label: lang('ClashgramWhisperBase'), value: 'base' },
              { label: lang('ClashgramWhisperSmall'), value: 'small' },
            ]}
            selected={clashgramWhisperModel ?? 'base'}
            onChange={(value) => setSharedSettingOption({ clashgramWhisperModel: value as any })}
          />
          <p className="settings-item-description" style="margin-top: 0.25rem; margin-bottom: 1rem;">
            {lang('ClashgramWhisperModelSub')}
          </p>

          <h4 className="settings-item-subheader">{lang('ClashgramTranscriptionModeHeader')}</h4>
          <RadioGroup
            name="clashgramWhisperTask"
            options={[
              { label: lang('ClashgramWhisperTranscribe'), value: 'transcribe' },
              { label: lang('ClashgramWhisperTranslate'), value: 'translate' },
            ]}
            selected={clashgramWhisperTask ?? 'transcribe'}
            onChange={(value) => setSharedSettingOption({ clashgramWhisperTask: value as any })}
          />

          <div style="margin-top: 1rem;">
            <Checkbox
              label={lang('ClashgramEnableVoiceChanger')}
              subLabel={lang('ClashgramEnableVoiceChangerSub')}
              checked={Boolean(clashgramVoiceChangerEnabled)}
              onCheck={() => setSharedSettingOption({
                clashgramVoiceChangerEnabled: !clashgramVoiceChangerEnabled,
              })}
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
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramVoiceChangerEnabled,
    } = selectSharedSettings(global);

    return {
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramVoiceChangerEnabled,
    };
  },
)(SettingsClashgramGeneral));
