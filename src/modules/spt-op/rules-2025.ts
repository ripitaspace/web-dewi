/** Evidence registry: a verified formula does not verify the whole annual return. */
export const rules2025 = {
    version: '2025-simplified-op.2',
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
        umkm: {
            title: 'DJP · WP OP UMKM: Fasilitas PPh Final dan Ketentuan Umum',
            url: 'https://www.pajak.go.id/id/artikel/wp-op-umkm-fasilitas-pph-final-dan-ketentuan-umum',
            scope: 'PPh Final 0,5% untuk WP OP dengan peredaran bruto tertentu; fasilitas omzet kumulatif Rp500 juta dan batas skenario Rp4,8 miliar.',
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
        'Pembukuan, NPPN, OPPT, dan UMKM di luar skenario final bruto tertentu',
        'Penghasilan pasangan PH/MT dan kredit PPh 24',
        'Pengurang, kompensasi kerugian, angsuran, dan pembetulan',
    ],
} as const;

export const UMKM_FINAL_RATE = 0.005;
export const UMKM_OP_ANNUAL_ALLOWANCE = 500_000_000;
export const UMKM_ANNUAL_GROSS_LIMIT = 4_800_000_000;

/**
 * PPh Final UMKM WP OP dihitung atas bagian omzet setahun yang melewati fasilitas Rp500 juta.
 * Caller must first establish that the taxpayer can use the final-gross regime.
 */
export function umkmFinalReference(annualGross: number): number {
    if (!Number.isFinite(annualGross) || annualGross < 0)
        throw Error('Omzet UMKM acuan harus angka nonnegatif.');
    return Math.max(0, annualGross - UMKM_OP_ANNUAL_ALLOWANCE) * UMKM_FINAL_RATE;
}
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
