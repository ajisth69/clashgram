import type { ChangeEvent } from 'react';
import { memo, useEffect, useRef, useState } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { SettingsScreens } from '../../../types';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import {
  applyClashgramGlassTheme,
  DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
} from '../../../util/clashgramGlass';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

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
  clashgramCustomAnimation?: string;
};

// Style removed because custom fonts moved to a separate panel

const PRE_CODE_STYLE = 'margin: 0.5rem 0; padding: 0.625rem; '
  + 'background: rgba(0,0,0,0.15); border-radius: 4px; font-size: 0.725rem; '
  + 'line-height: 1.4; color: var(--color-text);';

const SettingsClashgramAppearance = ({
  clashgramNativeGlass,
  clashgramNativeGlassColorValue,
  clashgramNativeGlassOpacityValue,
  clashgramBackgroundAnimation,
  clashgramCustomFont,
  clashgramCustomAnimation,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption, showNotification, openSettingsScreen } = getActions();
  const colorFrameRef = useRef<number>();
  const lang = useLang();

  const [renderingGlassColorValue, setRenderingGlassColorValue] = useState(
    clashgramNativeGlassColorValue ?? DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE,
  );
  const [renderingGlassOpacityValue, setRenderingGlassOpacityValue] = useState(
    clashgramNativeGlassOpacityValue ?? DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE,
  );

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

  // Load all preview web fonts in background batches
  useEffect(() => {
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
  }, []);

  // Local fonts state removed (moved to SettingsClashgramCustomFonts)

  const [customAnimText, setCustomAnimText] = useState(clashgramCustomAnimation || '');

  // Font handlers removed (moved to SettingsClashgramCustomFonts)

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

  // filteredFontsList removed

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
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

          <div style="margin-top: 1.5rem;">
            <ListItem
              icon="fontsize"
              narrow
              onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramCustomFonts })}
            >
              <div className="multiline-item" style="min-width: 0; flex: 1; overflow: hidden;">
                <span
                  className="title"
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
                >
                  {lang('ClashgramCustomFonts') || 'Custom Fonts'}
                </span>
                <span
                  className="subtitle"
                  style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;"
                >
                  {clashgramCustomFont && clashgramCustomFont !== 'default' ? clashgramCustomFont : lang('SystemDefault')}
                </span>
              </div>
            </ListItem>
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
  "gravity": 0.0, "drift": 0.03,
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
              <Button
                onClick={() => openSettingsScreen({ screen: SettingsScreens.ClashgramThemeDocs })}
                color="secondary"
                size="smaller"
                style="margin-top: 0.5rem; width: 100%;"
              >
                Documentation
              </Button>
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
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramBackgroundAnimation,
      clashgramCustomFont,
      clashgramCustomAnimation,
    } = selectSharedSettings(global);

    return {
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramBackgroundAnimation,
      clashgramCustomFont,
      clashgramCustomAnimation,
    };
  },
)(SettingsClashgramAppearance));
