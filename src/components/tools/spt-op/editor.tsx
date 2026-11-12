'use client';
import { useState } from 'react';
import { assets, catalog, field, profileFields, partnerFields, declarationFields, row, type Action, type Draft, type Row } from '@/modules/spt-op/model';
import { compute, errors, money, numeric, readiness, rowValue, sectionStatus } from '@/modules/spt-op/engine';
import { auditFormAnnotations, formSections } from '@/modules/spt-op/form-annotations';
import { adapters, xmlGuide } from '@/modules/spt-op/xml';
import { csv, download } from '@/modules/spt-op/import-export';
import { Fields } from './fields';
import { Dialog } from './dialog';
import { TableGrid } from './table-grid';

const tableGroupsByPage: Record<number, { title: string; description: string; sections: string[] }> = {
    5: { title: 'Lampiran 1 · Harta', description: 'Pilih jenis harta yang sedang diisi pada formulir.', sections: ['cash', 'receivables', 'investments', 'movable'] },
    6: { title: 'Lampiran 1 · Harta & Utang', description: 'Harta tidak bergerak, harta lainnya, dan utang akhir tahun.', sections: ['immovable', 'otherassets', 'debts'] },
    7: { title: 'Lampiran 1 · Keluarga & Penghasilan', description: 'Data keluarga, penghasilan pekerjaan, dan bukti potong.', sections: ['family', 'jobs', 'withholding'] },
    8: { title: 'Lampiran 2 · Penghasilan', description: 'Penghasilan final, bukan objek pajak, serta luar negeri.', sections: ['finalincome', 'exempt', 'foreign'] },
    9: { title: 'Lampiran 3A-1 · Rekonsiliasi Dagang', description: 'Saldo dan koreksi fiskal usaha dagang.', sections: ['dagangan'] },
    10: { title: 'Lampiran 3A-2 · Rekonsiliasi Jasa', description: 'Saldo dan koreksi fiskal usaha jasa.', sections: ['jasa'] },
    11: { title: 'Lampiran 3A-3 · Rekonsiliasi Industri', description: 'Saldo dan koreksi fiskal usaha industri.', sections: ['industri'] },
    12: { title: 'Lampiran 3A-4 · Norma & Penghasilan Lain', description: 'Norma penghitungan neto dan penghasilan dalam negeri lainnya.', sections: ['nppn', 'otherdomestic'] },
    13: { title: 'Lampiran 3B · Peredaran Bruto', description: 'Pilih skenario peredaran bruto yang sesuai.', sections: ['umkm', 'opent', 'normmonths'] },
    14: { title: 'Lampiran 3C · Penyusutan & Amortisasi', description: 'Daftar aset dan perhitungan fiskal terkait.', sections: ['depreciation', 'amortization'] },
    15: { title: 'Lampiran 3D · Biaya Tertentu', description: 'Rincian entertainment, promosi, dan piutang tidak tertagih.', sections: ['entertainment', 'promotion', 'baddebt'] },
    17: { title: 'Lampiran 5 · Pengurang', description: 'Kompensasi kerugian serta pengurang penghasilan dan PPh.', sections: ['taxloss', 'deductions', 'taxrelief'] },
};

function RelatedTables({ page, section, draft, onSection }: { page: number; section: string; draft: Draft; onSection: (section: string) => void }) {
    const group = tableGroupsByPage[page];
    if (!group) return null;
    return <section className="spt-editor-group spt-page-group"><header><h3>{group.title}</h3><p>{group.description}</p></header><div className="spt-page-table-links">{group.sections.map(key => <button type="button" className={key === section ? 'is-current' : ''} key={key} onClick={() => onSection(key)}><span>{catalog.tables[key]?.title || catalog.BOOKS[key]?.title || key}</span><small>{(draft.tables[key] || draft.books[key] || []).filter(row => !row.disposed).length} baris</small></button>)}</div></section>;
}

function PageFourEditor({ draft, dispatch, onSection }: { draft: Draft; dispatch: (action: Action) => void; onSection: (section: string) => void }) {
    const sources = { profile: profileFields, questions: catalog.questionFields, extras: catalog.extraFields, declaration: declarationFields } as const;
    const groups: Array<{ title: string; description: string; fields?: Array<{ group: keyof typeof sources; keys: string[] }>; results?: string[]; links?: string[] }> = [
        { title: 'E. PPh Kurang / Lebih Bayar', description: 'Ringkasan selisih PPh terutang dan kredit pajak.', results: ['balance', 'payable'], links: ['withholding', 'foreign'] },
        { title: 'F. Pembetulan', description: 'Diisi hanya untuk SPT Pembetulan.', fields: [{ group: 'profile', keys: ['sptStatus'] }, { group: 'extras', keys: ['previousBalance'] }] },
        { title: 'G. Permohonan Pengembalian', description: 'Pilihan proses pengembalian PPh lebih bayar.', fields: [{ group: 'declaration', keys: ['refund'] }] },
        { title: 'H. Angsuran PPh Pasal 25', description: 'Data pembayaran, STP, dan skenario angsuran berikutnya.', fields: [{ group: 'questions', keys: ['hasP25', 'hasCustomP25', 'hasOPPTP25'] }, { group: 'extras', keys: ['p25Paid', 'p25STP', 'nextP25'] }] },
        { title: 'I. Pernyataan Transaksi Lainnya', description: 'Kelengkapan lampiran yang dipicu transaksi atau kondisi tertentu.', fields: [{ group: 'questions', keys: ['hasDebt', 'hasFinal', 'hasExempt', 'hasDepreciation', 'hasSpecialCosts', 'hasForeignDividend'] }] },
        { title: 'J. Lampiran Tambahan', description: 'Daftar dokumen tambahan yang disertakan.', fields: [{ group: 'declaration', keys: ['additional'] }] },
        { title: 'K. Pernyataan', description: 'Identitas penandatangan dan konfirmasi pernyataan.', fields: [{ group: 'declaration', keys: ['confirmed', 'signer', 'capacity', 'date', 'place', 'notes'] }] },
    ];
    const results = compute(draft);
    return <div className="spt-profile-editor">{groups.map(group => <section className="spt-editor-group" key={group.title}><header><h3>{group.title}</h3><p>{group.description}</p></header>{group.results?.map(key => { const result = results.find(item => item.key === key); return result && <article className="spt-record" key={key}><strong>{result.label}</strong><b>{money(result.value)}</b><p>{result.note}</p></article>; })}{group.fields?.map(source => { const fields = source.keys.map(key => sources[source.group].find(field => field.key === key)).filter((field): field is typeof profileFields[number] => !!field); return fields.length ? <Fields key={source.group} fields={fields} values={draft[source.group]} onChange={(key, value) => dispatch({ type: 'field', group: source.group, key, value })}/> : null; })}{group.links && <div className="spt-actions">{group.links.map(key => <button key={key} type="button" onClick={() => onSection(key)}>Buka {catalog.tables[key]?.title || key}</button>)}</div>}</section>)}</div>;
}

function PageSixteenEditor({ draft, dispatch }: { draft: Draft; dispatch: (action: Action) => void }) {
    const groups = [
        { title: 'A. Angsuran PPh Pasal 25', description: 'Nilai angsuran, STP, dan pengembalian kredit luar negeri.', group: 'extras' as const, fields: ['p25Paid', 'p25STP', 'foreignRefund', 'nextP25'] },
        { title: 'B. PH/MT', description: 'Data pembagian penghasilan dan PTKP suami-istri.', group: 'partner' as const, fields: ['wpNet', 'spouseNet', 'wpDed', 'spouseDed', 'combinedPtkp'] },
    ];
    const sources = { extras: catalog.extraFields, partner: partnerFields } as const;
    return <div className="spt-profile-editor">{groups.map(group => { const fields = group.fields.map(key => sources[group.group].find(field => field.key === key)).filter((field): field is typeof profileFields[number] => !!field); return <section className="spt-editor-group" key={group.title}><header><h3>{group.title}</h3><p>{group.description}</p></header><Fields fields={fields} values={draft[group.group]} onChange={(key, value) => dispatch({ type: 'field', group: group.group, key, value })}/></section>; })}</div>;
}

function ProfileEditor({ draft, dispatch }: { draft: Draft; dispatch: (a: Action) => void }) {
    return <div className="spt-profile-editor">{formSections.map(group => {
        const sourceFields = { profile: profileFields, questions: catalog.questionFields, extras: catalog.extraFields } as const;
        return <section className="spt-editor-group" key={group.title}><header><h3>{group.title}</h3><p>{group.description}</p></header>{group.sources.map(source => {
            const fields = source.keys.map(key => sourceFields[source.group].find(item => item.key === key)).filter((item): item is typeof profileFields[number] => !!item);
            return fields.length ? <Fields key={source.group} fields={fields} values={draft[source.group]} onChange={(key, value) => dispatch({ type: 'field', group: source.group, key, value })}/> : null;
        })}</section>;
    })}</div>;
}

export function Editor({ draft, section, dispatch, onSection }: {
    draft: Draft;
    section: string;
    dispatch: (a: Action) => void;
    onSection: (s: string) => void;
}) {
    const [edit, setEdit] = useState<Row | null>(null), [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [message, setMessage] = useState(''), [grid, setGrid] = useState(false);
    const table = catalog.tables[section], book = catalog.BOOKS[section];
    const fields = table?.columns || catalog.bokFields;
    const rows = (book ? draft.books : draft.tables)[section] || [];
    const updateRows = (r: Row[]) => dispatch({ type: 'rows', key: section, rows: r, book: !!book });
    if (section === 'summary') return <PageFourEditor draft={draft} dispatch={dispatch} onSection={onSection}/>;
    if (section === 'partner') return <PageSixteenEditor draft={draft} dispatch={dispatch}/>;
    const groups: {
        [k: string]: {
            fields: typeof profileFields;
            group: 'profile' | 'questions' | 'extras' | 'partner' | 'declaration' | 'documentNotes';
        };
    } = { profile: { fields: profileFields, group: 'profile' }, questions: { fields: catalog.questionFields, group: 'questions' }, extras: { fields: catalog.extraFields, group: 'extras' }, partner: { fields: partnerFields, group: 'partner' }, declaration: { fields: declarationFields, group: 'declaration' }, documentNotes: { fields: [...Object.keys(draft.documentNotes || {}).map(k => field(k, k)), field('references', 'Referensi dokumen dan catatan')].filter((f, i, a) => a.findIndex(x => x.key === f.key) === i), group: 'documentNotes' } };
    if (groups[section]) {
        const g = groups[section];
        return <>{section === 'profile' ? <ProfileEditor draft={draft} dispatch={dispatch} /> : <Fields fields={g.fields} values={draft[g.group]} onChange={(key, value) => dispatch({ type: 'field', group: g.group, key, value })}/>} {section === 'extras' && <p className="spt-warning">Penyesuaian ini disimpan sebagai data pendukung. Pengganti nilai rekap diatur melalui Ikhtisar.</p>}{section === 'partner' && <p className="spt-warning">Perhitungan PH/MT menunggu verifikasi ruleset dan contoh acuan.</p>}</>;
    }
    if (section === 'summary')
        return <>{compute(draft).map(r => <section className="spt-record" key={r.key}><strong>{r.label}</strong><b>{money(r.value)}</b><p>{r.note}</p><small>{r.verification === 'pending' ? 'Perlu Verifikasi' : r.verification === 'ruleset-2025' ? 'Dihitung dari data dan ruleset 2025 terbatas' : r.verification === 'reconciliation-required' ? 'Perlu rekonsiliasi setoran' : r.verification === 'not-applicable' ? 'Tidak Berlaku' : 'Rekap input, belum disahkan'} · {r.ruleVersion}</small><small>Sumber: {r.source}</small><div className="spt-actions">{r.sections.map(s => <button key={s} onClick={() => onSection(s)}>Lihat {catalog.tables[s]?.title || catalog.BOOKS[s]?.title || s}</button>)}</div></section>)}{['business', 'deductions'].map(key => { const o = draft.overrides[key] || { value: '', reason: '', enabled: false }; return <section className="spt-record" key={key}><label><input type="checkbox" checked={o.enabled} onChange={e => dispatch({ type: 'override', key, value: { ...o, enabled: e.target.checked } })}/> Override {key === 'business' ? 'neto usaha' : 'pengurang'}</label><Fields fields={[field('value', 'Nilai pengganti', 'money'), field('reason', 'Alasan dan dokumen sumber')]} values={{ value: o.value, reason: o.reason }} onChange={(k, v) => dispatch({ type: 'override', key, value: { ...o, [k]: v } })}/>{o.enabled && !o.reason && <p className="spt-error">Alasan wajib diisi sebelum override digunakan.</p>}</section>; })}</>;
    if (section === 'validation') {
        const report = readiness(draft);
        const annotations = auditFormAnnotations();
        return <><h3>Pemeriksaan kesiapan</h3><p className={report.rulesReady ? 'spt-success' : 'spt-warning'}>{report.summary}</p><dl className="spt-readiness"><div><dt>Aturan tahun pajak</dt><dd>{report.rulesReady ? 'Terverifikasi' : 'Belum siap pelaporan'}</dd></div><div><dt>Kontrol langsung di formulir</dt><dd>{report.mapped.direct}</dd></div><div><dt>Tabel lampiran</dt><dd>{report.mapped.editorOnly} dibuka dari sel formulir</dd></div><div><dt>Register anotasi</dt><dd>{annotations.errors.length ? `${annotations.errors.length} masalah struktur` : 'Terverifikasi'}</dd></div></dl><h4>Temuan yang perlu ditinjau</h4>{report.issues.map((v, i) => <p className="spt-warning" key={i}>{v}</p>)}{annotations.errors.map((v, i) => <p className="spt-warning" key={`annotation-error-${i}`}>{v}</p>)}{annotations.warnings.map((v, i) => <p className="spt-warning" key={`annotation-warning-${i}`}>{v}</p>)}</>;
    }
    if (section === 'xml')
        return <><h3>XML per lampiran</h3><p>Ekspor belum aktif sampai sampel dan pemetaan resmi lolos pengujian.</p>{adapters.map(a => <section className="spt-record" key={a.id}><strong>{a.label}</strong><p>{a.reason}</p><button disabled>Preview / ekspor XML · belum terverifikasi</button></section>)}<a href={xmlGuide} target="_blank" rel="noreferrer">Panduan DJP versi 20260310 ↗</a><p>Gunakan converter resmi untuk menyiapkan XML, unggah manual pada tabel terkait, lalu periksa hasil proses pada XML Monitoring.</p></>;
    if (section === 'imports')
        return <><h3>Data sumber Excel</h3><p>Setiap baris dari template disimpan agar kolom yang belum memiliki kotak SPT tidak hilang. Perbarui melalui Excel lalu impor kembali untuk menggantinya.</p>{Object.entries(draft.importTables || {}).map(([sheet, sourceRows]) => <details className="spt-record" key={sheet}><summary><strong>{sheet}</strong> · {sourceRows.length} baris</summary>{sourceRows.map((source, index) => <div className="spt-record" key={source.id}><strong>Baris {index + 1}</strong><p>{Object.entries(source.values).filter(([, value]) => value).map(([key, value]) => <small key={key}>{key}: {value} · </small>)}</p></div>)}</details>)}{!Object.keys(draft.importTables || {}).length && <p>Belum ada template Excel yang diimpor.</p>}</>;
    if (!table && !book)
        return null;
    const relatedTables = <RelatedTables page={table?.page || book?.page || 0} section={section} draft={draft} onSection={onSection}/>;
    const status = sectionStatus(draft, section);
    const shown = rows.filter(r => JSON.stringify(r.values).toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || (filter === 'disposed' ? r.disposed : !r.disposed)));
    return <>{relatedTables}<p className="spt-warning">{status.applicability} · {status.progress}</p><label>Cari baris<input value={query} onChange={e => setQuery(e.target.value)}/></label>{assets.includes(section) && <label>Status harta<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Semua</option><option value="active">Aktif</option><option value="disposed">Dilepas</option></select></label>}{book ? <div className="spt-actions">{[...catalog.bookAccounts[section], ...catalog.bookCommon].map(([code, label]) => <button key={code} onClick={() => { setEdit(rows.find(r => r.values.code === code) || row({ code, label })); setMessage(''); }}>{code} · {label}</button>)}</div> : <div className="spt-actions"><button className="primary" onClick={() => { setEdit(row({})); setMessage(''); }}>＋ Tambah baris</button><button onClick={() => setGrid(true)}>▦ Edit sebagai tabel</button></div>}{shown.map((r, i) => <article className="spt-record" key={r.id}><strong>{r.values.name || r.values.owner || r.values.employer || r.values.label || r.values.description || r.values.code || `Baris ${i + 1}`}</strong><small>{r.origin}{r.review ? ' · Perlu pembaruan nilai' : ''}{r.disposed ? ' · Dilepas' : ''}</small>{table?.sum && <b>{money(numeric(rowValue(section, r, table.sum)))}</b>}<div className="spt-actions"><button onClick={() => { setEdit(r); setMessage(''); }}>Edit</button>{!book && <button onClick={() => updateRows([...rows, row({ ...r.values }, 'duplicate:' + r.id)])}>Duplikasi</button>}<button onClick={() => { if (window.confirm('Hapus baris ini?'))
        updateRows(rows.filter(x => x.id !== r.id)); }}>Hapus</button></div></article>)}{!rows.length && <p>Belum ada data.</p>}{table && <button disabled={!rows.length} onClick={() => download(`SPT_${section}_${draft.profile.year}.csv`, csv(draft, section), 'text/csv;charset=utf-8')}>Ekspor tabel CSV</button>}{table?.sum && <p>Total {table.summary || table.columns.find(f => f.key === table.sum)?.label || table.sum}: {money(rows.filter(r => !r.disposed).reduce((s, r) => s + numeric(rowValue(section, r, table.sum!)), 0))}</p>}{section === 'umkm' && <><h3>Setoran / pemotongan per bulan</h3><Fields fields={Array.from({ length: 12 }, (_, i) => [field('umkmPaid' + i, `Bulan ${i + 1} · Setoran`, 'money'), field('umkmWithheld' + i, `Bulan ${i + 1} · Pemotongan`, 'money')]).flat()} values={draft.extras} onChange={(key, value) => dispatch({ type: 'field', group: 'extras', key, value })}/><p className="spt-warning">Perhitungan fasilitas UMKM menunggu verifikasi syarat penggunaan.</p></>}{grid && table && <Dialog wide title={table.title} onClose={() => setGrid(false)}><TableGrid section={section} columns={table.columns} rows={rows} assets={assets.includes(section)} sumKey={table.sum} sumLabel={table.summary || table.columns.find(f => f.key === table.sum)?.label || table.sum || ''} onRows={updateRows}/></Dialog>}{edit && <Dialog title={table?.title || book.title} onClose={() => setEdit(null)}><Fields prefix="row" fields={fields} values={{ ...edit.values, ...Object.fromEntries(fields.filter(f => f.type === 'computed').map(f => [f.key, rowValue(section, edit, f.key)])) }} onChange={(k, v) => setEdit(previous => previous && { ...previous, values: { ...previous.values, [k]: v } })}/>{assets.includes(section) && <label><input type="checkbox" checked={!!edit.disposed} onChange={e => setEdit({ ...edit, disposed: e.target.checked })}/> Harta telah dilepas</label>}{edit.review && <label><input type="checkbox" onChange={e => { if (e.target.checked)
        setEdit({ ...edit, review: false }); }}/> Nilai akhir tahun sudah diperbarui</label>}<p className="spt-error">{message}</p><div className="spt-actions"><button onClick={() => setEdit(null)}>Batal</button><button className="primary" onClick={() => { const err = errors(fields, edit); if (err.length) {
        setMessage(err.join('; '));
        return;
    } updateRows(rows.some(r => r.id === edit.id) ? rows.map(r => r.id === edit.id ? edit : r) : [...rows, edit]); setEdit(null); }}>Simpan baris</button></div></Dialog>}</>;
}
