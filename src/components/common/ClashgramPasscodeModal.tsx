import { memo, useState, useEffect, useRef } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectTabState } from '../../global/selectors';
import useLang from '../../hooks/useLang';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import buildClassName from '../../util/buildClassName';
import styles from './ClashgramPasscodeModal.module.scss';
import { getUnlockedChatIds, getUnlockedFolderIds } from '../../util/clashgramSessionVault';


export type OwnProps = {};

type StateProps = {
  isOpen: boolean;
  type?: 'chat' | 'folder';
  targetId?: string | number;
  pendingAction?: {
    type: 'openChat' | 'setActiveChatFolder' | 'clashgramUnlockChat' | 'clashgramUnlockFolder';
    payload: any;
  };
};

// SHA-256 function
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function ClashgramPasscodeModal({
  isOpen,
  type,
  targetId,
  pendingAction,
}: OwnProps & StateProps) {
  const { closeClashgramPasscodeModal, openChat, setActiveChatFolder, signOut } = getActions();
  const lang = useLang();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isLogoutConfirmMode, setIsLogoutConfirmMode] = useState(false);
  const [isRecoverySuccess, setIsRecoverySuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError(false);
      setShake(false);
      setIsRecoveryMode(false);
      setIsLogoutConfirmMode(false);
      setIsRecoverySuccess(false);
      inputRef.current?.focus();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockAndClose = () => {
    // Success! Add to session unlocked
    if (type === 'chat' && targetId) {
      getUnlockedChatIds().add(String(targetId));
    } else if (type === 'folder' && targetId !== undefined) {
      getUnlockedFolderIds().add(String(targetId));
    }

    // Close and execute pending action
    closeClashgramPasscodeModal();
    if (pendingAction) {
      if (pendingAction.type === 'openChat') {
        openChat(pendingAction.payload);
      } else if (pendingAction.type === 'setActiveChatFolder') {
        setActiveChatFolder(pendingAction.payload);
      } else if (pendingAction.type === 'clashgramUnlockChat') {
        let lockedChats: string[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem('clashgramLockedChatIds') || '[]');
          if (Array.isArray(parsed)) lockedChats = parsed as string[];
        } catch {
          // Ignore malformed JSON
        }
        const nextLocked = lockedChats.filter((id: string) => id !== String(targetId));
        localStorage.setItem('clashgramLockedChatIds', JSON.stringify(nextLocked));
        getUnlockedChatIds().delete(String(targetId));
        getActions().setSharedSettingOption({});
      } else if (pendingAction.type === 'clashgramUnlockFolder') {
        let lockedFolders: number[] = [];
        try {
          const parsed = JSON.parse(localStorage.getItem('clashgramLockedFolderIds') || '[]');
          if (Array.isArray(parsed)) lockedFolders = parsed as number[];
        } catch {
          // Ignore malformed JSON
        }
        const nextLocked = lockedFolders.filter((id: number) => id !== Number(targetId));
        localStorage.setItem('clashgramLockedFolderIds', JSON.stringify(nextLocked));
        getUnlockedFolderIds().delete(String(targetId));
        getActions().setSharedSettingOption({});
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLogoutConfirmMode) return;

    if (isRecoverySuccess) {
      if (passcode.length < 4) {
        setError(true);
        setShake(true);
        setPasscode('');
        setTimeout(() => {
          setShake(false);
        }, 500);
        return;
      }

      const hash = await sha256(passcode);
      localStorage.setItem('clashgramPasscodeHash', hash);

      unlockAndClose();
      return;
    }

    const storedHash = isRecoveryMode
      ? (localStorage.getItem('clashgramRecoveryPasscodeHash') || '')
      : (localStorage.getItem('clashgramPasscodeHash') || '');

    // Hash the entered passcode
    const hashedInput = await sha256(passcode);

    if (hashedInput === storedHash) {
      if (isRecoveryMode) {
        setIsRecoverySuccess(true);
        setPasscode('');
        setError(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return;
      }

      unlockAndClose();
    } else {
      // Shaking animation
      setError(true);
      setShake(true);
      setPasscode('');
      setTimeout(() => {
        setShake(false);
      }, 500);
    }
  };

  const handleClose = () => {
    closeClashgramPasscodeModal();
    const isUnlocked = type === 'chat'
      ? getUnlockedChatIds().has(String(targetId))
      : getUnlockedFolderIds().has(String(targetId));

    if (!isUnlocked) {
      if (type === 'chat') {
        openChat({ id: undefined });
      } else if (type === 'folder') {
        setActiveChatFolder({ activeChatFolder: 0 });
      }
    }
  };

  const handleForgotClick = () => {
    const hasRecovery = Boolean(localStorage.getItem('clashgramRecoveryPasscodeHash'));
    if (!isRecoveryMode && hasRecovery) {
      setIsRecoveryMode(true);
      setPasscode('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setIsLogoutConfirmMode(true);
      setPasscode('');
      setError(false);
    }
  };

  const handleBackToPasscode = () => {
    setIsLogoutConfirmMode(false);
    setPasscode('');
    setError(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleLogoutReset = () => {
    localStorage.removeItem('clashgramPasscodeHash');
    localStorage.removeItem('clashgramRecoveryPasscodeHash');
    localStorage.removeItem('clashgramLockedChatIds');
    localStorage.removeItem('clashgramLockedFolderIds');
    getUnlockedChatIds().clear();
    getUnlockedFolderIds().clear();
    closeClashgramPasscodeModal();
    signOut({ forceInitApi: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className={buildClassName(styles.modal, 'narrow')}
      noBackdropClose
    >
      <form
        onSubmit={handleSubmit}
        className={styles.container}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            inputRef.current?.focus();
          }
        }}
        onTouchStart={(e) => {
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            inputRef.current?.focus();
          }
        }}
      >
        {isLogoutConfirmMode ? (
          <div className={styles.lockHeader}>
            <div className={buildClassName(styles.iconContainer, styles.warningIcon)}>
              <div className={styles.iconRing} />
              <svg
                className={styles.lockIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className={styles.title}>{lang('ClashgramPasscodeResetLogoutTitle')}</h2>
            <p className={styles.description}>
              {lang('ClashgramPasscodeResetLogoutDesc')}
            </p>
            <div className={styles.buttonGroup}>
              <Button type="button" color="translucent" onClick={handleBackToPasscode}>
                Back
              </Button>
              <Button type="button" color="danger" onClick={handleLogoutReset}>
                Logout & Reset
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.lockHeader}>
              <div className={buildClassName(styles.iconContainer, shake && styles.shake, error && styles.error)}>
                <div className={styles.iconRing} />
                <svg
                  className={styles.lockIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className={styles.title}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeResetPrimary')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeBypassLock')
                  : type === 'folder' ? lang('ClashgramPasscodeUnlockFolder') : lang('ClashgramPasscodeUnlockChat')}
              </h2>
              <p className={styles.description}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeRecoveryVerifiedSuccess')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeRecoveryBypassDesc')
                  : type === 'folder' ? lang('ClashgramPasscodeFolderProtectedDesc') : lang('ClashgramPasscodeChatProtectedDesc')}
              </p>
            </div>

            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.passcodeInput}
                style={{ WebkitTextSecurity: 'disc', textSecurity: 'disc' } as any}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={passcode}
                onChange={(e) => {
                  setError(false);
                  setPasscode((e.target as HTMLInputElement).value);
                }}
                maxLength={20}
                autoFocus
              />
              <div className={buildClassName(styles.dotsContainer, shake && styles.shake, error && styles.error)}>
                {Array.from({ length: Math.max(6, passcode.length) }).map((_, idx) => {
                  const isFilled = idx < passcode.length;
                  const isActive = idx === passcode.length;
                  return (
                    <div
                      key={idx}
                      className={buildClassName(
                        styles.dot,
                        isFilled && styles.dotFilled,
                        isActive && styles.dotActive
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {error && (
              <p className={styles.errorText}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeErrMinLength')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeErrIncorrectRecovery')
                  : lang('ClashgramPasscodeErrIncorrectPrimary')}
              </p>
            )}

            {!isRecoverySuccess && (
              <button type="button" className={styles.forgotBtn} onClick={handleForgotClick}>
                {isRecoveryMode ? lang('ClashgramPasscodeForgotRecovery') : lang('ClashgramPasscodeForgot')}
              </button>
            )}

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                color="translucent"
                onClick={handleClose}
              >
                {lang('ClashgramPasscodeButtonCancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={!passcode}
              >
                {isRecoverySuccess ? lang('ClashgramPasscodeButtonSaveUnlock') : lang('ClashgramPasscodeButtonUnlock')}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const tabState = selectTabState(global);
    const passcodeModal = tabState.clashgramPasscodeModal;
    const pendingAction = tabState.clashgramPendingAction;

    return {
      isOpen: Boolean(passcodeModal?.isOpen),
      type: passcodeModal?.type,
      targetId: passcodeModal?.targetId,
      pendingAction: pendingAction as any,
    };
  },
)(ClashgramPasscodeModal));
