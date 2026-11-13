import type {
  LearningDomain,
  LearningModuleRegistration,
  LearningTopic,
  ModuleCard,
} from "./types";

export const learningDomains: LearningDomain[] = [
  { id: "audit", slug: "audit", title: "Audit", description: "Memahami pemeriksaan, bukti, dan tanggung jawab profesional.", icon: "◌", order: 1, status: "published" },
  { id: "akuntansi", slug: "akuntansi", title: "Akuntansi", description: "Membangun pemahaman akuntansi dari dasar hingga praktik.", icon: "✳", order: 2, status: "published" },
  { id: "pajak", slug: "pajak", title: "Pajak", description: "Mempelajari konsep dan praktik perpajakan Indonesia.", icon: "◈", order: 3, status: "published" },
  { id: "ekonomi", slug: "ekonomi", title: "Ekonomi", description: "Memahami prinsip ekonomi mikro, makro, dan perilaku pasar.", icon: "◇", order: 4, status: "published" },
  { id: "sistem", slug: "sistem", title: "Sistem", description: "Mempelajari sistem informasi, proses bisnis, dan pengendalian.", icon: "◎", order: 5, status: "published" },
  { id: "manajemen", slug: "manajemen", title: "Manajemen", description: "Membangun dasar perencanaan, pengorganisasian, dan pengambilan keputusan.", icon: "❖", order: 6, status: "published" },
];

export const learningTopics: LearningTopic[] = [
  { id: "audit-assurance", domainId: "audit", parentId: null, slug: "audit-dan-asurans", title: "Audit & Asurans", order: 1, status: "published" },
  { id: "audit-sme", domainId: "audit", parentId: null, slug: "audit-sme", title: "Audit SME", order: 2, status: "published", description: "Roadmap audit yang dirancang untuk konteks usaha kecil dan menengah." },
  { id: "audit-foundations", domainId: "audit", parentId: "audit-assurance", slug: "fondasi-dan-profesi-audit", title: "Fondasi & Profesi Audit", order: 1, status: "published", description: "Bangun cara berpikir auditor, profesi, etika, dan tujuan penugasan." },
  { id: "audit-intro", domainId: "audit", parentId: "audit-foundations", slug: "pengantar-audit", title: "Pengantar Audit", order: 1, status: "published", description: "Mulai dari teori inti, bukti, asurans, jenis audit, hingga rancangan penugasan." },
  { id: "audit-profession", domainId: "audit", parentId: "audit-foundations", slug: "profesi-auditor", title: "Profesi Auditor", order: 2, status: "published" },
  { id: "audit-ethics", domainId: "audit", parentId: "audit-foundations", slug: "etika-dan-independensi", title: "Etika & Independensi", order: 3, status: "published" },
  { id: "audit-objectives", domainId: "audit", parentId: "audit-foundations", slug: "tanggung-jawab-dan-tujuan-audit", title: "Tanggung Jawab dan Tujuan Audit", order: 4, status: "published" },
  { id: "audit-planning-risk", domainId: "audit", parentId: "audit-assurance", slug: "perencanaan-dan-risiko-audit", title: "Perencanaan & Risiko Audit", order: 2, status: "published", description: "Siapkan penugasan dengan memahami klien, entitas, materialitas, dan risiko." },
  { id: "audit-client-acceptance", domainId: "audit", parentId: "audit-planning-risk", slug: "penerimaan-klien", title: "Penerimaan Klien", order: 1, status: "published" },
  { id: "audit-entity-understanding", domainId: "audit", parentId: "audit-planning-risk", slug: "memahami-entitas", title: "Memahami Entitas", order: 2, status: "published" },
  { id: "audit-materiality", domainId: "audit", parentId: "audit-planning-risk", slug: "materialitas", title: "Materialitas", order: 3, status: "published" },
  { id: "audit-risk", domainId: "audit", parentId: "audit-planning-risk", slug: "risiko-audit", title: "Risiko Audit", order: 4, status: "published" },
  { id: "audit-fraud", domainId: "audit", parentId: "audit-planning-risk", slug: "risiko-kecurangan", title: "Risiko Kecurangan", order: 5, status: "published" },
  { id: "audit-evidence-controls", domainId: "audit", parentId: "audit-assurance", slug: "bukti-dan-pengendalian-internal", title: "Bukti & Pengendalian Internal", order: 3, status: "published", description: "Pelajari bukti, prosedur, pengendalian, pengujian, dan program audit." },
  { id: "audit-evidence", domainId: "audit", parentId: "audit-evidence-controls", slug: "bukti-audit", title: "Bukti Audit", order: 1, status: "published" },
  { id: "audit-procedures", domainId: "audit", parentId: "audit-evidence-controls", slug: "prosedur-audit", title: "Prosedur Audit", order: 2, status: "published" },
  { id: "audit-internal-control", domainId: "audit", parentId: "audit-evidence-controls", slug: "pengendalian-internal", title: "Pengendalian Internal", order: 3, status: "published" },
  { id: "audit-control-testing", domainId: "audit", parentId: "audit-evidence-controls", slug: "pengujian-pengendalian", title: "Pengujian Pengendalian", order: 4, status: "published" },
  { id: "audit-program", domainId: "audit", parentId: "audit-evidence-controls", slug: "strategi-dan-program-audit", title: "Strategi dan Program Audit", order: 5, status: "published" },
  { id: "audit-cycles", domainId: "audit", parentId: "audit-assurance", slug: "siklus-transaksi-dan-akun", title: "Audit Siklus Transaksi & Akun", order: 4, status: "published", description: "Jelajahi siklus transaksi, akun penting, dan sampling audit." },
  { id: "audit-sales-collection", domainId: "audit", parentId: "audit-cycles", slug: "penjualan-dan-piutang", title: "Penjualan dan Piutang", order: 1, status: "published" },
  { id: "audit-acquisition-payment", domainId: "audit", parentId: "audit-cycles", slug: "pembelian-dan-utang", title: "Pembelian dan Utang", order: 2, status: "published" },
  { id: "audit-payroll", domainId: "audit", parentId: "audit-cycles", slug: "penggajian-dan-personalia", title: "Penggajian dan Personalia", order: 3, status: "published" },
  { id: "audit-inventory", domainId: "audit", parentId: "audit-cycles", slug: "persediaan-dan-pergudangan", title: "Persediaan dan Pergudangan", order: 4, status: "published" },
  { id: "audit-capital", domainId: "audit", parentId: "audit-cycles", slug: "pendanaan-dan-ekuitas", title: "Pendanaan dan Ekuitas", order: 5, status: "published" },
  { id: "audit-cash", domainId: "audit", parentId: "audit-cycles", slug: "kas-dan-instrumen-keuangan", title: "Kas dan Instrumen Keuangan", order: 6, status: "published" },
  { id: "audit-sampling", domainId: "audit", parentId: "audit-cycles", slug: "sampling-audit", title: "Sampling Audit", order: 7, status: "published" },
  { id: "audit-completion-reporting", domainId: "audit", parentId: "audit-assurance", slug: "penyelesaian-dan-pelaporan-audit", title: "Penyelesaian & Pelaporan", order: 5, status: "published", description: "Tutup penugasan dengan evaluasi, opini, dan komunikasi yang tepat." },
  { id: "audit-completion", domainId: "audit", parentId: "audit-completion-reporting", slug: "penyelesaian-audit", title: "Penyelesaian Audit", order: 1, status: "published" },
  { id: "audit-reporting", domainId: "audit", parentId: "audit-completion-reporting", slug: "pelaporan-audit", title: "Pelaporan Audit", order: 2, status: "published" },
  { id: "audit-opinions", domainId: "audit", parentId: "audit-completion-reporting", slug: "opini-audit", title: "Opini Audit", order: 3, status: "published" },
  { id: "audit-communication", domainId: "audit", parentId: "audit-completion-reporting", slug: "komunikasi-hasil-audit", title: "Komunikasi Hasil Audit", order: 4, status: "published" },
  { id: "audit-other-assurance", domainId: "audit", parentId: "audit-assurance", slug: "asurans-dan-jasa-terkait", title: "Asurans dan Jasa Terkait", order: 6, status: "published", description: "Bedakan review, kompilasi, atestasi, jasa asurans, dan non-asurans." },
  { id: "audit-review-compilation", domainId: "audit", parentId: "audit-other-assurance", slug: "review-dan-kompilasi", title: "Review dan Kompilasi", order: 1, status: "published" },
  { id: "audit-attestation", domainId: "audit", parentId: "audit-other-assurance", slug: "atestasi", title: "Atestasi", order: 2, status: "published" },
  { id: "audit-assurance-other", domainId: "audit", parentId: "audit-other-assurance", slug: "asurans-lain", title: "Asurans Lain", order: 3, status: "published" },
  { id: "audit-nonassurance", domainId: "audit", parentId: "audit-other-assurance", slug: "jasa-non-asurans", title: "Jasa Non-Asurans", order: 4, status: "published" },
  { id: "audit-special", domainId: "audit", parentId: "audit-assurance", slug: "audit-internal-pemerintah-dan-operasional", title: "Audit Internal, Pemerintah & Operasional", order: 7, status: "published", description: "Pahami mandat, peran, dan fokus audit dalam berbagai organisasi." },
  { id: "internal-audit", domainId: "audit", parentId: "audit-special", slug: "audit-internal", title: "Audit Internal", order: 1, status: "published" },
  { id: "audit-government", domainId: "audit", parentId: "audit-special", slug: "audit-pemerintah", title: "Audit Pemerintah", order: 2, status: "published" },
  { id: "audit-operational", domainId: "audit", parentId: "audit-special", slug: "audit-operasional", title: "Audit Operasional", order: 3, status: "published" },
  { id: "accounting-basic", domainId: "akuntansi", parentId: null, slug: "akuntansi-dasar", title: "Akuntansi Dasar", order: 1, status: "published" },
  { id: "accounting-equation", domainId: "akuntansi", parentId: "accounting-basic", slug: "persamaan-dasar-akuntansi", title: "Persamaan Dasar Akuntansi", order: 1, status: "published" },
  { id: "accounting-journal", domainId: "akuntansi", parentId: "accounting-basic", slug: "jurnal-umum", title: "Jurnal Umum", order: 2, status: "published" },
  { id: "accounting-cycle", domainId: "akuntansi", parentId: "accounting-basic", slug: "siklus-akuntansi", title: "Siklus Akuntansi", order: 3, status: "published" },
  { id: "accounting-intermediate", domainId: "akuntansi", parentId: null, slug: "akuntansi-menengah", title: "Akuntansi Menengah", order: 2, status: "published" },
  { id: "accounting-fixed-assets", domainId: "akuntansi", parentId: "accounting-intermediate", slug: "aset-tetap", title: "Aset Tetap", order: 1, status: "published" },
  { id: "accounting-inventory", domainId: "akuntansi", parentId: "accounting-intermediate", slug: "persediaan", title: "Persediaan", order: 2, status: "published" },
  { id: "accounting-receivables", domainId: "akuntansi", parentId: "accounting-intermediate", slug: "piutang", title: "Piutang", order: 3, status: "published" },
  { id: "accounting-advanced", domainId: "akuntansi", parentId: null, slug: "akuntansi-lanjutan", title: "Akuntansi Lanjutan", order: 3, status: "published" },
  { id: "accounting-cost", domainId: "akuntansi", parentId: null, slug: "akuntansi-biaya", title: "Akuntansi Biaya", order: 4, status: "published" },
  { id: "tax-basic", domainId: "pajak", parentId: null, slug: "dasar-perpajakan", title: "Dasar Perpajakan", order: 1, status: "published" },
  { id: "tax-vat", domainId: "pajak", parentId: null, slug: "ppn", title: "PPN", order: 2, status: "published" },
  { id: "tax-invoice", domainId: "pajak", parentId: "tax-vat", slug: "faktur-pajak", title: "Faktur Pajak", order: 1, status: "published" },
  { id: "tax-input", domainId: "pajak", parentId: "tax-vat", slug: "pajak-masukan", title: "Pajak Masukan", order: 2, status: "published" },
  { id: "tax-output", domainId: "pajak", parentId: "tax-vat", slug: "pajak-keluaran", title: "Pajak Keluaran", order: 3, status: "published" },
  { id: "tax-pph21", domainId: "pajak", parentId: null, slug: "pph-pasal-21", title: "PPh Pasal 21", order: 3, status: "published" },
  { id: "tax-pph23", domainId: "pajak", parentId: null, slug: "pph-pasal-23", title: "PPh Pasal 23", order: 4, status: "published" },
  { id: "tax-corporate", domainId: "pajak", parentId: null, slug: "pph-badan", title: "PPh Badan", order: 5, status: "published" },
  { id: "tax-business-law", domainId: "pajak", parentId: null, slug: "hukum-bisnis", title: "Hukum Bisnis", description: "Hukum perusahaan, kontrak, dan regulasi bisnis yang melandasi praktik perpajakan.", order: 6, status: "published" },
  { id: "tax-ukp", domainId: "pajak", parentId: null, slug: "ukp", title: "UKP", description: "Ujian Kompetensi Perpajakan (UKP): ujian untuk mengukur pemahaman dan keterampilan praktis perpajakan sebagai syarat menjadi kuasa wajib pajak. Berisi materi, latihan soal, dan strategi persiapan.", active: true, order: 7, status: "published" },
  { id: "tax-ukp-a", domainId: "pajak", parentId: "tax-ukp", slug: "ukp-a", title: "UKP A", description: "Tingkat dasar: Bea Meterai, KUP, PPh orang pribadi, PPh pemotongan/pemungutan, serta PPN dan SPT PPN.", active: true, order: 1, status: "published" },
  { id: "tax-ukp-b", domainId: "pajak", parentId: "tax-ukp", slug: "ukp-b", title: "UKP B", description: "Tingkat menengah: akuntansi perpajakan, KUP, PBB-P5L, PPh badan, PPh pemotongan/pemungutan, serta PPN untuk badan dan orang pribadi.", active: true, order: 2, status: "published" },
  { id: "ukp-a-bea-meterai", domainId: "pajak", parentId: "tax-ukp-a", slug: "bea-meterai", title: "UKP A — Bea Meterai", description: "Objek, tarif, saat terutang, pihak yang terutang, pemungut, tata cara pembayaran, serta sanksi administrasi dan pidana bea meterai.", order: 1, status: "published" },
  { id: "ukp-a-kup-ppsp-pp", domainId: "pajak", parentId: "tax-ukp-a", slug: "kup-ppsp-pp", title: "UKP A — KUP, PPSP, dan Pengadilan Pajak", description: "NPWP dan pengukuhan PKP, pembayaran dan pelaporan, STP dan SKP, surat paksa, keberatan, banding, restitusi, pemeriksaan, dan ketentuan pidana.", order: 2, status: "published" },
  { id: "ukp-a-pph-orang-pribadi", domainId: "pajak", parentId: "tax-ukp-a", slug: "pph-orang-pribadi", title: "UKP A — PPh Orang Pribadi", description: "Subjek dan objek pajak OP, PPh final, norma penghitungan, PTKP dan tarif, kredit pajak, angsuran Pasal 25, dan SPT Tahunan.", order: 3, status: "published" },
  { id: "ukp-a-pph-pemotongan-pemungutan", domainId: "pajak", parentId: "tax-ukp-a", slug: "pph-pemotongan-pemungutan", title: "UKP A — PPh Pemotongan/Pemungutan", description: "PPh 21, 23, 4(2), dan 26: pemotong, objek, tarif, pengecualian, penghitungan, serta tata cara pemotongan dan pelaporan.", order: 4, status: "published" },
  { id: "ukp-a-ppn-dan-spt-ppn", domainId: "pajak", parentId: "tax-ukp-a", slug: "ppn-dan-spt-ppn", title: "UKP A — PPN dan SPT PPN", description: "Karakteristik dan objek PPN, kewajiban PKP, DPP dan tarif, faktur pajak, pengkreditan pajak masukan, pemungut PPN, dan fasilitas.", order: 5, status: "published" },
  { id: "ukp-b-akuntansi-perpajakan", domainId: "pajak", parentId: "tax-ukp-b", slug: "akuntansi-perpajakan", title: "UKP B — Akuntansi Perpajakan", description: "Jurnal PPh pemotongan/pemungutan, aspek pajak akun neraca, akuntansi nirlaba, pengakuan pendapatan dan biaya, serta rekonsiliasi fiskal.", order: 1, status: "published" },
  { id: "ukp-b-bea-meterai", domainId: "pajak", parentId: "tax-ukp-b", slug: "bea-meterai", title: "UKP B — Bea Meterai", description: "Objek, tarif, saat terutang, pihak yang terutang, dan pengecualian bea meterai untuk orang pribadi.", order: 2, status: "published" },
  { id: "ukp-b-kup-ppsp-pp", domainId: "pajak", parentId: "tax-ukp-b", slug: "kup-ppsp-pp", title: "UKP B — KUP, PPSP, dan Pengadilan Pajak", description: "Ketentuan KUP untuk badan dan orang pribadi: pembayaran, STP dan SKP, surat paksa, keberatan, banding, pembukuan, dan restitusi.", order: 3, status: "published" },
  { id: "ukp-b-pbb-p5l", domainId: "pajak", parentId: "tax-ukp-b", slug: "pbb-p5l", title: "UKP B — PBB-P5L", description: "Subjek dan objek PBB, pendataan, NJOP, penghitungan PBB terutang, ketetapan dan penagihan, serta upaya hukum.", order: 4, status: "published" },
  { id: "ukp-b-pph-orang-pribadi", domainId: "pajak", parentId: "tax-ukp-b", slug: "pph-orang-pribadi", title: "UKP B — PPh Orang Pribadi", description: "Norma penghitungan penghasilan neto, pemajakan penghasilan keluarga, PTKP, tarif, dan PPh terutang orang pribadi.", order: 5, status: "published" },
  { id: "ukp-b-pph-pemotongan-pemungutan", domainId: "pajak", parentId: "tax-ukp-b", slug: "pph-pemotongan-pemungutan", title: "UKP B — PPh Pemotongan/Pemungutan", description: "PPh 21, 22, 23, 4(2), dan 26 untuk badan dalam negeri, serta penghitungan PPh 21 dan hak penerima untuk orang pribadi.", order: 6, status: "published" },
  { id: "ukp-b-pph-badan", domainId: "pajak", parentId: "tax-ukp-b", slug: "pph-badan", title: "UKP B — PPh Badan", description: "Subjek, objek, biaya, penyusutan, hubungan istimewa, kompensasi kerugian, tarif, kredit pajak, angsuran Pasal 25, dan SPT Tahunan Badan.", order: 7, status: "published" },
  { id: "ukp-b-ppn-dan-spt-ppn", domainId: "pajak", parentId: "tax-ukp-b", slug: "ppn-dan-spt-ppn", title: "UKP B — PPN dan SPT PPN", description: "Objek PPN, DPP dan tarif, faktur pajak, pengkreditan pajak masukan, pemungut PPN, fasilitas, dan SPT Masa PPN badan serta orang pribadi.", order: 8, status: "published" },
  { id: "tax-ukp-c", domainId: "pajak", parentId: "tax-ukp", slug: "ukp-c", title: "UKP C", description: "Tingkat lanjutan: pajak internasional, transaksi lintas negara, dan studi kasus perpajakan yang kompleks.", active: true, order: 3, status: "published" },
  { id: "ukp-c-akuntansi", domainId: "pajak", parentId: "tax-ukp-c", slug: "akuntansi-perpajakan", title: "UKP C — Akuntansi Perpajakan", description: "Jurnal PPh pemotongan/pemungutan, aspek pajak akun neraca, rekonsiliasi fiskal, dan perbedaan laporan keuangan komersial dengan fiskal.", active: true, order: 1, status: "published" },
  { id: "ukp-c-bea-meterai", domainId: "pajak", parentId: "tax-ukp-c", slug: "bea-meterai", title: "UKP C — Bea Meterai", description: "Objek, tarif, saat terutang, pihak yang terutang, dan pengecualian bea meterai berdasarkan UU 10/2020.", active: true, order: 2, status: "published" },
  { id: "ukp-c-kup", domainId: "pajak", parentId: "tax-ukp-c", slug: "kup-ppsp-pengadilan-pajak", title: "UKP C — KUP, PPSP, dan Pengadilan Pajak", description: "Ketentuan umum perpajakan, STP dan SKP, penagihan, keberatan, banding, serta penyelesaian sengketa di Pengadilan Pajak.", active: true, order: 3, status: "published" },
  { id: "ukp-c-internasional", domainId: "pajak", parentId: "tax-ukp-c", slug: "pajak-internasional", title: "UKP C — Pajak Internasional", description: "Subjek dan objek pajak transaksi lintas negara, P3B, kredit pajak luar negeri, dan pemotongan atas penghasilan WP luar negeri.", active: true, order: 4, status: "published" },
  { id: "ukp-c-pbb-p5l", domainId: "pajak", parentId: "tax-ukp-c", slug: "pbb-p5l", title: "UKP C — PBB-P5L", description: "PBB sektor perkebunan, perhutanan, pertambangan, dan sektor lainnya: subjek, objek, NJOP, dan penghitungan.", active: true, order: 5, status: "published" },
  { id: "ukp-c-pph-badan", domainId: "pajak", parentId: "tax-ukp-c", slug: "pph-badan", title: "UKP C — PPh Badan", description: "Penghitungan PPh badan dalam negeri dan transaksi internasional: penghasilan kena pajak, tarif, kompensasi kerugian, dan kredit pajak.", active: true, order: 6, status: "published" },
  { id: "ukp-c-pph-op", domainId: "pajak", parentId: "tax-ukp-c", slug: "pph-orang-pribadi", title: "UKP C — PPh Orang Pribadi", description: "Penghasilan, PTKP, tarif progresif, dan penghitungan PPh terutang orang pribadi.", active: true, order: 7, status: "published" },
  { id: "ukp-c-pemotongan", domainId: "pajak", parentId: "tax-ukp-c", slug: "pph-pemotongan-pemungutan", title: "UKP C — PPh Pemotongan/Pemungutan", description: "PPh 21, 22, 23, 4(2), 15, dan 26: objek, tarif, saat terutang, serta kewajiban pemotong dan pemungut.", active: true, order: 8, status: "published" },
  { id: "ukp-c-ppn", domainId: "pajak", parentId: "tax-ukp-c", slug: "ppn-dan-spt-ppn", title: "UKP C — PPN dan SPT PPN", description: "Tarif 12% dengan DPP nilai lain, faktur pajak, pengkreditan pajak masukan, PPN KMS, dan pengisian SPT Masa PPN.", active: true, order: 9, status: "published" },
];

type AuditChapterSeed = {
  number: number;
  title: string;
  summary: string;
  relatedTopicId: string;
  slug?: string;
  available?: boolean;
};

/**
 * This is intentionally only curriculum metadata. The table of contents is a
 * source for scope and ordering, not a substitute for the copyrighted text.
 */
const auditChapterSeeds: AuditChapterSeed[] = [
  { number: 1, title: "The Demand for Audit and Other Assurance Services", summary: "Mengapa pengguna informasi membutuhkan audit dan jasa assurance independen.", relatedTopicId: "audit-intro", slug: "mengapa-audit-dibutuhkan", available: true },
  { number: 2, title: "The CPA Profession", summary: "Peran, kompetensi, dan tanggung jawab profesi auditor.", relatedTopicId: "audit-profession" },
  { number: 3, title: "Audit Reports", summary: "Struktur dan fungsi laporan auditor.", relatedTopicId: "audit-reporting" },
  { number: 4, title: "Professional Ethics", summary: "Etika, independensi, dan pertimbangan profesional.", relatedTopicId: "audit-ethics" },
  { number: 5, title: "Legal Liability", summary: "Tanggung jawab hukum dalam praktik audit.", relatedTopicId: "audit-profession" },
  { number: 6, title: "Audit Responsibilities and Objectives", summary: "Tanggung jawab auditor, asersi, dan tujuan audit.", relatedTopicId: "audit-objectives" },
  { number: 7, title: "Audit Evidence", summary: "Kecukupan, ketepatan, dan evaluasi bukti audit.", relatedTopicId: "audit-evidence" },
  { number: 8, title: "Audit Planning and Materiality", summary: "Perencanaan penugasan dan penetapan materialitas.", relatedTopicId: "audit-materiality" },
  { number: 9, title: "Assessing the Risk of Material Misstatement", summary: "Identifikasi dan penilaian risiko salah saji material.", relatedTopicId: "audit-risk" },
  { number: 10, title: "Assessing and Responding to Fraud Risks", summary: "Penilaian serta respons atas risiko kecurangan.", relatedTopicId: "audit-fraud" },
  { number: 11, title: "Internal Control and COSO Framework", summary: "Pemahaman pengendalian internal dan kerangka COSO.", relatedTopicId: "audit-internal-control" },
  { number: 12, title: "Assessing Control Risk and Reporting on Internal Controls", summary: "Penilaian risiko pengendalian dan pelaporan pengendalian internal.", relatedTopicId: "audit-control-testing" },
  { number: 13, title: "Overall Audit Strategy and Audit Program", summary: "Penyusunan strategi menyeluruh dan program audit.", relatedTopicId: "audit-program" },
  { number: 14, title: "Audit of the Sales and Collection Cycle", summary: "Audit siklus penjualan dan penagihan.", relatedTopicId: "audit-sales-collection" },
  { number: 15, title: "Audit Sampling for Tests of Controls and Substantive Tests of Transactions", summary: "Sampling untuk pengujian pengendalian dan transaksi.", relatedTopicId: "audit-sampling" },
  { number: 16, title: "Completing the Tests in the Sales and Collection Cycle: Accounts Receivable", summary: "Penyelesaian pengujian piutang dalam siklus penjualan dan penagihan.", relatedTopicId: "audit-sales-collection" },
  { number: 17, title: "Audit Sampling for Tests of Details of Balances", summary: "Sampling untuk pengujian rinci saldo.", relatedTopicId: "audit-sampling" },
  { number: 18, title: "Audit of the Acquisition and Payment Cycle", summary: "Audit siklus perolehan dan pembayaran.", relatedTopicId: "audit-acquisition-payment" },
  { number: 19, title: "Completing the Tests in the Acquisition and Payment Cycle", summary: "Penyelesaian pengujian dalam siklus perolehan dan pembayaran.", relatedTopicId: "audit-acquisition-payment" },
  { number: 20, title: "Audit of the Payroll and Personnel Cycle", summary: "Audit siklus penggajian dan personalia.", relatedTopicId: "audit-payroll" },
  { number: 21, title: "Audit of the Inventory and Warehousing Cycle", summary: "Audit siklus persediaan dan pergudangan.", relatedTopicId: "audit-inventory" },
  { number: 22, title: "Audit of the Capital Acquisition and Repayment Cycle", summary: "Audit siklus perolehan modal dan pelunasan.", relatedTopicId: "audit-capital" },
  { number: 23, title: "Audit of Cash and Financial Instruments", summary: "Audit kas dan instrumen keuangan.", relatedTopicId: "audit-cash" },
  { number: 24, title: "Completing the Audit", summary: "Penyelesaian audit, evaluasi bukti, dan final review.", relatedTopicId: "audit-completion" },
  { number: 25, title: "Other Assurance Services", summary: "Jasa assurance lain dan ruang lingkup penugasannya.", relatedTopicId: "audit-other-assurance" },
  { number: 26, title: "Internal and Governmental Financial Auditing and Operational Auditing", summary: "Audit internal, pemerintahan, dan operasional.", relatedTopicId: "audit-special" },
];

export const auditMasterclassChapters: LearningModuleRegistration[] = auditChapterSeeds.map((chapter) => ({
  id: `audit-chapter-${String(chapter.number).padStart(2, "0")}`,
  publicCode: `MOD-AUD-${String(chapter.number).padStart(3, "0")}`,
  slug: chapter.slug || `audit-masterclass-chapter-${String(chapter.number).padStart(2, "0")}`,
  title: `Chapter ${chapter.number} · ${chapter.title}`,
  description: chapter.summary,
  primaryTopicId: "audit-intro",
  relatedTopicIds: chapter.relatedTopicId === "audit-intro" ? undefined : [chapter.relatedTopicId],
  version: "1.0.0",
  level: "beginner",
  status: "published",
  estimatedMinutes: chapter.available ? 20 : undefined,
  tags: ["audit", "audit masterclass", `chapter ${chapter.number}`],
  learningUnitCount: chapter.available ? 1 : 0,
  activityCount: chapter.available ? 5 : 0,
  contentStatus: chapter.available ? "available" : "pending",
  catalogKind: "chapter",
}));

const auditSupplementarySeeds = [
  ["hakikat-audit", "Hakikat Audit", "Bangun model mental audit: informasi, kriteria, bukti, pertimbangan, dan laporan.", 20],
  ["bukti-dan-pertimbangan-auditor", "Bukti dan Pertimbangan Auditor", "Nilai kecukupan dan ketepatan bukti serta pentingnya kompetensi dan independensi.", 20],
  ["akuntansi-bukan-audit", "Akuntansi Bukan Audit", "Bedakan penyusunan informasi dengan pemeriksaan klaim dan bukti atas informasi tersebut.", 17],
  ["jasa-asurans-dan-non-asurans", "Jasa Asurans dan Non-Asurans", "Bandingkan audit, review, atestasi, pembukuan, dan konsultasi secara bertanggung jawab.", 20],
  ["tiga-jenis-audit", "Tiga Jenis Audit", "Bedakan audit laporan keuangan, kepatuhan, dan operasional melalui tujuan dan kriteria.", 20],
  ["peran-dan-jenis-auditor", "Peran dan Jenis Auditor", "Kenali auditor eksternal, internal, pemerintah, dan pajak beserta konteks objektivitasnya.", 18],
  ["capstone-rancangan-penugasan-audit", "Capstone: Rancangan Penugasan Audit", "Satukan klaim, kriteria, risiko, bukti, jenis audit, dan komunikasi hasil dalam satu kasus.", 20],
] as const;

export const auditSupplementaryModules: LearningModuleRegistration[] = auditSupplementarySeeds.map(([slug, title, description, estimatedMinutes], index) => ({
  id: `audit-supplementary-${String(index + 1).padStart(2, "0")}`,
  publicCode: `MOD-AUD-${String(index + 101).padStart(3, "0")}`,
  slug,
  title: `Pengantar Audit · ${title}`,
  description,
  primaryTopicId: "audit-intro",
  version: "2.0.0",
  level: "beginner",
  status: "published",
  estimatedMinutes,
  tags: ["audit", "pengantar audit", "micro-learning"],
  learningUnitCount: 1,
  activityCount: 5,
  contentStatus: "available",
  catalogKind: "supplementary",
}));

export const learningModuleRegistry: LearningModuleRegistration[] = [
  ...auditMasterclassChapters,
  ...auditSupplementaryModules,
  {
    id: "audit-sme-risk-based",
    publicCode: "MOD-AUD-201",
    slug: "audit-sme",
    title: "Audit SME — Praktik Audit Berbasis Risiko",
    description: "Latihan audit SME berbasis risiko melalui kasus Dephta Furniture dan Kumar & Co.",
    primaryTopicId: "audit-sme",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 660,
    tags: ["audit SME", "IFAC 2010", "risk-based audit"],
    learningUnitCount: 22,
    activityCount: 66,
  },
  {
    id: "ukp-a-bea-meterai",
    publicCode: "MOD-PJK-101",
    slug: "ukp-a-bea-meterai",
    title: "UKP A · Bea Meterai",
    description: "20 soal latihan orisinal UKP Tingkat A tentang objek, tarif, saat terutang, pihak terutang, dan pengecualian Bea Meterai menurut UU 10/2020. Perlu verifikasi.",
    primaryTopicId: "ukp-a-bea-meterai",
    version: "1.0.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP A", "bea meterai"],
    learningUnitCount: 6,
    activityCount: 21,
  },
  {
    id: "ukp-a-kup-ppsp-pengadilan-pajak",
    publicCode: "MOD-PJK-102",
    slug: "ukp-a-kup-ppsp-pengadilan-pajak",
    title: "UKP A · KUP, PPSP, dan Pengadilan Pajak",
    description: "17 soal latihan orisinal UKP Tingkat A: STP dan SKP, keberatan dan banding, sanksi, serta urutan penagihan pajak. Perlu verifikasi.",
    primaryTopicId: "ukp-a-kup-ppsp-pp",
    version: "1.0.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP A", "KUP, PPSP, dan Pengadilan Pajak"],
    learningUnitCount: 5,
    activityCount: 18,
  },
  {
    id: "ukp-a-pph-orang-pribadi",
    publicCode: "MOD-PJK-103",
    slug: "ukp-a-pph-orang-pribadi",
    title: "UKP A · PPh Orang Pribadi",
    description: "17 soal latihan orisinal UKP Tingkat A: PTKP, tarif Pasal 17, penghitungan PPh pegawai, norma, dan penghasilan final. Perlu verifikasi.",
    primaryTopicId: "ukp-a-pph-orang-pribadi",
    version: "1.0.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP A", "PPh Orang Pribadi"],
    learningUnitCount: 6,
    activityCount: 18,
  },
  {
    id: "ukp-a-pph-pemotongan-pemungutan",
    publicCode: "MOD-PJK-104",
    slug: "ukp-a-pph-pemotongan-pemungutan",
    title: "UKP A · PPh Pemotongan/Pemungutan",
    description: "18 soal latihan orisinal UKP Tingkat A: PPh 21, 23, 4(2), dan 26: objek, tarif, serta cara penghitungan. Perlu verifikasi.",
    primaryTopicId: "ukp-a-pph-pemotongan-pemungutan",
    version: "1.0.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 45,
    tags: ["pajak", "UKP", "UKP A", "PPh Pemotongan/Pemungutan"],
    learningUnitCount: 6,
    activityCount: 19,
  },
  {
    id: "ukp-a-ppn-dan-spt-ppn",
    publicCode: "MOD-PJK-105",
    slug: "ukp-a-ppn-dan-spt-ppn",
    title: "UKP A · PPN dan SPT PPN",
    description: "19 soal latihan orisinal UKP Tingkat A: objek PPN, DPP dan tarif, faktur pajak, Pajak Masukan, dan PPN orang pribadi. Perlu verifikasi.",
    primaryTopicId: "ukp-a-ppn-dan-spt-ppn",
    version: "1.0.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 50,
    tags: ["pajak", "UKP", "UKP A", "PPN dan SPT PPN"],
    learningUnitCount: 6,
    activityCount: 20,
  },
  {
    id: "ukp-b-akuntansi-perpajakan",
    publicCode: "MOD-PJK-201",
    slug: "ukp-b-akuntansi-perpajakan",
    title: "UKP B · Akuntansi Perpajakan",
    description: "17 soal latihan orisinal UKP Tingkat B: jurnal PPh, aspek pajak akun neraca, koreksi fiskal, rekonsiliasi fiskal, dan PPh final jasa konstruksi. Perlu verifikasi.",
    primaryTopicId: "ukp-b-akuntansi-perpajakan",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "Akuntansi Perpajakan"],
    learningUnitCount: 6,
    activityCount: 18,
  },
  {
    id: "ukp-b-bea-meterai",
    publicCode: "MOD-PJK-202",
    slug: "ukp-b-bea-meterai",
    title: "UKP B · Bea Meterai",
    description: "15 soal latihan orisinal UKP Tingkat B: objek, tarif, saat terutang, pihak terutang, dan pengecualian Bea Meterai untuk orang pribadi. Perlu verifikasi.",
    primaryTopicId: "ukp-b-bea-meterai",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "Bea Meterai"],
    learningUnitCount: 6,
    activityCount: 16,
  },
  {
    id: "ukp-b-kup-ppsp-pengadilan-pajak",
    publicCode: "MOD-PJK-203",
    slug: "ukp-b-kup-ppsp-pengadilan-pajak",
    title: "UKP B · KUP, PPSP, dan Pengadilan Pajak",
    description: "16 soal latihan orisinal UKP Tingkat B: STP dan SKP, keberatan dan banding, denda, serta penagihan dengan surat paksa. Perlu verifikasi.",
    primaryTopicId: "ukp-b-kup-ppsp-pp",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "KUP, PPSP, dan Pengadilan Pajak"],
    learningUnitCount: 5,
    activityCount: 17,
  },
  {
    id: "ukp-b-pbb-p5l",
    publicCode: "MOD-PJK-204",
    slug: "ukp-b-pbb-p5l",
    title: "UKP B · PBB-P5L",
    description: "16 soal latihan orisinal UKP Tingkat B: subjek dan objek, penghitungan PBB terutang, sanksi, serta upaya non-keberatan. Perlu verifikasi.",
    primaryTopicId: "ukp-b-pbb-p5l",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "PBB-P5L"],
    learningUnitCount: 4,
    activityCount: 17,
  },
  {
    id: "ukp-b-pph-orang-pribadi",
    publicCode: "MOD-PJK-205",
    slug: "ukp-b-pph-orang-pribadi",
    title: "UKP B · PPh Orang Pribadi",
    description: "15 soal latihan orisinal UKP Tingkat B: PTKP, tarif progresif, PPh pegawai, norma, dan pemajakan penghasilan keluarga. Perlu verifikasi.",
    primaryTopicId: "ukp-b-pph-orang-pribadi",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "PPh Orang Pribadi"],
    learningUnitCount: 7,
    activityCount: 16,
  },
  {
    id: "ukp-b-pph-pemotongan-pemungutan",
    publicCode: "MOD-PJK-206",
    slug: "ukp-b-pph-pemotongan-pemungutan",
    title: "UKP B · PPh Pemotongan/Pemungutan",
    description: "17 soal latihan orisinal UKP Tingkat B: PPh 21, 22, 23, 4(2), dan 26 untuk badan dalam negeri serta orang pribadi. Perlu verifikasi.",
    primaryTopicId: "ukp-b-pph-pemotongan-pemungutan",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "PPh Pemotongan/Pemungutan"],
    learningUnitCount: 6,
    activityCount: 18,
  },
  {
    id: "ukp-b-pph-badan",
    publicCode: "MOD-PJK-207",
    slug: "ukp-b-pph-badan",
    title: "UKP B · PPh Badan",
    description: "17 soal latihan orisinal UKP Tingkat B: objek, biaya, fasilitas Pasal 31E, penyusutan, kompensasi kerugian, tarif, dan PPh 25. Perlu verifikasi.",
    primaryTopicId: "ukp-b-pph-badan",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 40,
    tags: ["pajak", "UKP", "UKP B", "PPh Badan"],
    learningUnitCount: 6,
    activityCount: 18,
  },
  {
    id: "ukp-b-ppn-dan-spt-ppn",
    publicCode: "MOD-PJK-208",
    slug: "ukp-b-ppn-dan-spt-ppn",
    title: "UKP B · PPN dan SPT PPN",
    description: "18 soal latihan orisinal UKP Tingkat B: objek PPN, DPP dan tarif, faktur pajak, pengkreditan Pajak Masukan, dan PPN orang pribadi. Perlu verifikasi.",
    primaryTopicId: "ukp-b-ppn-dan-spt-ppn",
    version: "1.0.0",
    level: "intermediate",
    status: "published",
    estimatedMinutes: 45,
    tags: ["pajak", "UKP", "UKP B", "PPN dan SPT PPN"],
    learningUnitCount: 6,
    activityCount: 19,
  },
  {
    id: "ukp-c-akuntansi-perpajakan",
    publicCode: "MOD-PJK-301",
    slug: "ukp-c-akuntansi-perpajakan",
    title: "UKP C · Akuntansi Perpajakan",
    description: "40 soal latihan UKP Tingkat C tentang jurnal PPh, aspek pajak akun neraca, rekonsiliasi fiskal, dan pajak tangguhan, lengkap dengan ringkasan dan pembahasan.",
    primaryTopicId: "ukp-c-akuntansi",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "akuntansi pajak", "rekonsiliasi fiskal"],
    learningUnitCount: 10,
    activityCount: 41,
  },
  {
    id: "ukp-c-bea-meterai",
    publicCode: "MOD-PJK-302",
    slug: "ukp-c-bea-meterai",
    title: "UKP C · Bea Meterai",
    description: "40 soal latihan UKP Tingkat C tentang objek, tarif, saat terutang, pihak terutang, dan pengecualian Bea Meterai menurut UU 10/2020.",
    primaryTopicId: "ukp-c-bea-meterai",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 60,
    tags: ["pajak", "UKP", "UKP C", "bea meterai"],
    learningUnitCount: 6,
    activityCount: 41,
  },
  {
    id: "ukp-c-kup-ppsp-pengadilan-pajak",
    publicCode: "MOD-PJK-303",
    slug: "ukp-c-kup-ppsp-pengadilan-pajak",
    title: "UKP C · KUP, PPSP, dan Pengadilan Pajak",
    description: "40 soal latihan UKP Tingkat C tentang STP dan SKP, keberatan dan banding, sanksi, serta penagihan pajak dengan surat paksa.",
    primaryTopicId: "ukp-c-kup",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "KUP", "PPSP"],
    learningUnitCount: 6,
    activityCount: 41,
  },
  {
    id: "ukp-c-pajak-internasional",
    publicCode: "MOD-PJK-304",
    slug: "ukp-c-pajak-internasional",
    title: "UKP C · Pajak Internasional",
    description: "40 soal latihan UKP Tingkat C tentang BUT, P3B, anti-avoidance, transfer pricing, MAP/APA, dan pertukaran informasi.",
    primaryTopicId: "ukp-c-internasional",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "P3B", "transfer pricing"],
    learningUnitCount: 9,
    activityCount: 41,
  },
  {
    id: "ukp-c-pbb-p5l",
    publicCode: "MOD-PJK-305",
    slug: "ukp-c-pbb-p5l",
    title: "UKP C · PBB-P5L",
    description: "40 soal latihan UKP Tingkat C tentang subjek dan objek PBB-P5L, penghitungan, sanksi, serta upaya hukum non-keberatan.",
    primaryTopicId: "ukp-c-pbb-p5l",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 75,
    tags: ["pajak", "UKP", "UKP C", "PBB", "PBB-P5L"],
    learningUnitCount: 4,
    activityCount: 41,
  },
  {
    id: "ukp-c-pph-badan",
    publicCode: "MOD-PJK-306",
    slug: "ukp-c-pph-badan",
    title: "UKP C · PPh Badan",
    description: "40 soal latihan UKP Tingkat C tentang PPh badan dalam negeri dan transaksi internasional: objek, biaya, tarif, BUT, kompensasi, dan kredit pajak luar negeri.",
    primaryTopicId: "ukp-c-pph-badan",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "PPh Badan", "BUT"],
    learningUnitCount: 8,
    activityCount: 41,
  },
  {
    id: "ukp-c-pph-orang-pribadi",
    publicCode: "MOD-PJK-307",
    slug: "ukp-c-pph-orang-pribadi",
    title: "UKP C · PPh Orang Pribadi",
    description: "40 soal latihan UKP Tingkat C tentang PTKP, tarif progresif, PPh pegawai, norma, dan PPh keluarga.",
    primaryTopicId: "ukp-c-pph-op",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "PPh OP", "PTKP"],
    learningUnitCount: 7,
    activityCount: 41,
  },
  {
    id: "ukp-c-ppn-dan-spt-ppn",
    publicCode: "MOD-PJK-309",
    slug: "ukp-c-ppn-dan-spt-ppn",
    title: "UKP C · PPN dan SPT PPN",
    description: "40 soal latihan UKP Tingkat C tentang objek PPN, DPP dan tarif 12%, faktur pajak, pengkreditan Pajak Masukan, dan PPN orang pribadi.",
    primaryTopicId: "ukp-c-ppn",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "PPN", "faktur pajak"],
    learningUnitCount: 6,
    activityCount: 41,
  },
  {
    id: "ukp-c-pph-pemotongan-pemungutan",
    publicCode: "MOD-PJK-308",
    slug: "ukp-c-pph-pemotongan-pemungutan",
    title: "UKP C · PPh Pemotongan/Pemungutan",
    description: "40 soal latihan UKP Tingkat C tentang PPh 21, 22, 23, 4(2), dan 26 lengkap dengan ringkasan, hitungan interaktif, dan pembahasan.",
    primaryTopicId: "ukp-c-pemotongan",
    version: "1.0.0",
    level: "advanced",
    status: "published",
    estimatedMinutes: 90,
    tags: ["pajak", "UKP", "UKP C", "PPh 21", "PPh 22", "PPh 23", "PPh 26"],
    learningUnitCount: 11,
    activityCount: 41,
  },
  {
    id: "template-self-learning",
    publicCode: "MOD-AKT-002",
    slug: "template-self-learning",
    title: "Template Self-Learning: Jurnal dan Aset",
    description: "Template draft untuk pengalaman self-learning bertahap.",
    primaryTopicId: "accounting-basic",
    version: "1.1.0",
    level: "beginner",
    status: "draft",
    estimatedMinutes: 65,
    tags: ["template", "self-learning"],
    learningUnitCount: 2,
    activityCount: 16,
  },
  {
    id: "aset-tetap",
    publicCode: "MOD-AKT-001",
    slug: "aset-tetap",
    title: "Aset Tetap: Dari Perolehan sampai Penyusutan",
    description: "Kenali biaya perolehan, hitung penyusutan, dan coba pencatatan jurnal lewat satu kasus yang saling terhubung.",
    primaryTopicId: "accounting-fixed-assets",
    version: "1.1.0",
    level: "beginner",
    status: "published",
    estimatedMinutes: 45,
    tags: ["aset tetap", "penyusutan", "jurnal"],
    learningUnitCount: 3,
    activityCount: 13,
  },
];

const byOrder = <T extends { id: string; order: number }>(a: T, b: T) => a.order - b.order || a.id.localeCompare(b.id);
const domainById = (id: string) => learningDomains.find((domain) => domain.id === id);

export interface TopicTreeNode extends LearningTopic { children: TopicTreeNode[]; moduleCount: number }
export interface CatalogBreadcrumb { label: string; href: string }

export function topicPath(topic: LearningTopic): string[] {
  const result = [topic.slug];
  let parentId = topic.parentId;
  const visited = new Set<string>([topic.id]);
  while (parentId) {
    if (visited.has(parentId)) return [];
    visited.add(parentId);
    const parent = learningTopics.find((entry) => entry.id === parentId);
    if (!parent) return [];
    result.unshift(parent.slug);
    parentId = parent.parentId;
  }
  return result;
}

export function getPublishedDomains() { return learningDomains.filter((domain) => domain.status === "published").sort(byOrder); }
export function getDomain(slug: string) { return getPublishedDomains().find((domain) => domain.slug === slug); }
export function getModuleRegistration(slug: string) { return learningModuleRegistry.find((module) => module.slug === slug); }
export function getChildTopics(domainId: string, parentId: string | null) { return learningTopics.filter((topic) => topic.domainId === domainId && topic.parentId === parentId && topic.status === "published").sort(byOrder); }
export function getDescendantTopicIds(topicId: string): string[] {
  const found = new Set<string>([topicId]);
  for (const topic of learningTopics) if (topic.parentId && found.has(topic.parentId)) found.add(topic.id);
  let changed = true;
  while (changed) { changed = false; for (const topic of learningTopics) if (topic.parentId && found.has(topic.parentId) && !found.has(topic.id)) { found.add(topic.id); changed = true; } }
  return [...found];
}
export function getModulesForTopic(topicId?: string, options: { descendants?: boolean; level?: string; query?: string } = {}) {
  const ids = topicId ? new Set(options.descendants ? getDescendantTopicIds(topicId) : [topicId]) : undefined;
  const term = options.query?.trim().toLocaleLowerCase("id-ID");
  return learningModuleRegistry.filter((module) => {
    const topics = [module.primaryTopicId, ...(module.relatedTopicIds || [])];
    const searchable = [module.title, module.description, ...(module.tags || [])].join(" ").toLocaleLowerCase("id-ID");
    return module.status === "published" && (!ids || topics.some((id) => ids.has(id))) && (!options.level || module.level === options.level) && (!term || searchable.includes(term));
  });
}
export function getModulesForDomain(domainId: string) {
  const ids = new Set(learningTopics.filter((topic) => topic.domainId === domainId).map((topic) => topic.id));
  return learningModuleRegistry.filter((module) => module.status === "published" && [module.primaryTopicId, ...(module.relatedTopicIds || [])].some((id) => ids.has(id)));
}
export function moduleCard(module: LearningModuleRegistration): ModuleCard {
  const topic = learningTopics.find((entry) => entry.id === module.primaryTopicId);
  return {
    slug: module.slug,
    id: module.id,
    revision: Number(module.version.split(".")[0]) || 1,
    title: module.title,
    summary: module.description,
    subject: domainById(topic?.domainId || "")?.title || "Belajar",
    minutes: module.estimatedMinutes || 0,
    level: module.level === "beginner" ? "Pemula" : module.level,
    pages: module.learningUnitCount || 0,
    activities: module.activityCount || 0,
    contentStatus: module.contentStatus || "available",
    catalogKind: module.catalogKind || "module",
  };
}
export function getPublishedModuleCards(options: { descendants?: boolean; level?: string; query?: string } = {}) { return getModulesForTopic(undefined, options).map(moduleCard); }
export function getTopicTree(domainId: string, parentId: string | null = null): TopicTreeNode[] { return getChildTopics(domainId, parentId).map((topic) => ({ ...topic, children: getTopicTree(domainId, topic.id), moduleCount: getModulesForTopic(topic.id, { descendants: true }).length })); }
export function resolveCatalogRoute(domainSlug: string, segments: string[] = []) {
  const domain = getDomain(domainSlug);
  if (!domain) return undefined;
  let parentId: string | null = null;
  let topic: LearningTopic | undefined;
  for (const segment of segments) { topic = getChildTopics(domain.id, parentId).find((entry) => entry.slug === segment); if (!topic) return undefined; parentId = topic.id; }
  return { domain, topic };
}

const legacyCatalogRedirects: Record<string, string> = {
  "audit/audit-dan-asurans/pengantar-audit": "/belajar/audit/audit-dan-asurans/fondasi-dan-profesi-audit/pengantar-audit",
  "audit/audit-dan-asurans/perencanaan-audit": "/belajar/audit/audit-dan-asurans/perencanaan-dan-risiko-audit",
  "audit/audit-dan-asurans/perencanaan-audit/risiko-audit": "/belajar/audit/audit-dan-asurans/perencanaan-dan-risiko-audit/risiko-audit",
  "audit/audit-dan-asurans/perencanaan-audit/materialitas": "/belajar/audit/audit-dan-asurans/perencanaan-dan-risiko-audit/materialitas",
  "audit/audit-dan-asurans/bukti-audit": "/belajar/audit/audit-dan-asurans/bukti-dan-pengendalian-internal/bukti-audit",
  "audit/audit-dan-asurans/pelaporan-audit": "/belajar/audit/audit-dan-asurans/penyelesaian-dan-pelaporan-audit/pelaporan-audit",
  "audit/audit-internal": "/belajar/audit/audit-dan-asurans/audit-internal-pemerintah-dan-operasional/audit-internal",
  "audit/etika-dan-independensi": "/belajar/audit/audit-dan-asurans/fondasi-dan-profesi-audit/etika-dan-independensi",
};

export function legacyCatalogRedirect(domainSlug: string, segments: string[] = []) {
  return legacyCatalogRedirects[[domainSlug, ...segments].join("/")];
}
export function breadcrumbs(domain: LearningDomain, topic?: LearningTopic): CatalogBreadcrumb[] {
  const items = [{ label: "Belajar", href: "/belajar" }, { label: domain.title, href: `/belajar/${domain.slug}` }];
  if (!topic) return items;
  const chain: LearningTopic[] = [];
  let current: LearningTopic | undefined = topic;
  while (current) {
    chain.unshift(current);
    current = current.parentId ? learningTopics.find((entry) => entry.id === current!.parentId) : undefined;
  }
  for (const entry of chain)
    items.push({ label: entry.title, href: `/belajar/${domain.slug}/${topicPath(entry).join("/")}` });
  return items;
}
export function validateLearningRegistry(
  modules: LearningModuleRegistration[] = learningModuleRegistry,
) {
  const fail = (message: string): never => { throw new Error(`Learning registry: ${message}`); };
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) fail(`duplicate ${label}`); };
  unique(learningDomains.map((entry) => entry.id), "domain ID"); unique(learningDomains.map((entry) => entry.slug), "domain slug"); unique(learningTopics.map((entry) => entry.id), "topic ID"); unique(modules.map((entry) => entry.id), "module ID"); unique(modules.map((entry) => entry.slug), "module slug"); unique(modules.map((entry) => entry.publicCode), "module public code");
  for (const domain of learningDomains) if (domain.slug === "modul") fail("domain slug 'modul' is reserved");
  for (const topic of learningTopics) { if (!domainById(topic.domainId)) fail(`topic ${topic.id} has unknown domain`); if (topic.parentId) { const parent = learningTopics.find((entry) => entry.id === topic.parentId); if (!parent || parent.domainId !== topic.domainId) fail(`topic ${topic.id} has invalid parent`); } if (!topicPath(topic).length) fail(`topic ${topic.id} has circular parent reference`); }
  const siblingKeys = learningTopics.map((topic) => `${topic.domainId}:${topic.parentId || "root"}:${topic.slug}`); unique(siblingKeys, "topic slug in the same parent");
  for (const entry of modules) {
    if (!/^MOD-[A-Z]{3}-\d{3}$/.test(entry.publicCode)) fail(`module ${entry.id} has invalid public code`);
    if (!learningTopics.some((topic) => topic.id === entry.primaryTopicId)) fail(`module ${entry.id} has unknown primary topic`);
    for (const id of entry.relatedTopicIds || []) if (!learningTopics.some((topic) => topic.id === id)) fail(`module ${entry.id} has unknown related topic`);
  }
}

validateLearningRegistry();
