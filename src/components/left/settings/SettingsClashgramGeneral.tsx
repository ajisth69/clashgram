import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import useLang from '../../../hooks/useLang';

import Checkbox from '../../ui/Checkbox';
import RadioGroup from '../../ui/RadioGroup';
import InputText from '../../ui/InputText';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramWhisperModel?: 'tiny' | 'base' | 'small';
  clashgramWhisperTask?: 'transcribe' | 'translate';
  clashgramVoiceChangerEnabled?: boolean;
  clashgramProxyEnabled?: boolean;
  clashgramProxyUrl?: string;
  connectionState?: 'connectionStateConnecting' | 'connectionStateReady' | 'connectionStateBroken';
};

const getBadgeStyleString = (state?: string) => {
  let bg = 'rgba(241, 196, 15, 0.15)';
  let color = '#f1c40f';
  if (state === 'connectionStateReady') {
    bg = 'rgba(46, 204, 113, 0.15)';
    color = '#2ecc71';
  } else if (state === 'connectionStateBroken') {
    bg = 'rgba(231, 76, 60, 0.15)';
    color = '#e74c3c';
  }
  return `background-color: ${bg}; color: ${color}; padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.03em; display: inline-flex; align-items: center;`;
};

const getBadgeDotStyleString = (state?: string) => {
  let color = '#f1c40f';
  if (state === 'connectionStateReady') color = '#2ecc71';
  if (state === 'connectionStateBroken') color = '#e74c3c';
  return `width: 6px; height: 6px; border-radius: 50%; background-color: ${color}; margin-right: 6px; display: inline-block;`;
};

const SettingsClashgramGeneral = ({
  clashgramWhisperModel,
  clashgramWhisperTask,
  clashgramVoiceChangerEnabled,
  clashgramProxyEnabled,
  clashgramProxyUrl,
  connectionState,
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

        <div className="settings-item">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <h4 className="settings-item-header" style="margin: 0;">{lang('ClashgramProxyHeader') || 'Proxy Settings'}</h4>
            {clashgramProxyEnabled && (
              <span style={getBadgeStyleString(connectionState)}>
                <span style={getBadgeDotStyleString(connectionState)} />
                {connectionState === 'connectionStateReady' ? 'Connected' :
                 connectionState === 'connectionStateBroken' ? 'Connection Failed' : 'Connecting...'}
              </span>
            )}
          </div>
          <Checkbox
            label={lang('ClashgramProxyEnable') || 'Enable Connection Proxy'}
            subLabel={lang('ClashgramProxyEnableSub') || 'Route MTProto traffic through a WebSocket proxy worker'}
            checked={Boolean(clashgramProxyEnabled)}
            onCheck={() => setSharedSettingOption({
              clashgramProxyEnabled: !clashgramProxyEnabled,
            })}
          />
          {clashgramProxyEnabled && (
            <div style="margin-top: 1rem;">
              <InputText
                value={clashgramProxyUrl ?? 'https://freenet.clashgram.workers.dev/'}
                label={lang('ClashgramProxyUrlHeader') || 'Proxy URL'}
                placeholder="https://freenet.clashgram.workers.dev/"
                onChange={(e) => setSharedSettingOption({
                  clashgramProxyUrl: (e.target as HTMLInputElement).value,
                })}
              />
            </div>
          )}
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
      clashgramProxyEnabled,
      clashgramProxyUrl,
    } = selectSharedSettings(global);

    return {
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramVoiceChangerEnabled,
      clashgramProxyEnabled,
      clashgramProxyUrl,
      connectionState: global.connectionState,
    };
  },
)(SettingsClashgramGeneral));
