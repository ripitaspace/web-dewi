'use client';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { fresh, readBackup, reducer, type Draft, type Action } from '@/modules/spt-op/model';
import { deleteDraft as deleteStoredDraft, listDrafts, saveDraft, withoutDraft } from '@/modules/spt-op/storage';
export function useDrafts() {
    const [draft, reduce] = useReducer((d: Draft | null, a: Action) => a.type === 'replace' ? a.draft : d ? reducer(d, a) : null, null);
    const [saved, setSaved] = useState('Memuat draft…');
    const [list, setList] = useState<Draft[]>([]);
    const [ready, setReady] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const revision = useRef<Record<string, number>>({});
    const latest = useRef<Draft | null>(null);
    const persisted = useRef<Draft | null>(null);
    const queue = useRef<Promise<void>>(Promise.resolve());
    // Save and route exit must see edits made in the same event.
    function dispatch(action: Action) {
        const next = action.type === 'replace' ? action.draft : latest.current ? reducer(latest.current, action) : null;
        latest.current = next;
        reduce(action);
        if (next !== persisted.current)
            setSaved('Perubahan belum tersimpan');
    }
    useEffect(() => {
        let active = true;
        listDrafts().then(items => {
            if (!active)
                return;
            setList(items);
            const d = items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || fresh();
            revision.current[d.id] = d.revision;
            persisted.current = items.length ? d : null;
            latest.current = d;
            reduce({ type: 'replace', draft: d });
            setReady(true);
            setSaved(items.length ? '✓ Tersimpan lokal' : 'Draft baru');
        }).catch(() => {
            if (!active)
                return;
            const d = fresh();
            latest.current = d;
            reduce({ type: 'replace', draft: d });
            setReady(true);
            setBlocked(true);
            setSaved('Penyimpanan gagal. Gunakan Backup JSON.');
        });
        return () => { active = false; };
    }, []);
    const save = useCallback(async () => {
        const snapshot = latest.current;
        if (!snapshot)
            return false;
        let ok = true;
        const run = queue.current.then(async () => {
            if (persisted.current === snapshot)
                return;
            try {
                setSaved('Menyimpan…');
                const stored = await saveDraft(snapshot, revision.current[snapshot.id] ?? snapshot.revision);
                revision.current[snapshot.id] = stored.revision;
                persisted.current = snapshot;
                setList(items => [stored, ...items.filter(x => x.id !== stored.id)]);
                setSaved(latest.current === snapshot ? '✓ Tersimpan lokal' : 'Perubahan belum tersimpan');
                setBlocked(false);
            }
            catch (error) {
                ok = false;
                setBlocked(true);
                setSaved(error instanceof Error ? error.message : 'Simpan gagal.');
            }
        });
        queue.current = run;
        await run;
        return ok;
    }, []);
    useEffect(() => {
        if (!ready || !draft || blocked || persisted.current === draft)
            return;
        const timer = setTimeout(() => void save(), 700);
        return () => clearTimeout(timer);
    }, [draft, ready, blocked, save]);
    useEffect(() => {
        const leave = (event: BeforeUnloadEvent) => {
            if (latest.current !== persisted.current) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', leave);
        return () => window.removeEventListener('beforeunload', leave);
    }, []);
    async function replace(next: Draft) {
        if (!await save())
            return false;
        const d = { ...next, revision: revision.current[next.id] ?? next.revision };
        revision.current[d.id] = d.revision;
        dispatch({ type: 'replace', draft: d });
        setBlocked(false);
        return true;
    }
    async function reload() {
        const items = await listDrafts();
        setList(items);
        const d = items.find(x => x.id === latest.current?.id);
        if (!d)
            throw Error('Draft tidak ditemukan.');
        revision.current[d.id] = d.revision;
        persisted.current = d;
        dispatch({ type: 'replace', draft: d });
        setBlocked(false);
        setSaved('Draft terbaru dimuat.');
    }
    async function openDraft(id: string) {
        if (!await save()) return false;
        try {
            const items = await listDrafts();
            const next = items.find(item => item.id === id);
            if (!next) throw Error('Draft tidak ditemukan.');
            setList(items);
            revision.current[next.id] = next.revision;
            persisted.current = next;
            dispatch({type:'replace',draft:next});
            setBlocked(false);
            setSaved('✓ Tersimpan lokal');
            return true;
        } catch (error) {
            setSaved(error instanceof Error ? error.message : 'Draft gagal dibuka.');
            return false;
        }
    }
    async function deleteDraft(id: string) {
        if (!await save())
            return false;
        try {
            const deleted = await deleteStoredDraft(id);
            if (!deleted) {
                setSaved('Draft tidak ditemukan atau sudah dihapus.');
                setList(items => withoutDraft(items, id));
                return false;
            }
            setList(items => withoutDraft(items, id));
            delete revision.current[id];
            if (latest.current?.id === id) {
                const next = fresh();
                revision.current[next.id] = next.revision;
                persisted.current = null;
                dispatch({ type: 'replace', draft: next });
                setSaved('Draft dihapus. Draft kosong baru dibuat.');
            }
            else
                setSaved('Draft dihapus.');
            setBlocked(false);
            return true;
        }
        catch (error) {
            setSaved(error instanceof Error ? error.message : 'Draft gagal dihapus.');
            return false;
        }
    }
    function rescue() {
        if (!latest.current)
            return;
        const source = latest.current;
        dispatch({ type: 'replace', draft: { ...source, id: crypto.randomUUID(), revision: 0, profile: { ...source.profile, tin: '', name: source.profile.name + ' (salinan)' } } });
        setBlocked(false);
    }
    function legacy() {
        const raw = localStorage.getItem('ripitax.spt.op.2025.local.v1');
        if (!raw)
            throw Error('Draft HTML tidak ditemukan di origin ini. Gunakan file Backup JSON dari HTML.');
        return readBackup({ format: 'RIPITAX.SPT.OP.v1', data: JSON.parse(raw) });
    }
    return { draft, dispatch, ready, saved, list, save, replace, openDraft, deleteDraft, reload, rescue, legacy, blocked };
}
