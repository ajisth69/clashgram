import { useEffect, useRef } from '../lib/teact/teact';

import { ApiMediaFormat } from '../api/types';

import { selectIsSynced } from '../global/selectors';
import { IS_PROGRESSIVE_SUPPORTED } from '../util/browser/windowEnvironment';
import * as mediaLoader from '../util/mediaLoader';
import useSelector from './data/useSelector';
import useForceUpdate from './useForceUpdate';

const useMedia = (
  mediaHash: string | false | undefined,
  noLoad = false,
  mediaFormat = ApiMediaFormat.BlobUrl,
  delay?: number | false,
  cacheBuster?: number,
) => {
  const isStreaming = IS_PROGRESSIVE_SUPPORTED && mediaFormat === ApiMediaFormat.Progressive;
  const mediaData = mediaHash
    ? (isStreaming ? mediaLoader.getProgressiveUrl(mediaHash)
      : mediaLoader.getFromMemory(mediaHash)) : undefined;

  const forceUpdate = useForceUpdate();
  const isSynced = useSelector(selectIsSynced);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  useEffect(() => {
    if (!noLoad && mediaHash && !mediaData) {
      const startedAt = Date.now();

      mediaLoader.fetch(mediaHash, mediaFormat).then(() => {
        const spentTime = Date.now() - startedAt;
        if (!delay || spentTime >= delay) {
          forceUpdate();
        } else {
          if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
          }
          delayTimerRef.current = setTimeout(forceUpdate, delay - spentTime);
        }
      });
    }

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = undefined;
      }
    };
  }, [noLoad, mediaHash, mediaData, mediaFormat, cacheBuster, delay, isSynced, forceUpdate]);

  return mediaData;
};

export default useMedia;
