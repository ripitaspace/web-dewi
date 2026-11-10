/** Evidence registry: a verified formula does not verify the whole annual return. */
export const rules2025 = {
    version: '2025-regular-employee.1',
    year: '2025',
    annualReturnVerified: false,
    sources: {
        rates: {
            title: 'DJP · UU Pajak Penghasilan, Pasal 17',
            url: 'https://pajak.go.id/id/peraturan/pajak-penghasilan',
            scope: 'Lapisan tarif PPh orang pribadi dan pembulatan PKP ke bawah hingga ribuan rupiah penuh.',
            checkedAt: '2026-11-04',
        },
        regularEmployee: {
            title: 'DJP · Panduan SPT OP Coretax Form V25022026',
            scope: 'Alur Induk C.2–C.9 dan H.13a untuk SPT OP reguler. Hanya dipakai bersama pagar kelayakan ruleset ini.',
            checkedAt: '2026-11-10',
        },
        prototype: {
            title: 'RIPITAX SPT OP Studio 2025 · prototype pengguna',
            scope: 'Inventaris input, koordinat, dan aritmetika rekap; bukan acuan hukum.',
        },
    },
    pending: [
        'Kewajiban lampiran dan seluruh field Induk A–K',
        'Penghasilan pekerjaan dengan pengurang khusus atau periode tidak penuh',
        'PTKP dan pembulatan di luar skenario karyawan reguler',
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

/** Pasal 17 ayat (3) UU PPh: PKP dibulatkan ke bawah hingga ribuan rupiah penuh. */
export function roundPkpDownToThousand(value: number): number {
    if (!Number.isFinite(value))
        throw Error('PKP acuan harus angka yang valid.');
    return Math.floor(Math.max(0, value) / 1_000) * 1_000;
}
