import { memo, useState, useEffect, useRef } from '../../lib/teact/teact';
import { getActions, withGlobal, getGlobal } from '../../global';
import type { GlobalState } from '../../global/types';
import { type ApiChat, type ApiMessage, ApiMediaFormat, MAIN_THREAD_ID } from '../../api/types';
import { selectChat, selectTabState } from '../../global/selectors';
import { selectMessageDownloadableMedia } from '../../global/selectors/media';
import { getMediaHash, getMediaFilename } from '../../global/helpers/messageMedia';
import { callApi } from '../../api/gramjs';
import { zipSync } from 'fflate';
import useLang from '../../hooks/useLang';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import RadioGroup from '../ui/RadioGroup';
import buildClassName from '../../util/buildClassName';
import styles from './ClashgramExportModal.module.scss';

export type OwnProps = {};

type StateProps = {
  isOpen: boolean;
  chatId?: string;
  chat?: ApiChat;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#bg-grad)" stroke="url(#accent-grad)" stroke-width="1.5"/>
  <circle cx="60" cy="60" r="38" fill="#172554" opacity="0.3" filter="url(#glow)"/>
  <g transform="translate(18, 16)">
    <path d="M72.26 21.05L21.72 40.54C18.28 41.87 18.3 43.78 21.09 44.64L34.05 48.68L64.04 29.77C65.46 28.91 66.75 29.37 65.68 30.32L41.38 52.26L40.44 65.5C41.74 65.5 42.31 64.9 43.04 64.2L49.28 58.13L62.24 67.7C64.63 69.02 66.35 68.34 66.95 65.48L75.44 25.43C76.31 21.87 74.06 20.25 72.26 21.05Z" fill="url(#plane-grad)"/>
    <path d="M40.44 65.5L42.2 59.8L34.05 48.68L40.44 65.5Z" fill="#1d4ed8" opacity="0.6"/>
  </g>
</svg>`;

const STYLE_CSS = `:root {
  --bg-color: #0e1621;
  --bg-sidebar: #17212b;
  --bg-header: #242f3d;
  --bg-message-received: #182533;
  --bg-message-sent: #2b5278;
  --border-color: #101921;
  --text-primary: #f5f5f5;
  --text-secondary: #7f91a4;
  --text-sent: #fff;
  --accent-color: #5288c1;
  --accent-hover: #6299d1;
  --danger-color: #e53935;
  --transition-speed: 0.2s;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.5;
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.app-header {
  background-color: var(--bg-header);
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-logo {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 8px rgba(6, 182, 212, 0.4));
}

.chat-info h1 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.chat-info .subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

#search-input {
  width: 100%;
  padding: 10px 16px 10px 42px;
  background-color: var(--bg-sidebar);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition-speed);
}

#search-input:focus {
  border-color: var(--accent-color);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  background-color: var(--bg-sidebar);
  padding: 4px;
  border-radius: 20px;
}

.filter-tab {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.filter-tab:hover {
  color: var(--text-primary);
}

.filter-tab.active {
  background-color: var(--accent-color);
  color: var(--text-sent);
}

.chat-viewport {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
  background-image: radial-gradient(circle at 50% 50%, #1c2738 0%, var(--bg-color) 100%);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

.message-row {
  display: flex;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-row.sent {
  justify-content: flex-end;
}

.message-row.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

.message-row.sent .message-bubble {
  background-color: var(--bg-message-sent);
  color: var(--text-sent);
  border-bottom-right-radius: 4px;
}

.message-row.received .message-bubble {
  background-color: var(--bg-message-received);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.sender-name {
  font-size: 13px;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 4px;
}

.message-row.sent .sender-name {
  color: #a4c7ec;
}

.message-text {
  font-size: 14.5px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 6px;
}

.message-row.sent .message-meta {
  color: rgba(255, 255, 255, 0.65);
}

.media-container {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}

img, video {
  max-width: 100%;
  border-radius: 8px;
  max-height: 320px;
  object-fit: cover;
  transition: transform var(--transition-speed);
}

img:hover {
  transform: scale(1.02);
}

audio {
  width: 100%;
  margin-top: 6px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.25);
  padding: 12px;
  border-radius: 10px;
  margin-top: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(255,255,255,0.05);
  transition: background var(--transition-speed);
}

.file-card:hover {
  background: rgba(0, 0, 0, 0.35);
}

.file-icon {
  font-size: 28px;
  background-color: var(--accent-color);
  padding: 8px;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13.5px;
  font-weight: 500;
  word-break: break-all;
}

.file-size {
  font-size: 11.5px;
  color: var(--text-secondary);
}

.message-row.sent .file-size {
  color: rgba(255, 255, 255, 0.7);
}

.chat-viewport::-webkit-scrollbar {
  width: 8px;
}

.chat-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.chat-viewport::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.chat-viewport::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
  text-align: center;
}
`;

const APP_JS = `document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const messageRows = document.querySelectorAll('.message-row');
  const messagesList = document.getElementById('messages-list');

  let activeFilter = 'all';
  let searchQuery = '';

  const noResultsEl = document.createElement('div');
  noResultsEl.className = 'no-messages';
  noResultsEl.textContent = 'No messages match your criteria.';
  noResultsEl.style.display = 'none';
  messagesList.appendChild(noResultsEl);

  function applyFilters() {
    let visibleCount = 0;

    messageRows.forEach(row => {
      const textContent = (row.querySelector('.message-text')?.textContent || '').toLowerCase();
      const senderName = (row.querySelector('.sender-name')?.textContent || '').toLowerCase();
      const hasMedia = row.querySelector('.media-container, .file-card') !== null;

      const matchesSearch = textContent.includes(searchQuery) || senderName.includes(searchQuery);

      let matchesType = true;
      if (activeFilter === 'text') {
        matchesType = !hasMedia && textContent.trim().length > 0;
      } else if (activeFilter === 'media') {
        matchesType = hasMedia;
      }

      if (matchesSearch && matchesType) {
        row.style.display = 'flex';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      noResultsEl.style.display = 'flex';
    } else {
      noResultsEl.style.display = 'none';
    }
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      applyFilters();
    });
  });
});
`;

const INDEX_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clashgram Chat Export: CHAT_TITLE</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="app-layout">
    <header class="app-header">
      <div class="logo-container">
        <img class="app-logo" src="assets/logo.svg" alt="Clashgram Logo">
        <div class="chat-info">
          <h1>CHAT_TITLE</h1>
          <p class="subtitle">Chat Export • MSG_COUNT Messages</p>
        </div>
      </div>
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" id="search-input" placeholder="Search messages...">
        </div>
        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="all">{lang('ClashgramExportRangeAll')}</button>
          <button class="filter-tab" data-filter="text">Text</button>
          <button class="filter-tab" data-filter="media">Media</button>
        </div>
      </div>
    </header>
    
    <main class="chat-viewport">
      <div class="messages-list" id="messages-list">
        <!-- MESSAGES_HTML -->
      </div>
    </main>
  </div>
  <script src="js/app.js" defer></script>
</body>
</html>
`;

function getSenderName(global: any, msg: ApiMessage, chat: ApiChat) {
  const senderId = msg.senderId;
  const currentUser = global.currentUserId ? global.users.byId[global.currentUserId] : undefined;
  
  if (msg.isOutgoing) {
    if (currentUser) {
      const name = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ');
      return name ? `You (${name})` : 'You';
    }
    return 'You';
  }

  if (!senderId) {
    return chat.title || 'Unknown Chat';
  }

  const user = global.users.byId[senderId];
  if (user) {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    if (name) return name;
    if (user.username) return `@${user.username}`;
    return `User ${senderId}`;
  }

  const senderChat = global.chats.byId[senderId];
  if (senderChat) {
    return senderChat.title || `Chat ${senderId}`;
  }

  return `User ${senderId}`;
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function ClashgramExportModal({
  isOpen,
  chatId,
  chat,
}: OwnProps & StateProps) {
  const { closeClashgramExportModal } = getActions();
  const lang = useLang();

  const [format, setFormat] = useState<'html' | 'json'>('html');
  const [exportPhotos, setExportPhotos] = useState(true);
  const [exportVideos, setExportVideos] = useState(true);
  const [exportAudios, setExportAudios] = useState(true);
  const [exportVoices, setExportVoices] = useState(true);
  const [exportStickers, setExportStickers] = useState(true);
  const [exportDocs, setExportDocs] = useState(true);

  // Range and Date limits states
  const [exportRange, setExportRange] = useState<'50' | '100' | 'all' | 'date'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Status and Progress States
  const [isExporting, setIsExporting] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [logs, setLogs] = useState('');

  const isAbortedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setIsExporting(false);
      setProgressText('');
      setProgressPercent(0);
      setLogs('');
      isAbortedRef.current = false;
      setExportRange('all');
      setStartDate('');
      setEndDate('');
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  const logMessage = (msg: string) => {
    setLogs((prev) => prev + `[${new Date().toLocaleTimeString()}] ${msg}\n`);
  };

  const handleStartExport = async () => {
    setValidationError('');

    // Pre-export validations
    if (exportRange === 'date') {
      if (!startDate || !endDate) {
        setValidationError(lang('ClashgramExportErrBothDates'));
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setValidationError(lang('ClashgramExportErrDateRange'));
        return;
      }
    }

    setIsExporting(true);
    isAbortedRef.current = false;
    setProgressPercent(5);
    setProgressText(lang('ClashgramExportProgressFetch'));
    logMessage(`Starting export for chat: ${chat.title}`);

    try {
      let offsetId = 0;
      let allMessages: ApiMessage[] = [];
      const seenIds = new Set<number>();
      let hasMore = true;

      const startTimestamp = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
      const endTimestamp = endDate ? Math.floor(new Date(endDate).getTime() / 1000) + 86399 : Infinity;

      logMessage(lang('ClashgramExportProgressHistory'));
      while (hasMore) {
        if (isAbortedRef.current) break;

        const result = await callApi('fetchMessages', {
          chat,
          threadId: MAIN_THREAD_ID,
          offsetId,
          limit: 100,
        });

        if (!result || !result.messages || result.messages.length === 0) {
          break;
        }

        let newFetched = 0;
        let reachedStartTime = false;

        for (const msg of result.messages) {
          if (!seenIds.has(msg.id)) {
            seenIds.add(msg.id);

            if (exportRange === 'date') {
              if (msg.date < startTimestamp) {
                reachedStartTime = true;
                continue;
              }
              if (msg.date > endTimestamp) {
                continue;
              }
            }

            allMessages.push(msg);
            newFetched++;
          }
        }

        if (reachedStartTime) {
          logMessage('Reached specified start date limit.');
          break;
        }

        if (newFetched === 0) {
          break;
        }

        if (exportRange === '50' && allMessages.length >= 50) {
          allMessages = allMessages.slice(0, 50);
          break;
        }
        if (exportRange === '100' && allMessages.length >= 100) {
          allMessages = allMessages.slice(0, 100);
          break;
        }

        setProgressText(`${lang('ClashgramExportProgressHistory')} ${allMessages.length}...`);
        offsetId = result.messages[result.messages.length - 1].id;
        
        // Minor delay to prevent aggressive flooding
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      if (isAbortedRef.current) {
        logMessage('Export cancelled by user.');
        setIsExporting(false);
        return;
      }

      logMessage(`Fetched ${allMessages.length} total messages.`);
      setProgressPercent(30);

      // Media downloading phase
      setProgressText(lang('ClashgramExportProgressMedia'));
      const mediaFiles: Record<number, string> = {}; // msgId -> relative filename
      const zipEntries: Record<string, Uint8Array> = {};

      const global = getGlobal();
      let downloadedCount = 0;
      const mediaMessages = allMessages.filter((msg) => {
        const media = selectMessageDownloadableMedia(global, msg);
        if (!media) return false;

        if (media.mediaType === 'photo' && exportPhotos) return true;
        if (media.mediaType === 'video') {
          if (media.isRound && exportVoices) return true;
          if (!media.isRound && !media.isGif && exportVideos) return true;
          if (media.isGif && exportVideos) return true;
        }
        if (media.mediaType === 'audio' && exportAudios) return true;
        if (media.mediaType === 'voice' && exportVoices) return true;
        if (media.mediaType === 'sticker' && exportStickers) return true;
        if (media.mediaType === 'document' && exportDocs) return true;

        return false;
      });

      logMessage(`Found ${mediaMessages.length} messages containing media to download.`);

      // Parallel execution helper with concurrency limit (e.g., 5 workers)
      const CONCURRENCY_LIMIT = 5;
      let downloadedProgressCount = 0;

      const downloadTasks = mediaMessages.map((msg) => async () => {
        if (isAbortedRef.current) return;

        const media = selectMessageDownloadableMedia(global, msg)!;
        const mediaHash = getMediaHash(media, 'download');

        if (mediaHash) {
          logMessage(`Downloading media for message ID ${msg.id}...`);

          try {
            const result = await callApi('downloadMedia', {
              url: mediaHash,
              mediaFormat: ApiMediaFormat.BlobUrl,
            });

            if (result && result.dataBlob) {
              const blob = result.dataBlob instanceof Blob ? result.dataBlob : new Blob([result.dataBlob]);
              const buffer = await blob.arrayBuffer();
              const filename = getMediaFilename(media) || `media-${msg.id}`;
              const uniqueFilename = `${msg.id}_${filename}`;

              zipEntries[`media/${uniqueFilename}`] = new Uint8Array(buffer);
              mediaFiles[msg.id] = uniqueFilename;
              downloadedCount++;
            }
          } catch (err) {
            logMessage(`Error downloading media for msg ID ${msg.id}: ${err}`);
          }
        }

        // Update progress safely
        const completed = ++downloadedProgressCount;
        setProgressText(lang('ClashgramExportProgressMediaProgress', { completed, total: mediaMessages.length }));
        setProgressPercent(Math.floor(30 + (completed / mediaMessages.length) * 50));
      });

      const executePool = async (tasks: (() => Promise<void>)[]) => {
        const pool: Promise<void>[] = [];
        for (const task of tasks) {
          if (isAbortedRef.current) break;
          const promise = task().then(() => {
            pool.splice(pool.indexOf(promise), 1);
          });
          pool.push(promise);
          if (pool.length >= CONCURRENCY_LIMIT) {
            await Promise.race(pool);
          }
        }
        await Promise.all(pool);
      };

      await executePool(downloadTasks);

      if (isAbortedRef.current) {
        logMessage('Export cancelled by user.');
        setIsExporting(false);
        return;
      }

      setProgressPercent(80);
      setProgressText(lang('ClashgramExportProgressStructuring'));
      logMessage(`Downloaded ${downloadedCount} media files.`);

      if (format === 'json') {
        const jsonOutput = allMessages.map((msg) => {
          const exportMsg: any = {
            id: msg.id,
            date: msg.date,
            senderId: msg.senderId,
            isOutgoing: msg.isOutgoing,
            text: msg.content.text?.text || '',
          };

          if (mediaFiles[msg.id]) {
            exportMsg.media = `media/${mediaFiles[msg.id]}`;
          }

          return exportMsg;
        });

        const jsonString = JSON.stringify(jsonOutput, null, 2);
        zipEntries['messages.json'] = new TextEncoder().encode(jsonString);
      } else {
        // Generate beautiful structured export files
        zipEntries['assets/logo.svg'] = new TextEncoder().encode(LOGO_SVG);
        zipEntries['css/style.css'] = new TextEncoder().encode(STYLE_CSS);
        zipEntries['js/app.js'] = new TextEncoder().encode(APP_JS);

        let messagesHtml = '';

        // Loop forward to display chronologically
        for (let i = allMessages.length - 1; i >= 0; i--) {
          const msg = allMessages[i];
          const directionClass = msg.isOutgoing ? 'sent' : 'received';
          const sender = getSenderName(global, msg, chat);
          const dateStr = new Date(msg.date * 1000).toLocaleString();
          let mediaHtml = '';

          if (mediaFiles[msg.id]) {
            const filePath = `media/${mediaFiles[msg.id]}`;
            const media = selectMessageDownloadableMedia(global, msg);

            if (media) {
              if (media.mediaType === 'photo') {
                mediaHtml = `<div class="media-container"><img src="${filePath}" /></div>`;
              } else if (media.mediaType === 'video') {
                mediaHtml = `<div class="media-container"><video src="${filePath}" controls></video></div>`;
              } else if (media.mediaType === 'audio' || media.mediaType === 'voice') {
                mediaHtml = `<div class="media-container"><audio src="${filePath}" controls></audio></div>`;
              } else if (media.mediaType === 'sticker') {
                mediaHtml = `<div class="media-container"><img src="${filePath}" style="max-width:120px;" /></div>`;
              } else if (media.mediaType === 'document') {
                mediaHtml = `
                  <a href="${filePath}" download class="file-card">
                    <span class="file-icon">📁</span>
                    <div class="file-info">
                      <span class="file-name">${escapeHtml(media.fileName || 'Document')}</span>
                      <span class="file-size">${formatBytes(media.size)}</span>
                    </div>
                  </a>
                `;
              }
            }
          }

          const textHtml = escapeHtml(msg.content.text?.text || '');
          messagesHtml += `
      <div class="message-row ${directionClass}">
        <div class="message-bubble">
          <div class="sender-name">${escapeHtml(sender)}</div>
          ${textHtml ? `<div class="message-text">${textHtml}</div>` : ''}
          ${mediaHtml}
          <div class="message-meta">${dateStr}</div>
        </div>
      </div>`;
        }

        const indexHtml = INDEX_HTML_TEMPLATE
          .replace(/CHAT_TITLE/g, () => escapeHtml(chat.title))
          .replace(/MSG_COUNT/g, () => String(allMessages.length))
          .replace(/<!-- MESSAGES_HTML -->/, () => messagesHtml);

        zipEntries['index.html'] = new TextEncoder().encode(indexHtml);
      }

      setProgressPercent(90);
      setProgressText(lang('ClashgramExportProgressCompressing'));
      logMessage(lang('ClashgramExportProgressCompressing'));

      // Run zipping
      const zipped = zipSync(zipEntries);

      setProgressPercent(98);
      setProgressText(lang('ClashgramExportProgressTriggering'));
      logMessage(lang('ClashgramExportProgressTriggering'));

      const blob = new Blob([zipped as any], { type: 'application/zip' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Clashgram_Export_${chat.title.replace(/\s+/g, '_')}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setProgressPercent(100);
      setProgressText(lang('ClashgramExportProgressSuccess'));
      logMessage(lang('ClashgramExportProgressSuccess'));
    } catch (err) {
      logMessage(`Error during export: ${err}`);
      setProgressText(lang('ClashgramExportProgressFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleAbort = () => {
    isAbortedRef.current = true;
    setProgressText(lang('ClashgramExportProgressAborted'));
    setIsExporting(false);
    logMessage('Export aborted by user.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeClashgramExportModal}
      className={buildClassName(styles.modal, 'narrow')}
      title={lang('ClashgramExportTitle')}
    >
      <div className={styles.container}>
        <p className={styles.description}>
          {lang('ClashgramExportDesc')}
        </p>

        {!isExporting && progressPercent !== 100 && (
          <>
            {validationError && (
              <div className={styles.errorBanner}>
                ⚠️ {validationError}
              </div>
            )}

            <div className={styles.optionsSection}>
              <h4 className={styles.sectionHeader}>{lang('ClashgramExportRange')}</h4>
              <div className={styles.rangeSelector}>
                <button
                  type="button"
                  className={buildClassName(styles.rangeButton, exportRange === '50' && styles.rangeButtonActive)}
                  onClick={() => { setExportRange('50'); setValidationError(''); }}
                >
                  {lang('ClashgramExportRange50')}
                </button>
                <button
                  type="button"
                  className={buildClassName(styles.rangeButton, exportRange === '100' && styles.rangeButtonActive)}
                  onClick={() => { setExportRange('100'); setValidationError(''); }}
                >
                  {lang('ClashgramExportRange100')}
                </button>
                <button
                  type="button"
                  className={buildClassName(styles.rangeButton, exportRange === 'all' && styles.rangeButtonActive)}
                  onClick={() => { setExportRange('all'); setValidationError(''); }}
                >
                  All
                </button>
                <button
                  type="button"
                  className={buildClassName(styles.rangeButton, exportRange === 'date' && styles.rangeButtonActive)}
                  onClick={() => { setExportRange('date'); setValidationError(''); }}
                >
                  {lang('ClashgramExportRangeDate')}
                </button>
              </div>
            </div>

            {exportRange === 'date' && (
              <div className={styles.dateContainer}>
                <div className={styles.dateField}>
                  <label className={styles.dateLabel}>{lang('ClashgramExportStartDate')}</label>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={startDate}
                    onChange={(e) => { setStartDate((e.target as HTMLInputElement).value); setValidationError(''); }}
                  />
                </div>
                <div className={styles.dateField}>
                  <label className={styles.dateLabel}>{lang('ClashgramExportEndDate')}</label>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={endDate}
                    onChange={(e) => { setEndDate((e.target as HTMLInputElement).value); setValidationError(''); }}
                  />
                </div>
              </div>
            )}

            <div className={styles.optionsSection}>
              <h4 className={styles.sectionHeader}>{lang('ClashgramExportFormat')}</h4>
              <RadioGroup
                name="export-format"
                options={[
                  { label: lang('ClashgramExportFormatHtml'), value: 'html' },
                  { label: lang('ClashgramExportFormatJson'), value: 'json' },
                ]}
                selected={format}
                onChange={(val) => setFormat(val as 'html' | 'json')}
              />
            </div>

            <div className={styles.optionsSection}>
              <h4 className={styles.sectionHeader}>{lang('ClashgramExportMedia')}</h4>
              <div className={styles.checkboxes}>
                <Checkbox
                  label={lang('ClashgramExportMediaPhotos')}
                  checked={exportPhotos}
                  onCheck={setExportPhotos}
                />
                <Checkbox
                  label={lang('ClashgramExportMediaVideos')}
                  checked={exportVideos}
                  onCheck={setExportVideos}
                />
                <Checkbox
                  label={lang('ClashgramExportMediaAudios')}
                  checked={exportAudios}
                  onCheck={setExportAudios}
                />
                <Checkbox
                  label={lang('ClashgramExportMediaVoices')}
                  checked={exportVoices}
                  onCheck={setExportVoices}
                />
                <Checkbox
                  label={lang('ClashgramExportMediaStickers')}
                  checked={exportStickers}
                  onCheck={setExportStickers}
                />
                <Checkbox
                  label={lang('ClashgramExportMediaDocs')}
                  checked={exportDocs}
                  onCheck={setExportDocs}
                />
              </div>
            </div>
          </>
        )}

        {(isExporting || progressPercent > 0) && (
          <div className={styles.progressContainer}>
            <span className={styles.progressLabel}>{progressText}</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={`width: ${progressPercent}%`}
              />
            </div>
            <pre className={styles.statusLog}>{logs}</pre>
          </div>
        )}

        <div className="dialog-buttons mt-4">
          {isExporting ? (
            <Button
              type="button"
              color="danger"
              onClick={handleAbort}
            >
              {lang('ClashgramExportButtonCancel')}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                color="translucent"
                onClick={() => closeClashgramExportModal()}
              >
                {lang('ClashgramExportButtonClose')}
              </Button>
              <Button
                type="button"
                color="primary"
                onClick={handleStartExport}
              >
                {lang('ClashgramExportButtonStart')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const tabState = selectTabState(global);
    const exportModal = tabState.clashgramExportModal;
    const chatId = exportModal?.chatId;
    const chat = chatId ? selectChat(global, chatId) : undefined;

    return {
      isOpen: Boolean(exportModal?.isOpen),
      chatId,
      chat,
    };
  },
)(ClashgramExportModal));
