import { useState } from 'react';
import { catalog, type Draft } from '@/modules/spt-op/model';
import { pageCount } from '@/modules/spt-op/form-layout';
import { Dialog } from './dialog';
import { Document, PrintDetails } from './document';
export function PrintDialog({ draft, page, onPrint, onClose }: {
    draft: Draft;
    page: number;
    onPrint: (pages: number[]) => void;
    onClose: () => void;
}) {
    const all = Array.from({ length: 17 }, (_, i) => i + 1);
    const [selected, setSelected] = useState(all);
    const [preview, setPreview] = useState(false);
    return (<Dialog title="Preview & cetak" onClose={onClose}>
      <p>Kertas F4 210 × 330 mm; lampiran lanskap 330 × 210 mm. Formulir diperkecil proporsional agar muat tanpa mengubah posisi isian. Rincian data lengkap disertakan sebagai lembar kerja pelengkap.</p>
      <div className="spt-actions">
        <button onClick={() => setSelected([page])}>Halaman aktif</button>
        <button onClick={() => setSelected(all)}>Semua formulir</button>
      </div>
      {catalog.PAGE_NAMES.map((title, i) => (<label className="spt-print-choice" key={i}>
          <input type="checkbox" checked={selected.includes(i + 1)} onChange={event => setSelected(event.target.checked ? [...selected, i + 1] : selected.filter(n => n !== i + 1))}/>
          {i + 1}. {title} · {pageCount(draft, i + 1)} lembar
        </label>))}
      <div className="spt-actions"><button disabled={!selected.length} onClick={() => setPreview(!preview)}>{preview ? 'Tutup pratinjau' : 'Lihat pratinjau dokumen'}</button><button className="primary" disabled={!selected.length} onClick={() => onPrint([...selected].sort((a, b) => a - b))}>Buka preview cetak browser</button></div>
      {preview && <div className="spt-print-preview">{[...selected].sort((a,b)=>a-b).flatMap(n=>Array.from({length:pageCount(draft,n)},(_,part)=><Document key={`${n}-${part}`} draft={draft} page={n} part={part} print/>))}<PrintDetails draft={draft}/></div>}
    </Dialog>);
}
