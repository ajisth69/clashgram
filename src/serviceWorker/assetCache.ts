import { ASSET_CACHE_NAME } from '../config';
import { pause } from '../util/schedulers';

declare const self: ServiceWorkerGlobalScope;

const TIMEOUT = 3000;

export async function respondWithCacheNetworkFirst(e: FetchEvent) {
  try {
    const remote = await withTimeout(() => fetch(e.request), TIMEOUT);
    if (remote && remote.ok) {
      const toCache = remote.clone();
      try {
        const cache = await self.caches.open(ASSET_CACHE_NAME);
        await cache?.put(e.request, toCache);
      } catch (cacheErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to write response to asset cache:', cacheErr);
      }
      return remote;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Network-first fetch failed, falling back to cache:', err);
  }

  return respondWithCache(e);
}

export async function respondWithCache(e: FetchEvent) {
  let cache: Cache | undefined;
  let cached: Response | undefined;

  try {
    const cacheResult = await withTimeout(async () => {
      const c = await self.caches.open(ASSET_CACHE_NAME);
      const m = await c.match(e.request);
      return { cache: c, cached: m };
    }, TIMEOUT);

    cache = cacheResult?.cache;
    cached = cacheResult?.cached;
  } catch (cacheErr) {
    // eslint-disable-next-line no-console
    console.error('Failed to open or match cache entry:', cacheErr);
  }

  if (cache && cached) {
    if (cached.ok) {
      return cached;
    } else {
      try {
        await cache.delete(e.request);
      } catch (delErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete invalid cached response:', delErr);
      }
    }
  }

  try {
    const remote = await fetch(e.request);
    if (remote.ok && cache) {
      try {
        await cache.put(e.request, remote.clone());
      } catch (putErr) {
        // eslint-disable-next-line no-console
        console.error('Failed to cache successful remote response:', putErr);
      }
    }
    return remote;
  } catch (fetchErr) {
    // eslint-disable-next-line no-console
    console.error('Final fallback asset fetch failed:', fetchErr);
    
    // Return a custom 503 response instead of throwing unhandled exceptions that crash the Service Worker context
    return new Response('Network connection lost and no cached copy is available.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    });
  }
}

async function withTimeout<T>(cb: () => Promise<T>, timeout: number): Promise<T | undefined> {
  let isResolved = false;

  try {
    return await Promise.race([
      pause(timeout).then(() => (isResolved ? undefined : Promise.reject(new Error('TIMEOUT')))),
      cb(),
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Operation timeout occurred:', err);
    return undefined;
  } finally {
    isResolved = true;
  }
}

export function clearAssetCache() {
  return self.caches.delete(ASSET_CACHE_NAME);
}
