import { DEBUG, DEBUG_ALERT_MSG } from '../config';
import { isCurrentTabMaster } from './establishMultitabRole';
import { throttle } from './schedulers';

let showError = true;
let error: Error | undefined;

window.addEventListener('error', handleErrorEvent);
window.addEventListener('unhandledrejection', handleErrorEvent);

if (DEBUG) {
  window.addEventListener('focus', () => {
    if (!isCurrentTabMaster()) {
      return;
    }
    showError = true;
    if (error) {
      window.alert(getErrorMessage(error));
      error = undefined;
    }
  });
  window.addEventListener('blur', () => {
    if (!isCurrentTabMaster()) {
      return;
    }
    showError = false;
  });
}

const throttleError = throttle((err) => {
  if (showError) {
    window.alert(getErrorMessage(err));
  } else {
    error = err;
  }
}, 1500);

export function handleError(err: any) {
  // eslint-disable-next-line no-console
  console.error(err);

  const reasonStr = err && (err.message || String(err)) || '';
  if (
    reasonStr.includes('MSGID_DECREASE_RETRY')
    || reasonStr.includes('MSGID_DECREASE')
    || reasonStr.includes('Unexpected mutation detected')
  ) {
    return;
  }

  if (DEBUG) {
    throttleError(err || new Error('Unknown error'));
  }
}

function handleErrorEvent(e: ErrorEvent | PromiseRejectionEvent) {
  if (e instanceof ErrorEvent) {
    // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
    if (e.message === 'ResizeObserver loop limit exceeded') {
      return;
    }

    // Flood wait errors
    if (e.message && e.message.includes('A wait of')) {
      return;
    }
  }

  const reason = e instanceof ErrorEvent ? (e.error || e.message) : e.reason;
  const reasonStr = reason && (reason.message || String(reason)) || '';
  if (
    reasonStr.includes('MSGID_DECREASE_RETRY')
    || reasonStr.includes('MSGID_DECREASE')
    || reasonStr.includes('Unexpected mutation detected')
  ) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  handleError(reason);
}

function getErrorMessage(err: any) {
  const message = (err && (err.message || String(err))) || 'Unknown error';
  const stack = err && err.stack ? `\n${err.stack}` : '';
  return `${DEBUG_ALERT_MSG}\n\n${message}${stack}`;
}
