import { createInitialState, RIPINTAR_SCHEMA_VERSION } from "./engine";
import type { RipintarState } from "./types";

const DB_NAME = "puspitacore-ripintar";
const STORE = "journey";
const KEY = "primary";

function isState(value: unknown): value is RipintarState {
  return !!value && typeof value === "object" && (value as { schemaVersion?: unknown }).schemaVersion === RIPINTAR_SCHEMA_VERSION;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, RIPINTAR_SCHEMA_VERSION);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Local storage could not be opened."));
  });
}

export async function loadJourney(): Promise<RipintarState> {
  const db = await openDatabase();
  try {
    const value = await new Promise<unknown>((resolve, reject) => { const request = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return isState(value) ? value : createInitialState();
  } finally { db.close(); }
}

export async function saveJourney(state: RipintarState) {
  const db = await openDatabase();
  try { await new Promise<void>((resolve, reject) => { const transaction = db.transaction(STORE, "readwrite"); transaction.objectStore(STORE).put(state, KEY); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error || new Error("Progress could not be saved.")); }); } finally { db.close(); }
}

export async function resetJourney() { await saveJourney(createInitialState()); }

export async function requestDurableStorage() { return navigator.storage?.persist ? navigator.storage.persist() : false; }
