// ─────────────────────────────────────────────────────────────
// CLASHGRAM — MTProto Telemetry Proxy Worker
// Cloudflare Worker: WebSocket proxy + embedded dashboard
// ─────────────────────────────────────────────────────────────

let BOOT_TIME = 0;
let bytesReceived = 0;
let bytesSent = 0;
let activeConnections = 0;
let peakConnections = 0;
let totalConnections = 0;
let connectionErrors = 0;
let lastConnectionTime = 0;

const UPSTREAM_TIMEOUT_MS = 30000;

// Permitted domains — strict allowlist prevents open-proxy abuse
const PERMITTED_DOMAINS = [
  "web.telegram.org",
  "telegram.org",
  "telegram.dog",
  "t.me"
];

/**
 * Decode URL-safe Base64 strings for obfuscated target routing.
 */
function safeBase64Decode(str) {
  try {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(normalized);
  } catch (e) {
    return null;
  }
}

/**
 * Validates whether the resolved destination belongs to Telegram infrastructure.
 */
function isValidTarget(domain) {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return PERMITTED_DOMAINS.some(a => d === a || d.endsWith('.' + a));
}

// ─────────────────────────────────────────────────────────────
// Dashboard HTML — Pure CSS, zero external framework deps
// ─────────────────────────────────────────────────────────────

const renderDashboard = (uptimeStr) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>clashgram</title>
  <meta name="description" content="Real-time network telemetry dashboard for Clashgram proxy.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg:           #09090b;
      --surface:      #111113;
      --surface-2:    #1a1a1e;
      --border:       #27272a;
      --border-hover: #3f3f46;
      --text:         #fafafa;
      --text-2:       #a1a1aa;
      --text-3:       #71717a;
      --text-4:       #52525b;
      --green:        #34d399;
      --green-dim:    rgba(52,211,153,0.10);
      --blue:         #60a5fa;
      --blue-dim:     rgba(96,165,250,0.10);
      --amber:        #fbbf24;
      --red:          #f87171;
      --radius:       12px;
      --radius-sm:    8px;
      --ease:         cubic-bezier(0.16, 1, 0.3, 1);
    }

    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 32px 20px;
    }

    /* Subtle top ambient glow */
    body::before {
      content: '';
      position: fixed;
      top: -40%; left: -20%; right: -20%;
      height: 80%;
      background: radial-gradient(ellipse at 50% 0%, rgba(52,211,153,0.025) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    .mono { font-family: 'JetBrains Mono', monospace; }

    ::selection { background: rgba(52,211,153,0.25); color: #fff; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

    /* ── Layout ── */
    .shell {
      width: 100%;
      max-width: 960px;
      position: relative;
      z-index: 1;
    }

    /* ── Animations ── */
    @keyframes enter {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.55; transform: scale(0.92); }
    }
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .animate-enter {
      opacity: 0;
      animation: enter 0.55s var(--ease) forwards;
    }

    /* ── Header ── */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      animation-delay: 0s;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .wordmark {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--green);
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse-soft 2.5s ease-in-out infinite;
    }

    /* ── Metrics Strip ── */
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .metric {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.25s ease, transform 0.25s var(--ease);
    }
    .metric:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }
    .metric:nth-child(1) { animation-delay: 0.05s; }
    .metric:nth-child(2) { animation-delay: 0.10s; }
    .metric:nth-child(3) { animation-delay: 0.15s; }
    .metric-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.1;
      color: var(--text);
    }
    .metric-label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-3);
      text-transform: lowercase;
      letter-spacing: 0.03em;
    }

    /* ── Location Bar ── */
    .location-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 16px;
      transition: border-color 0.25s ease;
    }
    .location-bar:hover { border-color: var(--border-hover); }
    .location-bar svg {
      width: 14px; height: 14px;
      color: var(--text-3);
      flex-shrink: 0;
    }
    .location-text {
      font-size: 0.75rem;
      color: var(--text-2);
      font-weight: 500;
    }
    .location-text .loc-highlight {
      color: var(--text);
      font-weight: 600;
    }
    .location-text .loc-colo {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      color: var(--text-3);
      margin-left: 4px;
    }

    /* ── Cards ── */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: border-color 0.25s ease;
    }
    .card:hover { border-color: var(--border-hover); }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-3);
      text-transform: lowercase;
      letter-spacing: 0.03em;
    }
    .card-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.625rem;
      font-weight: 500;
      color: var(--text-4);
    }

    /* ── Traffic Card ── */
    .traffic-row {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }
    .traffic-item { flex: 1; }
    .traffic-dir {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .traffic-arrow {
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;
    }
    .traffic-arrow.down { color: var(--green); }
    .traffic-arrow.up { color: var(--blue); }
    .traffic-label {
      font-size: 0.6875rem;
      color: var(--text-4);
      font-weight: 500;
    }
    .traffic-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
    }
    .traffic-raw {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.625rem;
      color: var(--text-4);
      margin-top: 2px;
      display: block;
    }
    .throughput-track {
      width: 100%;
      height: 3px;
      background: var(--surface-2);
      border-radius: 2px;
      overflow: hidden;
    }
    .throughput-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--green), var(--blue));
      border-radius: 2px;
      transition: width 0.6s var(--ease);
      width: 0%;
    }
    .throughput-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }
    .throughput-label {
      font-size: 0.6875rem;
      color: var(--text-4);
      font-weight: 500;
    }
    .throughput-total {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-2);
    }

    /* ── RTT Chart Card ── */
    .sparkline-wrap {
      width: 100%;
      height: 80px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 8px;
      margin-bottom: 14px;
      overflow: hidden;
    }
    .sparkline-wrap canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .ping-btn {
      width: 100%;
      padding: 9px 0;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-2);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      outline: none;
    }
    .ping-btn:hover {
      background: var(--surface-2);
      border-color: var(--border-hover);
      color: var(--text);
    }
    .ping-btn:active {
      transform: scale(0.98);
    }

    /* ── Endpoint Card ── */
    .endpoint-card {
      margin-bottom: 12px;
      animation-delay: 0.35s;
    }
    .endpoint-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .endpoint-path {
      flex: 1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--green);
      word-break: break-all;
      user-select: all;
      line-height: 1.4;
    }
    .copy-btn {
      flex-shrink: 0;
      width: 30px; height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-3);
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    .copy-btn:hover {
      border-color: var(--border-hover);
      color: var(--text);
      background: var(--surface-2);
    }
    .copy-btn svg { width: 13px; height: 13px; }

    .secure-note {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      background: var(--green-dim);
      border: 1px solid rgba(52,211,153,0.12);
      border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .secure-note svg {
      width: 14px; height: 14px;
      color: var(--green);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .secure-note-text {
      font-size: 0.6875rem;
      color: var(--text-2);
      line-height: 1.5;
    }
    .secure-note-text strong {
      color: var(--text);
      font-weight: 600;
      display: block;
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 2px;
    }

    .api-links {
      display: flex;
      gap: 8px;
    }
    .api-link {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 0;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-3);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .api-link:hover {
      border-color: var(--border-hover);
      color: var(--text);
      background: var(--surface-2);
    }

    /* ── Footer ── */
    footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-size: 0.6875rem;
      color: var(--text-4);
      font-weight: 500;
      animation-delay: 0.4s;
    }
    footer span { display: flex; align-items: center; gap: 6px; }
    .footer-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--text-4);
      opacity: 0.5;
    }

    /* ── Toast ── */
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      padding: 10px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-2);
      pointer-events: auto;
      animation: slide-in 0.35s var(--ease) forwards;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .toast svg {
      width: 14px; height: 14px;
      color: var(--green);
      flex-shrink: 0;
    }
    .toast.exit {
      opacity: 0;
      transform: translateX(16px);
      transition: all 0.3s ease;
    }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      body { padding: 20px 14px; }
      .metrics { grid-template-columns: 1fr; gap: 8px; }
      .grid-2 { grid-template-columns: 1fr; gap: 8px; }
      .metric-value { font-size: 1.25rem; }
      .traffic-value { font-size: 1rem; }
      header { margin-bottom: 28px; }
      footer { flex-wrap: wrap; justify-content: center; gap: 8px; }
    }
  </style>
</head>
<body>

  <!-- Toast container -->
  <div class="toast-container" id="toast-container"></div>

  <div class="shell">
    <!-- Header -->
    <header class="animate-enter">
      <div class="brand">
        <span class="wordmark">clashgram</span>
      </div>
      <div class="status">
        <span class="status-dot"></span>
        <span>connected</span>
      </div>
    </header>

    <!-- Metrics Strip -->
    <div class="metrics">
      <div class="metric animate-enter">
        <span class="metric-value mono" id="uptime">${uptimeStr}</span>
        <span class="metric-label">uptime</span>
      </div>
      <div class="metric animate-enter">
        <span class="metric-value mono" id="active-sockets">0</span>
        <span class="metric-label">streams</span>
      </div>
      <div class="metric animate-enter">
        <span class="metric-value mono" id="latency">&mdash;</span>
        <span class="metric-label">latency</span>
      </div>
    </div>

    <!-- Location Bar -->
    <div class="location-bar animate-enter" style="animation-delay:0.18s" id="location-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <span class="location-text" id="location-text">locating proxy...</span>
    </div>

    <!-- Content Grid -->
    <div class="grid-2">
      <!-- Traffic Card -->
      <div class="card animate-enter" style="animation-delay:0.2s">
        <div class="card-header">
          <span class="card-title">traffic</span>
        </div>
        <div class="traffic-row">
          <div class="traffic-item">
            <div class="traffic-dir">
              <span class="traffic-arrow down">&darr;</span>
              <span class="traffic-label">received</span>
            </div>
            <span class="traffic-value mono" id="bytes-received">0.000 MB</span>
            <span class="traffic-raw" id="bytes-received-raw">&mdash;</span>
          </div>
          <div class="traffic-item">
            <div class="traffic-dir">
              <span class="traffic-arrow up">&uarr;</span>
              <span class="traffic-label">sent</span>
            </div>
            <span class="traffic-value mono" id="bytes-sent">0.000 MB</span>
            <span class="traffic-raw" id="bytes-sent-raw">&mdash;</span>
          </div>
        </div>
        <div class="throughput-track">
          <div class="throughput-fill" id="volume-ratio"></div>
        </div>
        <div class="throughput-meta">
          <span class="throughput-label">total</span>
          <span class="throughput-total mono" id="bytes-total">0.000 MB</span>
        </div>
      </div>

      <!-- RTT Chart Card -->
      <div class="card animate-enter" style="animation-delay:0.25s">
        <div class="card-header">
          <span class="card-title">rtt history</span>
          <span class="card-badge" id="avg-latency">&mdash; ms avg</span>
        </div>
        <div class="sparkline-wrap">
          <canvas id="sparkline-canvas"></canvas>
        </div>
        <button class="ping-btn" id="ping-btn" onclick="measureLatency()">ping</button>
      </div>
    </div>

    <!-- Endpoint Card -->
    <div class="card endpoint-card animate-enter">
      <div class="card-header">
        <span class="card-title">endpoint</span>
      </div>
      <div class="endpoint-row">
        <span class="endpoint-path" id="config-path">resolving...</span>
        <button class="copy-btn" id="copy-btn" onclick="copyConfig()" aria-label="Copy endpoint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div class="secure-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <div class="secure-note-text">
          <strong>encrypted tunnel</strong>
          Headers scrubbed. Routed through Cloudflare edge. Zero tracking metadata.
        </div>
      </div>
      <div class="api-links">
        <a href="/ping" class="api-link">/ping</a>
        <a href="/metrics" class="api-link">/metrics</a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="animate-enter">
      <span>cloudflare edge</span>
      <div class="footer-dot"></div>
      <span>zero-log</span>
      <div class="footer-dot"></div>
      <span>encrypted</span>
    </footer>
  </div>

  <script>
    // ── Init ──
    var host = window.location.host;
    document.getElementById('config-path').innerText = host + '/[ROUTE]';

    // ── Toast ──
    function showToast(msg) {
      var container = document.getElementById('toast-container');
      var el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' + '<span>' + msg + '</span>';
      container.appendChild(el);
      setTimeout(function() {
        el.classList.add('exit');
        setTimeout(function() { el.remove(); }, 300);
      }, 2500);
    }

    // ── Copy ──
    function copyConfig() {
      var text = document.getElementById('config-path').innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() { showToast('copied'); });
      } else {
        var input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('copied');
      }
    }

    // ── Sparkline ──
    var latencyHistory = [];
    var sparkCanvas = document.getElementById('sparkline-canvas');
    var sparkCtx = sparkCanvas.getContext('2d');

    function resizeSparkline() {
      var rect = sparkCanvas.getBoundingClientRect();
      sparkCanvas.width = rect.width * (window.devicePixelRatio || 1);
      sparkCanvas.height = rect.height * (window.devicePixelRatio || 1);
      sparkCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      drawSparkline();
    }

    window.addEventListener('resize', resizeSparkline);
    setTimeout(resizeSparkline, 80);

    function drawSparkline() {
      var w = sparkCanvas.width / (window.devicePixelRatio || 1);
      var h = sparkCanvas.height / (window.devicePixelRatio || 1);
      sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
      if (latencyHistory.length < 2) return;

      var maxV = Math.max.apply(null, latencyHistory);
      var minV = Math.min.apply(null, latencyHistory);
      var range = maxV - minV || 1;
      var pad = 6;
      var step = (w - pad * 2) / (latencyHistory.length - 1);

      // Line
      sparkCtx.beginPath();
      sparkCtx.strokeStyle = '#34d399';
      sparkCtx.lineWidth = 1.5;
      sparkCtx.lineJoin = 'round';
      sparkCtx.lineCap = 'round';

      for (var i = 0; i < latencyHistory.length; i++) {
        var x = pad + i * step;
        var norm = (latencyHistory[i] - minV) / range;
        var y = h - pad - norm * (h - pad * 2);
        if (i === 0) sparkCtx.moveTo(x, y);
        else sparkCtx.lineTo(x, y);
      }
      sparkCtx.stroke();

      // Fill gradient
      sparkCtx.lineTo(pad + (latencyHistory.length - 1) * step, h);
      sparkCtx.lineTo(pad, h);
      sparkCtx.closePath();
      var grad = sparkCtx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(52,211,153,0.08)');
      grad.addColorStop(1, 'rgba(52,211,153,0)');
      sparkCtx.fillStyle = grad;
      sparkCtx.fill();

      // Dot on last point
      var lastX = pad + (latencyHistory.length - 1) * step;
      var lastNorm = (latencyHistory[latencyHistory.length - 1] - minV) / range;
      var lastY = h - pad - lastNorm * (h - pad * 2);
      sparkCtx.beginPath();
      sparkCtx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
      sparkCtx.fillStyle = '#34d399';
      sparkCtx.fill();
    }

    // ── Latency Ping ──
    function measureLatency() {
      var btn = document.getElementById('ping-btn');
      var el = document.getElementById('latency');
      btn.textContent = '...';
      btn.disabled = true;

      var start = performance.now();
      fetch('/ping?t=' + Date.now())
        .then(function(res) {
          var ms = Math.round(performance.now() - start);
          if (res.ok) {
            el.textContent = ms + ' ms';
            el.style.color = ms < 150 ? '#34d399' : ms < 400 ? '#fbbf24' : '#f87171';

            latencyHistory.push(ms);
            if (latencyHistory.length > 30) latencyHistory.shift();

            var sum = 0;
            for (var i = 0; i < latencyHistory.length; i++) sum += latencyHistory[i];
            var avg = Math.round(sum / latencyHistory.length);
            document.getElementById('avg-latency').textContent = avg + ' ms avg';
            drawSparkline();
          } else {
            el.textContent = 'err';
            el.style.color = '#f87171';
          }
          btn.textContent = 'ping';
          btn.disabled = false;
        })
        .catch(function() {
          el.textContent = 'offline';
          el.style.color = '#f87171';
          btn.textContent = 'ping';
          btn.disabled = false;
        });
    }

    // ── Metrics Polling ──
    function fetchMetrics() {
      fetch('/metrics')
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(d) {
          if (!d) return;
          var mbR = d.bandwidth_received_bytes / (1024 * 1024);
          var mbS = d.bandwidth_sent_bytes / (1024 * 1024);
          var mbT = mbR + mbS;

          document.getElementById('bytes-received').textContent = mbR.toFixed(3) + ' MB';
          document.getElementById('bytes-sent').textContent = mbS.toFixed(3) + ' MB';
          document.getElementById('bytes-total').textContent = mbT.toFixed(3) + ' MB';

          document.getElementById('bytes-received-raw').textContent = (d.bandwidth_received_bytes / 1024).toFixed(0) + ' KB';
          document.getElementById('bytes-sent-raw').textContent = (d.bandwidth_sent_bytes / 1024).toFixed(0) + ' KB';

          document.getElementById('active-sockets').textContent = d.active_connections;

          var ratio = Math.min((mbS / Math.max(mbT, 0.001)) * 100, 100);
          document.getElementById('volume-ratio').style.width = ratio + '%';

          var hrs = Math.floor(d.uptime_seconds / 3600);
          var mins = Math.floor((d.uptime_seconds % 3600) / 60);
          var secs = d.uptime_seconds % 60;
          document.getElementById('uptime').textContent =
            String(hrs).padStart(2, '0') + ':' +
            String(mins).padStart(2, '0') + ':' +
            String(secs).padStart(2, '0');
        })
        .catch(function() {});
    }

    // ── Location ──
    function fetchLocation() {
      fetch('/location')
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(loc) {
          if (!loc) return;
          var parts = [];
          if (loc.city) parts.push(loc.city);
          if (loc.region) parts.push(loc.region);
          if (loc.country) parts.push(loc.country);
          var label = parts.length > 0 ? parts.join(', ') : 'Unknown';
          var html = 'proxy at <span class="loc-highlight">' + label + '</span>';
          if (loc.colo) html += '<span class="loc-colo">' + loc.colo + '</span>';
          document.getElementById('location-text').innerHTML = html;
        })
        .catch(function() {
          document.getElementById('location-text').textContent = 'location unavailable';
        });
    }

    // ── Embedded TelemetryHUD Client ──
    var TelemetryHUD = (function() {
      function HUD(workerUrl) {
        this.baseUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
      }

      HUD.prototype.measureLatency = function() {
        var base = this.baseUrl;
        var start = performance.now();
        return fetch(base + '/ping', { cache: 'no-store' })
          .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function(data) {
            return { status: data.status, rtt_ms: Math.round(performance.now() - start) };
          })
          .catch(function(err) {
            return { status: 'offline', rtt_ms: -1, error: err.message };
          });
      };

      HUD.prototype.fetchMetrics = function() {
        return fetch(this.baseUrl + '/metrics', { cache: 'no-store' })
          .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .catch(function() { return null; });
      };

      HUD.prototype.fetchLocation = function() {
        return fetch(this.baseUrl + '/location', { cache: 'no-store' })
          .then(function(res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .catch(function() { return null; });
      };

      HUD.prototype.updateHUD = function() {
        return Promise.all([this.measureLatency(), this.fetchMetrics(), this.fetchLocation()])
          .then(function(results) {
            var ping = results[0];
            var metrics = results[1];
            var loc = results[2];
            return {
              connection: ping.status,
              latency: ping.rtt_ms,
              uptime: metrics ? metrics.uptime_seconds : 0,
              bandwidth: {
                received: metrics ? metrics.bandwidth_received_bytes : 0,
                sent: metrics ? metrics.bandwidth_sent_bytes : 0,
                total: metrics ? metrics.bandwidth_total_bytes : 0
              },
              connections: {
                active: metrics ? metrics.active_connections : 0,
                peak: metrics ? metrics.peak_connections : 0,
                total: metrics ? metrics.total_connections : 0,
                errors: metrics ? metrics.connection_errors : 0
              },
              location: loc
            };
          });
      };

      return HUD;
    })();

    // Expose globally
    window.TelemetryHUD = TelemetryHUD;

    // ── Bootstrap ──
    measureLatency();
    fetchMetrics();
    fetchLocation();
    setInterval(fetchMetrics, 2000);
    setInterval(measureLatency, 8000);
  </script>

</body>
</html>
`;

// ─────────────────────────────────────────────────────────────
// Worker Entry Point
// ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const rawPath = url.pathname.slice(1);

    // ── Dashboard (GET /) ──
    if (url.pathname === '/' || url.pathname === '') {
      if (!BOOT_TIME) BOOT_TIME = Date.now();
      const uptimeSecs = Math.floor((Date.now() - BOOT_TIME) / 1000);
      const h = String(Math.floor(uptimeSecs / 3600)).padStart(2, '0');
      const m = String(Math.floor((uptimeSecs % 3600) / 60)).padStart(2, '0');
      const s = String(uptimeSecs % 60).padStart(2, '0');
      return new Response(renderDashboard(h + ':' + m + ':' + s), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      });
    }

    // ── Ping ──
    if (url.pathname === '/ping' || url.pathname === '/ping-probe') {
      return new Response(JSON.stringify({ status: "online", timestamp: Date.now() }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      });
    }

    // ── Metrics ──
    if (url.pathname === '/metrics') {
      if (!BOOT_TIME) BOOT_TIME = Date.now();
      const uptimeSeconds = Math.floor((Date.now() - BOOT_TIME) / 1000);
      return new Response(JSON.stringify({
        uptime_seconds: uptimeSeconds,
        bandwidth_received_bytes: bytesReceived,
        bandwidth_sent_bytes: bytesSent,
        bandwidth_total_bytes: bytesReceived + bytesSent,
        active_connections: activeConnections,
        peak_connections: peakConnections,
        total_connections: totalConnections,
        connection_errors: connectionErrors,
        last_connection_at: lastConnectionTime || null
      }, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      });
    }

    // ── Location (Cloudflare cf object geo data) ──
    if (url.pathname === '/location') {
      const cf = request.cf || {};
      return new Response(JSON.stringify({
        colo: cf.colo || null,
        country: cf.country || null,
        city: cf.city || null,
        region: cf.region || null,
        timezone: cf.timezone || null,
        latitude: cf.latitude || null,
        longitude: cf.longitude || null,
        asn: cf.asn || null,
        asOrganization: cf.asOrganization || null
      }, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      });
    }

    // ── WebSocket Proxy ──
    if (request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      let resolvedTarget = rawPath;

      // Anti-DPI: decode Base64-obfuscated domain targets
      if (rawPath.endsWith('==') || (!rawPath.includes('.') && rawPath.length > 8)) {
        const decoded = safeBase64Decode(rawPath);
        if (decoded) resolvedTarget = decoded;
      }

      // Separate target host and path
      let targetHost = resolvedTarget;
      let targetPath = '';
      const firstSlashIdx = resolvedTarget.indexOf('/');
      if (firstSlashIdx !== -1) {
        targetHost = resolvedTarget.substring(0, firstSlashIdx);
        targetPath = resolvedTarget.substring(firstSlashIdx);
      }

      if (!isValidTarget(targetHost)) {
        return new Response("Forbidden: target not in allowlist", { status: 403 });
      }

      try {
        const [clientSocket, serverSocket] = new WebSocketPair();
        serverSocket.accept();

        activeConnections++;
        totalConnections++;
        lastConnectionTime = Date.now();
        if (activeConnections > peakConnections) peakConnections = activeConnections;

        const targetUrl = 'https://' + targetHost + targetPath;

        // Clean upstream headers — only send what Telegram needs
        // Do NOT forward client's Host, Origin, Sec-WebSocket-Key, or CF headers
        const upstreamHeaders = new Headers();
        upstreamHeaders.set('Upgrade', 'websocket');
        upstreamHeaders.set('User-Agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        );
        // Telegram always requires 'binary' subprotocol
        upstreamHeaders.set('Sec-WebSocket-Protocol', 'binary');

        // Upstream connection with timeout
        const upstreamFetch = fetch(targetUrl, {
          headers: upstreamHeaders,
        });
        let timeoutId;
        const timeoutRace = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('upstream_timeout')), UPSTREAM_TIMEOUT_MS);
        });

        let upstreamResponse;
        try {
          upstreamResponse = await Promise.race([upstreamFetch, timeoutRace]);
        } catch (timeoutErr) {
          activeConnections = Math.max(0, activeConnections - 1);
          connectionErrors++;
          try { serverSocket.close(1001, 'Upstream timeout'); } catch (_) {}
          return new Response("Gateway Timeout: upstream did not respond in time", { status: 504 });
        } finally {
          clearTimeout(timeoutId);
        }

        const upstreamSocket = upstreamResponse.webSocket;
        if (!upstreamSocket) {
          activeConnections = Math.max(0, activeConnections - 1);
          connectionErrors++;
          try { serverSocket.close(1002, 'No upstream WebSocket'); } catch (_) {}
          return new Response("Bad Gateway: upstream handshake failed", { status: 502 });
        }
        upstreamSocket.accept();

        // Cleanup — declared BEFORE event listeners that reference it
        let isCleanedUp = false;
        const safeCleanup = (code, reason) => {
          if (isCleanedUp) return;
          isCleanedUp = true;
          activeConnections = Math.max(0, activeConnections - 1);
          const closeCode = (code >= 1000 && code <= 4999) ? code : 1000;
          const closeReason = reason || '';
          try { serverSocket.close(closeCode, closeReason); } catch (_) {}
          try { upstreamSocket.close(closeCode, closeReason); } catch (_) {}
        };

        // Client → Upstream
        serverSocket.addEventListener('message', (event) => {
          try {
            if (upstreamSocket.readyState === 1) {
              upstreamSocket.send(event.data);
              const len = event.data.byteLength || event.data.length || 0;
              bytesSent += len;
            }
          } catch (_) {
            safeCleanup(1011, 'Forward error');
          }
        });

        // Upstream → Client
        upstreamSocket.addEventListener('message', (event) => {
          try {
            if (serverSocket.readyState === 1) {
              serverSocket.send(event.data);
              const len = event.data.byteLength || event.data.length || 0;
              bytesReceived += len;
            }
          } catch (_) {
            safeCleanup(1011, 'Relay error');
          }
        });

        // Close code forwarding
        serverSocket.addEventListener('close', (e) => safeCleanup(e.code || 1000, e.reason));
        serverSocket.addEventListener('error', () => safeCleanup(1006, 'Client error'));
        upstreamSocket.addEventListener('close', (e) => safeCleanup(e.code || 1000, e.reason));
        upstreamSocket.addEventListener('error', () => safeCleanup(1006, 'Upstream error'));

        // Echo the negotiated subprotocol back to the client
        const responseHeaders = new Headers();
        const requestedProtocol = request.headers.get('Sec-WebSocket-Protocol');
        if (requestedProtocol) {
          responseHeaders.set('Sec-WebSocket-Protocol', requestedProtocol.split(',')[0].trim());
        }

        return new Response(null, { status: 101, webSocket: clientSocket, headers: responseHeaders });

      } catch (err) {
        connectionErrors++;
        return new Response('Internal error: ' + err.message, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
