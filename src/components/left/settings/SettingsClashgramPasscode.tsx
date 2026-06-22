import { memo, useState, useEffect } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import { type ApiChat, type ApiChatFolder, MAIN_THREAD_ID } from '../../../api/types';
import { SettingsScreens } from '../../../types';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useLang from '../../../hooks/useLang';
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
  const lang = useLang();

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
      setErrorMsg(lang('ClashgramPasscodeErrBothRequired'));
      return;
    }
    if (setupPrimary.length < 4) {
      setErrorMsg(lang('ClashgramPasscodeErrMinLength'));
      return;
    }
    if (setupPrimary === setupRecovery) {
      setErrorMsg(lang('ClashgramPasscodeErrDifferent'));
      return;
    }

    const hash = await sha256(setupPrimary);
    const recoveryHash = await sha256(setupRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);
    
    setHasPasscode(true);
    setSetupPrimary('');
    setSetupRecovery('');
    setSuccessMsg(lang('ClashgramPasscodeSuccessSetup'));
  });

  // B. Change Passcode
  const handleChangePasscode = useLastCallback(async () => {
    clearMessages();
    if (!changeVerifyInput || !changeNewPrimary || !changeNewRecovery) {
      setErrorMsg(lang('ClashgramPasscodeErrBothRequired'));
      return;
    }

    const isPrimaryAuth = changeAuthMode === 'primary';
    const storedHash = isPrimaryAuth
      ? localStorage.getItem('clashgramPasscodeHash')
      : localStorage.getItem('clashgramRecoveryPasscodeHash');
    
    const enteredHash = await sha256(changeVerifyInput);
    if (enteredHash !== storedHash) {
      setErrorMsg(isPrimaryAuth ? lang('ClashgramPasscodeErrIncorrectPrimary') : lang('ClashgramPasscodeErrIncorrectRecovery'));
      return;
    }

    if (changeNewPrimary.length < 4) {
      setErrorMsg(lang('ClashgramPasscodeErrMinLength'));
      return;
    }

    if (changeNewPrimary === changeNewRecovery) {
      setErrorMsg(lang('ClashgramPasscodeErrDifferent'));
      return;
    }

    const hash = await sha256(changeNewPrimary);
    const recoveryHash = await sha256(changeNewRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);

    setSuccessMsg(lang('ClashgramPasscodeSuccessChange'));
    setTimeout(() => navigateTo(null), 1000);
  });

  // C. Forgot & Recover
  const handleVerifyRecovery = useLastCallback(async () => {
    clearMessages();
    if (!recoveryInput) {
      setErrorMsg(lang('ClashgramPasscodeBackupPlaceholder'));
      return;
    }

    const storedRecoveryHash = localStorage.getItem('clashgramRecoveryPasscodeHash');
    const enteredRecoveryHash = await sha256(recoveryInput);

    if (enteredRecoveryHash !== storedRecoveryHash) {
      setErrorMsg(lang('ClashgramPasscodeErrIncorrectRecovery'));
      return;
    }

    setRecoverySuccess(true);
    setSuccessMsg(lang('ClashgramPasscodeRecoveryVerified'));
  });

  const handleSetNewPasscodesAfterRecovery = useLastCallback(async () => {
    clearMessages();
    if (!recoveryNewPrimary || !recoveryNewRecovery) {
      setErrorMsg(lang('ClashgramPasscodeErrBothRequired'));
      return;
    }
    if (recoveryNewPrimary.length < 4) {
      setErrorMsg(lang('ClashgramPasscodeErrMinLength'));
      return;
    }
    if (recoveryNewPrimary === recoveryNewRecovery) {
      setErrorMsg(lang('ClashgramPasscodeErrDifferent'));
      return;
    }

    const hash = await sha256(recoveryNewPrimary);
    const recoveryHash = await sha256(recoveryNewRecovery);
    localStorage.setItem('clashgramPasscodeHash', hash);
    localStorage.setItem('clashgramRecoveryPasscodeHash', recoveryHash);

    setSuccessMsg(lang('ClashgramPasscodeSaveNew'));
    setTimeout(() => navigateTo(null), 1000);
  });

  // D. Disable Passcode
  const handleDisablePasscode = useLastCallback(async () => {
    clearMessages();
    if (!disableVerifyInput) {
      setErrorMsg(lang('ClashgramPasscodeBackupPlaceholder'));
      return;
    }

    const isPrimaryAuth = disableAuthMode === 'primary';
    const storedHash = isPrimaryAuth
      ? localStorage.getItem('clashgramPasscodeHash')
      : localStorage.getItem('clashgramRecoveryPasscodeHash');

    const enteredHash = await sha256(disableVerifyInput);
    if (enteredHash !== storedHash) {
      setErrorMsg(isPrimaryAuth ? lang('ClashgramPasscodeErrIncorrectPrimary') : lang('ClashgramPasscodeErrIncorrectRecovery'));
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
    setSuccessMsg(lang('ClashgramPasscodeDisable'));
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
                ? lang('ClashgramPasscodeEnabled')
                : lang('ClashgramPasscodeDisabledDesc')}
            </p>
          </div>

          {/* B. Passcode Options Menu */}
          {hasPasscode ? (
            <div className="settings-item">
              <ListItem
                icon="edit"
                onClick={() => navigateTo('change')}
              >
                {lang('ClashgramPasscodeChange')}
              </ListItem>

              <ListItem
                icon="key"
                onClick={() => navigateTo('recovery')}
              >
                {lang('ClashgramPasscodeResetRec')}
              </ListItem>

              <ListItem
                icon="lock"
                onClick={() => navigateTo('items')}
              >
                {lang('ClashgramPasscodeManageItems')} ({lockedChats.length + lockedFolders.length})
              </ListItem>

              <ListItem
                icon="password-off"
                className="color-danger"
                onClick={() => navigateTo('disable')}
              >
                <span style="color: var(--color-error)">{lang('ClashgramPasscodeDisable')}</span>
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
                  placeholder={lang('ClashgramPasscodeMinChars')}
                />
                <label htmlFor="clashgram-setup-primary">{lang('ClashgramPasscodePrimary')}</label>
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
                  placeholder={lang('ClashgramPasscodeBackupPlaceholder')}
                />
                <label htmlFor="clashgram-setup-recovery">{lang('ClashgramPasscodeRecovery')}</label>
              </div>

              <p className="settings-item-description" style="margin: 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
                {lang('ClashgramPasscodeNote')}
              </p>

              <Button
                onClick={handleSetupPasscode}
                disabled={!setupPrimary || !setupRecovery}
                style="margin-top: 10px; width: 100%"
              >
                {lang('ClashgramPasscodeEnableButton')}
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
            <h3>{lang('ClashgramPasscodeChange')}</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
              {lang('ClashgramPasscodeConfirmVerify')}
            </p>

            <div className="auth-tab-bar">
              <div 
                className={`auth-tab ${changeAuthMode === 'primary' ? 'active' : ''}`}
                onClick={() => { setChangeAuthMode('primary'); clearMessages(); }}
              >
                {lang('ClashgramPasscodeUsePrimary')}
              </div>
              <div 
                className={`auth-tab ${changeAuthMode === 'recovery' ? 'active' : ''}`}
                onClick={() => { setChangeAuthMode('recovery'); clearMessages(); }}
              >
                {lang('ClashgramPasscodeUseRecovery')}
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
                placeholder={changeAuthMode === 'primary' ? lang('ClashgramPasscodeCurrent') : lang('ClashgramPasscodeRecovery')}
              />
              <label htmlFor="clashgram-change-verify">
                {changeAuthMode === 'primary' ? lang('ClashgramPasscodeCurrent') : lang('ClashgramPasscodeRecovery')}
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
                  placeholder={lang('ClashgramPasscodeMinChars')}
                />
                <label htmlFor="clashgram-change-new-primary">{lang('ClashgramPasscodeNewPrimary')}</label>
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
                  placeholder={lang('ClashgramPasscodeErrDifferent')}
                />
                <label htmlFor="clashgram-change-new-rec">{lang('ClashgramPasscodeNewRecovery')}</label>
              </div>
            </div>

            <Button
              onClick={handleChangePasscode}
              disabled={!changeVerifyInput || !changeNewPrimary || !changeNewRecovery}
              style="width: 100%; margin-top: 8px"
            >
              {lang('ClashgramPasscodeUpdateSettings')}
            </Button>
          </div>
        </>
      )}

      {/* 4. Sub-Screen: Reset via Recovery */}
      {activeSubScreen === 'recovery' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>{lang('ClashgramPasscodeResetRec')}</h3>
          </div>
          <div className="subscreen-body">
            {!recoverySuccess ? (
              <>
                <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
                  {lang('ClashgramPasscodeForgotDesc')}
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
                  <label htmlFor="clashgram-recovery-verify">{lang('ClashgramPasscodeRecovery')}</label>
                </div>

                <Button
                  onClick={handleVerifyRecovery}
                  disabled={!recoveryInput}
                  style="width: 100%"
                >
                  {lang('ClashgramPasscodeUseRecovery')}
                </Button>

                {/* Secure Account Exit Fallback */}
                <div style="margin-top: 15px; border-top: 1px dashed var(--color-borders); padding-top: 18px">
                  <p className="settings-item-description" style="margin: 0 0 8px 0; color: var(--color-error); font-weight: 600">
                    {lang('ClashgramPasscodeLostBothHeader')}
                  </p>
                  <p className="settings-item-description" style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
                    {lang('ClashgramPasscodeLostBothDesc')}
                  </p>
                  <Button onClick={handleResetAndLogout} color="danger" style="width: 100%">
                    {lang('ClashgramPasscodeLogoutReset')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="settings-item-description" style="margin: 0; color: #2ecc71; font-weight: 500">
                  {lang('ClashgramPasscodeRecoveryVerified')}
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
                    placeholder={lang('ClashgramPasscodeMinChars')}
                  />
                  <label htmlFor="clashgram-rec-new-p">{lang('ClashgramPasscodeNewPrimary')}</label>
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
                    placeholder={lang('ClashgramPasscodeErrDifferent')}
                  />
                  <label htmlFor="clashgram-rec-new-r">{lang('ClashgramPasscodeNewRecovery')}</label>
                </div>

                <Button
                  onClick={handleSetNewPasscodesAfterRecovery}
                  disabled={!recoveryNewPrimary || !recoveryNewRecovery}
                  style="width: 100%; margin-top: 8px"
                >
                  {lang('ClashgramPasscodeSaveNew')}
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
            <h3>{lang('ClashgramPasscodeManageItems')}</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0 0 8px 0; color: var(--color-text-secondary)">
              {lang('ClashgramPasscodeManageItemsDesc')}
            </p>

            {lockedChats.length === 0 && lockedFolders.length === 0 ? (
              <p style="margin: 30px 0; font-size: 14px; text-align: center; color: var(--color-text-secondary)">
                {lang('ClashgramPasscodeNoLockedItems')}
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
                      <Button onClick={() => handleUnlockFolder(folderId)} color="danger" size="tiny">{lang('Unlock')}</Button>
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
                      <Button onClick={() => handleUnlockChat(chatId)} color="danger" size="tiny">{lang('Unlock')}</Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="settings-item-description" style="margin: 10px 0 0 0; font-size: 12px; line-height: 1.4; color: var(--color-text-secondary)">
              {lang('ClashgramPasscodeManageItemsTip')}
            </p>
          </div>
        </>
      )}

      {/* 6. Sub-Screen: Disable Passcode Lock */}
      {activeSubScreen === 'disable' && (
        <>
          <div className="subscreen-header" onClick={() => navigateTo(null)}>
            <span className="back-arrow">←</span>
            <h3>{lang('ClashgramPasscodeDisable')}</h3>
          </div>
          <div className="subscreen-body">
            <p className="settings-item-description" style="margin: 0; color: var(--color-text-secondary)">
              {lang('ClashgramPasscodeDisableNote')}
            </p>

            <div className="auth-tab-bar">
              <div 
                className={`auth-tab ${disableAuthMode === 'primary' ? 'active' : ''}`}
                onClick={() => { setDisableAuthMode('primary'); clearMessages(); }}
              >
                {lang('ClashgramPasscodeUsePrimary')}
              </div>
              <div 
                className={`auth-tab ${disableAuthMode === 'recovery' ? 'active' : ''}`}
                onClick={() => { setDisableAuthMode('recovery'); clearMessages(); }}
              >
                {lang('ClashgramPasscodeUseRecovery')}
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
                placeholder={disableAuthMode === 'primary' ? lang('ClashgramPasscodeCurrent') : lang('ClashgramPasscodeRecovery')}
              />
              <label htmlFor="clashgram-disable-verify">
                {disableAuthMode === 'primary' ? lang('ClashgramPasscodeCurrent') : lang('ClashgramPasscodeRecovery')}
              </label>
            </div>

            <Button
              onClick={handleDisablePasscode}
              color="danger"
              disabled={!disableVerifyInput}
              style="width: 100%; margin-top: 8px"
            >
              {lang('ClashgramPasscodeDisableButton')}
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
