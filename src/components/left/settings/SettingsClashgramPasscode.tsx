import { memo, useState, useEffect } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import { type ApiChat, type ApiChatFolder, MAIN_THREAD_ID } from '../../../api/types';
import { SettingsScreens } from '../../../types';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useOldLang from '../../../hooks/useOldLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Button from '../../ui/Button';
import ListItem from '../../ui/ListItem';
import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';
import lockPreviewUrl from '../../../assets/lock.png';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  chatsById?: Record<string, ApiChat>;
  chatFoldersById?: Record<number, ApiChatFolder>;
  lockedChats: string[];
  lockedFolders: number[];
};

// SHA-256 helper
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const SettingsClashgramPasscode = ({
  isActive,
  chatsById,
  chatFoldersById,
  lockedChats: initialLockedChats,
  lockedFolders: initialLockedFolders,
  onReset,
}: OwnProps & StateProps) => {
  const { setSharedSettingOption, openSettingsScreen, signOut } = getActions();
  const lang = useOldLang();

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  // Local state for locked items so we have immediate UI reactivity
  const [lockedChats, setLockedChats] = useState<string[]>(initialLockedChats);
  const [lockedFolders, setLockedFolders] = useState<number[]>(initialLockedFolders);

  useEffect(() => {
    setLockedChats(initialLockedChats);
  }, [initialLockedChats]);

  useEffect(() => {
    setLockedFolders(initialLockedFolders);
  }, [initialLockedFolders]);

  // Sync state with localstorage
  const [hasPasscode, setHasPasscode] = useState(Boolean(localStorage.getItem('clashgramPasscodeHash')));

  // Sub-screen navigator: null (main menu), 'change', 'recovery', 'items', 'disable'
  const [activeSubScreen, setActiveSubScreen] = useState<null | 'change' | 'recovery' | 'items' | 'disable'>(null);

  // Forms inputs
  // 1. Initial Setup Inputs
  const [setupPrimary, setSetupPrimary] = useState('');
  const [setupRecovery, setSetupRecovery] = useState('');

  // 2. Change Passcode Inputs
  const [changeAuthMode, setChangeAuthMode] = useState<'primary' | 'recovery'>('primary');
  const [changeVerifyInput, setChangeVerifyInput] = useState('');
  const [changeNewPrimary, setChangeNewPrimary] = useState('');
  const [changeNewRecovery, setChangeNewRecovery] = useState('');

  // 3. Forgot Passcode / Recovery Inputs
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryNewPrimary, setRecoveryNewPrimary] = useState('');
  const [recoveryNewRecovery, setRecoveryNewRecovery] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // 4. Disable Passcode Inputs
  const [disableAuthMode, setDisableAuthMode] = useState<'primary' | 'recovery'>('primary');
  const [disableVerifyInput, setDisableVerifyInput] = useState('');

  // System Logs
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const navigateTo = (screen: null | 'change' | 'recovery' | 'items' | 'disable') => {
    clearMessages();
    setChangeVerifyInput('');
    setChangeNewPrimary('');
    setChangeNewRecovery('');
    setRecoveryInput('');
    setRecoveryNewPrimary('');
    setRecoveryNewRecovery('');
    setRecoverySuccess(false);
    setDisableVerifyInput('');
    setActiveSubScreen(screen);
  };

  // Actions
  // A. Initial setup
  const handleSetupPasscode = useLastCallback(async () => {
    clearMessages();
    if (!setupPrimary || !setupRecovery) {
      setErrorMsg('Both primary and recovery passcodes are required.');
      return;
    }
    if (setupPrimary.length < 4) {
      setErrorMsg('Primary passcode should be at least 4 characters.');
      return;
    }
    if (setupPrimary === setupRecovery) {
      setErrorMsg('Recovery passcode must be different from primary passcode.');
      return;
    }

    const hash = await sha256(setupPrimary);
    const recoveryHash = await sha256(setupRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);
    
    setHasPasscode(true);
    setSetupPrimary('');
    setSetupRecovery('');
    setSuccessMsg('Passcode protection configured successfully!');
  });

  // B. Change Passcode
  const handleChangePasscode = useLastCallback(async () => {
    clearMessages();
    if (!changeVerifyInput || !changeNewPrimary || !changeNewRecovery) {
      setErrorMsg('All fields (current verify, new primary, and new recovery passcode) are required.');
      return;
    }

    const isPrimaryAuth = changeAuthMode === 'primary';
    const storedHash = isPrimaryAuth
      ? localStorage.getItem('clashgramPasscodeHash')
      : localStorage.getItem('clashgramRecoveryPasscodeHash');
    
    const enteredHash = await sha256(changeVerifyInput);
    if (enteredHash !== storedHash) {
      setErrorMsg(`Incorrect ${isPrimaryAuth ? 'current primary' : 'recovery'} passcode.`);
      return;
    }

    if (changeNewPrimary.length < 4) {
      setErrorMsg('New primary passcode should be at least 4 characters.');
      return;
    }

    if (changeNewPrimary === changeNewRecovery) {
      setErrorMsg('Recovery passcode must be different from primary passcode.');
      return;
    }

    const hash = await sha256(changeNewPrimary);
    const recoveryHash = await sha256(changeNewRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);

    setSuccessMsg('Passcode changed successfully.');
    setTimeout(() => navigateTo(null), 1000);
  });

  // C. Forgot & Recover
  const handleVerifyRecovery = useLastCallback(async () => {
    clearMessages();
    if (!recoveryInput) {
      setErrorMsg('Please enter your recovery passcode.');
      return;
    }

    const storedRecoveryHash = localStorage.getItem('clashgramRecoveryPasscodeHash');
    const enteredRecoveryHash = await sha256(recoveryInput);

    if (enteredRecoveryHash !== storedRecoveryHash) {
      setErrorMsg('Incorrect recovery passcode.');
      return;
    }

    setRecoverySuccess(true);
    setSuccessMsg('Recovery verified! Choose your new primary & recovery passcodes.');
  });

  const handleSetNewPasscodesAfterRecovery = useLastCallback(async () => {
    clearMessages();
    if (!recoveryNewPrimary || !recoveryNewRecovery) {
      setErrorMsg('Please enter both new primary and recovery passcodes.');
      return;
    }
    if (recoveryNewPrimary.length < 4) {
      setErrorMsg('Primary passcode must be at least 4 characters.');
      return;
    }
    if (recoveryNewPrimary === recoveryNewRecovery) {
      setErrorMsg('Recovery passcode must be different from primary passcode.');
      return;
    }

    const hash = await sha256(recoveryNewPrimary);
    const recoveryHash = await sha256(recoveryNewRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);

    setSuccessMsg('Passcodes have been reset successfully!');
    setTimeout(() => navigateTo(null), 1000);
  });

  // D. Disable Passcode
  const handleDisablePasscode = useLastCallback(async () => {
    clearMessages();
    if (!disableVerifyInput) {
      setErrorMsg('Please enter passcode to verify identity.');
      return;
    }

    const isPrimaryAuth = disableAuthMode === 'primary';
    const storedHash = isPrimaryAuth
      ? localStorage.getItem('clashgramPasscodeHash')
      : localStorage.getItem('clashgramRecoveryPasscodeHash');

    const enteredHash = await sha256(disableVerifyInput);
    if (enteredHash !== storedHash) {
      setErrorMsg(`Incorrect ${isPrimaryAuth ? 'current primary' : 'recovery'} passcode.`);
      return;
    }

    localStorage.removeItem('clashgramPasscodeHash');
    localStorage.removeItem('clashgramRecoveryPasscodeHash');
    localStorage.removeItem('clashgramLockedChatIds');
    localStorage.removeItem('clashgramLockedFolderIds');
    
    setHasPasscode(false);
    setLockedChats([]);
    setLockedFolders([]);
    setSharedSettingOption({});
    setSuccessMsg('Passcode protection has been disabled.');
    setTimeout(() => navigateTo(null), 1000);
  });

  // E. Unlock items
  const handleUnlockChat = useLastCallback((chatId: string) => {
    getActions().openClashgramPasscodeModal({
      type: 'chat',
      targetId: chatId,
      pendingAction: { type: 'clashgramUnlockChat', payload: {} },
    });
  });

  const handleUnlockFolder = useLastCallback((folderId: number) => {
    getActions().openClashgramPasscodeModal({
      type: 'folder',
      targetId: folderId,
      pendingAction: { type: 'clashgramUnlockFolder', payload: {} },
    });
  });

  const handleResetAndLogout = () => {
    localStorage.removeItem('clashgramPasscodeHash');
    localStorage.removeItem('clashgramRecoveryPasscodeHash');
    localStorage.removeItem('clashgramLockedChatIds');
    localStorage.removeItem('clashgramLockedFolderIds');
    signOut({ forceInitApi: true });
  };

  return (
    <div className="settings-content custom-scroll">
      {/* Dynamic Styling to emulate 100% Official Telegram UI/UX */}
      <style>{`
        .no-autofill-password {
          -webkit-text-security: disc !important;
          text-security: disc !important;
        }
        
        /* Modern settings back header */
        .subscreen-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--color-borders);
          user-select: none;
          transition: background 0.2s;
        }
        .subscreen-header:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .subscreen-header .back-arrow {
          font-size: 20px;
          color: var(--color-primary);
          transition: transform 0.2s;
        }
        .subscreen-header:hover .back-arrow {
          transform: translateX(-4px);
        }
        .subscreen-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 500;
          color: var(--color-text);
        }
        
        .subscreen-body {
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        
        /* Auth Role Switcher Tab bar */
        .auth-tab-bar {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--color-borders);
          border-radius: 8px;
          padding: 3px;
          margin-bottom: 8px;
        }
        .auth-tab {
          padding: 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-text-secondary);
        }
        .auth-tab.active {
          background: var(--color-primary);
          color: #fff !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .auth-tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03);
          color: var(--color-text);
        }
        
        .feedback-banner {
          font-size: 13px;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 500;
          margin: 0 16px 10px 16px;
        }
        .banner-err {
          background: rgba(231, 76, 60, 0.12);
          color: #ff5252;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }
        .banner-ok {
          background: rgba(46, 204, 113, 0.12);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .item-unlock-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid var(--color-borders);
          border-radius: 10px;
          margin-bottom: 8px;
          transition: all 0.2s;
        }
        .item-unlock-row:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }
        .item-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          font-size: 14px;
          color: var(--color-text);
        }
        
        /* Light mode filter for Lock sticker */
        html.theme-light .settings-content-icon {
          filter: invert(1) hue-rotate(180deg);
        }
      `}</style>

      {/* 1. Notifications & Feedback Messages */}
      {errorMsg && <div className="feedback-banner banner-err">⚠️ {errorMsg}</div>}
      {successMsg && <div className="feedback-banner banner-ok">✨ {successMsg}</div>}

      {/* 2. Main View (activeSubScreen === null) */}
      {activeSubScreen === null && (
        <>
          {/* A. Official Telegram header with Lock Sticker */}
          <div className="settings-content-header no-border">
            <AnimatedIconWithPreview
              tgsUrl={LOCAL_TGS_URLS.Lock}
              previewUrl={lockPreviewUrl}
              size={160}
              className="settings-content-icon"
            />
            <p className="settings-item-description mb-3" dir="auto">
              {hasPasscode
                ? 'Clashgram Passcode Lock is enabled.'
                : 'Set a local passcode to secure your private chats and custom folders on this device.'}
            </p>
          </div>

          {/* B. Passcode Options Menu */}
          {hasPasscode ? (
            <div className="settings-item">
              <ListItem
                icon="edit"
                onClick={() => navigateTo('change')}
              >
                Change Passcode
              </ListItem>

              <ListItem
                icon="key"
                onClick={() => navigateTo('recovery')}
              >
                Reset via Recovery Passcode
              </ListItem>

              <ListItem
                icon="lock"
                onClick={() => navigateTo('items')}
              >
                Manage Locked Items ({lockedChats.length + lockedFolders.length})
              </ListItem>

              <ListItem
                icon="password-off"
                className="color-danger"
                onClick={() => navigateTo('disable')}
              >
                <span style="color: var(--color-error)">Turn Passcode Off</span>
              </ListItem>
            </div>
          ) : (
            <div className="settings-item settings-group" style="padding: 16px; display: flex; flex-direction: column; gap: 14px">
              <div className="input-group touched with-label">
                <input
                  id="clashgram-setup-primary"
                  type="text"
                  className="form-control no-autofill-password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={setupPrimary}
                  onChange={(e) => setSetupPrimary((e.target as HTMLInputElement).value)}
                  placeholder="Min 4 characters"
                />
                <label htmlFor="clashgram-setup-primary">Primary Passcode</label>
              </div>

              <div className="input-group touched with-label">
                <input
                  id="clashgram-setup-recovery"
                  type="text"
                  className="form-control no-autofill-password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={setupRecovery}
                  onChange={(e) => setSetupRecovery((e.target as HTMLInputElement).value)}
                  placeholder="Enter backup recovery code"
                />
                <label htmlFor="clashgram-setup-recovery">Recovery Passcode (Backup)</label>
              </div>

              <p className="settings-item-description" style="margin: 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
                Note: The Recovery passcode serves as a master override. If you forget your primary passcode, you can use it to reset your lock instantly without losing any local settings.
              </p>

              <Button
                onClick={handleSetupPasscode}
                disabled={!setupPrimary || !setupRecovery}
                style="margin-top: 10px; width: 100%"
              >
                Enable Passcode Protection
              </Button>
            </div>
          )}
        </>
      )}

      {/* 3. Sub-Screen: Change Passcode */}
      {activeSubScreen === 'change' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>Change Passcode</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
              Confirm identity to set a new primary passcode. You can verify using either your primary or recovery backup key.
            </p>

            <div className="auth-tab-bar">
              <div 
                className={`auth-tab ${changeAuthMode === 'primary' ? 'active' : ''}`}
                onClick={() => { setChangeAuthMode('primary'); clearMessages(); }}
              >
                Use Primary Passcode
              </div>
              <div 
                className={`auth-tab ${changeAuthMode === 'recovery' ? 'active' : ''}`}
                onClick={() => { setChangeAuthMode('recovery'); clearMessages(); }}
              >
                Use Recovery Passcode
              </div>
            </div>

            <div className="input-group touched with-label">
              <input
                id="clashgram-change-verify"
                type="text"
                className="form-control no-autofill-password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={changeVerifyInput}
                onChange={(e) => setChangeVerifyInput((e.target as HTMLInputElement).value)}
                placeholder={changeAuthMode === 'primary' ? 'Enter current primary passcode' : 'Enter current recovery passcode'}
              />
              <label htmlFor="clashgram-change-verify">
                {changeAuthMode === 'primary' ? 'Current Passcode' : 'Recovery Passcode'}
              </label>
            </div>

            <div style="border-top: 1px dashed var(--color-borders); padding-top: 16px; display: flex; flex-direction: column; gap: 14px">
              <div className="input-group touched with-label">
                <input
                  id="clashgram-change-new-primary"
                  type="text"
                  className="form-control no-autofill-password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={changeNewPrimary}
                  onChange={(e) => setChangeNewPrimary((e.target as HTMLInputElement).value)}
                  placeholder="Min 4 characters"
                />
                <label htmlFor="clashgram-change-new-primary">New Primary Passcode</label>
              </div>

              <div className="input-group touched with-label">
                <input
                  id="clashgram-change-new-rec"
                  type="text"
                  className="form-control no-autofill-password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={changeNewRecovery}
                  onChange={(e) => setChangeNewRecovery((e.target as HTMLInputElement).value)}
                  placeholder="Must be different"
                />
                <label htmlFor="clashgram-change-new-rec">New Recovery Passcode (Backup)</label>
              </div>
            </div>

            <Button
              onClick={handleChangePasscode}
              disabled={!changeVerifyInput || !changeNewPrimary || !changeNewRecovery}
              style="width: 100%; margin-top: 8px"
            >
              Update Passcode Settings
            </Button>
          </div>
        </>
      )}

      {/* 4. Sub-Screen: Reset via Recovery */}
      {activeSubScreen === 'recovery' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>Reset via Recovery</h3>
          </div>
          <div className="subscreen-body">
            {!recoverySuccess ? (
              <>
                <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
                  Forgot your primary passcode? Enter the backup recovery code you configured.
                </p>
                <div className="input-group touched with-label">
                  <input
                    id="clashgram-recovery-verify"
                    type="text"
                    className="form-control no-autofill-password"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput((e.target as HTMLInputElement).value)}
                  />
                  <label htmlFor="clashgram-recovery-verify">Backup Recovery Passcode</label>
                </div>

                <Button
                  onClick={handleVerifyRecovery}
                  disabled={!recoveryInput}
                  style="width: 100%"
                >
                  Verify Backup Code
                </Button>

                {/* Secure Account Exit Fallback */}
                <div style="margin-top: 15px; border-top: 1px dashed var(--color-borders); padding-top: 18px">
                  <p className="settings-item-description" style="margin: 0 0 8px 0; color: var(--color-error); font-weight: 600">
                    Lost both Primary & Recovery passcodes?
                  </p>
                  <p className="settings-item-description" style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
                    To protect your chats from unauthorized access, the local locks can only be wiped by terminating the current active device session.
                  </p>
                  <Button onClick={handleResetAndLogout} color="danger" style="width: 100%">
                    Logout & Reset Device Locks
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="settings-item-description" style="margin: 0; color: #2ecc71; font-weight: 500">
                  Recovery verified! Please define a brand new primary passcode and a different backup recovery passcode.
                </p>
                <div className="input-group touched with-label">
                  <input
                    id="clashgram-rec-new-p"
                    type="text"
                    className="form-control no-autofill-password"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={recoveryNewPrimary}
                    onChange={(e) => setRecoveryNewPrimary((e.target as HTMLInputElement).value)}
                    placeholder="Min 4 characters"
                  />
                  <label htmlFor="clashgram-rec-new-p">New Primary Passcode</label>
                </div>

                <div className="input-group touched with-label">
                  <input
                    id="clashgram-rec-new-r"
                    type="text"
                    className="form-control no-autofill-password"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={recoveryNewRecovery}
                    onChange={(e) => setRecoveryNewRecovery((e.target as HTMLInputElement).value)}
                    placeholder="Must be different"
                  />
                  <label htmlFor="clashgram-rec-new-r">New Recovery Passcode (Backup)</label>
                </div>

                <Button
                  onClick={handleSetNewPasscodesAfterRecovery}
                  disabled={!recoveryNewPrimary || !recoveryNewRecovery}
                  style="width: 100%; margin-top: 8px"
                >
                  Save New Security Settings
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {/* 5. Sub-Screen: Locked Items Manager */}
      {activeSubScreen === 'items' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>Manage Locked Items</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0 0 8px 0; color: var(--color-text-secondary)">
              Below is a list of folders and private chats protected on this device. Click Unlock to lift protection.
            </p>

            {lockedChats.length === 0 && lockedFolders.length === 0 ? (
              <p style="margin: 30px 0; font-size: 14px; text-align: center; color: var(--color-text-secondary)">
                No chats or folders are locked.
              </p>
            ) : (
              <div style="max-height: 400px; overflow-y: auto; padding-right: 4px">
                {lockedFolders.map((folderId) => {
                  const folder = chatFoldersById?.[folderId];
                  const name = folder?.title?.text || `Folder #${folderId}`;
                  return (
                    <div key={folderId} className="item-unlock-row">
                      <div className="item-title-wrapper">
                        <span>📂</span>
                        <span>{name}</span>
                      </div>
                      <Button onClick={() => handleUnlockFolder(folderId)} color="danger" size="tiny">Unlock</Button>
                    </div>
                  );
                })}
                {lockedChats.map((chatId) => {
                  const chat = chatsById?.[chatId];
                  const name = chat?.title || `Chat #${chatId}`;
                  return (
                    <div key={chatId} className="item-unlock-row">
                      <div className="item-title-wrapper">
                        <span>💬</span>
                        <span>{name}</span>
                      </div>
                      <Button onClick={() => handleUnlockChat(chatId)} color="danger" size="tiny">Unlock</Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="settings-item-description" style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
              Tip: You can lock new conversations at any time by right-clicking a folder tab or any individual item in your chats menu and selecting "Lock Chat/Folder".
            </p>
          </div>
        </>
      )}

      {/* 6. Sub-Screen: Disable Passcode Lock */}
      {activeSubScreen === 'disable' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>Disable Passcode Lock</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
              Disabling the passcode lock will immediately delete all active locks and wipe your primary and backup keys. Confirm your identity below:
            </p>

            <div className="auth-tab-bar">
              <div 
                className={`auth-tab ${disableAuthMode === 'primary' ? 'active' : ''}`}
                onClick={() => { setDisableAuthMode('primary'); clearMessages(); }}
              >
                Use Primary Passcode
              </div>
              <div 
                className={`auth-tab ${disableAuthMode === 'recovery' ? 'active' : ''}`}
                onClick={() => { setDisableAuthMode('recovery'); clearMessages(); }}
              >
                Use Recovery Passcode
              </div>
            </div>

            <div className="input-group touched with-label">
              <input
                id="clashgram-disable-verify"
                type="text"
                className="form-control no-autofill-password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={disableVerifyInput}
                onChange={(e) => setDisableVerifyInput((e.target as HTMLInputElement).value)}
                placeholder={disableAuthMode === 'primary' ? 'Enter current primary passcode' : 'Enter current recovery passcode'}
              />
              <label htmlFor="clashgram-disable-verify">
                {disableAuthMode === 'primary' ? 'Current Passcode' : 'Recovery Passcode'}
              </label>
            </div>

            <Button
              onClick={handleDisablePasscode}
              color="danger"
              disabled={!disableVerifyInput}
              style="width: 100%; margin-top: 8px"
            >
              Disable Passcode Protection
            </Button>
          </div>
        </>
      )}

    </div>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const chatsById = global.chats.byId;
    
    let lockedChats: string[] = [];
    try {
      lockedChats = JSON.parse(localStorage.getItem('clashgramLockedChatIds') || '[]');
    } catch {}
    
    let lockedFolders: number[] = [];
    try {
      lockedFolders = JSON.parse(localStorage.getItem('clashgramLockedFolderIds') || '[]');
    } catch {}

    return {
      chatsById,
      chatFoldersById: global.chatFolders.byId,
      lockedChats,
      lockedFolders,
    };
  },
 )(SettingsClashgramPasscode));
