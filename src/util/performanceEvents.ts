export type CancelableFunction<T extends AnyToVoidFunction> = T & {
  cancel: NoneToVoidFunction;
  flush: NoneToVoidFunction;
};

type AnyToVoidFunction = (...args: any[]) => void;

export function debounce<T extends AnyToVoidFunction>(
  callback: T,
  waitMs: number,
): CancelableFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const invoke = () => {
    if (!lastArgs) {
      return;
    }

    callback(...lastArgs);
    lastArgs = undefined;
  };

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = undefined;
      invoke();
    }, waitMs);
  }) as CancelableFunction<T>;

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = undefined;
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    invoke();
  };

  return debounced;
}

export function throttle<T extends AnyToVoidFunction>(
  callback: T,
  waitMs: number,
): CancelableFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let lastRunAt = 0;
  let lastArgs: Parameters<T> | undefined;

  const run = () => {
    if (!lastArgs) {
      return;
    }

    lastRunAt = Date.now();
    callback(...lastArgs);
    lastArgs = undefined;
  };

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;
    const remaining = waitMs - (Date.now() - lastRunAt);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }

      run();
      return;
    }

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = undefined;
        run();
      }, remaining);
    }
  }) as CancelableFunction<T>;

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = undefined;
    lastArgs = undefined;
  };

  throttled.flush = run;

  return throttled;
}

export function rafThrottle<T extends AnyToVoidFunction>(callback: T): CancelableFunction<T> {
  let frameId = 0;
  let lastArgs: Parameters<T> | undefined;

  const run = () => {
    frameId = 0;
    if (!lastArgs) {
      return;
    }

    callback(...lastArgs);
    lastArgs = undefined;
  };

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (!frameId) {
      frameId = requestAnimationFrame(run);
    }
  }) as CancelableFunction<T>;

  throttled.cancel = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }

    frameId = 0;
    lastArgs = undefined;
  };

  throttled.flush = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      run();
    }
  };

  return throttled;
}
