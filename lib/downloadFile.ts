/**
 * Downloads a file in a way that works across regular browsers AND
 * Capacitor Android/iOS WebViews.
 *
 * Strategy:
 * 1. Capacitor: navigate the WebView itself to the URL. The request carries the
 *    session cookie, and the server's Content-Disposition: attachment response is
 *    handled by the native DownloadListener (MainActivity), which saves the file to
 *    Downloads. An external browser must NOT be used: it has no session.
 * 2. Otherwise: open in a new tab; Content-Disposition: attachment on the server
 *    triggers the download.
 */
export function downloadFile(url: string, _filename?: string): void {
  const absoluteUrl = new URL(url, window.location.origin).href;

  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;

  if (cap?.isNativePlatform?.()) {
    window.location.assign(absoluteUrl);
  } else {
    // Same-tab anchor click: avoids popup blockers and standalone-PWA window issues.
    const a = document.createElement("a");
    a.href = absoluteUrl;
    a.download = _filename ?? "";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
