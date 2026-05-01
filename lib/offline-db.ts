/**
 * Browser-only IndexedDB utility for queuing offline form submissions.
 * Import this module only in client components (never on the server).
 */

const DB_NAME = "sport-mentor-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-sync";

export type OfflineSyncType =
  | "checkin"
  | "journal"
  | "confidence"
  | "scope"
  | "improvement";

export interface OfflineEntry {
  id: string;
  type: OfflineSyncType;
  endpoint: string;
  payload: unknown;
  /** ISO date string (YYYY-MM-DD) used for same-day deduplication */
  day: string;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("day", "day", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add or replace a pending sync entry.
 * If an entry with the same type+day already exists it is removed first
 * (same-day deduplication: only the latest submission is kept).
 */
export async function enqueue(
  entry: Omit<OfflineEntry, "id" | "createdAt">
): Promise<void> {
  const db = await openDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("type");

    const getReq = index.getAll(entry.type);
    getReq.onsuccess = () => {
      const existing = (getReq.result as OfflineEntry[]).filter(
        (e) => e.day === entry.day
      );
      for (const e of existing) {
        store.delete(e.id);
      }
      store.add({ ...entry, id, createdAt });
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Return all pending entries, ordered by createdAt ascending. */
export async function getAll(): Promise<OfflineEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(
        (req.result as OfflineEntry[]).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    req.onerror = () => reject(req.error);
  });
}

/** Remove a single entry by id. */
export async function remove(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Return the number of pending entries. */
export async function count(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
