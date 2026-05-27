export type VirtualWindowOptions = {
  itemCount: number;
  itemHeight: number;
  viewportHeight: number;
  scrollTop: number;
  overscan?: number;
};

export type VirtualWindow = {
  startIndex: number;
  endIndex: number;
  beforeHeight: number;
  afterHeight: number;
  totalHeight: number;
};

export function createVirtualWindow(options: VirtualWindowOptions): VirtualWindow {
  const overscan = options.overscan ?? 8;
  const safeItemCount = Math.max(0, options.itemCount);
  const totalHeight = safeItemCount * options.itemHeight;
  const visibleCount = Math.ceil(options.viewportHeight / options.itemHeight);
  const rawStart = Math.floor(options.scrollTop / options.itemHeight);
  const startIndex = clamp(rawStart - overscan, 0, safeItemCount);
  const endIndex = clamp(rawStart + visibleCount + overscan, startIndex, safeItemCount);

  return {
    startIndex,
    endIndex,
    beforeHeight: startIndex * options.itemHeight,
    afterHeight: Math.max(0, totalHeight - endIndex * options.itemHeight),
    totalHeight,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
