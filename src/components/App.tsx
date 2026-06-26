import { useEffect, useLayoutEffect } from '../lib/teact/teact';
import { getActions, getGlobal, withGlobal } from '../global';

import type { GlobalState } from '../global/types';
import type { ThemeKey } from '../types';
import type { UiLoaderPage } from './common/UiLoader';

import { DARK_THEME_BG_COLOR, INACTIVE_MARKER, LIGHT_THEME_BG_COLOR, PAGE_TITLE, PAGE_TITLE_TAURI, SESSION_ACCOUNT_PREFIX } from '../config';
import { forceMutation } from '../lib/fasterdom/stricterdom.ts';
import { selectActionMessageBg, selectTabState, selectTheme } from '../global/selectors';
import { selectSharedSettings } from '../global/selectors/sharedState';
import { IS_TAURI } from '../util/browser/globalEnvironment';
import { IS_INSTALL_PROMPT_SUPPORTED, PLATFORM_ENV } from '../util/browser/windowEnvironment';
import buildClassName from '../util/buildClassName';
import { applyClashgramGlassTheme } from '../util/clashgramGlass';
import { setupBeforeInstallPrompt } from '../util/installPrompt';
import { ACCOUNT_SLOT, getAccountsInfo, getAccountSlotUrl, reorganizeAccountSlots } from '../util/multiaccount';
import { hasEncryptedSession } from '../util/passcode';
import { getInitialLocationHash, parseInitialLocationHash } from '../util/routing';
import { checkSessionLocked, hasStoredSession } from '../util/sessions';
import { updateSizes } from '../util/windowSize';
import { callApi } from '../api/gramjs';

import useTauriDrag from '../hooks/tauri/useTauriDrag';
import useAppLayout from '../hooks/useAppLayout';
import usePrevious from '../hooks/usePrevious';
import { useSignalEffect } from '../hooks/useSignalEffect';
import { getIsInBackground } from '../hooks/window/useBackgroundMode';

import Auth from './auth/Auth';
import ClashgramExportModal from './common/ClashgramExportModal';
import ClashgramPasscodeModal from './common/ClashgramPasscodeModal';
import ErrorBoundary from './common/ErrorBoundary';
import Notifications from './common/Notifications';
import UiLoader from './common/UiLoader';
import AppInactive from './main/AppInactive';
import LockScreen from './main/LockScreen.async';
import Main from './main/Main.async';
import Transition from './ui/Transition';

import styles from './App.module.scss';

type StateProps = {
  currentUserId?: string;
  authState: GlobalState['auth']['state'];
  isScreenLocked?: boolean;
  hasPasscode?: boolean;
  inactiveReason?: 'auth' | 'otherClient';
  hasWebAuthTokenFailed?: boolean;
  isTestServer?: boolean;
  theme: ThemeKey;
  actionMessageBg?: string;
  clashgramNativeGlass?: boolean;
  clashgramNativeGlassColorValue?: number;
  clashgramNativeGlassOpacityValue?: number;
  clashgramCustomFont?: string;
};

enum AppScreens {
  auth,
  main,
  lock,
  inactive,
}

const TRANSITION_RENDER_COUNT = Object.keys(AppScreens).length / 2;
const ACTIVE_PAGE_TITLE = IS_TAURI ? PAGE_TITLE_TAURI : PAGE_TITLE;
const INACTIVE_PAGE_TITLE = `${ACTIVE_PAGE_TITLE} ${INACTIVE_MARKER}`;

const App = ({
  currentUserId,
  authState,
  isScreenLocked,
  hasPasscode,
  inactiveReason,
  hasWebAuthTokenFailed,
  isTestServer,
  theme,
  actionMessageBg,
  clashgramNativeGlass,
  clashgramNativeGlassColorValue,
  clashgramNativeGlassOpacityValue,
  clashgramCustomFont,
}: StateProps) => {
  const { isMobile } = useAppLayout();
  const isMobileOs = PLATFORM_ENV === 'iOS' || PLATFORM_ENV === 'Android';

  useEffect(() => {
    if (IS_INSTALL_PROMPT_SUPPORTED) {
      setupBeforeInstallPrompt();
    }
  }, []);

  useEffect(() => {
    const initSlots = async () => {
      const hash = getInitialLocationHash();
      const isLogin = hash.includes('login');
      if (isLogin) {
        return;
      }

      const nextSlot = await reorganizeAccountSlots();
      if (nextSlot !== undefined) {
        const nextUrl = new URL(getAccountSlotUrl(nextSlot));
        if (hash) nextUrl.hash = hash;
        window.location.replace(nextUrl.toString());
        return;
      }
      // If there is no stored session on first slot, navigate to any other slot with stored session
      if (!hasStoredSession() && !ACCOUNT_SLOT && !hash) {
        const accounts = getAccountsInfo();
        Object.keys(accounts)
          .map(Number)
          .sort((a, b) => b - a)
          .forEach((key) => {
            const slot = Number(key);
            const account = accounts[slot];
            if (account) {
              const url = getAccountSlotUrl(slot);
              window.location.replace(`${url}#${hash || 'login'}`);
            }
          });
      }
    };

    initSlots();

    // TODO[Passcode]: Remove when multiacc passcode is implemented
    const checkMultiaccPasscode = async () => {
      if (checkSessionLocked() && ACCOUNT_SLOT && await hasEncryptedSession()) {
        const url = getAccountSlotUrl(1);
        window.location.replace(url);
      }
    };
    checkMultiaccPasscode();
  }, []);

  useEffect(() => {
    if (!currentUserId) return undefined;

    function handleStorageChange(e: StorageEvent) {
      if (e.key && !e.key.startsWith(SESSION_ACCOUNT_PREFIX)) return;

      const accounts = getAccountsInfo();
      const slot = Object.entries(accounts).find(([_, info]) => info.userId === currentUserId)?.[0];
      if (slot) {
        const targetSlot = Number(slot);
        const currentSlot = ACCOUNT_SLOT || 1;
        if (targetSlot !== currentSlot) {
          const nextUrl = new URL(getAccountSlotUrl(targetSlot));
          if (window.location.hash) nextUrl.hash = window.location.hash;
          window.location.replace(nextUrl.toString());
        }
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserId]);

  // Prevent drop on elements that do not accept it
  useEffect(() => {
    const body = document.body;
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;
      if (!(e.target as HTMLElement).dataset.dropzone) {
        e.dataTransfer.dropEffect = 'none';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    body.addEventListener('drop', handleDrop);
    body.addEventListener('dragover', handleDrag);
    body.addEventListener('dragenter', handleDrag);

    return () => {
      body.removeEventListener('drop', handleDrop);
      body.removeEventListener('dragover', handleDrag);
      body.removeEventListener('dragenter', handleDrag);
    };
  }, []);

  // return <Test />;

  let activeKey: AppScreens;
  let page: UiLoaderPage | undefined;

  if (inactiveReason) {
    activeKey = AppScreens.inactive;
  } else if (isScreenLocked) {
    page = 'lock';
    activeKey = AppScreens.lock;
  } else if (authState) {
    switch (authState) {
      case 'authorizationStateWaitPhoneNumber':
        page = 'authPhoneNumber';
        activeKey = AppScreens.auth;
        break;
      case 'authorizationStateWaitCode':
        page = 'authCode';
        activeKey = AppScreens.auth;
        break;
      case 'authorizationStateWaitPassword':
        page = 'authPassword';
        activeKey = AppScreens.auth;
        break;
      case 'authorizationStateWaitRegistration':
        activeKey = AppScreens.auth;
        break;
      case 'authorizationStateWaitQrCode':
        page = 'authQrCode';
        activeKey = AppScreens.auth;
        break;
      case 'authorizationStateClosed':
      case 'authorizationStateClosing':
      case 'authorizationStateLoggingOut':
      case 'authorizationStateReady':
        page = 'main';
        activeKey = AppScreens.main;
        break;
    }
  } else if (hasStoredSession()) {
    page = 'main';
    activeKey = AppScreens.main;
  } else if (hasPasscode) {
    activeKey = AppScreens.lock;
  } else {
    page = isMobileOs ? 'authPhoneNumber' : 'authQrCode';
    activeKey = AppScreens.auth;
  }

  if (activeKey !== AppScreens.lock
    && activeKey !== AppScreens.inactive
    && activeKey !== AppScreens.main
    && parseInitialLocationHash()?.tgWebAuthToken
    && !hasWebAuthTokenFailed) {
    page = 'main';
    activeKey = AppScreens.main;
  }

  useEffect(() => {
    updateSizes();
  }, []);

  useEffect(() => {
    if (inactiveReason) {
      document.title = INACTIVE_PAGE_TITLE;
    } else {
      document.title = ACTIVE_PAGE_TITLE;
    }
  }, [inactiveReason]);

  useEffect(() => {
    let pingTimeout: ReturnType<typeof setTimeout> | undefined;
    let lastCheckAt = 0;

    const handleReconnectCheck = () => {
      const now = Date.now();
      if (now - lastCheckAt < 15000) return; // Throttle checks to once per 15 seconds
      lastCheckAt = now;

      const global = getGlobal();
      const actions = getActions();

      // Don't attempt reconnects during active login flow — there's no session to reconnect to,
      // and calling initApi would restart the auth handshake from scratch.
      if (global.auth.state && global.auth.state !== 'authorizationStateReady' && !hasStoredSession()) {
        return;
      }

      // If already connecting, the transport layer is handling reconnection — don't stack another one.
      // Only trigger a full reconnect for broken connections or genuinely stale states.
      if (global.connectionState === 'connectionStateBroken') {
        actions.apiUpdate({ '@type': 'requestReconnectApi' });
        return;
      }

      // If connecting, let the transport layer finish — don't interfere
      if (global.connectionState === 'connectionStateConnecting') {
        return;
      }

      // If we are ready, send a lightweight ping request to verify zombie state
      const pingPromise = Promise.race([
        callApi('fetchNearestCountry'),
        new Promise((_, reject) => {
          pingTimeout = setTimeout(() => reject(new Error('timeout')), 1500);
        }),
      ]);

      pingPromise.then(() => {
        if (pingTimeout) clearTimeout(pingTimeout);
      }).catch((err) => {
        if (pingTimeout) clearTimeout(pingTimeout);
        // eslint-disable-next-line no-console
        console.warn('Zombie connection detected during focus/online, reconnecting...', err);
        actions.apiUpdate({ '@type': 'requestReconnectApi' });
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReconnectCheck();
      }
    };

    window.addEventListener('online', handleReconnectCheck);
    window.addEventListener('focus', handleReconnectCheck);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleReconnectCheck);
      window.removeEventListener('focus', handleReconnectCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pingTimeout) clearTimeout(pingTimeout);
    };
  }, []);

  const prevActiveKey = usePrevious(activeKey);

  function renderContent() {
    switch (activeKey) {
      case AppScreens.auth:
        return <Auth />;
      case AppScreens.main:
        return <Main isMobile={isMobile} />;
      case AppScreens.lock:
        return <LockScreen isLocked={isScreenLocked} />;
      case AppScreens.inactive:
        return <AppInactive inactiveReason={inactiveReason!} />;
    }
  }

  useTauriDrag();

  useLayoutEffect(() => {
    document.body.classList.add(styles.bg);
  }, []);

  useLayoutEffect(() => {
    document.body.style.setProperty(
      '--theme-background-color',
      theme === 'dark' ? DARK_THEME_BG_COLOR : LIGHT_THEME_BG_COLOR,
    );
  }, [theme]);

  useLayoutEffect(() => {
    if (actionMessageBg) {
      document.body.style.setProperty('--action-message-bg', actionMessageBg);
    }
  }, [actionMessageBg]);

  useLayoutEffect(() => {
    applyClashgramGlassTheme(clashgramNativeGlass, clashgramNativeGlassColorValue, clashgramNativeGlassOpacityValue);
  }, [clashgramNativeGlass, clashgramNativeGlassColorValue, clashgramNativeGlassOpacityValue, theme]);

  useLayoutEffect(() => {
    if (clashgramCustomFont && clashgramCustomFont !== 'default') {
      document.body.style.setProperty('--font-family', `"${clashgramCustomFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Symbol", Roboto, Helvetica, Arial, sans-serif`);
      const systemFonts = ['arial', 'helvetica', 'georgia', 'impact', 'segoe ui', 'trebuchet ms', 'courier new', 'consolas', 'lucida console', 'comic sans ms', 'avenir next', 'cabinet', 'clash display', 'clash grotesk', 'chillax', 'general sans', 'satoshi', 'telma'];
      if (!systemFonts.includes(clashgramCustomFont.toLowerCase())) {
        const linkId = `gfont-${clashgramCustomFont.replace(/\s+/g, '-')}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clashgramCustomFont)}:wght@400;500;700&display=swap`;
          document.head.appendChild(link);
        }
      }
    } else {
      document.body.style.removeProperty('--font-family');
    }
  }, [clashgramCustomFont]);

  const getIsInBackgroundLocal = getIsInBackground;
  useSignalEffect(() => {
    // Mutation forced to avoid RAF throttling in background
    forceMutation(() => {
      document.body.classList.toggle('in-background', getIsInBackgroundLocal());
    }, document.body);
  }, [getIsInBackgroundLocal]);

  return (
    <UiLoader page={page} isMobile={isMobile}>
      <ErrorBoundary>
        <Transition
          name="fade"
          activeKey={activeKey}
          shouldCleanup
          className={buildClassName(
            'full-height',
            (activeKey === AppScreens.auth || prevActiveKey === AppScreens.auth) && 'is-auth',
          )}
          renderCount={TRANSITION_RENDER_COUNT}
        >
          {renderContent}
        </Transition>
      </ErrorBoundary>
      {activeKey === AppScreens.auth && isTestServer && <div className="test-server-badge">Test server</div>}
      <Notifications />
      <ClashgramPasscodeModal />
      <ClashgramExportModal />
    </UiLoader>
  );
};

export default withGlobal(
  (global): Complete<StateProps> => {
    const { state: authState, hasWebAuthTokenFailed, hasWebAuthTokenPasswordRequired } = global.auth;
    const {
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramCustomFont,
    } = selectSharedSettings(global);
    return {
      currentUserId: global.currentUserId,
      authState,
      isScreenLocked: global.passcode?.isScreenLocked,
      hasPasscode: global.passcode?.hasPasscode,
      inactiveReason: selectTabState(global).inactiveReason,
      hasWebAuthTokenFailed: hasWebAuthTokenFailed || hasWebAuthTokenPasswordRequired,
      theme: selectTheme(global),
      isTestServer: global.config?.isTestServer,
      actionMessageBg: selectActionMessageBg(global),
      clashgramNativeGlass,
      clashgramNativeGlassColorValue,
      clashgramNativeGlassOpacityValue,
      clashgramCustomFont,
    };
  },
)(App);
