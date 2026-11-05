import { useState } from 'react';
import { catalog, type Draft } from '@/modules/spt-op/model';
import { pageCount } from '@/modules/spt-op/form-layout';
import { Dialog } from './dialog';
import { Document, PrintDetails } from './document';
import { pageNumbers, sheetLabel } from '@/modules/spt-op/coretax-map';
export function PrintDialog({ draft, page, onPrint, onClose }: {
    draft: Draft;
    page: number;
    onPrint: (pages: number[]) => void;
    onClose: () => void;
}) {
    const all = pageNumbers;
    const [selected, setSelected] = useState(all);
    const [preview, setPreview] = useState(false);
    return (<Dialog title="Preview & cetak" onClose={onClose}>
      <p>Kertas F4 215 × 330 mm, satu lembar formulir per halaman. Rincian data lengkap disertakan sebagai lembar kerja pelengkap.</p>
      <div className="spt-actions">
        <button onClick={() => setSelected([page])}>Halaman aktif</button>
        <button onClick={() => setSelected(all)}>Semua formulir</button>
      </div>
      {pageNumbers.map(n => [n, catalog.PAGE_NAMES[n - 1]] as const).map(([n, title]) => (<label className="spt-print-choice" key={n}>
          <input type="checkbox" checked={selected.includes(n)} onChange={event => setSelected(event.target.checked ? [...selected, n] : selected.filter(x => x !== n))}/>
          {sheetLabel(n)}. {title} · {pageCount(draft, n)} lembar
        </label>))}
      <div className="spt-actions"><button disabled={!selected.length} onClick={() => setPreview(!preview)}>{preview ? 'Tutup pratinjau' : 'Lihat pratinjau dokumen'}</button><button className="primary" disabled={!selected.length} onClick={() => onPrint([...selected].sort((a, b) => a - b))}>Buka preview cetak browser</button></div>
      {preview && <div className="spt-print-preview">{[...selected].sort((a,b)=>a-b).flatMap(n=>Array.from({length:pageCount(draft,n)},(_,part)=><Document key={`${n}-${part}`} draft={draft} page={n} part={part} print/>))}<PrintDetails draft={draft}/></div>}
    </Dialog>);
}
