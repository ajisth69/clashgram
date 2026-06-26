import { Api as GramJs } from '../../../lib/gramjs';

import { DEBUG } from '../../../config';
import { invokeRequest } from './client';

export async function forceOfflineAfterOutgoingContent(shouldForce?: boolean) {
  // No-op: Stealth offline is disabled due to Telegram backend changes.
  return;
}
