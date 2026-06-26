import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof self !== 'undefined') {
  (self as any).Buffer = Buffer;
}
(globalThis as any).Buffer = Buffer;
