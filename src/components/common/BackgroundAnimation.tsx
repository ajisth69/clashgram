import { memo, useEffect, useRef } from '../../lib/teact/teact';
import './BackgroundAnimation.scss';

// Mathematical Expression Compiler
function compileExpression(expr: any): (variables: Record<string, number>) => any {
  if (typeof expr !== 'string') {
    return () => (typeof expr === 'number' ? expr : 0);
  }

  let jsExpr = expr
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\bsin\b/gi, 'Math.sin')
    .replace(/\bcos\b/gi, 'Math.cos')
    .replace(/\btan\b/gi, 'Math.tan')
    .replace(/\babs\b/gi, 'Math.abs')
    .replace(/\bsqrt\b/gi, 'Math.sqrt')
    .replace(/\bpow\b/gi, 'Math.pow')
    .replace(/\bmin\b/gi, 'Math.min')
    .replace(/\bmax\b/gi, 'Math.max')
    .replace(/\blog\b/gi, 'Math.log')
    .replace(/\bexp\b/gi, 'Math.exp')
    .replace(/\brandom\(([^)]*)\)/gi, (_, args) => {
      const parts = args.split(',').map((x: string) => x.trim());
      if (parts.length === 2) {
        return `(${parts[0]} + Math.random() * (${parts[1]} - (${parts[0]})))`;
      } else if (parts.length === 1 && parts[0] !== '') {
        return `(Math.random() * (${parts[0]}))`;
      }
      return 'Math.random()';
    });

  const sanitized = jsExpr.replace(/[a-zA-Z_$][a-zA-Z0-9_$]*/g, (match) => {
    if (
      [
        't', 'w', 'h', 'mx', 'my', 'bass', 'mid', 'treble', 'x', 'y', 'life', 'size',
        'Math', 'PI', 'sin', 'cos', 'tan', 'abs', 'sqrt', 'pow', 'min', 'max', 'log', 'exp'
      ].includes(match)
    ) {
      return match;
    }
    return '0';
  });

  try {
    return new Function(
      'vars',
      `const { t, w, h, mx, my, bass, mid, treble, x, y, life, size } = vars; return (${sanitized});`
    ) as any;
  } catch (err) {
    console.error('Clashgram expression compile error:', expr, err);
    return () => 0;
  }
}

// Color Expression Evaluator
function evaluateColor(colorExpr: string, vars: Record<string, number>): string {
  if (typeof colorExpr !== 'string') return colorExpr;
  if (!colorExpr.includes('${')) return colorExpr;

  return colorExpr.replace(/\$\{([^}]+)\}/g, (_, subExpr) => {
    const fn = compileExpression(subExpr);
    return String(fn(vars));
  });
}

// WebGL Shader Compiler Helper
function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}


type Props = {
  type: 'none' | 'starfall' | 'neon-rain' | 'fluid-gradients' | 'cosmic-dust' | 'bubbles' | 'custom';
  theme: string;
  customConfig?: string;
};

const BackgroundAnimation = ({ type, theme, customConfig }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null as any);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type === 'none' || type === 'custom') return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Handle high DPI screens and parent container sizing
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse Tracking with Inertia
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let isMouseOnScreen = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      isMouseOnScreen = true;
    };

    const handleMouseLeave = () => {
      isMouseOnScreen = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Interactive Click Physics
    let clickRipple: { x: number; y: number; radius: number; maxRadius: number; speed: number; opacity: number; active: boolean } | null = null;
    
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      clickRipple = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 0,
        maxRadius: 280,
        speed: 3.5, // Slow, peaceful expansion
        opacity: 1.0,
        active: true,
      };

      // Spawn active interactive elements based on animation type
      if (type === 'neon-rain') {
        // Spawn extra floating sakura petals at click point
        for (let i = 0; i < 12; i++) {
          sakuraPetals.push({
            x: clickRipple.x + (Math.random() - 0.5) * 40,
            y: clickRipple.y + (Math.random() - 0.5) * 20,
            r: 3.5 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -0.5 - Math.random() * 1.2, // Shoot slightly up, then float down
            angle: Math.random() * Math.PI * 2,
            angleSpeed: 0.01 + Math.random() * 0.02,
            color: '#fda4af',
            surfaceSlide: false,
            slideTimer: 0,
          });
        }
      } else if (type === 'cosmic-dust') {
        // Disturb fireflies at click point (they scatter away!)
        fireflies.forEach((f) => {
          const dx = f.x - clickRipple!.x;
          const dy = f.y - clickRipple!.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            f.vx += (dx / dist) * force * 5;
            f.vy += (dy / dist) * force * 5;
          }
        });
      } else if (type === 'fluid-gradients') {
        // Spawn bioluminescent bubbles
        for (let i = 0; i < 12; i++) {
          seaBubbles.push({
            x: clickRipple.x + (Math.random() - 0.5) * 40,
            y: clickRipple.y + (Math.random() - 0.5) * 30,
            r: 1.5 + Math.random() * 4,
            speed: 0.4 + Math.random() * 0.7,
            osc: Math.random() * Math.PI * 2,
            oscSpeed: 0.01 + Math.random() * 0.02,
          });
        }
      } else if (type === 'bubbles') {
        // Spawn soft glass sparkles
        for (let i = 0; i < 16; i++) {
          softBlossoms.push({
            x: clickRipple.x + (Math.random() - 0.5) * 50,
            y: clickRipple.y + (Math.random() - 0.5) * 30,
            r: 2 + Math.random() * 4,
            vy: 0.6 + Math.random() * 0.8,
            vx: (Math.random() - 0.5) * 0.6,
            angle: Math.random() * Math.PI * 2,
            angleSpeed: 0.005 + Math.random() * 0.01,
            color: ['#fbc2eb', '#a1c4fd', '#c2e9fb'][Math.floor(Math.random() * 3)],
          });
        }
      }
    };
    window.addEventListener('click', handleCanvasClick);

    // Detect Active Light Theme
    const isLight = theme === 'light' || document.documentElement.classList.contains('theme-light');

    // --- Dynamic Objects Initialization ---

    // 1. Dreamy Aurora Wave: Stars Setup
    const auroraStars: Array<{ x: number; y: number; r: number; alpha: number; speed: number }> = [];
    if (type === 'starfall') {
      for (let i = 0; i < 80; i++) {
        auroraStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + Math.random() * 0.9,
          alpha: Math.random(),
          speed: 0.003 + Math.random() * 0.006,
        });
      }
    }

    // 2. Sakura Blossom Zen Drift (Neon Rain Key): Falling Sakura Petals & Ripples
    const sakuraPetals: Array<{ x: number; y: number; r: number; vx: number; vy: number; angle: number; angleSpeed: number; color: string; surfaceSlide: boolean; slideTimer: number }> = [];
    const waterRipples: Array<{ x: number; y: number; r: number; maxR: number; opacity: number; color: string }> = [];
    if (type === 'neon-rain') {
      const petalColors = ['#fecdd3', '#fda4af', '#f472b6', '#fae8ff'];
      for (let i = 0; i < 35; i++) {
        sakuraPetals.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.8 - height * 0.5,
          r: 3 + Math.random() * 4,
          vx: -0.8 - Math.random() * 0.8, // Slow drifting drift leftward
          vy: 1.0 + Math.random() * 0.7, // Slow vertical fall
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.003 + Math.random() * 0.008,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
          surfaceSlide: false,
          slideTimer: 0,
        });
      }
    }

    // 3. Bioluminescent Ocean: Glowing Plankton & Crepuscular light rays
    const planktons: Array<{ x: number; y: number; r: number; speed: number; phase: number; color: string; baseAlpha: number }> = [];
    const seaBubbles: Array<{ x: number; y: number; r: number; speed: number; osc: number; oscSpeed: number }> = [];
    let oceanBeamOsc = 0;
    if (type === 'fluid-gradients') {
      const pColors = isLight 
        ? ['#0f766e', '#0369a1', '#4338ca'] 
        : ['#00ffff', '#00ffaa', '#bd00ff', '#ffffff'];
      for (let i = 0; i < 32; i++) {
        planktons.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 4.0 + Math.random() * 8.0,
          speed: 0.004 + Math.random() * 0.006,
          phase: Math.random() * Math.PI * 2,
          color: pColors[Math.floor(Math.random() * pColors.length)],
          baseAlpha: 0.20 + Math.random() * 0.30,
        });
      }
    }

    // 4. Enchanted Firefly Forest (Cosmic Dust Key): wandering forest fireflies
    const fireflies: Array<{ x: number; y: number; vx: number; vy: number; r: number; baseR: number; targetX: number; targetY: number; wanderAngle: number; glowSpeed: number; glowPhase: number; color: string }> = [];
    if (type === 'cosmic-dust') {
      const flyColors = ['#bef264', '#a3e635', '#fef08a', '#facc15'];
      for (let i = 0; i < 55; i++) {
        const base = 2 + Math.random() * 2.5;
        fireflies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          baseR: base,
          r: base,
          targetX: Math.random() * width,
          targetY: Math.random() * height,
          wanderAngle: Math.random() * Math.PI * 2,
          glowSpeed: 0.015 + Math.random() * 0.02,
          glowPhase: Math.random() * Math.PI * 2,
          color: flyColors[Math.floor(Math.random() * flyColors.length)],
        });
      }
    }

    // 5. Ethereal Glass Blossoms: Glass circles & floating petals
    const glassCircles: Array<{ x: number; y: number; r: number; speed: number; depth: number; angle: number; angleSpeed: number; color: string; opacity: number }> = [];
    const softBlossoms: Array<{ x: number; y: number; r: number; vy: number; vx: number; angle: number; angleSpeed: number; color: string }> = [];
    if (type === 'bubbles') {
      const blColors = isLight 
        ? ['#fbc2eb', '#a1c4fd', '#c2e9fb', '#fecfef'] 
        : ['#8b5cf6', '#bd00ff', '#00f0ff', '#ff007f'];
      for (let i = 0; i < 30; i++) {
        glassCircles.push({
          x: Math.random() * width,
          y: height + Math.random() * 150,
          r: 15 + Math.random() * 30, // High quality glass spheres
          speed: 0.25 + Math.random() * 0.45,
          depth: 0.35 + Math.random() * 0.65,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.003 + Math.random() * 0.006,
          color: blColors[Math.floor(Math.random() * blColors.length)],
          opacity: 0.12 + Math.random() * 0.22,
        });
      }
    }

    // Render loop
    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse transition
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Update click ripple
      if (clickRipple && clickRipple.active) {
        clickRipple.radius += clickRipple.speed;
        clickRipple.opacity = Math.max(0, 1 - clickRipple.radius / clickRipple.maxRadius);
        if (clickRipple.radius > clickRipple.maxRadius) {
          clickRipple.active = false;
        }
      }

      // ==================================================
      // 1. POLARIS AURORA WAVE (Starfall Selector)
      // ==================================================
      if (type === 'starfall') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (isLight) {
          skyGrad.addColorStop(0, '#f3f2fa');
          skyGrad.addColorStop(0.5, '#e6e6f7');
          skyGrad.addColorStop(1, '#dfdfe3');
        } else {
          skyGrad.addColorStop(0, '#04010a');
          skyGrad.addColorStop(0.5, '#0b0520');
          skyGrad.addColorStop(1, '#010005');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Quiet stars twinkling
        auroraStars.forEach((star) => {
          star.alpha += star.speed;
          if (star.alpha > 0.75 || star.alpha < 0.08) {
            star.speed = -star.speed;
          }
          ctx.fillStyle = isLight ? '#6366f1' : '#ffffff';
          ctx.globalAlpha = Math.max(0, star.alpha);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Render silky overlapping sine wave auroras
        ctx.save();
        ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';

        const time = Date.now() * 0.00045;
        const waveCount = 3;

        for (let w = 0; w < waveCount; w++) {
          const wAlpha = isLight ? 0.12 : 0.18;
          const grad = ctx.createLinearGradient(0, 0, width, 0);

          if (isLight) {
            if (w === 0) {
              grad.addColorStop(0, 'rgba(99, 102, 241, 0)');
              grad.addColorStop(0.5, `rgba(168, 85, 247, ${wAlpha})`);
              grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
            } else if (w === 1) {
              grad.addColorStop(0, 'rgba(236, 72, 153, 0)');
              grad.addColorStop(0.5, `rgba(20, 184, 166, ${wAlpha})`);
              grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
            } else {
              grad.addColorStop(0, 'rgba(20, 184, 166, 0)');
              grad.addColorStop(0.5, `rgba(99, 102, 241, ${wAlpha})`);
              grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
            }
          } else {
            if (w === 0) {
              grad.addColorStop(0, 'rgba(0, 255, 220, 0)');
              grad.addColorStop(0.5, `rgba(124, 58, 237, ${wAlpha * 1.5})`);
              grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
            } else if (w === 1) {
              grad.addColorStop(0, 'rgba(236, 72, 153, 0)');
              grad.addColorStop(0.5, `rgba(16, 185, 129, ${wAlpha * 1.5})`);
              grad.addColorStop(1, 'rgba(0, 255, 220, 0)');
            } else {
              grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
              grad.addColorStop(0.5, `rgba(0, 255, 220, ${wAlpha * 1.5})`);
              grad.addColorStop(1, 'rgba(124, 58, 237, 0)');
            }
          }

          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.moveTo(0, height);

          // Render wave using bezier curve interpolators to make them silky smooth
          const offsetBase = height * 0.4 + w * 65;
          const waveAmp = 45 + w * 12;
          const waveFreq = 0.0015 + w * 0.0004;

          const sway = isMouseOnScreen ? (mouseX - width / 2) * 0.06 : 0;

          ctx.lineTo(0, offsetBase + Math.sin(time + w) * waveAmp);
          for (let x = 30; x <= width; x += 30) {
            const angleVal = x * waveFreq + time + w * 1.5;
            const y = offsetBase + Math.sin(angleVal) * waveAmp + (isMouseOnScreen ? Math.sin((mouseY - offsetBase) * 0.004) * sway : 0);
            
            // smooth curve to next point
            const prevAngle = (x - 30) * waveFreq + time + w * 1.5;
            const prevY = offsetBase + Math.sin(prevAngle) * waveAmp + (isMouseOnScreen ? Math.sin((mouseY - offsetBase) * 0.004) * sway : 0);
            
            ctx.quadraticCurveTo(x - 15, (prevY + y) / 2, x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Soft click ripple
        if (clickRipple && clickRipple.active) {
          ctx.strokeStyle = isLight ? `rgba(99, 102, 241, ${clickRipple.opacity * 0.3})` : `rgba(0, 255, 220, ${clickRipple.opacity * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(clickRipple.x, clickRipple.y, clickRipple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ==================================================
      // 2. SAKURA BLOSSOM ZEN DRIFT (Neon Rain Selector)
      // ==================================================
      else if (type === 'neon-rain') {
        // Soothing warm sunrise sky-to-pond gradient
        const pondGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (isLight) {
          pondGrad.addColorStop(0, '#fff1f2');
          pondGrad.addColorStop(0.5, '#ffe4e6');
          pondGrad.addColorStop(1, '#f3e8ff');
        } else {
          pondGrad.addColorStop(0, '#0a030d');
          pondGrad.addColorStop(0.5, '#120412');
          pondGrad.addColorStop(1, '#05010a');
        }
        ctx.fillStyle = pondGrad;
        ctx.fillRect(0, 0, width, height);

        const waterLevel = height * 0.65;

        // Render soft misty shoreline/horizon shading
        ctx.save();
        ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';
        const mistGrad = ctx.createRadialGradient(width * 0.5, waterLevel, 0, width * 0.5, waterLevel, width * 0.55);
        mistGrad.addColorStop(0, isLight ? 'rgba(253, 164, 175, 0.15)' : 'rgba(139, 92, 246, 0.15)');
        mistGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Update and draw floating/falling Sakura petals
        sakuraPetals.forEach((p) => {
          if (!p.surfaceSlide) {
            // Falling stage
            p.y += p.vy;
            p.x += p.vx + Math.sin(Date.now() * 0.0015 + p.r) * 0.3;
            p.angle += p.angleSpeed;

            // Wind sways petals
            if (isMouseOnScreen) {
              const wind = (mouseX - width / 2) * 0.0015;
              p.vx = -0.5 + wind;
            }

            // Hits the peaceful water surface pond
            if (p.y > waterLevel + (height - waterLevel) * (p.r / 7)) {
              p.surfaceSlide = true;
              p.slideTimer = 180 + Math.random() * 180; // Slide along water for a while
              p.vy = 0; // stop vertical fall
              p.vx = -0.2 - Math.random() * 0.2; // slow drift along river currents

              // Spawn concentric water ring ripple
              waterRipples.push({
                x: p.x,
                y: p.y,
                r: 0.5,
                maxR: 12 + p.r * 2.5,
                opacity: 0.55,
                color: isLight ? 'rgba(244, 114, 182, 0.25)' : 'rgba(253, 164, 175, 0.2)',
              });
            }
          } else {
            // River surface sliding stage
            p.x += p.vx;
            p.angle += p.angleSpeed * 0.5;
            p.slideTimer--;

            // Slowly fade out petal on water
            if (p.slideTimer <= 0) {
              // Recycle petal to the sky
              p.y = Math.random() * -100;
              p.x = Math.random() * width + width * 0.1; // Spawn to the right
              p.vy = 0.6 + Math.random() * 0.5;
              p.vx = -0.4 - Math.random() * 0.6;
              p.surfaceSlide = false;
            }
          }

          // Draw the realistic cherry blossom petal
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.surfaceSlide ? Math.min(0.7, p.slideTimer / 30) : 0.75;
          ctx.beginPath();
          // Draw standard cherry petal outline shape
          ctx.moveTo(0, -p.r);
          ctx.bezierCurveTo(p.r * 0.8, -p.r * 0.8, p.r * 1.1, p.r * 0.4, 0, p.r * 1.1);
          ctx.bezierCurveTo(-p.r * 1.1, p.r * 0.4, -p.r * 0.8, -p.r * 0.8, 0, -p.r);
          ctx.fill();

          ctx.restore();
          ctx.globalAlpha = 1.0;
        });

        // Update and draw river ripples
        for (let r = waterRipples.length - 1; r >= 0; r--) {
          const rip = waterRipples[r];
          rip.r += 0.28;
          rip.opacity -= 0.008;

          if (rip.opacity <= 0) {
            waterRipples.splice(r, 1);
            continue;
          }

          ctx.strokeStyle = rip.color;
          ctx.globalAlpha = rip.opacity;
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.22, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // Custom click ripple (elliptical water ripple)
        if (clickRipple && clickRipple.active) {
          ctx.strokeStyle = isLight ? `rgba(244, 114, 182, ${clickRipple.opacity * 0.35})` : `rgba(253, 164, 175, ${clickRipple.opacity * 0.4})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(clickRipple.x, clickRipple.y, clickRipple.radius, clickRipple.radius * 0.22, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ==================================================
      // 3. BIOLUMINESCENT DEEP OCEAN (Fluid Gradients Key)
      // ==================================================
      else if (type === 'fluid-gradients') {
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (isLight) {
          oceanGrad.addColorStop(0, '#f0fdfa');
          oceanGrad.addColorStop(0.5, '#ccfbf1');
          oceanGrad.addColorStop(1, '#99f6e4');
        } else {
          oceanGrad.addColorStop(0, '#010c14');
          oceanGrad.addColorStop(0.6, '#00050a');
          oceanGrad.addColorStop(1, '#000102');
        }
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, width, height);

        // Undersea light beams filtering down
        oceanBeamOsc += 0.001;
        ctx.save();
        ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';

        const beamX = width * 0.3 + Math.sin(oceanBeamOsc) * 100;
        const beamGrad = ctx.createRadialGradient(beamX, -30, 20, width * 0.45, height, Math.max(width, height));
        if (isLight) {
          beamGrad.addColorStop(0, 'rgba(153, 246, 228, 0.4)');
          beamGrad.addColorStop(0.5, 'rgba(204, 251, 241, 0.18)');
          beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          beamGrad.addColorStop(0, 'rgba(13, 148, 136, 0.22)');
          beamGrad.addColorStop(0.4, 'rgba(4, 47, 46, 0.07)');
          beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Planktons drifting & breathing
        planktons.forEach((p) => {
          p.phase += p.speed;

          // Gentle sinusoidal pulse
          const pulse = Math.sin(p.phase);
          const currentRadius = p.r + pulse * 1.5;
          const alpha = p.baseAlpha + pulse * 0.06;

          // Water current force push
          if (isMouseOnScreen) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) {
              const force = (160 - dist) / 160;
              p.x += (dx / dist) * force * 1.5;
              p.y += (dy / dist) * force * 1.5;
            }
          }

          p.y -= 0.06;
          p.x += Math.sin(p.phase * 0.4) * 0.04;

          // boundary recycle
          if (p.y + p.r < -10) {
            p.y = height + p.r + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Radial glow background bubble
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 3.5);
          glow.addColorStop(0, p.color + '33');
          glow.addColorStop(0.5, p.color + '10');
          glow.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Shining core dot
          ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
          ctx.globalAlpha = Math.max(0.1, alpha * 2.2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });

        // Ascending sea bubbles
        seaBubbles.forEach((b, idx) => {
          b.y -= b.speed;
          b.osc += b.oscSpeed;
          const bx = b.x + Math.sin(b.osc) * 2.5;

          ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
          ctx.stroke();

          if (b.y + b.r < -5) {
            seaBubbles.splice(idx, 1);
          }
        });

        // click ripple
        if (clickRipple && clickRipple.active) {
          ctx.strokeStyle = isLight ? `rgba(13, 148, 136, ${clickRipple.opacity * 0.32})` : `rgba(0, 255, 180, ${clickRipple.opacity * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(clickRipple.x, clickRipple.y, clickRipple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ==================================================
      // 4. ENCHANTED FIREFLY FOREST (Cosmic Dust Selector)
      // ==================================================
      else if (type === 'cosmic-dust') {
        // Deep magical forest shadow backdrop
        const forestGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
        if (isLight) {
          forestGrad.addColorStop(0, '#f0fdf4');
          forestGrad.addColorStop(0.5, '#dcfce7');
          forestGrad.addColorStop(1, '#bbf7d0');
        } else {
          forestGrad.addColorStop(0, '#011c14');
          forestGrad.addColorStop(0.6, '#010f0a');
          forestGrad.addColorStop(1, '#000203');
        }
        ctx.fillStyle = forestGrad;
        ctx.fillRect(0, 0, width, height);

        // Process fireflies wander physics
        fireflies.forEach((f) => {
          f.glowPhase += f.glowSpeed;

          // Organic Wander Steering Math (Perlin-like wandering)
          f.wanderAngle += (Math.random() - 0.5) * 0.4;
          const wanderPower = 0.18;
          f.vx += Math.cos(f.wanderAngle) * wanderPower;
          f.vy += Math.sin(f.wanderAngle) * wanderPower;

          // Drag friction damping to keep sways incredibly smooth
          f.vx *= 0.96;
          f.vy *= 0.96;

          f.x += f.vx;
          f.y += f.vy;

          // boundary soft recovery
          if (f.x < 20) { f.x = 20; f.vx = Math.abs(f.vx); }
          if (f.x > width - 20) { f.x = width - 20; f.vx = -Math.abs(f.vx); }
          if (f.y < 20) { f.y = 20; f.vy = Math.abs(f.vy); }
          if (f.y > height - 20) { f.y = height - 20; f.vy = -Math.abs(f.vy); }

          // Mouse attraction light well
          if (isMouseOnScreen) {
            const dx = mouseX - f.x;
            const dy = mouseY - f.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 220) {
              const pull = (220 - dist) * 0.0003;
              f.vx += dx * pull;
              f.vy += dy * pull;
            }
          }

          // Slow organic glowing breathing
          const pulse = (Math.sin(f.glowPhase) + 1.0) * 0.5; // normalized 0 to 1
          f.r = f.baseR * (0.85 + pulse * 0.35);

          // Draw Glowing Firefly Core & Shimmer Halo
          if (pulse > 0.05) {
            const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6.5);
            if (isLight) {
              glow.addColorStop(0, `rgba(101, 163, 13, ${pulse * 0.55})`);
              glow.addColorStop(0.5, `rgba(132, 204, 22, ${pulse * 0.22})`);
              glow.addColorStop(1, 'rgba(0,0,0,0)');
            } else {
              glow.addColorStop(0, `rgba(163, 230, 53, ${pulse * 0.85})`);
              glow.addColorStop(0.4, `rgba(234, 179, 8, ${pulse * 0.35})`);
              glow.addColorStop(1, 'rgba(0,0,0,0)');
            }

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r * 6.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Shining tiny firefly point
          ctx.fillStyle = isLight ? '#4d7c0f' : '#ffffff';
          ctx.globalAlpha = Math.max(0.15, pulse * 0.9);
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });

        // Click Ripple forest magic sparks
        if (clickRipple && clickRipple.active) {
          ctx.strokeStyle = isLight ? `rgba(101, 163, 13, ${clickRipple.opacity * 0.35})` : `rgba(163, 230, 53, ${clickRipple.opacity * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(clickRipple.x, clickRipple.y, clickRipple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ==================================================
      // 5. ETHEREAL GLASS BLOSSOMS (Bubbles Selector)
      // ==================================================
      else if (type === 'bubbles') {
        const blossomGrad = ctx.createLinearGradient(0, 0, width, height);
        if (isLight) {
          blossomGrad.addColorStop(0, '#fff5f5');
          blossomGrad.addColorStop(1, '#f3e8ff');
        } else {
          blossomGrad.addColorStop(0, '#0c0312');
          blossomGrad.addColorStop(1, '#040108');
        }
        ctx.fillStyle = blossomGrad;
        ctx.fillRect(0, 0, width, height);

        // Process glass circles
        glassCircles.forEach((c) => {
          c.y -= c.speed * c.depth;
          c.angle += c.angleSpeed;

          // Parallax organic sway
          const cx = c.x + Math.sin(c.angle) * (15 * c.depth);

          // Recycle
          if (c.y + c.r < -30) {
            c.y = height + c.r + Math.random() * 100;
            c.x = Math.random() * width;
          }

          // Mouse push gently
          if (isMouseOnScreen) {
            const dx = cx - mouseX;
            const dy = c.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              const force = (150 - dist) / 150;
              c.x += (dx / dist) * force * 1.6;
            }
          }

          // Render Glass circle radial gradient
          const glow = ctx.createRadialGradient(
            cx - c.r * 0.2, 
            c.y - c.r * 0.2, 
            c.r * 0.1, 
            cx, 
            c.y, 
            c.r
          );
          
          if (isLight) {
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
            glow.addColorStop(0.5, c.color + '12');
            glow.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
          } else {
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
            glow.addColorStop(0.5, c.color + '0e');
            glow.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
          }

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();

          // 3D Glass rim outline
          ctx.strokeStyle = isLight 
            ? `rgba(99, 102, 241, ${c.opacity * 0.48})` 
            : `rgba(255, 255, 255, ${c.opacity * 0.58})`;
          ctx.lineWidth = 0.5 + c.depth * 0.5;
          ctx.stroke();
        });

        // Petals spawned on click drifting down
        softBlossoms.forEach((p, idx) => {
          p.y += p.vy;
          p.x += p.vx + Math.sin(Date.now() * 0.001 + idx) * 0.15;
          p.angle += p.angleSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y - p.r > height + 10) {
            softBlossoms.splice(idx, 1);
          }
        });
        ctx.globalAlpha = 1.0;

        // Custom click ripple
        if (clickRipple && clickRipple.active) {
          ctx.strokeStyle = isLight ? `rgba(168, 85, 247, ${clickRipple.opacity * 0.32})` : `rgba(236, 72, 153, ${clickRipple.opacity * 0.42})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(clickRipple.x, clickRipple.y, clickRipple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, theme]);

  // Custom JSON theme engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type !== 'custom' || !customConfig) return undefined;

    let parsed: any;
    try {
      parsed = JSON.parse(customConfig);
    } catch (e) {
      console.warn("Clashgram: Invalid custom theme JSON", e);
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Support dark/light mode overrides
    const isDark = theme === 'dark' || document.documentElement.classList.contains('theme-dark');
    if (parsed.themeOverrides) {
      const overrides = isDark ? parsed.themeOverrides.dark : parsed.themeOverrides.light;
      if (overrides) {
        parsed = { ...parsed, ...overrides };
      }
    }

    // Convert legacy schema to layered schema for backwards compatibility
    let layers: any[] = parsed.layers;
    if (!layers) {
      layers = [];
      if (parsed.background) {
        layers.push({
          type: 'background',
          background: parsed.background
        });
      }
      layers.push({
        type: 'particles',
        particleCount: parsed.particleCount ?? 65,
        colors: parsed.colors ?? ['#ff7b00', '#ff007b', '#7b00ff', '#00ffff'],
        minSpeed: parsed.minSpeed,
        maxSpeed: parsed.maxSpeed,
        minSize: parsed.minSize,
        maxSize: parsed.maxSize,
        glowEffect: parsed.glowEffect,
        spawnOnClick: parsed.spawnOnClick,
        gravity: parsed.gravity,
        drift: parsed.drift
      });
    }

    // Setup sizing & device pixel ratio
    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Offscreen WebGL setup if needed
    let hasShaderLayer = layers.some(l => l.type === 'shader' || l.type === 'webgl');
    let webglCanvas: HTMLCanvasElement | null = null;
    let gl: WebGLRenderingContext | null = null;
    let glProgram: WebGLProgram | null = null;
    let glBuffers: { position: WebGLBuffer } | null = null;

    if (hasShaderLayer) {
      webglCanvas = document.createElement('canvas');
      gl = (webglCanvas.getContext('webgl2')
        || webglCanvas.getContext('webgl')
        || webglCanvas.getContext('experimental-webgl')) as any;
      if (gl) {
        gl.getExtension('OES_standard_derivatives');
        const shaderLayer = layers.find(l => l.type === 'shader' || l.type === 'webgl');
        const vsSource = shaderLayer.vertexShader || `
          attribute vec2 position;
          void main() {
            gl_Position = vec4(position, 0.0, 1.0);
          }
        `;
        let fsSource = shaderLayer.fragmentShader || `
          precision highp float;
          uniform vec2 u_resolution;
          uniform float u_time;
          void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            gl_FragColor = vec4(uv.x, uv.y, 0.5 + 0.5 * sin(u_time), 1.0);
          }
        `;

        // Auto-enable standard derivatives for WebGL 1.0 if fwidth/dFdx/dFdy is used
        const glVersion = gl.getParameter(gl.VERSION) || '';
        if (glVersion.indexOf('WebGL 2.0') === -1) {
          if (fsSource.indexOf('fwidth') !== -1 || fsSource.indexOf('dFdx') !== -1 || fsSource.indexOf('dFdy') !== -1) {
            if (fsSource.indexOf('GL_OES_standard_derivatives') === -1) {
              fsSource = '#extension GL_OES_standard_derivatives : enable\n' + fsSource;
            }
          }
        }

        const vs = compileShader(gl, vsSource, gl.VERTEX_SHADER);
        const fs = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
        if (vs && fs) {
          glProgram = gl.createProgram();
          if (glProgram) {
            gl.attachShader(glProgram, vs);
            gl.attachShader(glProgram, fs);
            gl.linkProgram(glProgram);
            if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
              console.error('Shader link error:', gl.getProgramInfoLog(glProgram));
              glProgram = null;
            }
          }
        }

        if (glProgram) {
          gl.useProgram(glProgram);
          const positionLocation = gl.getAttribLocation(glProgram, 'position');
          const positionBuffer = gl.createBuffer();
          if (positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              -1, -1,  1, -1, -1,  1,
              -1,  1,  1, -1,  1,  1,
            ]), gl.STATIC_DRAW);
            glBuffers = { position: positionBuffer };
          }
        }
      }
    }

    // Math compile utility cache
    const exprCache = new Map<string, (vars: any) => any>();
    const getExpr = (expr: any) => {
      if (expr === undefined || expr === null) return () => 0;
      if (typeof expr !== 'string') return () => expr;
      if (exprCache.has(expr)) return exprCache.get(expr)!;
      const compiled = compileExpression(expr);
      exprCache.set(expr, compiled);
      return compiled;
    };

    // Particles System Setup
    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; color: string;
      alpha: number; life: number; maxLife: number;
      mass: number; charge: number;
    }

    interface SystemInstance {
      config: any;
      particles: Particle[];
      particleCountFn: (vars: any) => number;
      minSpeedFn: (vars: any) => number;
      maxSpeedFn: (vars: any) => number;
      minSizeFn: (vars: any) => number;
      maxSizeFn: (vars: any) => number;
      gravityFn: (vars: any) => number;
      driftFn: (vars: any) => number;
      windFn: (vars: any) => number;
    }

    const systems: SystemInstance[] = [];

    // DOM Injection for HTML and CSS layers
    const injectedStyles: HTMLStyleElement[] = [];
    const injectedHtmlContainers: HTMLDivElement[] = [];

    layers.forEach((layer, idx) => {
      if (layer.type === 'css' && layer.css) {
        const styleEl = document.createElement('style');
        styleEl.id = `clashgram-custom-css-${idx}`;
        styleEl.textContent = layer.css;
        document.head.appendChild(styleEl);
        injectedStyles.push(styleEl);
      }
      if (layer.type === 'html' && layer.html) {
        const containerEl = document.createElement('div');
        containerEl.className = `clashgram-custom-html-layer clashgram-custom-html-${idx}`;
        containerEl.style.position = 'absolute';
        containerEl.style.inset = '0';
        containerEl.style.pointerEvents = 'none';
        containerEl.style.zIndex = '-1';
        containerEl.innerHTML = layer.html;
        canvas.parentElement?.appendChild(containerEl);
        injectedHtmlContainers.push(containerEl);
      }
    });

    // Initialize systems
    layers.forEach((layer) => {
      if (layer.type === 'particles') {
        const countFn = getExpr(layer.particleCount ?? 65);
        const minSpeedFn = getExpr(layer.minSpeed ?? 0.4);
        const maxSpeedFn = getExpr(layer.maxSpeed ?? 1.2);
        const minSizeFn = getExpr(layer.minSize ?? 1.5);
        const maxSizeFn = getExpr(layer.maxSize ?? 4.5);
        const gravityFn = getExpr(layer.gravity ?? 0);
        const driftFn = getExpr(layer.drift ?? 0.05);
        const windFn = getExpr(layer.physics?.wind ?? 0);

        systems.push({
          config: layer,
          particles: [],
          particleCountFn: countFn as any,
          minSpeedFn: minSpeedFn as any,
          maxSpeedFn: maxSpeedFn as any,
          minSizeFn: minSizeFn as any,
          maxSizeFn: maxSizeFn as any,
          gravityFn: gravityFn as any,
          driftFn: driftFn as any,
          windFn: windFn as any,
        });
      }
    });

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const spawnParticle = (sys: SystemInstance, x?: number, y?: number): Particle => {
      const vars = { t: (Date.now() - startTime) / 1000, w: width, h: height, mx: mouseX, my: mouseY, bass, mid, treble };
      const minS = sys.minSpeedFn(vars);
      const maxS = sys.maxSpeedFn(vars);
      const minSz = sys.minSizeFn(vars);
      const maxSz = sys.maxSizeFn(vars);
      const colors = sys.config.colors || ['#ff7b00', '#ff007b', '#7b00ff', '#00ffff'];

      return {
        x: x ?? Math.random() * width,
        y: y ?? (sys.gravityFn(vars) >= 0 ? -10 : height + 10),
        vx: (Math.random() - 0.5) * sys.driftFn(vars) * 60,
        vy: sys.gravityFn(vars) >= 0 ? rand(minS, maxS) : -rand(minS, maxS),
        size: rand(minSz, maxSz),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: rand(0.3, 0.9),
        life: 0,
        maxLife: rand(120, 360),
        mass: sys.config.physics?.mass ?? 1,
        charge: sys.config.physics?.charge ?? 0,
      };
    };

    // Resize
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (webglCanvas && gl) {
        webglCanvas.width = width * dpr;
        webglCanvas.height = height * dpr;
        gl.viewport(0, 0, width * dpr, height * dpr);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);


    let bass = 0;
    let mid = 0;
    let treble = 0;


    // Click behavior
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      systems.forEach((sys) => {
        if (sys.config.spawnOnClick || sys.config.interaction?.onClick?.action === 'spawn') {
          const count = sys.config.interaction?.onClick?.count ?? 8;
          for (let i = 0; i < count; i++) {
            sys.particles.push(spawnParticle(
              sys,
              cx + (Math.random() - 0.5) * 40,
              cy + (Math.random() - 0.5) * 40
            ));
          }
        }
      });
    };
    window.addEventListener('click', handleClick);

    const startTime = Date.now();

    // Render loop
    const render = () => {
      if (document.hidden) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const t = (Date.now() - startTime) / 1000;

      // Update Audio Reactivity (Simulated Fallback)
      if (parsed.audioReactive?.enabled) {
        bass = 0.5 + 0.3 * Math.sin(t * 3.0);
        mid = 0.4 + 0.2 * Math.cos(t * 5.0);
        treble = 0.3 + 0.3 * Math.sin(t * 8.0);
      }

      const vars = { t, w: width, h: height, mx: mouseX, my: mouseY, bass, mid, treble };

      ctx.clearRect(0, 0, width, height);

      // Render layers
      layers.forEach((layer) => {
        // 1. Background static / animated / solid
        if (layer.type === 'background') {
          const bgConfig = layer.background || {};
          const bgType = bgConfig.type || 'none';
          const bgColors = bgConfig.colors || ['#0a0a1a'];
          const bgAnimSpeed = parseFloat(bgConfig.animationSpeed) || 15;

          if (bgType === 'animated-gradient' && bgColors.length >= 2) {
            const angle = (t / bgAnimSpeed) * Math.PI * 2;
            const diagLen = Math.sqrt(width * width + height * height);
            const x0 = width / 2 + Math.cos(angle) * diagLen * 0.5;
            const y0 = height / 2 + Math.sin(angle) * diagLen * 0.5;
            const x1 = width / 2 - Math.cos(angle) * diagLen * 0.5;
            const y1 = height / 2 - Math.sin(angle) * diagLen * 0.5;
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            bgColors.forEach((c: string, idx: number) => {
              grad.addColorStop(idx / Math.max(1, bgColors.length - 1), c);
            });
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
          } else if (bgType === 'radial-gradient' && bgColors.length >= 2) {
            const pulse = 0.35 + Math.sin((t / bgAnimSpeed) * Math.PI * 2) * 0.15;
            const grad = ctx.createRadialGradient(
              width / 2, height / 2, 0,
              width / 2, height / 2, Math.max(width, height) * pulse
            );
            bgColors.forEach((c: string, idx: number) => {
              grad.addColorStop(idx / Math.max(1, bgColors.length - 1), c);
            });
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
          } else if (bgType === 'static-gradient' && bgColors.length >= 2) {
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            bgColors.forEach((c: string, idx: number) => {
              grad.addColorStop(idx / Math.max(1, bgColors.length - 1), c);
            });
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
          } else if (bgType === 'solid' && bgColors.length >= 1) {
            ctx.fillStyle = bgColors[0];
            ctx.fillRect(0, 0, width, height);
          }
        }

        // 2. WebGL Shader background
        else if ((layer.type === 'shader' || layer.type === 'webgl') && gl && glProgram && webglCanvas) {
          gl.useProgram(glProgram);

          const uTimeLoc = gl.getUniformLocation(glProgram, 'u_time');
          const uResolutionLoc = gl.getUniformLocation(glProgram, 'u_resolution');
          const uMouseLoc = gl.getUniformLocation(glProgram, 'u_mouse');
          const uAudioLoc = gl.getUniformLocation(glProgram, 'u_audio');

          if (uTimeLoc !== null) gl.uniform1f(uTimeLoc, t);
          if (uResolutionLoc !== null) gl.uniform2f(uResolutionLoc, width * dpr, height * dpr);
          if (uMouseLoc !== null) gl.uniform2f(uMouseLoc, mouseX * dpr, (height - mouseY) * dpr);
          if (uAudioLoc !== null) gl.uniform3f(uAudioLoc, bass, mid, treble);

          if (layer.uniforms) {
            Object.entries(layer.uniforms).forEach(([name, val]) => {
              const loc = gl!.getUniformLocation(glProgram!, name);
              if (loc !== null) {
                let evaluated = typeof val === 'string' ? getExpr(val)!(vars) : val;
                if (typeof evaluated === 'number') {
                  gl!.uniform1f(loc, evaluated);
                } else if (Array.isArray(evaluated)) {
                  if (evaluated.length === 2) gl!.uniform2f(loc, evaluated[0], evaluated[1]);
                  else if (evaluated.length === 3) gl!.uniform3f(loc, evaluated[0], evaluated[1], evaluated[2]);
                  else if (evaluated.length === 4) gl!.uniform4f(loc, evaluated[0], evaluated[1], evaluated[2], evaluated[3]);
                }
              }
            });
          }

          if (glBuffers) {
            const positionLocation = gl.getAttribLocation(glProgram, 'position');
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.position);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }

          ctx.drawImage(webglCanvas, 0, 0, width, height);
        }

        // 3. Particles system layer
        else if (layer.type === 'particles') {
          const sys = systems.find(s => s.config === layer);
          if (!sys) return;

          const blendMode = layer.blendMode || 'normal';
          ctx.save();
          ctx.globalCompositeOperation = blendMode as any;

          const activeCount = Math.min(sys.particleCountFn(vars), 400);

          while (sys.particles.length < activeCount) {
            sys.particles.push(spawnParticle(sys));
          }

          const gravity = sys.gravityFn(vars);
          const drift = sys.driftFn(vars);
          const wind = sys.windFn(vars);
          const glowEffect = layer.glowEffect !== false;

          const attractors = layer.physics?.attractors || [];
          const flowField = layer.physics?.flowField;

          for (let i = sys.particles.length - 1; i >= 0; i--) {
            const p = sys.particles[i];
            p.life++;

            let ax = wind;
            let ay = gravity;

            attractors.forEach((att: any) => {
              const attX = typeof att.x === 'string' ? getExpr(att.x)!(vars) : att.x;
              const attY = typeof att.y === 'string' ? getExpr(att.y)!(vars) : att.y;
              const strength = typeof att.strength === 'string' ? getExpr(att.strength)!(vars) : (att.strength ?? 50);
              const radius = att.radius ?? 200;

              const dx = attX - p.x;
              const dy = attY - p.y;
              const distSq = dx * dx + dy * dy;
              const dist = Math.sqrt(distSq);

              if (dist < radius && dist > 1) {
                const force = (1 - dist / radius) * strength * 0.05;
                if (att.type === 'magnetic') {
                  const magForce = force / distSq;
                  ax += (dx / dist) * magForce * 100;
                  ay += (dy / dist) * magForce * 100;
                } else {
                  ax += (dx / dist) * force;
                  ay += (dy / dist) * force;
                }
              }
            });

            if (flowField) {
              const scale = flowField.scale ?? 0.01;
              const force = flowField.force ?? 0.2;
              ax += Math.sin(p.y * scale + t) * force;
              ay += Math.cos(p.x * scale + t) * force;
            }

            const mouseForce = layer.interaction?.mouseForce;
            if (mouseForce && isMouseActive) {
              const strength = mouseForce.strength ?? 100;
              const radius = mouseForce.radius ?? 150;
              const dx = mouseX - p.x;
              const dy = mouseY - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < radius && dist > 1) {
                const pct = 1 - dist / radius;
                const force = pct * strength * 0.02;
                if (mouseForce.type === 'repel') {
                  ax -= (dx / dist) * force;
                  ay -= (dy / dist) * force;
                } else {
                  ax += (dx / dist) * force;
                  ay += (dy / dist) * force;
                }
              }
            }

            p.vx += ax;
            p.vy += ay;
            p.vx += (Math.random() - 0.5) * drift;

            p.vx *= 0.98;
            p.vy *= 0.98;

            p.x += p.vx;
            p.y += p.vy;

            const lifeRatio = p.life / p.maxLife;
            let opacity = p.alpha;
            if (lifeRatio < 0.1) opacity *= lifeRatio / 0.1;
            else if (lifeRatio > 0.8) opacity *= (1 - lifeRatio) / 0.2;

            if (p.life >= p.maxLife || p.y < -30 || p.y > height + 30 || p.x < -30 || p.x > width + 30) {
              if (sys.particles.length <= activeCount) {
                sys.particles[i] = spawnParticle(sys);
              } else {
                sys.particles.splice(i, 1);
              }
              continue;
            }

            const particleVars = { ...vars, x: p.x, y: p.y, life: p.life };

            let size = p.size;
            if (layer.particle?.size) {
              size = getExpr(layer.particle.size)(particleVars);
            }
            let color = p.color;
            if (layer.particle?.color) {
              color = evaluateColor(layer.particle.color, particleVars);
            }

            if (glowEffect) {
              const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
              glow.addColorStop(0, color);
              glow.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.save();
              ctx.globalAlpha = Math.max(0, opacity * 0.28);
              ctx.fillStyle = glow;
              ctx.beginPath();
              ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            ctx.globalAlpha = Math.max(0, opacity);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // 4. Custom Renderer JavaScript execution
        else if (layer.type === 'custom' && layer.code) {
          try {
            if (!(layer as any)._compiledFn) {
              (layer as any)._compiledFn = new Function('ctx', 'w', 'h', 't', 'vars', `(${layer.code})(ctx, w, h, t, vars);`);
            }
            (layer as any)._compiledFn(ctx, width, height, t, vars);
          } catch (err) {
            // Ignore custom loop error to prevent frame lock
          }
        }
      });

      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      injectedStyles.forEach(s => {
        if (s.parentElement) s.parentElement.removeChild(s);
      });
      injectedHtmlContainers.forEach(c => {
        if (c.parentElement) c.parentElement.removeChild(c);
      });
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameId);
    };
  }, [type, customConfig]);

  return <canvas ref={canvasRef} className="clashgram-bg-animation" />;
};

export default memo(BackgroundAnimation);
