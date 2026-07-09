import type { ApiLanguage } from '../../api/types';
import type {
  AnimationLevel, FoldersPosition, PerformanceType, Point, Size, ThemeKey, TimeFormat,
} from '../../types';

export interface SharedState {
  settings: SharedSettings;
  isInitial?: true;
}

export interface SharedSettings {
  shouldUseSystemTheme: boolean;
  theme: ThemeKey;
  language: string;
  languages?: ApiLanguage[];
  performance: PerformanceType;
  messageTextSize: number;
  animationLevel: AnimationLevel;
  foldersPosition: FoldersPosition;
  // This can be deleted after September 2025, along with the corresponding migration
  wasAnimationLevelSetManually?: boolean;
  messageSendKeyCombo: 'enter' | 'ctrl-enter';
  miniAppsCachedPosition?: Point;
  miniAppsCachedSize?: Size;
  timeFormat: TimeFormat;
  wasTimeFormatSetManually: boolean;
  isConnectionStatusMinimized: boolean;
  canDisplayChatInTitle: boolean;
  shouldForceHttpTransport?: boolean;
  shouldAllowHttpTransport?: boolean;
  shouldCollectDebugLogs?: boolean;
  shouldDebugExportedSenders?: boolean;
  shouldWarnAboutFiles?: boolean;
  shouldSkipWebAppCloseConfirmation: boolean;
  clashgramGhostModeRead?: boolean;
  clashgramGhostModeTyping?: boolean;
  clashgramAntiDelete?: boolean;
  clashgramAntiEdit?: boolean;
  clashgramRetentionDays?: number;
  clashgramBypassRestrictions?: boolean;
  clashgramLocalPremium?: boolean;
  clashgramGhostModeStories?: boolean;
  clashgramWhisperModel?: 'tiny' | 'base' | 'small';
  clashgramWhisperTask?: 'transcribe' | 'translate';
  clashgramWhisperForceLocal?: boolean;
  clashgramNativeGlass?: boolean;
  clashgramNativeGlassColorValue?: number;
  clashgramNativeGlassOpacityValue?: number;
  clashgramBackgroundAnimation?: 'none' | 'starfall' | 'neon-rain' | 'fluid-gradients' | 'cosmic-dust' | 'bubbles' | 'custom';
  clashgramCustomFont?: string;
  clashgramVoiceChangerEnabled?: boolean;
  clashgramCustomAnimation?: string;
  clashgramSendSilently?: boolean;
  clashgramNoQuoteForwarding?: boolean;
  clashgramRetainKickedChats?: boolean;
  clashgramConfirmMedia?: boolean;
  clashgramConfirmFile?: boolean;
  clashgramConfirmGifEmoji?: boolean;
  clashgramConfirmMsg?: boolean;
  clashgramHideBlockedInGroups?: boolean;
  clashgramHideAllChats?: boolean;
}
