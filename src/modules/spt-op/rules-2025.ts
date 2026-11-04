/** Evidence registry: a verified formula does not verify the whole annual return. */
export const rules2025 = {
    version: '2025-review.1',
    year: '2025',
    annualReturnVerified: false,
    sources: {
        rates: {
            title: 'DJP · Gaji Rp5 Juta Kini Kena Pajak? (2 Januari 2023)',
            url: 'https://www.pajak.go.id/index.php/id/siaran-pers/gaji-rp5-juta-kini-kena-pajak',
            scope: 'Lapisan tarif UU HPP dan empat ilustrasi TK/0. Bukan validasi seluruh SPT 2025.',
            checkedAt: '2026-11-04',
        },
        prototype: {
            title: 'RIPITAX SPT OP Studio 2025 · prototype pengguna',
            scope: 'Inventaris input, koordinat, dan aritmetika rekap; bukan acuan hukum.',
        },
    },
    pending: [
        'Kewajiban lampiran dan seluruh field Induk A–K',
        'Penghasilan pekerjaan, batas pengurang, dan beberapa pemberi kerja',
        'PTKP selain ilustrasi TK/0, pembulatan PKP, dan periode tidak penuh',
        'Pembukuan, NPPN, fasilitas UMKM dan OPPT',
        'Penghasilan pasangan PH/MT dan kredit PPh 24',
        'Pengurang, kompensasi kerugian, angsuran, dan pembetulan',
    ],
} as const;
/** Testable rate schedule only. Caller must supply already validated PKP. */
export function progressiveReference(pkp: number): number {
    if (!Number.isFinite(pkp) || pkp < 0)
        throw Error('PKP acuan harus angka nonnegatif.');
    const brackets = [[60000000, 5], [250000000, 15], [500000000, 25], [5000000000, 30], [Infinity, 35]];
    let previous = 0;
    let tax = 0;
    for (const [ceiling, percent] of brackets) {
        tax += Math.max(0, Math.min(pkp, ceiling) - previous) * percent / 100;
        previous = ceiling;
        if (pkp <= ceiling)
            break;
    }
    return tax;
}
