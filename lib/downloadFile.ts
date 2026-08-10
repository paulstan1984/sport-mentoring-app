/**
 * Downloads a file programmatically using fetch + blob.
 * Works in hybrid mobile app web containers (e.g. Apache Cordova)
 * where the HTML `download` attribute on <a> tags is not supported.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Cleanup after a short delay to allow the download to start
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }, 100);
}
