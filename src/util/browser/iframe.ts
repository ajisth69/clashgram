export function isMessageFromIframe(event: MessageEvent, iframe?: HTMLIFrameElement) {
  if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
    return false;
  }
  if (!iframe.src || iframe.src === 'about:blank') {
    return true;
  }
  try {
    return new URL(iframe.src).origin === event.origin;
  } catch {
    return false;
  }
}
