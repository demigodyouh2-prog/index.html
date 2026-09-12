import { useEffect, useState } from "react";

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
export const LOCAL_SRC_PREFIX = "idb:";

const DB_NAME = "pulse-media";
const STORE = "videos";

export function isLocalSrc(src: string): boolean {
  return src.startsWith(LOCAL_SRC_PREFIX);
}

export function localSrcFor(id: string): string {
  return `${LOCAL_SRC_PREFIX}${id}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB unavailable"));
  });
}

export async function putLocalVideo(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not save video"));
  });
}

export async function getLocalVideoUrl(id: string): Promise<string | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

const urlCache = new Map<string, string>();

export function useResolvedSrc(src: string | undefined): string {
  const remote = src && !isLocalSrc(src) ? src : "";
  const [resolved, setResolved] = useState(remote);

  useEffect(() => {
    if (!src) {
      setResolved("");
      return;
    }
    if (!isLocalSrc(src)) {
      setResolved(src);
      return;
    }
    const id = src.slice(LOCAL_SRC_PREFIX.length);
    const cached = urlCache.get(id);
    if (cached) {
      setResolved(cached);
      return;
    }
    let cancelled = false;
    void getLocalVideoUrl(id)
      .then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          urlCache.set(id, url);
          setResolved(url);
        } else {
          setResolved("");
        }
      })
      .catch(() => {
        if (!cancelled) setResolved("");
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}
