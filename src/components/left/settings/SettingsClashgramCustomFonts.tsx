import { memo, useEffect, useState } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Button from '../../ui/Button';
import ListItem from '../../ui/ListItem';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  clashgramCustomFont?: string;
};

const IMPORT_CONTAINER_STYLE = 'display: flex; flex-direction: column; '
  + 'gap: 0.5rem; margin-bottom: 1.25rem;';

const SEARCH_INPUT_STYLE = 'width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; '
  + 'border: 1px solid rgba(var(--color-text-rgb), 0.08); border-radius: 0.5rem; '
  + 'background: var(--color-background); color: var(--color-text); '
  + 'font-size: 0.875rem; outline: none; transition: border-color 0.15s ease;';

const ACTIVE_PREVIEW_STYLE = 'margin-bottom: 1rem; padding: 0 0.5rem; font-size: 0.8125rem; '
  + 'color: var(--color-text-secondary);';

const SettingsClashgramCustomFonts = ({
  clashgramCustomFont,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption, showNotification } = getActions();
  const lang = useLang();

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

  const filteredFontsList = googleFontInput.trim()
    ? fontsList.filter((f) => f.label.toLowerCase().includes(googleFontInput.toLowerCase()))
    : fontsList;

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-item">
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
    </div>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const { clashgramCustomFont } = selectSharedSettings(global);
    return {
      clashgramCustomFont,
    };
  },
)(SettingsClashgramCustomFonts));
