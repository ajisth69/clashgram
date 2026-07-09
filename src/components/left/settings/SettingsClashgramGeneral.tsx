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
  clashgramWhisperForceLocal?: boolean;
  clashgramVoiceChangerEnabled?: boolean;
};

const SettingsClashgramGeneral = ({
  clashgramWhisperModel,
  clashgramWhisperTask,
  clashgramWhisperForceLocal,
  clashgramVoiceChangerEnabled,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption } = getActions();
  const lang = useLang();

  // Read local request count and date for UI progress bar
  const storedDate = localStorage.getItem('clashgram_transcribe_date') || '';
  const storedCountStr = localStorage.getItem('clashgram_transcribe_count') || '0';
  const storedHash = localStorage.getItem('clashgram_transcribe_hash') || '';
  let count = parseInt(storedCountStr, 10);

  const localDateStr = new Date().toISOString().split('T')[0];
  if (storedDate !== localDateStr) {
    count = 0;
  }

  // Basic validation hash to match getLocalRequestCount
  const HMAC_SALT = 'clashgram_whisper_secure_salt_2026';
  const hmacInput = `${storedDate}_${count}_${HMAC_SALT}`;
  let hashVal = 0;
  for (let i = 0; i < hmacInput.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hmacInput.charCodeAt(i);
    hashVal |= 0;
  }
  if (storedHash !== hashVal.toString(16) && storedDate === localDateStr) {
    count = 50; // Lock limit
  }

  const usedPercent = (count / 50) * 100;
  const remaining = Math.max(0, 50 - count);

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
              label={lang('ClashgramWhisperForceLocal')}
              subLabel={lang('ClashgramWhisperForceLocalSub')}
              checked={Boolean(clashgramWhisperForceLocal)}
              onCheck={() => setSharedSettingOption({
                clashgramWhisperForceLocal: !clashgramWhisperForceLocal,
              })}
            />
          </div>

          <div className="transcription-limit-card" style="background: rgba(0, 0, 0, 0.03); border-radius: 0.5rem; padding: 0.75rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid rgba(0, 0, 0, 0.05);">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 500; color: var(--color-text, #000000);">
              <span style="opacity: 0.85;">Daily Cloud Limit Used</span>
              <span style={`color: ${count >= 50 ? 'var(--color-danger, #e53935)' : 'var(--color-primary, #3390ec)'}; font-weight: 600;`}>
                {count}/50 requests
              </span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(0, 0, 0, 0.08); border-radius: 3px; overflow: hidden; position: relative;">
              <div 
                style={`width: ${usedPercent}%; 
                       height: 100%; 
                       background: ${count >= 50 ? 'var(--color-danger, #e53935)' : (usedPercent >= 80 ? '#f57c00' : 'var(--color-primary, #3390ec)')}; 
                       border-radius: 3px; 
                       transition: width 0.3s ease;`} 
              />
            </div>
            <p style="font-size: 0.6875rem; opacity: 0.55; margin: 0; line-height: 1.35; color: var(--color-text-secondary, #707579);">
              {count >= 50 
                ? "You have reached your 50 daily cloud requests. Local WASM transcription is now forced." 
                : `You have ${remaining} cloud requests remaining today before falling back to local WASM.`}
            </p>
          </div>

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
      clashgramWhisperForceLocal,
      clashgramVoiceChangerEnabled,
    } = selectSharedSettings(global);

    return {
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramWhisperForceLocal,
      clashgramVoiceChangerEnabled,
    };
  },
)(SettingsClashgramGeneral));
