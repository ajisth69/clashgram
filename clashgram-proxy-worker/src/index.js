// Clashgram WebSocket Proxy Worker
// Secure, stateless MTProto routing for Clashgram client

const TELEGRAM_CIDRS = [
  { ip: [149, 154, 160, 0], mask: 20 },
  { ip: [91, 108, 0, 0], mask: 16 }
];

// In-memory stats (reset when the worker container is recycled)
let totalConnections = 0;
let activeConnections = 0;
let peakConnections = 0;
let bandwidthReceived = 0;
let bandwidthSent = 0;
let connectionErrors = 0;
const workerStartTime = Date.now();

function ipInSandbox(ipParts, rangeParts, mask) {
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  const maskNum = mask === 0 ? 0 : (~0 << (32 - mask));
  return (ipNum & maskNum) === (rangeNum & maskNum);
}

function isTelegramAllowed(target) {
  if (!target) return false;
  
  const cleanTarget = target.trim().toLowerCase();
  
  // Allow Telegram subdomains
  if (cleanTarget.endsWith('.telegram.org') || cleanTarget === 'telegram.org') {
    return true;
  }
  
  if (cleanTarget.endsWith('.web.telegram.org')) {
    return true;
  }
  
  // Parse as IPv4
  const parts = cleanTarget.split('.').map(Number);
  if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    for (const cidr of TELEGRAM_CIDRS) {
      if (ipInSandbox(parts, cidr.ip, cidr.mask)) {
        return true;
      }
    }
  }
  
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Healthcheck / Ping endpoint
    if (url.pathname === '/ping') {
      return new Response(JSON.stringify({ status: 'ok', time: Date.now() }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Geolocation endpoint
    if (url.pathname === '/location') {
      return new Response(JSON.stringify({
        city: request.cf?.city || 'Unknown',
        region: request.cf?.region || 'Unknown',
        country: request.cf?.country || 'Unknown',
        colo: request.cf?.colo || 'Unknown'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Telemetry / Metrics endpoint
    if (url.pathname === '/metrics') {
      return new Response(JSON.stringify({
        uptime_seconds: Math.floor((Date.now() - workerStartTime) / 1000),
        active_connections: activeConnections,
        total_connections: totalConnections,
        peak_connections: peakConnections,
        bandwidth_received_bytes: bandwidthReceived,
        bandwidth_sent_bytes: bandwidthSent,
        bandwidth_total_bytes: bandwidthReceived + bandwidthSent,
        connection_errors: connectionErrors
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Serve gorgeous glassmorphic dashboard on root
    if (url.pathname === '/' && request.headers.get('Upgrade') !== 'websocket') {
      return new Response(getDashboardHTML(request.cf), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }

    // WebSocket connection proxying
    if (request.headers.get('Upgrade') === 'websocket') {
      return handleWebSocketProxy(request, url);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleWebSocketProxy(request, url) {
  const ip = url.searchParams.get('ip');
  const port = url.searchParams.get('port') || '443';
  const path = url.pathname;

  if (!ip) {
    return new Response('Missing target ip parameter', { status: 400 });
  }

  if (!isTelegramAllowed(ip)) {
    connectionErrors++;
    return new Response('Forbidden: target not in allowlist', { status: 403 });
  }

  const destProtocol = port === '443' ? 'wss' : 'ws';
  const destUrl = `${destProtocol}://${ip}:${port}${path}${url.search}`;

  try {
    const headers = new Headers(request.headers);
    headers.set('Host', `${ip}:${port}`);

    // Call target websocket server
    const targetResponse = await fetch(destUrl, {
      headers,
      method: 'GET'
    });

    if (targetResponse.status !== 101) {
      connectionErrors++;
      return new Response(`Target handshake failed: ${targetResponse.status}`, { status: 502 });
    }

    const serverWS = targetResponse.webSocket;
    if (!serverWS) {
      connectionErrors++;
      return new Response('Target response did not contain webSocket object', { status: 502 });
    }

    // Setup client websocket pair
    const [clientWS, workerWS] = new WebSocketPair();
    workerWS.accept();
    serverWS.accept();

    // Track connections & bandwidth
    totalConnections++;
    activeConnections++;
    if (activeConnections > peakConnections) {
      peakConnections = activeConnections;
    }

    workerWS.addEventListener('message', (event) => {
      try {
        const size = event.data instanceof ArrayBuffer ? event.data.byteLength : new Blob([event.data]).size;
        bandwidthReceived += size;
        serverWS.send(event.data);
      } catch (err) {
        connectionErrors++;
      }
    });

    serverWS.addEventListener('message', (event) => {
      try {
        const size = event.data instanceof ArrayBuffer ? event.data.byteLength : new Blob([event.data]).size;
        bandwidthSent += size;
        workerWS.send(event.data);
      } catch (err) {
        connectionErrors++;
      }
    });

    const closeConnection = () => {
      activeConnections = Math.max(0, activeConnections - 1);
      try { workerWS.close(); } catch (_) {}
      try { serverWS.close(); } catch (_) {}
    };

    workerWS.addEventListener('close', closeConnection);
    serverWS.addEventListener('close', closeConnection);
    workerWS.addEventListener('error', closeConnection);
    serverWS.addEventListener('error', closeConnection);

    return new Response(null, {
      status: 101,
      webSocket: clientWS
    });

  } catch (err) {
    connectionErrors++;
    return new Response(`Proxy error: ${err.message}`, { status: 502 });
  }
}

function getDashboardHTML(cf) {
  const city = cf?.city || 'Unknown';
  const country = cf?.country || 'Unknown';
  const colo = cf?.colo || 'Unknown';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clashgram WebSocket Proxy</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #34d399;
      --bg: #090b10;
      --card-bg: rgba(17, 22, 34, 0.65);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }

    /* Vibrant background gradients */
    body::before {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, rgba(0,0,0,0) 70%);
      top: -100px;
      left: -100px;
      z-index: 1;
    }

    body::after {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(0,0,0,0) 70%);
      bottom: -100px;
      right: -100px;
      z-index: 1;
    }

    .container {
      width: 100%;
      max-width: 520px;
      padding: 2rem;
      z-index: 10;
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: 18px;
      margin-bottom: 1.5rem;
      color: var(--primary);
    }

    h1 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(52, 211, 153, 0.1);
      color: var(--primary);
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid rgba(52, 211, 153, 0.2);
      margin-bottom: 2rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--primary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--primary);
      animation: pulse 2s infinite;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      text-align: left;
      margin-bottom: 2rem;
    }

    .stat-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.2rem;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text);
    }

    .latency-section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
    }

    .latency-info h3 {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .latency-val {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary);
    }

    .ping-btn {
      background: var(--primary);
      color: #0d1527;
      border: none;
      border-radius: 12px;
      padding: 0.6rem 1.2rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ping-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .footer {
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .highlight {
      color: var(--primary);
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="card">
      <div class="header-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      
      <h1>Clashgram Proxy</h1>
      <p class="subtitle">Secure WebSocket proxy routing for MTProto</p>
      
      <div class="status-badge">
        <div class="status-dot"></div>
        Active & Online
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">Server Location</div>
          <div class="stat-value">${city}, ${country}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Cloudflare Edge</div>
          <div class="stat-value">${colo}</div>
        </div>
      </div>
      
      <div class="latency-section">
        <div class="latency-info">
          <h3>Your Latency</h3>
          <div class="latency-val" id="latency-val">-- ms</div>
        </div>
        <button class="ping-btn" id="ping-btn" onclick="measurePing()">Test Ping</button>
      </div>
      
      <p class="footer">Powered by Cloudflare Edge &bull; Securely hiding your IP</p>
    </div>
  </div>

  <script>
    async function measurePing() {
      const btn = document.getElementById('ping-btn');
      const val = document.getElementById('latency-val');
      btn.disabled = true;
      btn.textContent = '...';
      
      const start = performance.now();
      try {
        const res = await fetch('/ping?t=' + Date.now());
        if (res.ok) {
          const diff = Math.round(performance.now() - start);
          val.textContent = diff + ' ms';
        } else {
          val.textContent = 'Error';
        }
      } catch (err) {
        val.textContent = 'Offline';
      }
      btn.disabled = false;
      btn.textContent = 'Test Ping';
    }
    
    // Auto measure on load
    measurePing();
  </script>

</body>
</html>`;
}
