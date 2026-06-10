import type { FC } from '../../../lib/teact/teact';
import {
  memo, useEffect, useMemo, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { SharedSettings } from '../../../global/types';
import type { AccountSettings, LangCode, TranslationTone } from '../../../types';
import { SettingsScreens } from '../../../types';

import { selectIsCurrentUserPremium } from '../../../global/selectors';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import { selectTranslationLanguage } from '../../../global/selectors/settings';
import { IS_TRANSLATION_SUPPORTED } from '../../../util/browser/windowEnvironment';
import { oldSetLanguage } from '../../../util/oldLangProvider';

import useFlag from '../../../hooks/useFlag';
import useHistoryBack from '../../../hooks/useHistoryBack';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';

import ItemPicker, { type ItemPickerOption } from '../../common/pickers/ItemPicker';
import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';
import Loading from '../../ui/Loading';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  isCurrentUserPremium: boolean;
  targetTranslationLanguage: string;
} & Pick<AccountSettings, 'canTranslate' | 'canTranslateChats' | 'doNotTranslate' | 'translationProvider' | 'translationTone'>
& Pick<SharedSettings, 'language' | 'languages'>;

const SettingsLanguage: FC<OwnProps & StateProps> = ({
  isActive,
  isCurrentUserPremium,
  languages,
  language,
  canTranslate,
  canTranslateChats,
  doNotTranslate,
  targetTranslationLanguage,
  translationProvider,
  translationTone = 'neutral',
  onReset,
}) => {
  const {
    loadLanguages,
    setSettingOption,
    setSharedSettingOption,
    openPremiumModal,
    openSettingsScreen,
    openChatLanguageModal,
  } = getActions();

  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [isLoading, markIsLoading, unmarkIsLoading] = useFlag();

  const isTranslateChatsLocked = translationProvider === 'cocoon' && !isCurrentUserPremium;
  const canTranslateChatsEnabled = canTranslateChats && !isTranslateChatsLocked;

  const lang = useOldLang();

  useEffect(() => {
    if (!languages?.length) {
      loadLanguages();
    }
  }, [languages]);

  const handleChange = useLastCallback((langCode: string) => {
    setSelectedLanguage(langCode);
    markIsLoading();

    void oldSetLanguage(langCode as LangCode, () => {
      unmarkIsLoading();

      setSharedSettingOption({ language: langCode as LangCode });
    });
  });

  const options = useMemo(() => {
    if (!languages) return undefined;
    const currentLangCode = (window.navigator.language || 'en').toLowerCase();
    const shortLangCode = currentLangCode.substr(0, 2);

    return languages.map(({ langCode, nativeName, name }) => ({
      value: langCode,
      label: nativeName,
      subLabel: name,
      isLoading: langCode === selectedLanguage && isLoading,
    } satisfies ItemPickerOption)).sort((a) => {
      return currentLangCode && (a.value === currentLangCode || a.value === shortLangCode) ? -1 : 0;
    });
  }, [isLoading, languages, selectedLanguage]);

  const handleShouldTranslateChange = useLastCallback((newValue: boolean) => {
    setSettingOption({ canTranslate: newValue });
  });

  const handleShouldTranslateChatsChange = useLastCallback((newValue: boolean) => {
    setSettingOption({ canTranslateChats: newValue });
  });

  const handleShouldTranslateChatsClick = useLastCallback(() => {
    if (!isCurrentUserPremium) {
      openPremiumModal({
        initialSection: 'translations',
      });
    }
  });

  const doNotTranslateText = useMemo(() => {
    if (!IS_TRANSLATION_SUPPORTED || !doNotTranslate.length) {
      return undefined;
    }

    if (doNotTranslate.length === 1) {
      const originalNames = new Intl.DisplayNames([language], { type: 'language' });
      return originalNames.of(doNotTranslate[0])!;
    }

    return lang('Languages', doNotTranslate.length);
  }, [doNotTranslate, lang, language]);

  const translationLanguageName = useMemo(() => {
    try {
      const originalNames = new Intl.DisplayNames([language], { type: 'language' });
      return originalNames.of(targetTranslationLanguage) || targetTranslationLanguage;
    } catch (e) {
      return targetTranslationLanguage;
    }
  }, [language, targetTranslationLanguage]);

  const handleChooseTranslationLanguage = useLastCallback(() => {
    openChatLanguageModal({});
  });

  const handleDoNotSelectOpen = useLastCallback(() => {
    openSettingsScreen({ screen: SettingsScreens.DoNotTranslate });
  });

  const engineOptions = useMemo(() => {
    return [
      { value: 'google', label: 'Google Translate', subLabel: 'Default' },
      { value: 'cocoon', label: 'Telegram (Cocoon)', subLabel: !isCurrentUserPremium ? 'Premium Only' : 'Native translation' },
    ] satisfies ItemPickerOption[];
  }, [isCurrentUserPremium]);

  const toneOptions = useMemo(() => {
    return [
      { value: 'neutral', label: lang('TranslationToneNeutral') },
      { value: 'formal', label: lang('TranslationToneFormal') },
      { value: 'casual', label: lang('TranslationToneCasual') },
    ] satisfies ItemPickerOption[];
  }, [lang]);

  const handleTranslationProviderChange = useLastCallback((newValue: string) => {
    setSettingOption({ translationProvider: newValue as any });
  });

  const handleTranslationToneChange = useLastCallback((newValue: string) => {
    setSettingOption({ translationTone: newValue as TranslationTone });
  });

  const handleDisabledEngineClick = useLastCallback((value: string) => {
    if (value === 'cocoon') {
      openPremiumModal({
        initialSection: 'translations',
      });
    }
  });

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  return (
    <div className="settings-content settings-language custom-scroll">
      {IS_TRANSLATION_SUPPORTED && (
        <div className="settings-item">
          <Checkbox
            label={lang('ShowTranslateButton')}
            checked={canTranslate}
            onCheck={handleShouldTranslateChange}
          />
          <Checkbox
            label={lang('ShowTranslateChatButton')}
            checked={canTranslateChatsEnabled}
            disabled={isTranslateChatsLocked}
            rightIcon={isTranslateChatsLocked ? 'lock' : undefined}
            onClickLabel={isTranslateChatsLocked ? handleShouldTranslateChatsClick : undefined}
            onCheck={isTranslateChatsLocked ? undefined : handleShouldTranslateChatsChange}
          />
          <ListItem
            narrow
            onClick={handleChooseTranslationLanguage}
          >
            Translate to
            <span className="settings-item__current-value">{translationLanguageName}</span>
          </ListItem>
          {(canTranslate || canTranslateChatsEnabled) && (
            <ListItem
              narrow
              onClick={handleDoNotSelectOpen}
            >
              {lang('DoNotTranslate')}
              <span className="settings-item__current-value">{doNotTranslateText}</span>
            </ListItem>
          )}
          <p className="settings-item-description mb-0 mt-1">
            {lang('lng_translate_settings_about')}
          </p>
        </div>
      )}
      {IS_TRANSLATION_SUPPORTED && (
        <div className="settings-item settings-item-picker">
          <h4 className="settings-item-header">
            Translation Engine
          </h4>
          <ItemPicker
            items={engineOptions}
            selectedValue={translationProvider}
            onSelectedValueChange={handleTranslationProviderChange}
            itemInputType="radio"
            className="settings-picker"
            lockedUnselectedValues={!isCurrentUserPremium ? ['cocoon'] : undefined}
            onDisabledClick={handleDisabledEngineClick}
          />
        </div>
      )}
      {IS_TRANSLATION_SUPPORTED && (canTranslate || canTranslateChatsEnabled) && (
        <div className="settings-item settings-item-picker">
          <h4 className="settings-item-header">
            Default Translation Tone
          </h4>
          <ItemPicker
            items={toneOptions}
            selectedValue={translationTone}
            onSelectedValueChange={handleTranslationToneChange}
            itemInputType="radio"
            className="settings-picker"
          />
        </div>
      )}
      <div className="settings-item settings-item-picker">
        <h4 className="settings-item-header">
          {lang('Localization.InterfaceLanguage')}
        </h4>
        {options ? (
          <ItemPicker
            items={options}
            selectedValue={selectedLanguage}
            forceRenderAllItems
            onSelectedValueChange={handleChange}
            itemInputType="radio"
            className="settings-picker"
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const {
      canTranslate, canTranslateChats, doNotTranslate, translationProvider = 'google', translationTone = 'neutral',
    } = global.settings.byKey;
    const { language, languages } = selectSharedSettings(global);

    const isCurrentUserPremium = selectIsCurrentUserPremium(global);
    const targetTranslationLanguage = selectTranslationLanguage(global);

    return {
      isCurrentUserPremium,
      languages,
      language,
      canTranslate,
      canTranslateChats,
      doNotTranslate,
      targetTranslationLanguage,
      translationProvider,
      translationTone,
    };
  },
)(SettingsLanguage));
