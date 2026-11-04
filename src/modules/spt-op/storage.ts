import { draftKey, readBackup, type Draft } from './model';
const database = 'ripitax-spt-op-v2';
async function open() { return new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(database, 1); r.onupgradeneeded = () => { r.result.createObjectStore('drafts', { keyPath: 'id' }); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(Error('Penyimpanan perangkat tidak tersedia.')); }); }
export async function listDrafts(): Promise<Draft[]> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction('drafts', 'readonly'); const r = tx.objectStore('drafts').getAll(); tx.oncomplete = () => { db.close(); try {
    resolve((r.result as Draft[]).map(d => ({ ...readBackup({ format: 'RIPITAX.SPT.OP.v2', data: d }), id: d.id, revision: d.revision, updatedAt: d.updatedAt })));
}
catch {
    reject(Error('Struktur draft lokal rusak. Pulihkan dari backup JSON.'));
} }; tx.onerror = () => { db.close(); reject(Error('Draft gagal dibaca.')); }; }); }
export function assertCanSave(d: Draft, expected: number, drafts: Draft[]) { const old = drafts.find(x => x.id === d.id); if ((old?.revision || 0) !== expected)
    throw Error('Konflik: draft diubah di tab lain. Muat ulang draft atau simpan salinan.'); if (drafts.some(x => x.id !== d.id && draftKey(x) === draftKey(d)))
    throw Error('Draft untuk identitas, tahun, dan pembetulan ini sudah ada. Buka draft tersebut atau ubah identitas/periode.'); }
export async function saveDraft(d: Draft, expected: number): Promise<Draft> { const db = await open(); return new Promise((resolve, reject) => { const tx = db.transaction('drafts', 'readwrite'), s = tx.objectStore('drafts'); let failure = 'Draft gagal disimpan.', next: Draft; const r = s.getAll(); r.onsuccess = () => { try {
    assertCanSave(d, expected, r.result as Draft[]);
}
catch (e) {
    failure = (e as Error).message;
    tx.abort();
    return;
} next = { ...d, revision: expected + 1, updatedAt: new Date().toISOString() }; s.put(next); }; tx.oncomplete = () => { db.close(); resolve(next); }; tx.onabort = tx.onerror = () => { db.close(); reject(Error(failure)); }; }); }
