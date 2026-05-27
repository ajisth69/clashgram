const { pathname, hostname, href } = window.location;

if (pathname.startsWith('/z')) {
  window.location.href = href.replace('/z', '/a');
}

if (
  (hostname === 'weba.telegram.org' || hostname === 'webz.telegram.org') && !localStorage.getItem('tt-global-state')
) {
  window.location.href = 'https://web.telegram.org/a';
}

// Synchronously restore theme and native glass properties to avoid startup flash glitches
try {
  const sharedStateStr = localStorage.getItem('tt-shared-state');
  if (sharedStateStr) {
    const sharedState = JSON.parse(sharedStateStr);
    const theme = sharedState.theme || 'dark';
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    }

    if (sharedState.clashgramNativeGlass) {
      root.classList.add('clashgram-native-glass');
      
      const colorValue = sharedState.clashgramNativeGlassColorValue !== undefined ? sharedState.clashgramNativeGlassColorValue : 50;
      const opacityValue = sharedState.clashgramNativeGlassOpacityValue !== undefined ? sharedState.clashgramNativeGlassOpacityValue : 40;
      
      const hue = colorValue * 3.6;
      let saturation = 30;
      let lightness = 50;
      
      const isDark = theme !== 'light';
      if (isDark) {
        saturation = 35;
        lightness = 18 - (opacityValue / 100) * 12;
      } else {
        saturation = 30;
        lightness = 96 - (opacityValue / 100) * 16;
      }
      
      const s = saturation / 100;
      const l = lightness / 100;
      const k = (n) => (n + hue / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
      
      const r = Math.round(255 * f(0));
      const g = Math.round(255 * f(8));
      const b = Math.round(255 * f(4));
      const alpha = 0.15 + (opacityValue / 100) * 0.70;
      
      root.style.setProperty('--cg-glass-bg', `rgba(${r}, ${g}, ${b}, ${alpha})`);
    }
  }
} catch (e) {
  // Graceful fallback
}
