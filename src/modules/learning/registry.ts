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
