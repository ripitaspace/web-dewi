'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function Dialog({ title, children, onClose }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) { const ref = useRef<HTMLDialogElement>(null); useEffect(() => { const el = ref.current; el?.showModal(); return () => el?.close(); }, []); return <dialog ref={ref} className="spt-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget)
    onClose(); }} aria-label={title}><header><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Tutup dialog">✕</button></header>{children}</dialog>; }
