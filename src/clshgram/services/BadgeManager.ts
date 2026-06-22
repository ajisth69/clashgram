// Clashgram User Badge Database Manager
// Synchronizes badge mappings from API and caches them locally with ETag support.

const ENDPOINT = '/api/user-badges/database';
const STORAGE_KEY_DB = 'clashgram_badge_db';
const STORAGE_KEY_ETAG = 'clashgram_badge_etag';

type BadgeDatabase = Record<string, string[]>;
type Listener = () => void;

class BadgeManager {
  private db: BadgeDatabase = {};
  private etag: string | null = null;
  private listeners: Set<Listener> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Loads cached database and ETag from local storage.
   */
  private loadFromStorage() {
    try {
      const cachedDb = localStorage.getItem(STORAGE_KEY_DB);
      const cachedEtag = localStorage.getItem(STORAGE_KEY_ETAG);

      if (cachedDb) {
        this.db = JSON.parse(cachedDb);
      }
      if (cachedEtag) {
        this.etag = cachedEtag;
      }
    } catch (e) {
      console.error('[BadgeManager] Error loading cache from storage', e);
    }
  }

  /**
   * Initializes the manager by performing background synchronization.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (this.etag) {
        headers['If-None-Match'] = this.etag;
      }

      console.log('[BadgeManager] Fetching badge database status...');
      const response = await fetch(ENDPOINT, {
        method: 'GET',
        headers,
      });

      if (response.status === 304) {
        console.log('[BadgeManager] Database is unmodified (304). Using cached data.');
        return;
      }

      if (response.status === 200) {
        const data = await response.json();
        
        // Update database state
        this.db = data || {};
        
        // Update ETag if provided in headers
        const responseEtag = response.headers.get('ETag') || response.headers.get('etag');
        if (responseEtag) {
          this.etag = responseEtag;
          localStorage.setItem(STORAGE_KEY_ETAG, responseEtag);
        } else {
          this.etag = null;
          localStorage.removeItem(STORAGE_KEY_ETAG);
        }

        // Cache the DB locally
        localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(this.db));
        console.log('[BadgeManager] Database successfully synchronized (200).');

        // Notify listeners
        this.notifyListeners();
        return;
      }

      throw new Error(`Unexpected server response: ${response.status}`);
    } catch (error) {
      console.error('[BadgeManager] Sync failed. Falling back to cached local storage.', error);
    }
  }

  /**
   * Retrieves a user's badges synchronously in constant time.
   * Returns an empty array if the user has no badges.
   */
  public getUserBadges(userId: string | number): string[] {
    const badges = this.db[String(userId)];
    return Array.isArray(badges) ? badges : [];
  }

  /**
   * Subscribes a callback to database update events.
   * Returns an unsubscribe cleanup function.
   */
  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[BadgeManager] Listener notification error', e);
      }
    });
  }
}

// Singleton instance
const badgeManagerInstance = new BadgeManager();

// Automatically trigger sync when this module is loaded
badgeManagerInstance.initialize();

export default badgeManagerInstance;
export { BadgeManager };
