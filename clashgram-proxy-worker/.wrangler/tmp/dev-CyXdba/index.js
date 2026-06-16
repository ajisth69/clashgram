var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-h6JBD9/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/index.js
var TELEGRAM_CIDRS = [
  { ip: [149, 154, 160, 0], mask: 20 },
  { ip: [91, 108, 0, 0], mask: 16 }
];
var totalConnections = 0;
var activeConnections = 0;
var peakConnections = 0;
var bandwidthReceived = 0;
var bandwidthSent = 0;
var connectionErrors = 0;
var workerStartTime = Date.now();
function ipInSandbox(ipParts, rangeParts, mask) {
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  const maskNum = mask === 0 ? 0 : ~0 << 32 - mask;
  return (ipNum & maskNum) === (rangeNum & maskNum);
}
__name(ipInSandbox, "ipInSandbox");
function isTelegramAllowed(target) {
  if (!target)
    return false;
  const cleanTarget = target.trim().toLowerCase();
  if (cleanTarget.endsWith(".telegram.org") || cleanTarget === "telegram.org") {
    return true;
  }
  if (cleanTarget.endsWith(".web.telegram.org")) {
    return true;
  }
  const parts = cleanTarget.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    for (const cidr of TELEGRAM_CIDRS) {
      if (ipInSandbox(parts, cidr.ip, cidr.mask)) {
        return true;
      }
    }
  }
  return false;
}
__name(isTelegramAllowed, "isTelegramAllowed");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/ping") {
      return new Response(JSON.stringify({ status: "ok", time: Date.now() }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (url.pathname === "/location") {
      return new Response(JSON.stringify({
        city: request.cf?.city || "Unknown",
        region: request.cf?.region || "Unknown",
        country: request.cf?.country || "Unknown",
        colo: request.cf?.colo || "Unknown"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (url.pathname === "/metrics") {
      return new Response(JSON.stringify({
        uptime_seconds: Math.floor((Date.now() - workerStartTime) / 1e3),
        active_connections: activeConnections,
        total_connections: totalConnections,
        peak_connections: peakConnections,
        bandwidth_received_bytes: bandwidthReceived,
        bandwidth_sent_bytes: bandwidthSent,
        bandwidth_total_bytes: bandwidthReceived + bandwidthSent,
        connection_errors: connectionErrors
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (url.pathname === "/" && request.headers.get("Upgrade") !== "websocket") {
      return new Response(getDashboardHTML(request.cf), {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }
    if (request.headers.get("Upgrade") === "websocket") {
      return handleWebSocketProxy(request, url);
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleWebSocketProxy(request, url) {
  const ip = url.searchParams.get("ip");
  const port = url.searchParams.get("port") || "443";
  const path = url.pathname;
  if (!ip) {
    return new Response("Missing target ip parameter", { status: 400 });
  }
  if (!isTelegramAllowed(ip)) {
    connectionErrors++;
    return new Response("Forbidden: target not in allowlist", { status: 403 });
  }
  const destProtocol = port === "443" ? "wss" : "ws";
  const destUrl = `${destProtocol}://${ip}:${port}${path}${url.search}`;
  try {
    const serverWS = new WebSocket(destUrl);
    const [clientWS, workerWS] = new WebSocketPair();
    workerWS.accept();
    totalConnections++;
    activeConnections++;
    if (activeConnections > peakConnections) {
      peakConnections = activeConnections;
    }
    let isServerWsOpen = false;
    const messageQueue = [];
    serverWS.addEventListener("open", () => {
      isServerWsOpen = true;
      while (messageQueue.length > 0) {
        try {
          serverWS.send(messageQueue.shift());
        } catch (err) {
          connectionErrors++;
        }
      }
    });
    workerWS.addEventListener("message", (event) => {
      try {
        const size = event.data instanceof ArrayBuffer ? event.data.byteLength : new Blob([event.data]).size;
        bandwidthReceived += size;
        if (isServerWsOpen) {
          serverWS.send(event.data);
        } else {
          messageQueue.push(event.data);
        }
      } catch (err) {
        connectionErrors++;
      }
    });
    serverWS.addEventListener("message", (event) => {
      try {
        const size = event.data instanceof ArrayBuffer ? event.data.byteLength : new Blob([event.data]).size;
        bandwidthSent += size;
        workerWS.send(event.data);
      } catch (err) {
        connectionErrors++;
      }
    });
    const closeConnection = /* @__PURE__ */ __name(() => {
      activeConnections = Math.max(0, activeConnections - 1);
      try {
        workerWS.close();
      } catch (_) {
      }
      try {
        serverWS.close();
      } catch (_) {
      }
    }, "closeConnection");
    workerWS.addEventListener("close", closeConnection);
    serverWS.addEventListener("close", closeConnection);
    workerWS.addEventListener("error", closeConnection);
    serverWS.addEventListener("error", closeConnection);
    return new Response(null, {
      status: 101,
      webSocket: clientWS
    });
  } catch (err) {
    connectionErrors++;
    return new Response(`Proxy error: ${err.message}`, { status: 502 });
  }
}
__name(handleWebSocketProxy, "handleWebSocketProxy");
function getDashboardHTML(cf) {
  const city = cf?.city || "Unknown";
  const country = cf?.country || "Unknown";
  const colo = cf?.colo || "Unknown";
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
  <\/script>

</body>
</html>`;
}
__name(getDashboardHTML, "getDashboardHTML");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-h6JBD9/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-h6JBD9/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
