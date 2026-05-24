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
      unreadChatIds,
    };
  },
)(SettingsClashgram));
