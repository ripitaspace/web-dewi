const RULES = { version: 'PP58-2023_PM K168-2023'.replace(' ', ''), effectiveFrom: '2024-01-01', ptkp: { 'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000, 'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000 }, category: { 'TK/0': 'A', 'TK/1': 'A', 'TK/2': 'B', 'TK/3': 'B', 'K/0': 'A', 'K/1': 'B', 'K/2': 'B', 'K/3': 'C' },
    ter: {
        A: { upper: [5400000, 5650000, 5950000, 6300000, 6750000, 7500000, 8550000, 9650000, 10050000, 10350000, 10700000, 11050000, 11600000, 12500000, 13750000, 15100000, 16950000, 19750000, 24150000, 26450000, 28000000, 30050000, 32400000, 35400000, 39100000, 43850000, 47800000, 51400000, 56300000, 62200000, 68600000, 77500000, 89000000, 103000000, 125000000, 157000000, 206000000, 337000000, 454000000, 550000000, 695000000, 910000000, 1400000000, Infinity], rate: [0, .0025, .005, .0075, .01, .0125, .015, .0175, .02, .0225, .025, .03, .035, .04, .05, .06, .07, .08, .09, .10, .11, .12, .13, .14, .15, .16, .17, .18, .19, .20, .21, .22, .23, .24, .25, .26, .27, .28, .29, .30, .31, .32, .33, .34] },
        B: { upper: [6200000, 6500000, 6850000, 7300000, 9200000, 10750000, 11250000, 11600000, 12600000, 13600000, 14950000, 16400000, 18450000, 21850000, 26000000, 27700000, 29350000, 31450000, 33950000, 37100000, 41100000, 45800000, 49500000, 53800000, 58500000, 64000000, 71000000, 80000000, 93000000, 109000000, 129000000, 163000000, 211000000, 374000000, 459000000, 555000000, 704000000, 957000000, 1405000000, Infinity], rate: [0, .0025, .005, .0075, .01, .015, .02, .025, .03, .04, .05, .06, .07, .08, .09, .10, .11, .12, .13, .14, .15, .16, .17, .18, .19, .20, .21, .22, .23, .24, .25, .26, .27, .28, .29, .30, .31, .32, .33, .34] },
        C: { upper: [6600000, 6950000, 7350000, 7800000, 8850000, 9800000, 10950000, 11200000, 12050000, 12950000, 14150000, 15550000, 17050000, 19500000, 22700000, 26600000, 28100000, 30100000, 32600000, 35400000, 38900000, 43000000, 47400000, 51200000, 55800000, 60400000, 66700000, 74500000, 83200000, 95600000, 110000000, 134000000, 169000000, 221000000, 390000000, 463000000, 561000000, 709000000, 965000000, 1419000000, Infinity], rate: [0, .0025, .005, .0075, .01, .0125, .015, .0175, .02, .03, .04, .05, .06, .07, .08, .09, .10, .11, .12, .13, .14, .15, .16, .17, .18, .19, .20, .21, .22, .23, .24, .25, .26, .27, .28, .29, .30, .31, .32, .33, .34] }
    }, article17: [{ cap: 60000000, rate: .05 }, { cap: 250000000, rate: .15 }, { cap: 500000000, rate: .25 }, { cap: 5000000000, rate: .30 }, { cap: Infinity, rate: .35 }] };
/* ====== Data model and editable component catalog. ====== */
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const KINDS = { fixed: 'Pegawai tetap', pension: 'Pensiun berkala', casual_month: 'Tidak tetap / bulanan', casual_daily: 'Tidak tetap / harian', nonemployee: 'Bukan pegawai / jasa', participant: 'Peserta kegiatan', commissioner: 'Komisaris tidak teratur', former: 'Mantan pegawai' };
const PTKP = Object.keys(RULES.ptkp);
const COMPONENTS = {
    salary: { label: 'Gaji / pensiun', tax: 1, cash: 1, a1: 'SalaryPensionJhtTht', a2: 'SalaryPensionJhtTht' },
    allowance: { label: 'Tunjangan lain', tax: 1, cash: 1, a1: 'OtherBenefit', a2: 'OtherBenefit' },
    overtime: { label: 'Lembur', tax: 1, cash: 1, a1: 'OtherBenefit', a2: 'OtherBenefit' },
    taxAllowance: { label: 'Tunjangan PPh', tax: 1, cash: 1, a1: 'IncomeTaxBenefit' },
    honorarium: { label: 'Honorarium pegawai', tax: 1, cash: 1, a1: 'Honorarium' },
    thr: { label: 'THR', tax: 1, cash: 1, a1: 'TantiemBonusThr' },
    bonus: { label: 'Bonus / tantiem', tax: 1, cash: 1, a1: 'TantiemBonusThr' },
    employerInsurance: { label: 'JKK / JKM oleh perusahaan', tax: 1, cash: 0, a1: 'InsurancePaidByEmployer' },
    natura: { label: 'Natura kena pajak', tax: 1, cash: 0, a1: 'Natura' },
    wifeBenefit: { label: 'Tunjangan istri', tax: 1, cash: 1, a2: 'WifeBenefit' },
    childBenefit: { label: 'Tunjangan anak', tax: 1, cash: 1, a2: 'ChildBenefit' },
    incomeImprovement: { label: 'Perbaikan penghasilan', tax: 1, cash: 1, a2: 'IncomeImprovementBenefit' },
    structuralBenefit: { label: 'Tunjangan struktural/fungsional', tax: 1, cash: 1, a2: 'StructuralFunctionalBenefit' },
    riceBenefit: { label: 'Tunjangan beras', tax: 1, cash: 1, a2: 'RiceBenefit' },
    otherRegular: { label: 'Penghasilan teratur lainnya', tax: 1, cash: 1, a2: 'OtherRegularIncome' },
    pensionContribution: { label: 'Iuran pensiun / JHT pegawai', tax: 0, cash: -1, a1: 'PensionContributionJhtThtFee', a2: 'PensionContributionJhtThtFee', annualDeduction: 1 },
    zakat: { label: 'Zakat wajib melalui perusahaan', tax: 0, cash: -1, a1: 'Zakat', a2: 'Zakat', annualDeduction: 1 },
    bpjsDeduction: { label: 'Potongan BPJS pegawai lainnya', tax: 0, cash: -1 },
    otherDeduction: { label: 'Potongan tunai lainnya', tax: 0, cash: -1 },
    fee: { label: 'Honorarium / jasa / hadiah', tax: 1, cash: 1 }
};
const DOCUMENT_TYPES = { CommercialInvoice: 'Tagihan / Invoice', Contract: 'Kontrak', PaymentProof: 'Bukti pembayaran', Announcement: 'Pengumuman', TaxInvoice: 'Faktur Pajak', StatementLetter: 'Surat pernyataan', Decree: 'Keputusan', Other: 'Lainnya', CurrentAccount: 'Rekening koran', TradeConfirmation: 'Konfirmasi transaksi', DeedOfEngagement: 'Akta perjanjian', DeedOfGeneral: 'Akta RUPS', TaxRegulationDoc: 'Dokumen perpajakan', OtherFacilityDoc: 'Dokumen fasilitas' };
const TAX_CODE = { fixed: '21-100-01', pension: '21-100-02', casual_month: '21-100-35', casual_daily: '21-100-24', nonemployee: '21-100-07', participant: '21-100-36', commissioner: '21-100-10', former: '' };
const OBJECT_OPTIONS = { fixed: [['21-100-01', 'Pegawai tetap'], ['21-100-32', 'Pegawai fasilitas daerah tertentu']], pension: [['21-100-02', 'Pensiun berkala']], casual_month: [['21-100-35', 'Tidak tetap dibayar bulanan']], casual_daily: [['21-100-24', 'Tidak tetap harian TER'], ['21-100-30', 'Tidak tetap harian Pasal 17']], nonemployee: [['21-100-07', 'Tenaga ahli'], ['21-100-18', 'Pengajar/pelatih/penasihat'], ['21-100-19', 'Pengarang/peneliti/penerjemah'], ['21-100-20', 'Jasa bidang lainnya'], ['21-100-21', 'Agen iklan'], ['21-100-22', 'Pengawas proyek'], ['21-100-23', 'Pembawa pesanan/langganan'], ['21-100-05', 'Agen asuransi'], ['21-100-06', 'Penjaja barang']], participant: [['21-100-36', 'Peserta perlombaan'], ['21-100-14', 'Peserta rapat/konferensi'], ['21-100-15', 'Panitia'], ['21-100-16', 'Peserta pendidikan'], ['21-100-17', 'Peserta kegiatan lain']], commissioner: [['21-100-10', 'Komisaris penghasilan tidak teratur']], former: [] };
const XML_META = { BPMP: { root: 'MmPayrollBulk', list: 'ListOfMmPayroll', item: 'MmPayroll' }, BP21: { root: 'Bp21Bulk', list: 'ListOfBp21', item: 'Bp21' }, BP26: { root: 'BP26Bulk', list: 'ListOfBP26', item: 'BP26' }, BPA1: { root: 'A1Bulk', list: 'ListOfA1', item: 'A1' }, BPA2: { root: 'A2Bulk', list: 'ListOfA2', item: 'A2' } };
export { RULES, MONTHS, KINDS, PTKP, COMPONENTS, DOCUMENT_TYPES, TAX_CODE, OBJECT_OPTIONS, XML_META };
