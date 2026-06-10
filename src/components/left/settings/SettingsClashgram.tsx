import type { ChangeEvent } from 'react';
import {
  memo, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import { MAIN_THREAD_ID } from '../../../api/types';
import { SettingsScreens } from '../../../types';

import { selectSharedSettings } from '../../../global/selectors/sharedState';
import { selectTabState } from '../../../global/selectors';
import {
  applyClashgramGlassTheme,
  DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
} from '../../../util/clashgramGlass';
import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import Button from '../../ui/Button';
import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';
import RadioGroup from '../../ui/RadioGroup';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramGhostModeRead?: boolean;
  clashgramGhostModeTyping?: boolean;
  clashgramGhostModeOnline?: boolean;
  clashgramGhostModeStories?: boolean;
  clashgramAntiDelete?: boolean;
  clashgramAntiEdit?: boolean;
  clashgramRetentionDays?: number;
  clashgramBypassRestrictions?: boolean;
  clashgramLocalPremium?: boolean;
  clashgramWhisperModel?: 'tiny' | 'base' | 'small';
  clashgramWhisperTask?: 'transcribe' | 'translate';
  clashgramNativeGlass?: boolean;
  clashgramNativeGlassColorValue?: number;
  clashgramNativeGlassOpacityValue?: number;
  clashgramBackgroundAnimation?:
    | 'none'
    | 'starfall'
    | 'neon-rain'
    | 'fluid-gradients'
    | 'cosmic-dust'
    | 'bubbles'
    | 'custom';
  clashgramCustomFont?: string;
  clashgramVoiceChangerEnabled?: boolean;
  unreadChatIds: string[];
  clashgramCustomAnimation?: string;
  clashgramSendSilently?: boolean;
  clashgramNoQuoteForwarding?: boolean;
  clashgramRetainKickedChats?: boolean;
  clashgramConfirmMedia?: boolean;
  clashgramConfirmFile?: boolean;
  clashgramConfirmGifEmoji?: boolean;
  clashgramConfirmMsg?: boolean;
  clashgramHideBlockedInGroups?: boolean;
};

const IMPORT_CONTAINER_STYLE = 'display: flex; flex-direction: column; '
  + 'gap: 0.5rem; margin-bottom: 0.75rem;';

const SEARCH_INPUT_STYLE = 'width: 100%; box-sizing: border-box; padding: 0.5rem; '
  + 'border: 1px solid rgba(var(--color-text-rgb), 0.12); border-radius: 0.375rem; '
  + 'background: var(--color-background); color: var(--color-text); '
  + 'font-size: 0.8125rem; outline: none;';

const ACTIVE_PREVIEW_STYLE = 'margin-bottom: 0.75rem; font-size: 0.8125rem; '
  + 'color: var(--color-text-secondary);';

const FONT_LIST_SCROLL_STYLE = 'height: 320px; overflow-y: auto; '
  + 'border: 1px solid rgba(var(--color-text-rgb), 0.08); border-radius: 0.375rem; '
  + 'background: var(--color-background);';

const PRE_CODE_STYLE = 'margin: 0.5rem 0; padding: 0.625rem; '
  + 'background: rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.725rem; '
  + 'line-height: 1.4; color: var(--color-text);';

const TEXTAREA_STYLE = 'width: 100%; height: 100px; margin-top: 0.5rem; '
  + 'padding: 0.5rem; border: 1px solid rgba(var(--color-text-rgb), 0.12); '
  + 'border-radius: 0.25rem; font-family: var(--font-family-monospace); '
  + 'font-size: 0.75rem; background: var(--color-background); color: var(--color-text);';

const SettingsClashgram = ({
  isActive,
  clashgramGhostModeRead,
  clashgramGhostModeTyping,
  clashgramGhostModeOnline,
  clashgramGhostModeStories,
  clashgramAntiDelete,
  clashgramAntiEdit,
  clashgramRetentionDays,
  clashgramBypassRestrictions,
  clashgramLocalPremium,
  clashgramWhisperModel,
  clashgramWhisperTask,
  clashgramNativeGlass,
  clashgramNativeGlassColorValue,
  clashgramNativeGlassOpacityValue,
  clashgramBackgroundAnimation,
  clashgramCustomFont,
  clashgramVoiceChangerEnabled,
  unreadChatIds,
  clashgramCustomAnimation,
  clashgramSendSilently,
  clashgramNoQuoteForwarding,
  clashgramRetainKickedChats,
  clashgramConfirmMedia,
  clashgramConfirmFile,
  clashgramConfirmGifEmoji,
  clashgramConfirmMsg,
  clashgramHideBlockedInGroups,
  onReset,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption, showNotification } = getActions();
  const colorFrameRef = useRef<number>();
  const lang = useLang();

  const [currentScreen, setCurrentScreen] = useState<
    'categories' | 'clashgram' | 'general' | 'appearance' | 'chats'
  >('categories');

  const [renderingGlassColorValue, setRenderingGlassColorValue] = useState(
    clashgramNativeGlassColorValue ?? DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  );
  const [renderingGlassOpacityValue, setRenderingGlassOpacityValue] = useState(
    clashgramNativeGlassOpacityValue ?? DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
  );

  // Reset to categories screen when component is deactivated
  useEffect(() => {
    if (!isActive) {
      setCurrentScreen('categories');
    }
  }, [isActive]);

  // Load custom web font if needed
  useEffect(() => {
    if (clashgramCustomFont && clashgramCustomFont !== 'default') {
      const systemFonts = ['arial', 'helvetica', 'georgia', 'impact', 'segoe ui', 'trebuchet ms', 'courier new', 'consolas', 'lucida console', 'comic sans ms', 'avenir next', 'cabinet', 'clash display', 'clash grotesk', 'chillax', 'general sans', 'satoshi', 'telma'];
      if (!systemFonts.includes(clashgramCustomFont.toLowerCase())) {
        const linkId = `gfont-${clashgramCustomFont.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clashgramCustomFont)}:wght@400;500;700&display=swap`;
          document.head.appendChild(link);
        }
      }
    }
  }, [clashgramCustomFont]);

  // Load all preview web fonts in background batches when appearance screen is active
  useEffect(() => {
    if (currentScreen === 'appearance') {
      const gfonts = [
        'Anton', 'Bebas Neue', 'Bricolage Grotesk', 'Cabinet Grotesk', 'Cabin', 'Cinzel',
        'Cormorant Garamond', 'Crimson Text', 'DM Sans', 'Fjalla One', 'Fira Sans', 'Inter',
        'Josefin Sans', 'Kanit', 'Lato', 'Lexend', 'Libre Baskerville', 'Lora', 'Merriweather',
        'Montserrat', 'Nunito', 'Open Sans', 'Oswald', 'Outfit', 'Playfair Display', 'Poppins',
        'Plus Jakarta Sans', 'Quicksand', 'Raleway', 'Roboto', 'Space Grotesk', 'Spectral',
        'Syne', 'Unbounded', 'Work Sans',
        'Bubblegum Sans', 'Bungee Outline', 'Creepster', 'Eater', 'Monoton', 'Nosifer',
        'Rubik Glitch', 'Rubik Beastly', 'Press Start 2P', 'VT323', 'Shojumaru', 'Pirata One',
        'Uncial Antiqua', 'Fredericka the Great', 'Cinzel Decorative', 'Pacifico', 'Sacramento',
        'Special Elite', 'Righteous', 'Comfortaa', 'Megrim'
      ];

      const batchSize = 15;
      for (let i = 0; i < gfonts.length; i += batchSize) {
        const batch = gfonts.slice(i, i + batchSize);
        const linkId = `gfonts-preview-batch-${i}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = 'https://fonts.googleapis.com/css2?'
            + batch.map((f) => `family=${encodeURIComponent(f)}`).join('&')
            + '&display=swap';
          document.head.appendChild(link);
        }
      }
    }
  }, [currentScreen]);

  // Custom Font lookup
  const [googleFontInput, setGoogleFontInput] = useState('');
  const [fontsList, setFontsList] = useState([
    { label: 'System Default', value: 'default' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Avenir Next', value: 'Avenir Next' },
    { label: 'Anton', value: 'Anton' },
    { label: 'Bebas Neue', value: 'Bebas Neue' },
    { label: 'Bricolage Grotesk', value: 'Bricolage Grotesk' },
    { label: 'Cabinet Grotesk', value: 'Cabinet Grotesk' },
    { label: 'Cabinet', value: 'Cabinet' },
    { label: 'Cabin', value: 'Cabin' },
    { label: 'Cascadia Code', value: 'Cascadia Code' },
    { label: 'Clash Display', value: 'Clash Display' },
    { label: 'Clash Grotesk', value: 'Clash Grotesk' },
    { label: 'Chillax', value: 'Chillax' },
    { label: 'Cinzel', value: 'Cinzel' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' },
    { label: 'Consolas', value: 'Consolas' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
    { label: 'Crimson Text', value: 'Crimson Text' },
    { label: 'DM Sans', value: 'DM Sans' },
    { label: 'Fjalla One', value: 'Fjalla One' },
    { label: 'Fira Sans', value: 'Fira Sans' },
    { label: 'General Sans', value: 'General Sans' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Inter', value: 'Inter' },
    { label: 'Josefin Sans', value: 'Josefin Sans' },
    { label: 'Kanit', value: 'Kanit' },
    { label: 'Lato', value: 'Lato' },
    { label: 'Lexend', value: 'Lexend' },
    { label: 'Libre Baskerville', value: 'Libre Baskerville' },
    { label: 'Lora', value: 'Lora' },
    { label: 'Lucida Console', value: 'Lucida Console' },
    { label: 'Merriweather', value: 'Merriweather' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Nunito', value: 'Nunito' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Oswald', value: 'Oswald' },
    { label: 'Outfit', value: 'Outfit' },
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'Playfair', value: 'Playfair' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
    { label: 'Quicksand', value: 'Quicksand' },
    { label: 'Raleway', value: 'Raleway' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Satoshi', value: 'Satoshi' },
    { label: 'Segoe UI', value: 'Segoe UI' },
    { label: 'Space Grotesk', value: 'Space Grotesk' },
    { label: 'Spectral', value: 'Spectral' },
    { label: 'Syne', value: 'Syne' },
    { label: 'Telma', value: 'Telma' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Ubuntu', value: 'Ubuntu' },
    { label: 'Unbounded', value: 'Unbounded' },
    { label: 'Work Sans', value: 'Work Sans' },
    // Google Fonts with clean labels
    { label: 'Bubblegum Sans', value: 'Bubblegum Sans' },
    { label: 'Bungee Outline', value: 'Bungee Outline' },
    { label: 'Creepster', value: 'Creepster' },
    { label: 'Eater', value: 'Eater' },
    { label: 'Monoton', value: 'Monoton' },
    { label: 'Nosifer', value: 'Nosifer' },
    { label: 'Rubik Glitch', value: 'Rubik Glitch' },
    { label: 'Rubik Beastly', value: 'Rubik Beastly' },
    { label: 'Press Start 2P', value: 'Press Start 2P' },
    { label: 'VT323', value: 'VT323' },
    { label: 'Shojumaru', value: 'Shojumaru' },
    { label: 'Pirata One', value: 'Pirata One' },
    { label: 'Uncial Antiqua', value: 'Uncial Antiqua' },
    { label: 'Fredericka the Great', value: 'Fredericka the Great' },
    { label: 'Cinzel Decorative', value: 'Cinzel Decorative' },
    { label: 'Pacifico', value: 'Pacifico' },
    { label: 'Sacramento', value: 'Sacramento' },
    { label: 'Special Elite', value: 'Special Elite' },
    { label: 'Righteous', value: 'Righteous' },
    { label: 'Comfortaa', value: 'Comfortaa' },
    { label: 'Megrim', value: 'Megrim' },
  ]);

  const [customAnimText, setCustomAnimText] = useState(clashgramCustomAnimation || '');
  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  const handleFontSelect = useLastCallback((fontValue: string) => {
    setSharedSettingOption({ clashgramCustomFont: fontValue });
    document.documentElement.style.setProperty(
      '--clashgram-custom-font',
      fontValue === 'default' ? 'inherit' : `"${fontValue}", sans-serif`,
    );
    if (fontValue && fontValue !== 'default') {
      const systemFonts = ['arial', 'helvetica', 'georgia', 'impact', 'segoe ui', 'trebuchet ms', 'courier new', 'consolas', 'lucida console', 'comic sans ms', 'avenir next', 'cabinet', 'clash display', 'clash grotesk', 'chillax', 'general sans', 'satoshi', 'telma'];
      if (!systemFonts.includes(fontValue.toLowerCase())) {
        const linkId = `gfont-${fontValue.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontValue)}:wght@400;500;700&display=swap`;
          document.head.appendChild(link);
        }
      }
    }
  });

  const handleImportGoogleFont = () => {
    if (!googleFontInput.trim()) return;
    const fontName = googleFontInput.trim();
    const linkId = `gfont-${fontName.replace(/\s+/g, '-')}`;

    if (document.getElementById(linkId)) {
      showNotification({ message: lang('ClashgramFontAlreadyImported') });
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}`
      + ':wght@400;500;700&display=swap';
    document.head.appendChild(link);

    const newFont = { label: fontName, value: fontName };
    setFontsList((prev) => [...prev, newFont]);
    handleFontSelect(fontName);
    setGoogleFontInput('');
    showNotification({ message: lang('ClashgramFontImportSuccess', { fontName }) });
  };

  const handleNativeGlassToggle = useLastCallback((isChecked: boolean) => {
    applyClashgramGlassTheme(isChecked, renderingGlassColorValue, renderingGlassOpacityValue);
    setSharedSettingOption({ clashgramNativeGlass: isChecked });
  });

  const handleGlassColorChange = useLastCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    setRenderingGlassColorValue(value);

    if (colorFrameRef.current !== undefined) {
      cancelAnimationFrame(colorFrameRef.current);
    }

    colorFrameRef.current = requestAnimationFrame(() => {
      colorFrameRef.current = undefined;
      applyClashgramGlassTheme(Boolean(clashgramNativeGlass), value, renderingGlassOpacityValue);
      setSharedSettingOption({ clashgramNativeGlassColorValue: value });
    });
  });

  const handleGlassOpacityChange = useLastCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);
    setRenderingGlassOpacityValue(value);

    if (colorFrameRef.current !== undefined) {
      cancelAnimationFrame(colorFrameRef.current);
    }

    colorFrameRef.current = requestAnimationFrame(() => {
      colorFrameRef.current = undefined;
      applyClashgramGlassTheme(Boolean(clashgramNativeGlass), renderingGlassColorValue, value);
      setSharedSettingOption({ clashgramNativeGlassOpacityValue: value });
    });
  });

  const handleApplyCustomAnimation = () => {
    try {
      JSON.parse(customAnimText);
      setSharedSettingOption({ clashgramCustomAnimation: customAnimText });
      showNotification({ message: lang('ClashgramCustomAnimApplied') });
    } catch (e) {
      showNotification({ message: lang('ClashgramInvalidJson') });
    }
  };

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

  const filteredFontsList = googleFontInput.trim()
    ? fontsList.filter((f) => f.label.toLowerCase().includes(googleFontInput.toLowerCase()))
    : fontsList;

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      {currentScreen === 'categories' && (
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
            <ListItem icon="eye-crossed-outline" narrow onClick={() => setCurrentScreen('clashgram')}>
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

            <ListItem icon="settings" narrow onClick={() => setCurrentScreen('general')}>
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
            <ListItem icon="animations" narrow onClick={() => setCurrentScreen('appearance')}>
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
            <ListItem icon="group" narrow onClick={() => setCurrentScreen('chats')}>
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
          </div>
        </div>
      )}

      {currentScreen === 'clashgram' && (
        <div className="fade-in">
          <ListItem icon="arrow-left" narrow onClick={() => setCurrentScreen('categories')}>
            <strong>{lang('ClashgramBackToCategories')}</strong>
          </ListItem>

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
              label={lang('ClashgramHideOnlineStatus')}
              subLabel={lang('ClashgramHideOnlineStatusSub')}
              checked={Boolean(clashgramGhostModeOnline)}
              onCheck={() => setSharedSettingOption({ clashgramGhostModeOnline: !clashgramGhostModeOnline })}
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
      )}

      {currentScreen === 'general' && (
        <div className="fade-in">
          <ListItem icon="arrow-left" narrow onClick={() => setCurrentScreen('categories')}>
            <strong>{lang('ClashgramBackToCategories')}</strong>
          </ListItem>

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
      )}

      {currentScreen === 'appearance' && (
        <div className="fade-in">
          <ListItem icon="arrow-left" narrow onClick={() => setCurrentScreen('categories')}>
            <strong>{lang('ClashgramBackToCategories')}</strong>
          </ListItem>

          <div className="settings-item">
            <h4 className="settings-item-header">{lang('ClashgramAestheticsLayout')}</h4>

            <Checkbox
              label={lang('ClashgramNativeGlass')}
              subLabel={lang('ClashgramNativeGlassSub')}
              checked={Boolean(clashgramNativeGlass)}
              onCheck={handleNativeGlassToggle}
            />

            <div
              className={`clashgram-glass-color-control${!clashgramNativeGlass ? ' disabled' : ''}`}
            >
              <div className="clashgram-glass-color-row">
                <span className="clashgram-glass-color-label">{lang('ClashgramGlassColorHue')}</span>
                <span className="clashgram-glass-color-value">
                  {Math.round(renderingGlassColorValue * 3.6)}
                  °
                </span>
              </div>
              <div className="clashgram-glass-slider-row">
                <input
                  className="clashgram-glass-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={renderingGlassColorValue}
                  disabled={!clashgramNativeGlass}
                  onChange={handleGlassColorChange}
                />
              </div>

              <div className="clashgram-glass-color-row" style="margin-top: 1.25rem;">
                <span className="clashgram-glass-color-label">{lang('ClashgramTransparencyDepth')}</span>
                <span className="clashgram-glass-color-value">
                  {renderingGlassOpacityValue}
                  %
                </span>
              </div>
              <div className="clashgram-glass-slider-row">
                <input
                  className="clashgram-glass-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={renderingGlassOpacityValue}
                  disabled={!clashgramNativeGlass}
                  onChange={handleGlassOpacityChange}
                />
              </div>
            </div>
          </div>

          <div className="settings-item">
            <h4 className="settings-item-header">{lang('ClashgramCustomFonts')}</h4>

            <div className="font-import-container" style={IMPORT_CONTAINER_STYLE}>
              <input
                type="text"
                placeholder={lang('ClashgramSearchFontsPlaceholder')}
                value={googleFontInput}
                onChange={(e) => setGoogleFontInput(e.currentTarget.value)}
                className="font-search-input"
                style={SEARCH_INPUT_STYLE}
              />
              <Button onClick={handleImportGoogleFont} color="primary" style="width: 100%;">
                {lang('ClashgramImportFontButton')}
              </Button>
            </div>

            <div className="font-active-preview" style={ACTIVE_PREVIEW_STYLE}>
              {lang('ClashgramActiveFontLabel')}
              {' '}
              <strong
                style={
                  clashgramCustomFont && clashgramCustomFont !== 'default'
                    ? `font-family: "${clashgramCustomFont}", sans-serif; color: var(--color-text);`
                    : 'color: var(--color-text);'
                }
              >
                {clashgramCustomFont && clashgramCustomFont !== 'default' ? clashgramCustomFont : lang('SystemDefault')}
              </strong>
            </div>

            <div className="font-list-scroll custom-scroll" style={FONT_LIST_SCROLL_STYLE}>
              {filteredFontsList.map((font) => {
                const isSelected = (clashgramCustomFont || 'default') === font.value;
                const fontLabel = font.value === 'default' ? lang('SystemDefault') : font.label;
                return (
                  <ListItem
                    key={font.value}
                    narrow
                    style={isSelected ? 'background: var(--color-background-selected); font-weight: 500;' : ''}
                    onClick={() => handleFontSelect(font.value)}
                  >
                    <span style={font.value !== 'default' ? `font-family: "${font.value}", sans-serif;` : ''}>
                      {fontLabel}
                    </span>
                  </ListItem>
                );
              })}
            </div>
          </div>

          <div className="settings-item">
            <h4 className="settings-item-header">{lang('ClashgramBgAnimation')}</h4>

            <RadioGroup
              name="clashgramBackgroundAnimation"
              options={[
                { label: lang('ClashgramBgAnimNone'), value: 'none' },
                { label: lang('ClashgramBgAnimAurora'), value: 'starfall' },
                { label: lang('ClashgramBgAnimRain'), value: 'neon-rain' },
                { label: lang('ClashgramBgAnimOcean'), value: 'fluid-gradients' },
                { label: lang('ClashgramBgAnimStardust'), value: 'cosmic-dust' },
                { label: lang('ClashgramBgAnimBlossoms'), value: 'bubbles' },
                { label: lang('ClashgramBgAnimCustom'), value: 'custom' },
              ]}
              selected={clashgramBackgroundAnimation ?? 'none'}
              onChange={(value) => setSharedSettingOption({ clashgramBackgroundAnimation: value as any })}
            />

            {clashgramBackgroundAnimation === 'custom' && (
              <div className="custom-animation-injector-panel fade-in" style="margin-top: 1rem;">
                <h4 className="settings-item-subheader">{lang('ClashgramCustomThemeSchema')}</h4>
                <p className="settings-item-description">
                  {lang('ClashgramCustomThemeSchemaDesc')}
                </p>
                <div style="position: relative;">
                  <button
                    type="button"
                    className="json-copy-btn"
                    onClick={() => {
                      const jsonText = JSON.stringify({
                        particleCount: 80,
                        colors: ['#4ae7ff', '#6370ff', '#ca78ff', '#ff7beb', '#ffffff'],
                        minSpeed: 0.5,
                        maxSpeed: 1.5,
                        minSize: 1.2,
                        maxSize: 3.5,
                        glowEffect: true,
                        spawnOnClick: true,
                        gravity: 0.04,
                        drift: 0.03,
                        background: {
                          type: 'animated-gradient',
                          colors: ['#060814', '#0b112c', '#16113a'],
                          animationSpeed: '15s',
                        },
                      }, null, 2);
                      navigator.clipboard.writeText(jsonText).then(() => {
                        showNotification({ message: lang('ClashgramJsonCopied') });
                      });
                    }}
                    style="position: absolute; top: 0.375rem; right: 0.375rem; padding: 0.25rem 0.5rem; border: 1px solid rgba(var(--color-text-rgb), 0.15); border-radius: 0.25rem; background: rgba(var(--color-text-rgb), 0.08); color: var(--color-text-secondary); font-size: 0.6875rem; cursor: pointer; z-index: 1; transition: background 0.2s, color 0.2s;"
                  >
                    {lang('ClashgramCopyJsonButton')}
                  </button>
                  <pre className="monospace-code-block" style={PRE_CODE_STYLE}>
                    {`{
  "particleCount": 80,
  "colors": ["#4ae7ff", "#6370ff", "#ca78ff"],
  "minSpeed": 0.5, "maxSpeed": 1.5,
  "minSize": 1.2, "maxSize": 3.5,
  "glowEffect": true,
  "spawnOnClick": true,
  "gravity": 0.04, "drift": 0.03,
  "background": {
    "type": "animated-gradient",
    "colors": ["#060814", "#0b112c", "#16113a"],
    "animationSpeed": "15s"
  }
}`}
                  </pre>
                </div>
                <p className="settings-item-description" style="margin-top: 0.25rem; margin-bottom: 0.5rem; font-size: 0.7rem; opacity: 0.6;">
                  {lang('ClashgramCustomAnimTip')}
                </p>
                <textarea
                  className="custom-animation-textarea"
                  value={customAnimText}
                  onChange={(e) => setCustomAnimText(e.currentTarget.value)}
                  placeholder={lang('ClashgramCustomAnimPlaceholder')}
                  style="width: 100%; height: 140px; margin-top: 0.5rem; padding: 0.5rem; border: 1px solid rgba(var(--color-text-rgb), 0.12); border-radius: 0.375rem; font-family: var(--font-family-monospace); font-size: 0.75rem; background: var(--color-background); color: var(--color-text); resize: vertical;"
                />
                <Button
                  onClick={handleApplyCustomAnimation}
                  color="primary"
                  size="smaller"
                  style="margin-top: 0.75rem; width: 100%;"
                >
                  {lang('ClashgramApplyCustomTheme')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentScreen === 'chats' && (
        <div className="fade-in">
          <ListItem icon="arrow-left" narrow onClick={() => setCurrentScreen('categories')}>
            <strong>{lang('ClashgramBackToCategories')}</strong>
          </ListItem>

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
      )}
    </div>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const {
      clashgramGhostModeRead,
      clashgramGhostModeTyping,
      clashgramGhostModeOnline,
      clashgramGhostModeStories,
      clashgramAntiDelete,
      clashgramAntiEdit,
      clashgramRetentionDays,
      clashgramBypassRestrictions,
      clashgramLocalPremium,
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramBackgroundAnimation,
      clashgramCustomFont,
      clashgramVoiceChangerEnabled,
      clashgramCustomAnimation,
      clashgramSendSilently,
      clashgramNoQuoteForwarding,
      clashgramRetainKickedChats,
      clashgramConfirmMedia,
      clashgramConfirmFile,
      clashgramConfirmGifEmoji,
      clashgramConfirmMsg,
      clashgramHideBlockedInGroups,
    } = selectSharedSettings(global);

    const chatsById = global.chats.byId;
    const unreadChatIds = Object.keys(chatsById).filter((id) => {
      const readState = global.messages.byChatId[id]?.threadsById?.[MAIN_THREAD_ID]?.readState;
      return readState && ((readState.unreadCount || 0) > 0 || readState.hasUnreadMark);
    });

    return {
      clashgramGhostModeRead,
      clashgramGhostModeTyping,
      clashgramGhostModeOnline,
      clashgramGhostModeStories,
      clashgramAntiDelete,
      clashgramAntiEdit,
      clashgramRetentionDays,
      clashgramBypassRestrictions,
      clashgramLocalPremium,
      clashgramWhisperModel,
      clashgramWhisperTask,
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramBackgroundAnimation,
      clashgramCustomFont,
      clashgramVoiceChangerEnabled,
      unreadChatIds,
      clashgramCustomAnimation,
      clashgramSendSilently,
      clashgramNoQuoteForwarding,
      clashgramRetainKickedChats,
      clashgramConfirmMedia,
      clashgramConfirmFile,
      clashgramConfirmGifEmoji,
      clashgramConfirmMsg,
      clashgramHideBlockedInGroups,
    };
  },
)(SettingsClashgram));
