/**
 * Downloads a file in a way that works across regular browsers AND
 * Capacitor Android/iOS WebViews.
 *
 * Strategy:
 * 1. Capacitor: open via @capacitor/browser (Chrome Custom Tab / SFSafariViewController)
 *    so the native browser handles the download — WebViews cannot download files directly.
 * 2. Otherwise: open in a new tab; Content-Disposition: attachment on the server triggers
 *    the download.
 */
export async function downloadFile(url: string, _filename: string): Promise<void> {
  const absoluteUrl = new URL(url, window.location.origin).href;

  // Detect Capacitor runtime
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;

  if (cap?.isNativePlatform?.()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: absoluteUrl });
  } else {
    window.open(absoluteUrl, "_blank");
  }
}
