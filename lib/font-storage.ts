const DATABASE = "arixweb-fonts";
const STORE = "fonts";

function openFontDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFontFile(id: string, file: Blob): Promise<void> {
  const db = await openFontDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put({ id, file });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function readFontFile(id: string): Promise<Blob | null> {
  const db = await openFontDatabase();
  const file = await new Promise<Blob | null>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result?.file as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return file;
}

export async function deleteFontFile(id: string): Promise<void> {
  const db = await openFontDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}
