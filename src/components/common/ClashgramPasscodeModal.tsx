import { memo, useState, useEffect, useRef } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { selectTabState } from '../../global/selectors';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import buildClassName from '../../util/buildClassName';
import styles from './ClashgramPasscodeModal.module.scss';

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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockAndClose = () => {
    // Success! Add to session unlocked
    if (type === 'chat' && targetId) {
      if (!(window as any).clashgramUnlockedChatIds) {
        (window as any).clashgramUnlockedChatIds = new Set();
      }
      (window as any).clashgramUnlockedChatIds.add(String(targetId));
    } else if (type === 'folder' && targetId !== undefined) {
      if (!(window as any).clashgramUnlockedFolderIds) {
        (window as any).clashgramUnlockedFolderIds = new Set();
      }
      (window as any).clashgramUnlockedFolderIds.add(String(targetId));
    }

    // Close and execute pending action
    closeClashgramPasscodeModal();
    if (pendingAction) {
      if (pendingAction.type === 'openChat') {
        openChat(pendingAction.payload);
      } else if (pendingAction.type === 'setActiveChatFolder') {
        setActiveChatFolder(pendingAction.payload);
      } else if (pendingAction.type === 'clashgramUnlockChat') {
        const lockedChats = JSON.parse(localStorage.getItem('clashgramLockedChatIds') || '[]');
        const nextLocked = lockedChats.filter((id: string) => id !== String(targetId));
        localStorage.setItem('clashgramLockedChatIds', JSON.stringify(nextLocked));
        (window as any).clashgramUnlockedChatIds?.delete(String(targetId));
        getActions().setSharedSettingOption({});
      } else if (pendingAction.type === 'clashgramUnlockFolder') {
        const lockedFolders = JSON.parse(localStorage.getItem('clashgramLockedFolderIds') || '[]');
        const nextLocked = lockedFolders.filter((id: number) => id !== Number(targetId));
        localStorage.setItem('clashgramLockedFolderIds', JSON.stringify(nextLocked));
        (window as any).clashgramUnlockedFolderIds?.delete(String(targetId));
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
      ? (window as any).clashgramUnlockedChatIds?.has(String(targetId))
      : (window as any).clashgramUnlockedFolderIds?.has(String(targetId));

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
    if ((window as any).clashgramUnlockedChatIds) {
      (window as any).clashgramUnlockedChatIds.clear();
    }
    if ((window as any).clashgramUnlockedFolderIds) {
      (window as any).clashgramUnlockedFolderIds.clear();
    }
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
            <h2 className={styles.title}>Reset & Logout?</h2>
            <p className={styles.description}>
              If you forgot your passcodes, you must log out of your account to clear them. This will delete all local locks.
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
                  ? 'Reset Primary Passcode'
                  : isRecoveryMode
                  ? 'Bypass Lock'
                  : `Unlock ${type === 'folder' ? 'Folder' : 'Chat'}`}
              </h2>
              <p className={styles.description}>
                {isRecoverySuccess
                  ? 'Recovery verified! Choose a new primary passcode of at least 4 characters to unlock.'
                  : isRecoveryMode
                  ? 'Enter recovery passcode to bypass primary lock.'
                  : `This ${type === 'folder' ? 'folder' : 'chat'} is protected by local passcode.`}
              </p>
            </div>

            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.passcodeInput}
                style="-webkit-text-security: disc; text-security: disc;"
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
                  ? 'Passcode must be at least 4 characters'
                  : isRecoveryMode
                  ? 'Incorrect recovery passcode'
                  : 'Incorrect passcode, try again'}
              </p>
            )}

            {!isRecoverySuccess && (
              <button type="button" className={styles.forgotBtn} onClick={handleForgotClick}>
                {isRecoveryMode ? 'Forgot recovery passcode too?' : 'Forgot passcode?'}
              </button>
            )}

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                color="translucent"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={!passcode}
              >
                {isRecoverySuccess ? 'Save & Unlock' : 'Unlock'}
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
