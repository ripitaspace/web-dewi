export const xmlGuide = 'https://pajak.go.id/sites/default/files/2026-03/Tata%20Cara%20Pembuatan%20XML%20SPT%20OP%20v20260310.pdf';
// No inferred tags: adapters are gated until a versioned official sample passes fixtures.
export const adapters = [
    ...['Kas dan setara kas', 'Piutang', 'Investasi/sekuritas', 'Harta bergerak', 'Harta tidak bergerak', 'Harta lainnya'].map((label, i) => ({ id: 'l1a-' + i, label: 'L1A · ' + label, verified: false, reason: 'Menunggu template dan sampel XML resmi kelompok harta.' })),
    { id: 'l3c', label: 'L3C · Penyusutan dan amortisasi', verified: false, reason: 'Panduan tersedia; struktur dan kode XML belum diuji terhadap sampel resmi.' },
    { id: 'entertainment', label: 'L3D · Entertainment', verified: false, reason: 'Menunggu sampel valid dan pemeriksaan seluruh field.' },
    { id: 'promotion', label: 'L3D · Promosi/natura', verified: false, reason: 'Kode prototype perlu dicocokkan dengan converter resmi.' },
    { id: 'baddebt', label: 'L3D · Piutang tak tertagih', verified: false, reason: 'Field prototype berbeda dengan panduan v20260310; perlu template resmi untuk menyelesaikan perbedaan.' },
];
export function previewXML(id: string): never { const a = adapters.find(a => a.id === id); throw Error(a?.reason || 'Format XML tidak dikenal.'); }
