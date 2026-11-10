import { useState } from 'react';
import { catalog, type Draft } from '@/modules/spt-op/model';
import { pageCount } from '@/modules/spt-op/form-layout';
import { Dialog } from './dialog';
import { Document, PrintDetails } from './document';
import { pageNumbers, sheetLabel } from '@/modules/spt-op/coretax-map';
import { printBlockers } from '@/modules/spt-op/engine';

export interface PrintJob {
    pages: number[];
    includeDetails: boolean;
}
export function PrintDialog({ draft, page, onPrint, onClose }: {
    draft: Draft;
    page: number;
    onPrint: (job: PrintJob) => void;
    onClose: () => void;
}) {
    const all = pageNumbers;
    const [selected, setSelected] = useState(all);
    const [preview, setPreview] = useState(false);
    const [includeDetails, setIncludeDetails] = useState(false);
    const blockers = printBlockers(draft);
    const canPrint = selected.length > 0 && blockers.length === 0;
    return (<Dialog title="Preview & cetak" onClose={onClose}>
      <p>Kertas F4 215 × 330 mm, satu lembar formulir per halaman. Rincian data kerja bersifat opsional dan tidak disertakan pada cetak standar.</p>
      <div className="spt-actions">
        <button onClick={() => setSelected([page])}>Halaman aktif</button>
        <button onClick={() => setSelected(all)}>Semua formulir</button>
      </div>
      {pageNumbers.map(n => [n, catalog.PAGE_NAMES[n - 1]] as const).map(([n, title]) => (<label className="spt-print-choice" key={n}>
          <input type="checkbox" checked={selected.includes(n)} onChange={event => setSelected(event.target.checked ? [...selected, n] : selected.filter(x => x !== n))}/>
          {sheetLabel(n)}. {title} · {pageCount(draft, n)} lembar
        </label>))}
      <label className="spt-print-choice"><input type="checkbox" checked={includeDetails} onChange={event => setIncludeDetails(event.target.checked)}/> Sertakan rincian data kerja sebagai lampiran audit</label>
      {blockers.length > 0 && <div className="spt-warning" role="alert"><b>Cetak formulir diblokir.</b><ul>{blockers.map(blocker => <li key={blocker}>{blocker}</li>)}</ul></div>}
      <div className="spt-actions"><button disabled={!canPrint} onClick={() => setPreview(!preview)}>{preview ? 'Tutup pratinjau' : 'Lihat pratinjau dokumen'}</button><button className="primary" disabled={!canPrint} onClick={() => onPrint({ pages: [...selected].sort((a, b) => a - b), includeDetails })}>Buka preview cetak browser</button></div>
      {preview && <div className="spt-print-preview">{[...selected].sort((a, b) => a - b).flatMap(n => Array.from({ length: pageCount(draft, n) }, (_, part) => <Document key={`${n}-${part}`} draft={draft} page={n} part={part} print/>))}{includeDetails && <PrintDetails draft={draft}/>}</div>}
    </Dialog>);
}
