import { memo, useState } from '../../../lib/teact/teact';
import { getActions } from '../../../global';
import useLastCallback from '../../../hooks/useLastCallback';

import Button from '../../ui/Button';

import './SettingsClashgram.scss';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

const SettingsClashgramThemeDocs = ({ isActive, onReset }: OwnProps) => {
  const { setSharedSettingOption, showNotification } = getActions();
  const [activeCodeViewIndex, setActiveCodeViewIndex] = useState<number | null>(null);

  const handleApplyPreset = useLastCallback((presetConfig: string) => {
    try {
      JSON.parse(presetConfig);
      setSharedSettingOption({ clashgramCustomAnimation: presetConfig });
      showNotification({ message: 'Preset theme applied successfully!' });
    } catch (e) {
      showNotification({ message: 'Failed to apply preset: invalid JSON' });
    }
  });

  const handleDownloadPreset = useLastCallback((name: string, presetConfig: string) => {
    try {
      const blob = new Blob([presetConfig], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification({ message: 'Theme JSON downloaded successfully!' });
    } catch (e) {
      showNotification({ message: 'Failed to download preset' });
    }
  });

  const handleCopyPreset = useLastCallback((presetConfig: string) => {
    try {
      navigator.clipboard.writeText(presetConfig).then(() => {
        showNotification({ message: 'Theme code copied to clipboard!' });
      });
    } catch (e) {
      showNotification({ message: 'Failed to copy theme code' });
    }
  });

  return (
    <div className="settings-content custom-scroll clashgram-settings-dashboard">
      <div className="fade-in">
        <div className="settings-item">
          <div className="custom-theme-docs-info" style="margin-bottom: 1.5rem; padding: 0.75rem; border: 1px solid rgba(var(--color-text-rgb), 0.08); border-radius: 0.5rem; background: rgba(var(--color-text-rgb), 0.02); font-size: 0.75rem; color: var(--color-text-secondary); text-align: left;">
            <h4 style="font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; font-size: 0.875rem;">Theme Engine Specs</h4>
            <p style="margin-bottom: 0.5rem; line-height: 1.35;">Configure multiple visual layers (css, html, shader, particles, background, custom) via JSON:</p>
            
            <ul style="padding-left: 1.25rem; margin-bottom: 0.75rem; list-style-type: disc; display: flex; flex-direction: column; gap: 0.25rem;">
              <li><strong>css</strong>: Injects custom CSS rules to animate HTML elements.</li>
              <li><strong>html</strong>: Injects custom DOM nodes, SVGs, or custom layout overlays.</li>
              <li><strong>shader / webgl</strong>: Dynamic GPU-accelerated fragment shader backdrops.</li>
              <li><strong>particles</strong>: 2D physics engine with gravity, wind, flow fields, and attractors.</li>
              <li><strong>background</strong>: Renders custom static or animated gradient sweeps.</li>
              <li><strong>custom</strong>: Inline Javascript frame rendering callbacks.</li>
            </ul>
            
            <h5 style="font-weight: 600; color: var(--color-text); margin-bottom: 0.25rem; font-size: 0.8125rem;">Physics Config Properties:</h5>
            <p style="margin-bottom: 0.5rem; font-family: var(--font-family-monospace); font-size: 0.7rem; opacity: 0.8;">particleCount, colors, minSpeed, maxSpeed, minSize, maxSize, gravity, drift, blendMode, glowEffect</p>
            
            <h5 style="font-weight: 600; color: var(--color-text); margin-bottom: 0.25rem; font-size: 0.8125rem;">Math Variables & Functions:</h5>
            <p style="margin-bottom: 0.5rem; font-family: var(--font-family-monospace); font-size: 0.7rem; opacity: 0.8;">t (time), w (width), h (height), mx/my (mouse), bass/mid/treble, x/y, life, size, sin, cos, tan, abs, sqrt, pow, min, max, random</p>
          </div>

          <h4 className="settings-item-header" style="margin-top: 1rem; margin-bottom: 0.5rem;">God-Tier Animation Presets</h4>
          
          {GOD_TIER_PRESETS.map((preset, idx) => {
            const isCodeVisible = activeCodeViewIndex === idx;
            const configJson = JSON.stringify(preset.config, null, 2);
            return (
              <div key={preset.name} className="cg-preset-card" style="margin-bottom: 1rem; padding: 0.75rem; border: 1px solid rgba(var(--color-text-rgb), 0.08); border-radius: 0.5rem; background: rgba(var(--color-text-rgb), 0.02); display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-weight: 600; color: var(--color-text); font-size: 0.8125rem;">{preset.name}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-secondary); line-height: 1.25;">{preset.desc}</div>
                
                <div style="display: flex; flex-direction: column; gap: 0.35rem; width: 100%;">
                  <Button size="smaller" style="width: 100%; margin: 0; padding: 0.35rem 0.5rem; font-size: 0.7rem; font-weight: 500;" onClick={() => handleApplyPreset(configJson)}>Apply Theme</Button>
                  <Button size="smaller" style="width: 100%; margin: 0; padding: 0.35rem 0.5rem; font-size: 0.7rem; font-weight: 500;" onClick={() => handleDownloadPreset(preset.name, configJson)}>Download JSON</Button>
                  <Button size="smaller" style="width: 100%; margin: 0; padding: 0.35rem 0.5rem; font-size: 0.7rem; font-weight: 500;" onClick={() => setActiveCodeViewIndex(isCodeVisible ? null : idx)}>{isCodeVisible ? 'Hide Code' : 'View Code'}</Button>
                </div>
                
                {isCodeVisible && (
                  <div style="position: relative; margin-top: 0.25rem;">
                    <button
                      onClick={() => handleCopyPreset(configJson)}
                      style="position: absolute; top: 0.25rem; right: 0.25rem; padding: 0.25rem 0.5rem; border: 1px solid rgba(var(--color-text-rgb), 0.15); border-radius: 0.25rem; background: rgba(var(--color-text-rgb), 0.08); color: var(--color-text-secondary); font-size: 0.65rem; cursor: pointer; z-index: 1;"
                    >
                      Copy
                    </button>
                    <pre style="margin: 0; padding: 0.5rem; padding-right: 3rem; font-family: var(--font-family-monospace); font-size: 0.65rem; background: var(--color-background); border: 1px solid rgba(var(--color-text-rgb), 0.1); border-radius: 0.25rem; max-height: 150px; overflow: auto; text-align: left; white-space: pre-wrap; word-break: break-all;">
                      {configJson}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const GOD_TIER_PRESETS = [
  {
    name: "Neon Matrix Digital Rain",
    desc: "GPU-accelerated falling digital code streams in high contrast neon green matrix styling.",
    config: {
      layers: [
        {
          type: "shader",
          fragmentShader: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

float hash(float x) {
  return fract(sin(x) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float colWidth = 15.0 / u_resolution.x;
  float col = floor(uv.x / colWidth);
  float colFract = fract(uv.x / colWidth);
  
  if (colFract < 0.1 || colFract > 0.9) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  float speed = 0.5 + hash(col) * 1.5;
  float offset = hash(col * 12.3) * 10.0;
  float y = uv.y + u_time * speed * 0.2 + offset;
  float trail = fract(-y);
  
  float cellFract = fract(y * 25.0);
  float charShape = step(0.15, cellFract) * (1.0 - step(0.85, cellFract)) * step(0.2, colFract) * (1.0 - step(0.8, colFract));
  
  vec3 greenColor = vec3(0.02, 0.98, 0.2) * trail * charShape;
  if (trail > 0.94) {
    greenColor = vec3(0.8, 1.0, 0.9) * charShape;
  }
  
  vec3 bg = vec3(0.01, 0.03, 0.01);
  gl_FragColor = vec4(mix(bg, greenColor, trail), 1.0);
}`
        }
      ]
    }
  },
  {
    name: "Vaporwave Horizon Grid",
    desc: "Infinite 3D perspective wireframe grid scrolling dynamically with crisp sharp flat-edge lines and cycling colors.",
    config: {
      layers: [
        {
          type: "shader",
          fragmentShader: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  
  p.y += 0.5;
  if (p.y <= 0.02) {
    vec3 spaceBg = mix(vec3(0.05, 0.0, 0.1), vec3(0.4, 0.05, 0.3), uv.y * 2.0);
    gl_FragColor = vec4(spaceBg, 1.0);
    return;
  }
  
  float z = 1.0 / p.y;
  vec2 gridUV = vec2(p.x * z * 1.5, z * 2.0 + u_time * 1.5);
  vec2 grid = fract(gridUV);
  
  float lineWidth = 0.08 * (1.0 - smoothstep(0.0, 8.0, z));
  lineWidth = max(lineWidth, 0.015);
  
  float lineX = step(1.0 - lineWidth, grid.x) + step(grid.x, lineWidth);
  float lineY = step(1.0 - lineWidth, grid.y) + step(grid.y, lineWidth);
  float gridMask = max(lineX, lineY);
  
  float hue = u_time * 0.15 + z * 0.02;
  vec3 gridColor = 0.5 + 0.5 * cos(hue * 6.28 + vec3(0.0, 2.0, 4.0));
  vec3 bg = mix(vec3(0.08, 0.01, 0.15), vec3(0.02, 0.0, 0.05), uv.y);
  
  vec3 col = mix(bg, gridColor, gridMask);
  float fade = smoothstep(20.0, 2.0, z);
  col = mix(bg, col, fade);
  
  gl_FragColor = vec4(col, 1.0);
}`
        }
      ]
    }
  },
  {
    name: "Aurora Hero Fluted Glass",
    desc: "CSS stripes repeating gradients combined with an SVG fluted glass displacement filter.",
    config: {
      layers: [
        {
          type: "css",
          css: `.aurora-hero-wrapper {
  --stripe-color: #000;
  --bg-filter: blur(10px) opacity(50%) saturate(200%);
  background: var(--stripe-color);
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
:is(.dark) .aurora-hero-wrapper {
  --stripe-color: #fff;
  --bg-filter: blur(10px) invert(100%);
}
@keyframes smoothBg {
  from { background-position: 50% 50%, 50% 50%; }
  to { background-position: 350% 50%, 350% 50%; }
}
.aurora-hero-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  --stripes: repeating-linear-gradient(100deg, var(--stripe-color) 0%, var(--stripe-color) 7%, transparent 10%, transparent 12%, var(--stripe-color) 16%);
  --rainbow: repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 15%, #60a5fa 20%, #5eead4 25%, #60a5fa 30%);
  background-image: var(--stripes), var(--rainbow);
  background-size: 300%, 200%;
  background-position: 50% 50%, 50% 50%;
  filter: var(--bg-filter);
  mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
}
.aurora-hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--stripes), var(--rainbow);
  background-size: 200%, 100%;
  animation: smoothBg 60s linear infinite;
  background-attachment: fixed;
  mix-blend-mode: difference;
}
.aurora-content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  place-content: center;
  place-items: center;
  flex-flow: column;
  gap: 4.5%;
  text-align: center;
  backdrop-filter: contrast(0.9) blur(7px) url(#fluted);
  -webkit-backdrop-filter: contrast(0.9) blur(7px) url(#fluted);
  mix-blend-mode: difference;
  filter: invert(1);
}`
        },
        {
          type: "html",
          html: `<div class="aurora-hero-wrapper"><div class="aurora-hero-bg"></div></div><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" color-interpolation-filters="sRGB" style="position: absolute; opacity: 0; height: 0; width: 0; pointer-events: none;" aria-hidden="true" focusable="false"><filter id="fluted" primitiveUnits="objectBoundingBox"><feImage x="0" y="0" result="image_0" crossorigin="anonymous" href="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%201%201%27%20color-interpolation-filters%3D%27sRGB%27%3E%3Cg%3E%3Crect%20width%3D%271%27%20height%3D%271%27%20fill%3D%27black%27%20%2F%3E%3Crect%20width%3D%271%27%20height%3D%271%27%20fill%3D%27url(%23red)%27%20style%3D%27mix-blend-mode%3Ascreen%27%20%2F%3E%3Crect%20width%3D%271%27%20height%3D%271%27%20fill%3D%27url(%23green)%27%20style%3D%27mix-blend-mode%3Ascreen%27%20%2F%3E%3Crect%20width%3D%271%27%20height%3D%271%27%20fill%3D%27url(%23yellow)%27%20style%3D%27mix-blend-mode%3Ascreen%27%20%2F%3E%3C%2Fg%3E%3Cdefs%3E%3CradialGradient%20id%3D%27yellow%27%20cx%3D%270%27%20cy%3D%270%27%20r%3D%271%27%20%3E%3Cstop%20stop-color%3D%27yellow%27%20%2F%3E%3Cstop%20stop-color%3D%27yellow%27%20offset%3D%271%27%20stop-opacity%3D%270%27%20%2F%3E%3C%2FradialGradient%3E%3CradialGradient%20id%3D%27green%27%20cx%3D%271%27%20cy%3D%270%27%20r%3D%271%27%20%3E%3Cstop%20stop-color%3D%27green%27%20%2F%3E%3Cstop%20stop-color%3D%27green%27%20offset%3D%271%27%20stop-opacity%3D%270%27%20%2F%3E%3C%2FradialGradient%3E%3CradialGradient%20id%3D%27red%27%20cx%3D%270%27%20cy%3D%271%27%20r%3D%271%27%20%3E%3Cstop%20stop-color%3D%27red%27%20%2F%3E%3Cstop%20stop-color%3D%27red%27%20offset%3D%271%27%20stop-opacity%3D%270%27%20%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E" preserveAspectRatio="none meet" width=".03" height="1" /><feTile in="image_0" result="tile_0" /><feGaussianBlur stdDeviation=".0001" edgeMode="none" in="tile_0" result="bar_smoothness" x="0" y="0" /><feDisplacementMap scale=".08" xChannelSelector="R" yChannelSelector="G" in="SourceGraphic" in2="bar_smoothness" result="displacement_0" /></filter></svg>`
        }
      ]
    }
  },
  {
    name: "Cosmic Supernova Space Volumetrics",
    desc: "Raymarched FBM cosmic nebula backdrop coupled with custom gravity-defying stardust sparks.",
    config: {
      layers: [
        {
          type: "shader",
          fragmentShader: `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

float snoise(in vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  fp = fp*fp*(3.0-2.0*fp);
  float a = snoise(ip);
  float b = snoise(ip + vec2(1.0, 0.0));
  float c = snoise(ip + vec2(0.0, 1.0));
  float d = snoise(ip + vec2(1.0, 1.0));
  return mix(mix(a, b, fp.x), mix(c, d, fp.x), fp.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float d = length(p);
  float f = fbm(p * 2.0 - vec2(0.0, u_time * 0.05));
  f += fbm(p * 4.0 + vec2(u_time * 0.03, 0.0)) * 0.5;
  vec3 col = vec3(0.05, 0.02, 0.12);
  vec3 flame1 = vec3(0.85, 0.32, 0.05);
  vec3 flame2 = vec3(0.05, 0.65, 0.85);
  vec3 mixFlame = mix(flame1, flame2, sin(u_time * 0.2) * 0.5 + 0.5);
  col += mixFlame * pow(f, 2.8) * 1.5;
  float core = 1.0 - smoothstep(0.0, 0.35, d);
  col += vec3(0.9, 0.95, 1.0) * pow(core, 4.0) * 1.2;
  gl_FragColor = vec4(col, 1.0);
}`
        },
        {
          type: "particles",
          blendMode: "lighter",
          particleCount: 150,
          minSpeed: 0.5,
          maxSpeed: 2.2,
          minSize: 1.2,
          maxSize: 4.0,
          gravity: -0.01,
          drift: 0.05,
          colors: ["#ffe4e6", "#fda4af", "#a5f3fc", "#fed7aa"],
          particle: {
            size: "size * (1.2 + 0.5 * sin(t * 2.0 + life / 50.0))",
            color: "rgba(255, 180, 160, 0.8)"
          },
          physics: {
            wind: "0.15 * cos(t * 0.5)",
            flowField: {
              scale: 0.012,
              force: 0.22
            }
          },
          interaction: {
            mouseForce: {
              type: "repel",
              strength: 200,
              radius: 220
            }
          }
        }
      ]
    }
  },
  {
    name: "Deep Ocean Bioluminescent Plankton",
    desc: "Fluid underwater current vectors pushing floating neon plankton attracted to the mouse cursor.",
    config: {
      layers: [
        {
          type: "background",
          background: {
            type: "static-gradient",
            colors: ["#000f14", "#002029", "#00080d"]
          }
        },
        {
          type: "particles",
          blendMode: "screen",
          particleCount: 150,
          minSpeed: 0.2,
          maxSpeed: 0.9,
          minSize: 1.5,
          maxSize: 4.5,
          gravity: -0.005,
          drift: 0.03,
          colors: ["#00ffff", "#0ea5e9", "#22d3ee", "#06b6d4"],
          particle: {
            size: "size",
            color: "rgba(6, 182, 212, 0.85)"
          },
          physics: {
            wind: "0.05 * sin(t * 0.3)",
            flowField: {
              scale: 0.008,
              force: 0.12
            },
            attractors: [
              {
                x: "mx",
                y: "my",
                strength: 80,
                radius: 240,
                type: "gravity"
              }
            ]
          },
          interaction: {
            mouseForce: {
              type: "attract",
              strength: 100,
              radius: 240
            }
          }
        }
      ]
    }
  }
];

export default memo(SettingsClashgramThemeDocs);
