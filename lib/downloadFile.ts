/**
 * Downloads a file in a way that works across regular browsers AND
 * hybrid mobile app web containers (e.g. Apache Cordova / WKWebView).
 *
 * Strategy:
 * 1. If the Cordova runtime is detected, use `cordova.InAppBrowser.open`
 *    with target `_system` so the device's native browser handles the
 *    download (WebViews cannot download files directly).
 * 2. Otherwise, build a full absolute URL and open it via window.open
 *    with `_blank`. The server already sets Content-Disposition: attachment,
 *    so the browser will trigger a download.
 *
 * The previous blob + <a download> approach does NOT work in Cordova
 * WebViews because:
 * - The `download` attribute is ignored by WKWebView/Android WebView.
 * - Blob URLs created with URL.createObjectURL are often blocked.
 */
export function downloadFile(url: string, _filename: string): void {
  // Build absolute URL so it works regardless of base href
  const absoluteUrl = new URL(url, window.location.origin).href;

  // Detect Cordova environment
  const cordova = (window as unknown as { cordova?: { InAppBrowser?: { open: (url: string, target: string, options?: string) => unknown } } }).cordova;

  if (cordova?.InAppBrowser) {
    // Open in the device's system browser which can handle downloads natively
    cordova.InAppBrowser.open(absoluteUrl, "_system", "");
  } else {
    // Standard browser fallback — open in new tab; Content-Disposition
    // header on the server response will trigger the download.
    window.open(absoluteUrl, "_blank");
  }
}
