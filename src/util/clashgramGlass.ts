export const CLASHGRAM_NATIVE_GLASS_CLASS = 'clashgram-native-glass';
export const DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE = 50;

const GLASS_ALPHA = 0.64;
const GLASS_STOPS = [
  { value: 0, color: [18, 24, 38] },
  { value: 18, color: [37, 99, 235] },
  { value: 36, color: [13, 148, 136] },
  { value: 54, color: [22, 163, 74] },
  { value: 72, color: [217, 119, 6] },
  { value: 88, color: [225, 29, 72] },
  { value: 100, color: [124, 58, 237] },
] as const;

let scheduledFrame: number | undefined;

function clampColorValue(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return DEFAULT_CLASHGRAM_GLASS_COLOR_VALUE;
  }

  return Math.max(0, Math.min(100, value));
}

function toLinearChannel(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function fromLinearChannel(channel: number) {
  const normalized = channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * (channel ** (1 / 2.4)) - 0.055;

  return Math.round(Math.max(0, Math.min(1, normalized)) * 255);
}

function interpolateChannel(from: number, to: number, progress: number) {
  return fromLinearChannel(toLinearChannel(from) + (toLinearChannel(to) - toLinearChannel(from)) * progress);
}

export function getClashgramGlassRgb(value?: number) {
  const normalizedValue = clampColorValue(value);
  const upperIndex = GLASS_STOPS.findIndex((stop) => stop.value >= normalizedValue);
  const upperStop = GLASS_STOPS[Math.max(upperIndex, 0)];
  const lowerStop = GLASS_STOPS[Math.max(upperIndex - 1, 0)];
  const span = upperStop.value - lowerStop.value || 1;
  const progress = (normalizedValue - lowerStop.value) / span;

  return [
    interpolateChannel(lowerStop.color[0], upperStop.color[0], progress),
    interpolateChannel(lowerStop.color[1], upperStop.color[1], progress),
    interpolateChannel(lowerStop.color[2], upperStop.color[2], progress),
  ] as const;
}

export function getClashgramGlassColor(value?: number) {
  const [r, g, b] = getClashgramGlassRgb(value);
  return `rgba(${r}, ${g}, ${b}, ${GLASS_ALPHA})`;
}

export function getClashgramGlassHex(value?: number) {
  return `#${getClashgramGlassRgb(value)
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

export function applyClashgramGlassTheme(isEnabled?: boolean, colorValue?: number) {
  const root = document.documentElement;
  root.classList.toggle(CLASHGRAM_NATIVE_GLASS_CLASS, Boolean(isEnabled));
  root.style.setProperty('--cg-glass-bg', getClashgramGlassColor(colorValue));
}

export function scheduleClashgramGlassTheme(isEnabled?: boolean, colorValue?: number) {
  if (scheduledFrame !== undefined) {
    cancelAnimationFrame(scheduledFrame);
  }

  scheduledFrame = requestAnimationFrame(() => {
    scheduledFrame = undefined;
    applyClashgramGlassTheme(isEnabled, colorValue);
  });
}
