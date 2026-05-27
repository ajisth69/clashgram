import type { ChangeEvent } from 'react';
import {
  memo, useEffect, useRef, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import { MAIN_THREAD_ID } from '../../../api/types';
import { SettingsScreens } from '../../../types';

import { selectSharedSettings } from '../../../global/selectors/sharedState';
import {
  applyClashgramGlassTheme,
  DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
  getClashgramGlassColor,
  getClashgramGlassHex,
} from '../../../util/clashgramGlass';
import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useLastCallback from '../../../hooks/useLastCallback';

import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import Button from '../../ui/Button';
import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';
import RadioGroup from '../../ui/RadioGroup';

import './SettingsClashgram.scss';

const NATIVE_GLASS_DESCRIPTION = 'Apply Telegram-style translucent depth only to sidebars, headers, settings panels, '
  + 'and compact menus.';
const GHOST_ONLINE_DESCRIPTION = 'Prevent sending your online status to the server so you are always seen as offline. '
  + 'Tip: Set your Telegram server Privacy for \'Last Seen & Online\' to \'Everybody\'. Clashgram will block your '
  + 'online updates, so you can see everyone\'s last seen time without exposing your own online state!';

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
  clashgramBackgroundAnimation?: 'none' | 'starfall' | 'neon-rain' | 'fluid-gradients' | 'cosmic-dust' | 'bubbles';
  clashgramCustomFont?: string;
  clashgramVoiceChangerEnabled?: boolean;
  unreadChatIds: string[];
};

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
  onReset,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption } = getActions();
  const colorFrameRef = useRef<number>();
  const [renderingGlassColorValue, setRenderingGlassColorValue] = useState(
    clashgramNativeGlassColorValue ?? DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  );
  const [renderingGlassOpacityValue, setRenderingGlassOpacityValue] = useState(
    clashgramNativeGlassOpacityValue ?? DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
  );

  const LOCAL_FONTS = [
    { label: 'System Default', value: 'default' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Avenir Next', value: 'Avenir Next' },
    { label: 'Bahnschrift', value: 'Bahnschrift' },
    { label: 'Bookman Old Style', value: 'Bookman Old Style' },
    { label: 'Calibri', value: 'Calibri' },
    { label: 'Cambria', value: 'Cambria' },
    { label: 'Cambria Math', value: 'Cambria Math' },
    { label: 'Candara', value: 'Candara' },
    { label: 'Cascadia Code', value: 'Cascadia Code' },
    { label: 'Cascadia Mono', value: 'Cascadia Mono' },
    { label: 'Century Gothic', value: 'Century Gothic' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' },
    { label: 'Consolas', value: 'Consolas' },
    { label: 'Constantia', value: 'Constantia' },
    { label: 'Corbel', value: 'Corbel' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Ebrima', value: 'Ebrima' },
    { label: 'Franklin Gothic', value: 'Franklin Gothic' },
    { label: 'Futura', value: 'Futura' },
    { label: 'Gabriola', value: 'Gabriola' },
    { label: 'Gadugi', value: 'Gadugi' },
    { label: 'Garamond', value: 'Garamond' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Gill Sans', value: 'Gill Sans' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Ink Free', value: 'Ink Free' },
    { label: 'Javanese Text', value: 'Javanese Text' },
    { label: 'Leelawadee UI', value: 'Leelawadee UI' },
    { label: 'Lucida Console', value: 'Lucida Console' },
    { label: 'Lucida Handwriting', value: 'Lucida Handwriting' },
    { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
    { label: 'Malgun Gothic', value: 'Malgun Gothic' },
    { label: 'Microsoft Himalaya', value: 'Microsoft Himalaya' },
    { label: 'Microsoft JhengHei', value: 'Microsoft JhengHei' },
    { label: 'Microsoft JhengHei UI', value: 'Microsoft JhengHei UI' },
    { label: 'Microsoft New Tai Lue', value: 'Microsoft New Tai Lue' },
    { label: 'Microsoft PhagsPa', value: 'Microsoft PhagsPa' },
    { label: 'Microsoft Sans Serif', value: 'Microsoft Sans Serif' },
    { label: 'Microsoft Tai Le', value: 'Microsoft Tai Le' },
    { label: 'Microsoft YaHei', value: 'Microsoft YaHei' },
    { label: 'Microsoft YaHei UI', value: 'Microsoft YaHei UI' },
    { label: 'Optima', value: 'Optima' },
    { label: 'Palatino', value: 'Palatino' },
    { label: 'Segoe Print', value: 'Segoe Print' },
    { label: 'Segoe Script', value: 'Segoe Script' },
    { label: 'Segoe UI', value: 'Segoe UI' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  ];

  const handleFontSelect = useLastCallback((fontValue: string) => {
    setSharedSettingOption({ clashgramCustomFont: fontValue });
  });

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  useEffect(() => {
    setRenderingGlassColorValue(clashgramNativeGlassColorValue ?? DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE);
  }, [clashgramNativeGlassColorValue]);

  useEffect(() => {
    setRenderingGlassOpacityValue(clashgramNativeGlassOpacityValue ?? DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE);
  }, [clashgramNativeGlassOpacityValue]);

  useEffect(() => {
    return () => {
      if (colorFrameRef.current !== undefined) {
        cancelAnimationFrame(colorFrameRef.current);
      }
    };
  }, []);

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

  const handleMarkAllChatsRead = useLastCallback(() => {
    if (!unreadChatIds.length) return;
    unreadChatIds.forEach((chatId) => {
      getActions().markChatMessagesRead({ id: chatId });
    });
  });

  return (
    <div className="settings-content custom-scroll">
      <style>
        {`
        html.theme-light .experimental-duck {
          filter: invert(1);
        }
      `}
      </style>
      <div className="settings-content-header no-border">
        <AnimatedIconWithPreview
          tgsUrl={LOCAL_TGS_URLS.Eyes}
          size={200}
          className="experimental-duck"
          nonInteractive
          noLoop={false}
        />
        <p className="settings-item-description pt-3" dir="auto">
          Configure Clashgram's privacy and utility features.
        </p>
      </div>

      <div className="settings-item clashgram-glass-settings">
        <h3 className="settings-item-header">Appearance</h3>
        <Checkbox
          label="Native Glass Theme"
          subLabel={NATIVE_GLASS_DESCRIPTION}
          checked={Boolean(clashgramNativeGlass)}
          onCheck={handleNativeGlassToggle}
        />

        <div
          className={`clashgram-glass-color-control${!clashgramNativeGlass ? ' disabled' : ''}`}
          style={`--cg-preview-color: ${getClashgramGlassColor(renderingGlassColorValue, renderingGlassOpacityValue)}`}
        >
          <div className="clashgram-glass-color-row">
            <span className="clashgram-glass-color-label">Glass Color</span>
            <span className="clashgram-glass-color-value">Hue {Math.round(renderingGlassColorValue * 3.6)}°</span>
          </div>
          <div className="clashgram-glass-slider-row">
            <span className="clashgram-glass-swatch" />
            <input
              className="clashgram-glass-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={renderingGlassColorValue}
              disabled={!clashgramNativeGlass}
              aria-label="Glass color"
              onChange={handleGlassColorChange}
            />
          </div>

          <div className="clashgram-glass-color-row" style="margin-top: 1.25rem;">
            <span className="clashgram-glass-color-label">Transparency & Depth</span>
            <span className="clashgram-glass-color-value">{renderingGlassOpacityValue}%</span>
          </div>
          <div className="clashgram-glass-slider-row">
            <span className="clashgram-glass-swatch opacity-swatch" />
            <input
              className="clashgram-glass-slider clashgram-glass-opacity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={renderingGlassOpacityValue}
              disabled={!clashgramNativeGlass}
              aria-label="Glass transparency"
              onChange={handleGlassOpacityChange}
            />
          </div>
        </div>

        <div style="margin-top: 1.5rem;">
          <h4 className="settings-item-subheader" style="margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9375rem;">Chat Background Animation</h4>
          <RadioGroup
            name="clashgramBackgroundAnimation"
            options={[
              { label: 'None (Optimized / Static)', value: 'none' },
              { label: 'Dreamy Aurora Wave (Slow-motion Northern Lights)', value: 'starfall' },
              { label: 'Zen Garden Rain (Calm rain & surface ripples)', value: 'neon-rain' },
              { label: 'Bioluminescent Ocean (Glowing plankton & light shafts)', value: 'fluid-gradients' },
              { label: 'Celestial Stardust (Soothing golden dust motes)', value: 'cosmic-dust' },
              { label: 'Aura Glass Blossoms (Hypnotic floating circles & petals)', value: 'bubbles' },
            ]}
            selected={clashgramBackgroundAnimation ?? 'none'}
            onChange={(value) => setSharedSettingOption({ clashgramBackgroundAnimation: value as any })}
          />
        </div>

        <div style="margin-top: 1.5rem;" className="clashgram-font-settings">
          <h4 className="settings-item-subheader" style="margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9375rem;">Custom UI Font</h4>
          <div className="font-active-preview" style="margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-text-secondary);">
            Active Font: <strong style={clashgramCustomFont && clashgramCustomFont !== 'default' ? `font-family: "${clashgramCustomFont}", sans-serif; color: var(--color-text);` : 'color: var(--color-text);'}>
              {clashgramCustomFont && clashgramCustomFont !== 'default' ? clashgramCustomFont : 'System Default'}
            </strong>
          </div>
          <div className="font-list-scroll custom-scroll" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--color-borders); border-radius: 0.375rem; background: var(--color-background);">
            {LOCAL_FONTS.map((font) => {
              const isActive = (clashgramCustomFont || 'default') === font.value;
              return (
                <ListItem
                  key={font.value}
                  narrow
                  style={isActive ? "background: var(--color-background-selected); font-weight: 500;" : ""}
                  onClick={() => handleFontSelect(font.value)}
                >
                  <span style={font.value !== 'default' ? `font-family: "${font.value}", sans-serif;` : ''}>
                    {font.label}
                  </span>
                </ListItem>
              );
            })}
          </div>
        </div>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Ghost Mode</h3>
        <Checkbox
          label="Hide Read Receipts"
          subLabel="Prevent sending read receipts when reading messages."
          checked={Boolean(clashgramGhostModeRead)}
          onCheck={() => setSharedSettingOption({ clashgramGhostModeRead: !clashgramGhostModeRead })}
        />

        <Checkbox
          label="Hide Story Views"
          subLabel="Prevent sending view receipts when viewing stories."
          checked={Boolean(clashgramGhostModeStories)}
          onCheck={() => setSharedSettingOption({ clashgramGhostModeStories: !clashgramGhostModeStories })}
        />

        <Checkbox
          label="Hide Typing Status"
          subLabel="Prevent sending typing or other actions in chats."
          checked={Boolean(clashgramGhostModeTyping)}
          onCheck={() => setSharedSettingOption({ clashgramGhostModeTyping: !clashgramGhostModeTyping })}
        />

        <Checkbox
          label="Hide Online Status"
          subLabel={GHOST_ONLINE_DESCRIPTION}
          checked={Boolean(clashgramGhostModeOnline)}
          onCheck={() => setSharedSettingOption({ clashgramGhostModeOnline: !clashgramGhostModeOnline })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Message Retention</h3>
        <Checkbox
          label="Anti-Delete"
          subLabel="Keep messages that other users delete."
          checked={Boolean(clashgramAntiDelete)}
          onCheck={() => setSharedSettingOption({ clashgramAntiDelete: !clashgramAntiDelete })}
        />

        <Checkbox
          label="Anti-Edit"
          subLabel="Show original text beneath edited messages."
          checked={Boolean(clashgramAntiEdit)}
          onCheck={() => setSharedSettingOption({ clashgramAntiEdit: !clashgramAntiEdit })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Retention Period</h3>
        <RadioGroup
          name="clashgramRetentionDays"
          options={[
            { label: 'Until tab refresh', value: '0' },
            { label: '1 day', value: '1' },
            { label: '3 days', value: '3' },
            { label: '7 days', value: '7' },
          ]}
          selected={String(clashgramRetentionDays ?? 7)}
          onChange={(value) => setSharedSettingOption({ clashgramRetentionDays: Number(value) })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Restrictions</h3>
        <Checkbox
          label="Bypass Restrictions"
          subLabel="Allow saving, copying, and forwarding content from restricted groups."
          checked={Boolean(clashgramBypassRestrictions)}
          onCheck={() => setSharedSettingOption({ clashgramBypassRestrictions: !clashgramBypassRestrictions })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Speech-to-Text Model</h3>
        <RadioGroup
          name="clashgramWhisperModel"
          options={[
            { label: 'Tiny (Fastest, low memory)', value: 'tiny' },
            { label: 'Base (Balanced, recommended)', value: 'base' },
            { label: 'Small (Best accuracy, slow)', value: 'small' },
          ]}
          selected={clashgramWhisperModel ?? 'base'}
          onChange={(value) => setSharedSettingOption({ clashgramWhisperModel: value as any })}
        />
        <p className="settings-item-description pt-2">
          Larger models are more accurate but take longer to download and run, especially on devices without WebGPU
          acceleration.
        </p>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Speech-to-Text Translation</h3>
        <RadioGroup
          name="clashgramWhisperTask"
          options={[
            { label: 'Transcribe (Original Language)', value: 'transcribe' },
            { label: 'Translate (To English)', value: 'translate' },
          ]}
          selected={clashgramWhisperTask ?? 'transcribe'}
          onChange={(value) => setSharedSettingOption({ clashgramWhisperTask: value as any })}
        />
        <p className="settings-item-description pt-2">
          Choose whether to transcribe the voice note in its native language or translate it directly into English.
        </p>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Voice Changer</h3>
        <Checkbox
          label="Enable Voice Changer"
          subLabel="When enabled, you will be prompted to choose a voice effect (such as robotic, deep, girl, chipmunk, or echo) when sending voice messages."
          checked={Boolean(clashgramVoiceChangerEnabled)}
          onCheck={() => setSharedSettingOption({ clashgramVoiceChangerEnabled: !clashgramVoiceChangerEnabled })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Premium Options</h3>
        <Checkbox
          label="Local Telegram Premium"
          subLabel="Emulate Telegram Premium state locally to unlock premium badges, stealth mode, and custom emojis."
          checked={Boolean(clashgramLocalPremium)}
          onCheck={() => setSharedSettingOption({ clashgramLocalPremium: !clashgramLocalPremium })}
        />
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Passcode Lock</h3>
        <ListItem
          icon="lock"
          narrow
          multiline
          onClick={() => getActions().openSettingsScreen({ screen: SettingsScreens.ClashgramPasscode })}
        >
          <span className="title">Configure Passcode Settings</span>
          <span className="subtitle" dir="auto">
            Set primary & recovery passcodes, change passcodes, or manage locked items
          </span>
        </ListItem>
      </div>

      <div className="settings-item">
        <h3 className="settings-item-header">Utility Actions</h3>
        <Button
          onClick={handleMarkAllChatsRead}
          color="primary"
          disabled={unreadChatIds.length === 0}
          style="width: 100%"
        >
          {unreadChatIds.length > 0 ? `Mark All Chats Read (${unreadChatIds.length})` : 'All Chats Marked Read'}
        </Button>
      </div>
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
    };
  },
)(SettingsClashgram));
