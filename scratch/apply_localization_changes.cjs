const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Patch ClashgramExportModal.tsx
const exportModalPath = path.join(root, 'src', 'components', 'common', 'ClashgramExportModal.tsx');
if (fs.existsSync(exportModalPath)) {
  let content = fs.readFileSync(exportModalPath, 'utf8');

  // Add import useLang
  content = content.replace(
    "import Modal from '../ui/Modal';",
    "import useLang from '../../hooks/useLang';\nimport Modal from '../ui/Modal';"
  );

  // Add const lang = useLang()
  content = content.replace(
    `function ClashgramExportModal({
  isOpen,
  chatId,
  chat,
}: OwnProps & StateProps) {
  const { closeClashgramExportModal } = getActions();`,
    `function ClashgramExportModal({
  isOpen,
  chatId,
  chat,
}: OwnProps & StateProps) {
  const { closeClashgramExportModal } = getActions();
  const lang = useLang();`
  );

  // Replace validation error messages
  content = content.replace(
    "setValidationError('Please select both start and end dates.');",
    "setValidationError(lang('ClashgramExportErrBothDates'));"
  );
  content = content.replace(
    "setValidationError('Start date cannot be after end date.');",
    "setValidationError(lang('ClashgramExportErrDateRange'));"
  );

  // Replace progress texts and log messages
  content = content.replace(
    "setProgressText('Preparing message fetch...');",
    "setProgressText(lang('ClashgramExportProgressFetch'));"
  );
  content = content.replace(
    "logMessage('Fetching chat history...');",
    "logMessage(lang('ClashgramExportProgressHistory'));"
  );
  content = content.replace(
    "setProgressText(`Fetched ${allMessages.length} messages...`);",
    "setProgressText(`${lang('ClashgramExportProgressHistory')} ${allMessages.length}...`);"
  );
  content = content.replace(
    "setProgressText('Checking and downloading media...');",
    "setProgressText(lang('ClashgramExportProgressMedia'));"
  );
  content = content.replace(
    "setProgressText(`Downloading media ${completed}/${mediaMessages.length}...`);",
    "setProgressText(lang('ClashgramExportProgressMediaProgress', { completed, total: mediaMessages.length }));"
  );
  content = content.replace(
    "setProgressText('Structuring export file...');",
    "setProgressText(lang('ClashgramExportProgressStructuring'));"
  );
  content = content.replace(
    "setProgressText('Compressing ZIP file...');",
    "setProgressText(lang('ClashgramExportProgressCompressing'));"
  );
  content = content.replace(
    "logMessage('Compressing everything into a ZIP archive...');",
    "logMessage(lang('ClashgramExportProgressCompressing'));"
  );
  content = content.replace(
    "setProgressText('Triggering download...');",
    "setProgressText(lang('ClashgramExportProgressTriggering'));"
  );
  content = content.replace(
    "logMessage('Generating download trigger...');",
    "logMessage(lang('ClashgramExportProgressTriggering'));"
  );
  content = content.replace(
    "setProgressText('Export completed successfully!');",
    "setProgressText(lang('ClashgramExportProgressSuccess'));"
  );
  content = content.replace(
    "logMessage('Export completed!');",
    "logMessage(lang('ClashgramExportProgressSuccess'));"
  );
  content = content.replace(
    "setProgressText('Export failed.');",
    "setProgressText(lang('ClashgramExportProgressFailed'));"
  );
  content = content.replace(
    "setProgressText('Export aborted.');",
    "setProgressText(lang('ClashgramExportProgressAborted'));"
  );

  // Replace JSX titles, descriptions, and labels
  content = content.replace(
    'title="Export Chat History"',
    'title={lang(\'ClashgramExportTitle\')}'
  );
  content = content.replace(
    `<p className={styles.description}>
          Export messages and media from this chat locally. The exported content will be packaged into a ZIP archive.
        </p>`,
    `<p className={styles.description}>
          {lang('ClashgramExportDesc')}
        </p>`
  );
  content = content.replace(
    '<h4 className={styles.sectionHeader}>Export Range</h4>',
    '<h4 className={styles.sectionHeader}>{lang(\'ClashgramExportRange\')}</h4>'
  );
  content = content.replace(
    'Recent 50',
    '{lang(\'ClashgramExportRange50\')}'
  );
  content = content.replace(
    'Recent 100',
    '{lang(\'ClashgramExportRange100\')}'
  );
  content = content.replace(
    '>All<',
    '>{lang(\'ClashgramExportRangeAll\')}<'
  );
  content = content.replace(
    'By Date',
    '{lang(\'ClashgramExportRangeDate\')}'
  );
  content = content.replace(
    'Start Date',
    '{lang(\'ClashgramExportStartDate\')}'
  );
  content = content.replace(
    'End Date',
    '{lang(\'ClashgramExportEndDate\')}'
  );
  content = content.replace(
    '<h4 className={styles.sectionHeader}>Format</h4>',
    '<h4 className={styles.sectionHeader}>{lang(\'ClashgramExportFormat\')}</h4>'
  );
  content = content.replace(
    "{ label: 'HTML (Beautiful web view)', value: 'html' }",
    "{ label: lang('ClashgramExportFormatHtml'), value: 'html' }"
  );
  content = content.replace(
    "{ label: 'JSON (Raw data)', value: 'json' }",
    "{ label: lang('ClashgramExportFormatJson'), value: 'json' }"
  );
  content = content.replace(
    '<h4 className={styles.sectionHeader}>Media to include</h4>',
    '<h4 className={styles.sectionHeader}>{lang(\'ClashgramExportMedia\')}</h4>'
  );
  content = content.replace(
    'label="Photos"',
    'label={lang(\'ClashgramExportMediaPhotos\')}'
  );
  content = content.replace(
    'label="Videos"',
    'label={lang(\'ClashgramExportMediaVideos\')}'
  );
  content = content.replace(
    'label="Audio files"',
    'label={lang(\'ClashgramExportMediaAudios\')}'
  );
  content = content.replace(
    'label="Voice messages"',
    'label={lang(\'ClashgramExportMediaVoices\')}'
  );
  content = content.replace(
    'label="Stickers"',
    'label={lang(\'ClashgramExportMediaStickers\')}'
  );
  content = content.replace(
    'label="Files & Documents"',
    'label={lang(\'ClashgramExportMediaDocs\')}'
  );
  content = content.replace(
    `            <Button
              type="button"
              color="danger"
              onClick={handleAbort}
            >
              Cancel
            </Button>`,
    `            <Button
              type="button"
              color="danger"
              onClick={handleAbort}
            >
              {lang('ClashgramExportButtonCancel')}
            </Button>`
  );
  content = content.replace(
    `              <Button
                type="button"
                color="translucent"
                onClick={() => closeClashgramExportModal()}
              >
                Close
              </Button>`,
    `              <Button
                type="button"
                color="translucent"
                onClick={() => closeClashgramExportModal()}
              >
                {lang('ClashgramExportButtonClose')}
              </Button>`
  );
  content = content.replace(
    `              <Button
                type="button"
                color="primary"
                onClick={handleStartExport}
              >
                Start Export
              </Button>`,
    `              <Button
                type="button"
                color="primary"
                onClick={handleStartExport}
              >
                {lang('ClashgramExportButtonStart')}
              </Button>`
  );

  fs.writeFileSync(exportModalPath, content, 'utf8');
  console.log('Successfully patched ClashgramExportModal.tsx');
}

// 2. Patch ClashgramPasscodeModal.tsx
const passcodeModalPath = path.join(root, 'src', 'components', 'common', 'ClashgramPasscodeModal.tsx');
if (fs.existsSync(passcodeModalPath)) {
  let content = fs.readFileSync(passcodeModalPath, 'utf8');

  // Add import useLang
  content = content.replace(
    "import Modal from '../ui/Modal';",
    "import useLang from '../../hooks/useLang';\nimport Modal from '../ui/Modal';"
  );

  // Add const lang = useLang()
  content = content.replace(
    `function ClashgramPasscodeModal({
  isOpen,
  type,
  targetId,
  pendingAction,
}: OwnProps & StateProps) {
  const { closeClashgramPasscodeModal, openChat, setActiveChatFolder, signOut } = getActions();`,
    `function ClashgramPasscodeModal({
  isOpen,
  type,
  targetId,
  pendingAction,
}: OwnProps & StateProps) {
  const { closeClashgramPasscodeModal, openChat, setActiveChatFolder, signOut } = getActions();
  const lang = useLang();`
  );

  // Replace labels in form render
  content = content.replace(
    `<h2 className={styles.title}>Reset & Logout?</h2>`,
    `<h2 className={styles.title}>{lang('ClashgramPasscodeResetLogoutTitle')}</h2>`
  );
  content = content.replace(
    `<p className={styles.description}>
              If you forgot your passcodes, you must log out of your account to clear them. This will delete all local locks.
            </p>`,
    `<p className={styles.description}>
              {lang('ClashgramPasscodeResetLogoutDesc')}
            </p>`
  );
  content = content.replace(
    `<Button type="button" color="translucent" onClick={handleBackToPasscode}>
                 Back
               </Button>`,
    `<Button type="button" color="translucent" onClick={handleBackToPasscode}>
                 {lang('ClashgramPasscodeButtonBack')}
               </Button>`
  );
  content = content.replace(
    `<Button type="button" color="danger" onClick={handleLogoutReset}>
                 Logout & Reset
               </Button>`,
    `<Button type="button" color="danger" onClick={handleLogoutReset}>
                 {lang('ClashgramPasscodeButtonLogoutReset')}
               </Button>`
  );

  // Main screen passcode lock titles & descriptions
  content = content.replace(
    `              <h2 className={styles.title}>
                {isRecoverySuccess
                  ? 'Reset Primary Passcode'
                  : isRecoveryMode
                  ? 'Bypass Lock'
                  : \`Unlock \${type === 'folder' ? 'Folder' : 'Chat'}\`}
              </h2>`,
    `              <h2 className={styles.title}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeResetPrimary')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeBypassLock')
                  : type === 'folder' ? lang('ClashgramPasscodeUnlockFolder') : lang('ClashgramPasscodeUnlockChat')}
              </h2>`
  );
  content = content.replace(
    `              <p className={styles.description}>
                {isRecoverySuccess
                  ? 'Recovery verified! Choose a new primary passcode of at least 4 characters to unlock.'
                  : isRecoveryMode
                  ? 'Enter recovery passcode to bypass primary lock.'
                  : \`This \${type === 'folder' ? 'folder' : 'chat'} is protected by local passcode.\`}
              </p>`,
    `              <p className={styles.description}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeRecoveryVerifiedSuccess')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeRecoveryBypassDesc')
                  : type === 'folder' ? lang('ClashgramPasscodeFolderProtectedDesc') : lang('ClashgramPasscodeChatProtectedDesc')}
              </p>`
  );

  // Error texts
  content = content.replace(
    `              <p className={styles.errorText}>
                {isRecoverySuccess
                  ? 'Passcode must be at least 4 characters'
                  : isRecoveryMode
                  ? 'Incorrect recovery passcode'
                  : 'Incorrect passcode, try again'}
              </p>`,
    `              <p className={styles.errorText}>
                {isRecoverySuccess
                  ? lang('ClashgramPasscodeErrMinLength')
                  : isRecoveryMode
                  ? lang('ClashgramPasscodeErrIncorrectRecovery')
                  : lang('ClashgramPasscodeErrIncorrectPrimary')}
              </p>`
  );

  // Forgot buttons
  content = content.replace(
    `              <button type="button" className={styles.forgotBtn} onClick={handleForgotClick}>
                {isRecoveryMode ? 'Forgot recovery passcode too?' : 'Forgot passcode?'}
              </button>`,
    `              <button type="button" className={styles.forgotBtn} onClick={handleForgotClick}>
                {isRecoveryMode ? lang('ClashgramPasscodeForgotRecovery') : lang('ClashgramPasscodeForgot')}
              </button>`
  );

  // Action buttons
  content = content.replace(
    `              <Button
                type="button"
                color="translucent"
                onClick={handleClose}
              >
                Cancel
              </Button>`,
    `              <Button
                type="button"
                color="translucent"
                onClick={handleClose}
              >
                {lang('ClashgramPasscodeButtonCancel')}
              </Button>`
  );
  content = content.replace(
    `              <Button
                type="submit"
                color="primary"
                disabled={!passcode}
              >
                {isRecoverySuccess ? 'Save & Unlock' : 'Unlock'}
              </Button>`,
    `              <Button
                type="submit"
                color="primary"
                disabled={!passcode}
              >
                {isRecoverySuccess ? lang('ClashgramPasscodeButtonSaveUnlock') : lang('ClashgramPasscodeButtonUnlock')}
              </Button>`
  );

  fs.writeFileSync(passcodeModalPath, content, 'utf8');
  console.log('Successfully patched ClashgramPasscodeModal.tsx');
}
