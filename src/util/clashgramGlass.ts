export const CLASHGRAM_NATIVE_GLASS_CLASS = 'clashgram-native-glass';
export const DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE = 50;
export const DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE = 40;

let scheduledFrame: number | undefined;

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ] as const;
}

export function getClashgramGlassRgb(colorValue?: number, opacityValue?: number) {
  const isDark = !document.documentElement.classList.contains('theme-light');
  const normalizedColor = colorValue !== undefined && !Number.isNaN(colorValue)
    ? Math.max(0, Math.min(100, colorValue))
    : DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE;
  const normalizedOpacity = opacityValue !== undefined && !Number.isNaN(opacityValue)
    ? Math.max(0, Math.min(100, opacityValue))
    : DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE;

  const hue = normalizedColor * 3.6; // 0 to 360 degrees
  let saturation = 30;
  let lightness = 50;

  if (isDark) {
    saturation = 35;
    lightness = 18 - (normalizedOpacity / 100) * 12; // 18% down to 6%
  } else {
    saturation = 30;
    lightness = 96 - (normalizedOpacity / 100) * 16; // 96% down to 80%
  }

  return hslToRgb(hue, saturation, lightness);
}

export function getClashgramGlassColor(colorValue?: number, opacityValue?: number) {
  const [r, g, b] = getClashgramGlassRgb(colorValue, opacityValue);
  const normalizedOpacity = opacityValue !== undefined && !Number.isNaN(opacityValue)
    ? Math.max(0, Math.min(100, opacityValue))
    : DEFAULT_CLASHGRAM_GLASS_OPACITY_VALUE;
  
  // Alpha opacity ranges from 0.15 (fully transparent) to 0.85 (thick glass)
  const alpha = 0.15 + (normalizedOpacity / 100) * 0.70;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getClashgramGlassHex(colorValue?: number, opacityValue?: number) {
  return `#${getClashgramGlassRgb(colorValue, opacityValue)
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

export function applyClashgramGlassTheme(isEnabled?: boolean, colorValue?: number, opacityValue?: number) {
  const root = document.documentElement;
  root.classList.toggle(CLASHGRAM_NATIVE_GLASS_CLASS, Boolean(isEnabled));
  root.style.setProperty('--cg-glass-bg', getClashgramGlassColor(colorValue, opacityValue));
}

export function scheduleClashgramGlassTheme(isEnabled?: boolean, colorValue?: number, opacityValue?: number) {
  if (scheduledFrame !== undefined) {
    cancelAnimationFrame(scheduledFrame);
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = undefined;
    applyClashgramGlassTheme(isEnabled, colorValue, opacityValue);
  });
}
