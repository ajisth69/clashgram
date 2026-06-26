/* eslint-disable no-console */

import '../../../util/polyfill';

import type { DebugLevel } from '../../../util/debugConsole';
import type { ApiOnProgress, ApiUpdate } from '../../types';
import type { OriginMessageEvent, WorkerPayload } from './types';

import { DEBUG } from '../../../config';
import { DEBUG_LEVELS } from '../../../util/debugConsole';
import { throttleWithTickEnd } from '../../../util/schedulers';
import { buildApiError, log } from '../helpers/misc';
import { callApi, cancelApiProgress, initApi } from '../methods/init';
import { getClient } from '../methods/client';

declare const self: WorkerGlobalScope;

const ORIGINAL_FUNCTIONS = DEBUG_LEVELS.reduce((acc, level) => {
  acc[level] = console[level];
  return acc;
}, {} as Record<DebugLevel, (...args: any[]) => void>);

function enableDebugLog() {
  DEBUG_LEVELS.forEach((level) => {
    console[level] = (...args: any[]) => {
      postMessage({
        type: 'debugLog',
        level,
        args: JSON.parse(JSON.stringify(args, (key, value) => (typeof value === 'bigint'
          ? value.toString()
          : value))),
      });
    };
  });
}

function disableDebugLog() {
  DEBUG_LEVELS.forEach((level) => {
    console[level] = ORIGINAL_FUNCTIONS[level];
  });
}

handleErrors();

let pendingPayloads: WorkerPayload[] = [];
let pendingTransferables: Transferable[] = [];
let pendingUpdates: ApiUpdate[] = [];

const callbackState = new Map<string, ApiOnProgress>();

if (DEBUG) {
  console.log('>>> FINISH LOAD WORKER');
}

onmessage = ({ data }: OriginMessageEvent) => {
  data.payloads.forEach(async (payload) => {
    switch (payload.type) {
      case 'initApi': {
        const { messageId, args } = payload;
        initApi(onUpdate, args[0], args[1]).then(() => {
          if (messageId) {
            sendToOrigin({
              type: 'methodResponse',
              messageId,
              response: true,
            });
          }
        });
        break;
      }
      case 'callMethod': {
        const {
          messageId, name, args, withCallback,
        } = payload;
        try {
          if (messageId && withCallback) {
            const callback = (...callbackArgs: any[]) => {
              const lastArg = callbackArgs[callbackArgs.length - 1];

              sendToOrigin({
                type: 'methodCallback',
                messageId,
                callbackArgs,
              }, lastArg instanceof ArrayBuffer ? lastArg : undefined);
            };

            callbackState.set(messageId, callback);

            args.push(callback as never);
          }

          const response = await callApi(name, ...args);

          if (DEBUG && typeof response === 'object' && 'CONSTRUCTOR_ID' in response) {
            log('UNEXPECTED RESPONSE', `${name}: ${response.className}`);
          }

          const { arrayBuffer } = (typeof response === 'object' && 'arrayBuffer' in response && response) || {};

          if (messageId) {
            sendToOrigin({
              type: 'methodResponse',
              messageId,
              response,
            }, arrayBuffer);
          }
        } catch (error: any) {
          if (DEBUG) {
            console.error(error);
          }

          if (messageId) {
            sendToOrigin({
              type: 'methodResponse',
              messageId,
              error: buildApiError(error),
            });
          }
        }

        if (messageId) {
          callbackState.delete(messageId);
        }

        break;
      }
      case 'cancelProgress': {
        const callback = callbackState.get(payload.messageId);
        if (callback) {
          cancelApiProgress(callback);
        }

        break;
      }
      case 'ping': {
        sendToOrigin({
          type: 'methodResponse',
          messageId: payload.messageId!,
        });

        break;
      }
      case 'toggleDebugMode': {
        if (payload.isEnabled) {
          enableDebugLog();
        } else {
          disableDebugLog();
        }

        break;
      }
      case 'tabForeground': {
        const client = getClient();
        if (client) {
          client.onTabForeground();
        }

        break;
      }
    }
  });
};

function handleErrors() {
  self.onerror = (e: ErrorEvent) => {
    console.error(e);
    const err = e.error || e;
    const message = (err && (typeof err === 'object' && 'message' in err ? (err as any).message : String(err)))
      || e.message
      || 'Uncaught exception in worker';
    sendToOrigin({ type: 'unhandledError', error: { message } });
  };

  self.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    console.error(e);
    const reason = e.reason;
    const message = (reason && (reason.message || (typeof reason === 'object' && 'message' in reason ? reason.message : String(reason))))
      || 'Uncaught rejection in worker';
    sendToOrigin({ type: 'unhandledError', error: { message } });
  });
}

const sendToOriginOnTickEnd = throttleWithTickEnd(() => {
  if (pendingUpdates.length) {
    pendingPayloads.unshift({
      type: 'updates',
      updates: pendingUpdates,
    });
  }

  const data = { payloads: pendingPayloads };
  const transferables = pendingTransferables;

  pendingUpdates = [];
  pendingPayloads = [];
  pendingTransferables = [];

  if (transferables.length) {
    postMessage(data, transferables);
  } else {
    postMessage(data);
  }
});

function sendToOrigin(payload: WorkerPayload, transferable?: Transferable) {
  pendingPayloads.push(payload);

  if (transferable) {
    pendingTransferables.push(transferable);
  }

  sendToOriginOnTickEnd();
}

function onUpdate(update: ApiUpdate) {
  if (DEBUG && update['@type'] !== 'updateUserStatus' && update['@type'] !== 'updateServerTimeOffset') {
    log('UPDATE', update['@type'], update);
  }

  pendingUpdates.push(update);
  sendToOriginOnTickEnd();
}
