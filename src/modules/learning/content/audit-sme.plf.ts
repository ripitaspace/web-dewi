import type { LearningModule } from "../types";

type UnitSeed = { chapter: number; title: string; pages: string; summary: string; competency: string; artifact?: "acceptance" | "materiality" | "risk-register" | "audit-plan" | "testing" | "conclusion" };

/** Original learning text based on IFAC's non-authoritative 2010 guide. */
const units: UnitSeed[] = [
  { chapter: 4, title: "Engagement Acceptance and Continuance", pages: "27–42", summary: "Menilai apakah perikatan dapat diterima, dilanjutkan, dan disepakati secara jelas.", competency: "Menilai dasar penerimaan perikatan", artifact: "acceptance" },
  { chapter: 5, title: "Overall Audit Strategy", pages: "43–53", summary: "Menetapkan arah, sumber daya, waktu, dan fokus audit sebelum prosedur rinci disusun.", competency: "Menyusun strategi audit menyeluruh", artifact: "audit-plan" },
  { chapter: 6, title: "Determining and Using Materiality", pages: "54–69", summary: "Menetapkan materialitas keseluruhan, pelaksanaan, dan khusus secara beralasan.", competency: "Membuat pertimbangan materialitas", artifact: "materiality" },
  { chapter: 7, title: "Audit Team Discussions", pages: "70–78", summary: "Mendokumentasikan diskusi skeptisisme profesional, fraud, dan risiko tim audit.", competency: "Memfasilitasi diskusi risiko tim" },
  { chapter: 8, title: "Inherent Risks — Identification", pages: "79–106", summary: "Mengidentifikasi peristiwa bisnis atau fraud yang dapat menimbulkan salah saji material.", competency: "Mengidentifikasi risiko inheren", artifact: "risk-register" },
  { chapter: 9, title: "Inherent Risks — Assessment", pages: "107–116", summary: "Menilai risiko pada tingkat laporan keuangan dan asersi.", competency: "Menilai risiko salah saji material", artifact: "risk-register" },
  { chapter: 10, title: "Significant Risks", pages: "117–126", summary: "Membedakan risiko signifikan dan merancang respons yang proporsional.", competency: "Mengenali risiko signifikan", artifact: "risk-register" },
  { chapter: 11, title: "Understanding Internal Control", pages: "127–140", summary: "Memahami rancangan serta implementasi pengendalian yang relevan dengan audit.", competency: "Memetakan pengendalian internal", artifact: "risk-register" },
  { chapter: 12, title: "Evaluating Internal Control", pages: "141–169", summary: "Mengevaluasi apakah pengendalian menangani risiko yang telah diidentifikasi.", competency: "Mengevaluasi risiko pengendalian", artifact: "risk-register" },
  { chapter: 13, title: "Communicating Deficiencies in Internal Control", pages: "170–182", summary: "Mengomunikasikan kelemahan pengendalian secara tepat kepada manajemen dan tata kelola.", competency: "Mengomunikasikan defisiensi pengendalian" },
  { chapter: 14, title: "Concluding the Risk Assessment Phase", pages: "183–192", summary: "Menghubungkan penilaian risiko dengan strategi dan rencana audit yang dapat dilaksanakan.", competency: "Menyimpulkan fase penilaian risiko", artifact: "audit-plan" },
  { chapter: 15, title: "Risk Response — An Overview", pages: "193–195", summary: "Menerjemahkan risiko yang dinilai menjadi respons audit pada tingkat laporan dan asersi.", competency: "Merancang respons risiko", artifact: "audit-plan" },
  { chapter: 16, title: "The Responsive Audit Plan", pages: "196–218", summary: "Menyusun prosedur audit yang menanggapi risiko dan asersi terkait.", competency: "Menyusun audit plan responsif", artifact: "audit-plan" },
  { chapter: 17, title: "Determining the Extent of Testing", pages: "219–247", summary: "Menentukan sifat, saat, dan luas pengujian menggunakan pertimbangan profesional.", competency: "Menentukan luas pengujian", artifact: "testing" },
  { chapter: 18, title: "Documenting Work Performed", pages: "248–251", summary: "Mendokumentasikan prosedur, bukti, pertimbangan, dan kesimpulan secara dapat ditelusuri.", competency: "Mendokumentasikan pekerjaan audit", artifact: "testing" },
  { chapter: 19, title: "Written Representations", pages: "252–263", summary: "Menilai tujuan representasi tertulis manajemen dan batasannya sebagai bukti audit.", competency: "Mengevaluasi representasi tertulis" },
  { chapter: 20, title: "Reporting — An Overview", pages: "264–266", summary: "Menghubungkan bukti, evaluasi salah saji, dan pembentukan opini auditor.", competency: "Menjelaskan alur pelaporan", artifact: "conclusion" },
  { chapter: 21, title: "Evaluating Audit Evidence", pages: "267–283", summary: "Mengevaluasi kecukupan dan ketepatan bukti, termasuk salah saji yang teridentifikasi.", competency: "Mengevaluasi bukti audit", artifact: "conclusion" },
  { chapter: 22, title: "Communicating with Those Charged With Governance", pages: "284–294", summary: "Menentukan hal audit yang relevan untuk dikomunikasikan kepada tata kelola.", competency: "Menyiapkan komunikasi tata kelola" },
  { chapter: 23, title: "Modifications to the Auditor’s Report", pages: "295–307", summary: "Membedakan keadaan yang dapat menghasilkan opini termodifikasi.", competency: "Menilai kebutuhan modifikasi opini", artifact: "conclusion" },
  { chapter: 24, title: "Emphasis of Matter and Other Matter Paragraphs", pages: "308–313", summary: "Membedakan paragraf penekanan suatu hal dari hal lain tanpa menggantikan opini.", competency: "Menentukan komunikasi tambahan laporan" },
  { chapter: 25, title: "Comparative Information", pages: "314–321", summary: "Mempertimbangkan informasi komparatif dalam pembentukan laporan auditor.", competency: "Mengevaluasi informasi komparatif", artifact: "conclusion" },
];

const workpaperLabels = {
  acceptance: ["Keputusan penerimaan/kelanjutan", "Faktor independensi dan kompetensi", "Alasan serta tindak lanjut"],
  materiality: ["Basis materialitas", "Overall dan performance materiality", "Pertimbangan kualitatif"],
  "risk-register": ["Risiko dan asersi terkait", "Respons/pengendalian yang relevan", "Alasan penilaian risiko"],
  "audit-plan": ["Tujuan prosedur", "Prosedur serta bukti yang diharapkan", "Waktu dan pelaksana"],
  testing: ["Populasi atau bukti yang diuji", "Prosedur yang dilakukan", "Hasil dan pengecualian"],
  conclusion: ["Temuan atau salah saji", "Dampak terhadap bukti/opini", "Kesimpulan junior auditor"],
} as const;

function caseFor(index: number) {
  return index % 2 === 0
    ? "Dephta Furniture adalah entitas manufaktur keluarga. Dalam simulasi ini, pertimbangkan pertumbuhan penjualan, persediaan, dan penggunaan sistem akuntansi standar."
    : "Kumar & Co. adalah mikro-entitas pemasok furniture dengan ketergantungan tinggi pada Dephta. Dalam simulasi ini, pertimbangkan pemilik-manajer, pembukuan paruh waktu, dan covenant bank.";
}

export const auditSmeModule: LearningModule = {
  kind: "plf.module", schemaVersion: "1.1.0", id: "audit-sme-risk-based", revision: 1,
  metadata: { title: "Audit SME: Praktik Audit Berbasis Risiko", summary: "Latihan bertahap audit SME berbasis risiko dengan studi kasus Dephta Furniture dan Kumar & Co.", subject: "Audit SME", level: "intermediate", estimatedMinutes: 660, tags: ["audit", "SME", "risk-based audit", "IFAC 2010"], author: "PuspitaCore Belajar" },
  experience: { profile: "practice", navigation: "flexible", allowResume: true },
  prerequisites: { moduleIds: [], competencyIds: [], notes: "Direkomendasikan sudah memahami dasar audit dan asersi laporan keuangan." },
  learningPolicy: { allowRetry: true, feedbackTiming: "after_submit", hintMode: "guided_only", timerMode: "advisory", allowSkip: true, remediationEnabled: true, solutionsAfterAttempt: true },
  assessment: { passingScore: 75, requireAllRequired: true, attemptPolicy: "best" },
  reportPolicy: { scope: "learning_unit", formats: ["json", "print"], downloadOnCompletion: true, dataLocation: "client_only" },
  references: [{ id: "ifac-v2-2010", title: "Guide to Using International Standards on Auditing in the Audits of SMEs, Volume 2 — Practical Guidance", type: "IFAC implementation guide", url: null, edition: "Second Edition, 2010 · non-authoritative" }],
  assets: [{ id: "case-dephta", title: "Kasus Dephta Furniture", summary: "Studi kasus simulasi berbasis entitas manufaktur keluarga; gunakan hanya untuk latihan.", pageIds: units.filter((_, i) => i % 2 === 0).map((_, i) => `audit-sme-v2-${units[i * 2]!.chapter}`), caseId: "dephta" }, { id: "case-kumar", title: "Kasus Kumar & Co.", summary: "Studi kasus simulasi mikro-entitas; gunakan hanya untuk latihan.", pageIds: units.filter((_, i) => i % 2 === 1).map((_, i) => `audit-sme-v2-${units[i * 2 + 1]!.chapter}`), caseId: "kumar" }],
  competencies: units.map((unit) => ({ id: `audit-sme-v2-${unit.chapter}`, title: unit.competency })),
  outline: [{ type: "section", id: "risk-assessment", title: "Fase 1 — Risk Assessment", children: units.slice(0, 11).map((unit) => ({ type: "unit" as const, unitId: `unit-v2-${unit.chapter}` })) }, { type: "section", id: "risk-response", title: "Fase 2 — Risk Response", children: units.slice(11, 16).map((unit) => ({ type: "unit" as const, unitId: `unit-v2-${unit.chapter}` })) }, { type: "section", id: "reporting", title: "Fase 3 — Reporting", children: units.slice(16).map((unit) => ({ type: "unit" as const, unitId: `unit-v2-${unit.chapter}` })) }],
  learningUnits: units.map((unit, index) => ({ id: `unit-v2-${unit.chapter}`, title: `V2-${unit.chapter} · ${unit.title}`, learningObjectives: [unit.summary, unit.competency], competencyIds: [`audit-sme-v2-${unit.chapter}`], prerequisiteUnitIds: index ? [`unit-v2-${units[index - 1]!.chapter}`] : [], pageIds: [`audit-sme-v2-${unit.chapter}`], worksheets: [{ id: `guided-v2-${unit.chapter}`, title: "Latihan terpandu", mode: "guided" as const, difficulty: "medium" as const, complexityWeight: 1, targetMinutes: { min: 8, max: 12 }, scoreWeight: 1, blockIds: [`check-v2-${unit.chapter}`] }, { id: `independent-v2-${unit.chapter}`, title: "Worksheet mandiri", mode: "independent" as const, difficulty: "hard" as const, complexityWeight: 2, targetMinutes: { min: 12, max: 20 }, scoreWeight: 2, blockIds: [`workpaper-v2-${unit.chapter}`] }], masteryCriteria: { minimumScore: 75, requiredWorksheetIds: [`guided-v2-${unit.chapter}`, `independent-v2-${unit.chapter}`] }, report: { enabled: true } })),
  pages: units.map((unit, index) => {
    const fields = unit.artifact ? workpaperLabels[unit.artifact] : ["Keputusan yang dibuat", "Alasan profesional", "Bukti atau informasi lanjutan"];
    return { id: `audit-sme-v2-${unit.chapter}`, title: `V2-${unit.chapter} · ${unit.title}`, blocks: [
      { id: `discover-v2-${unit.chapter}`, type: "markdown" as const, role: "discover" as const, required: true, content: `# Pertanyaan pemantik\n\n${caseFor(index)}\n\nSebagai Junior Auditor, informasi apa yang perlu kamu pahami sebelum membuat keputusan pada tahap **${unit.title}**?` },
      { id: `understand-v2-${unit.chapter}`, type: "reading" as const, role: "understand" as const, required: true, title: "Konsep inti", competencyIds: [`audit-sme-v2-${unit.chapter}`], markdown: `# ${unit.title}\n\n${unit.summary} Panduan IFAC 2010 menjelaskan urutan kerja dan pertimbangan yang perlu didokumentasikan secara proporsional terhadap fakta perikatan. Gunakan pertimbangan profesional; materi ini bukan pengganti ISA atau standar lokal yang berlaku.` },
      { id: `observe-v2-${unit.chapter}`, type: "worked_example" as const, role: "observe" as const, title: "Contoh kerja junior auditor", steps: [{ title: "Tentukan tujuan", explanation: "Tulis pertanyaan audit yang perlu dijawab, bukan sekadar daftar dokumen." }, { title: "Hubungkan risiko dan bukti", explanation: "Pilih informasi yang relevan dengan risiko/asersi dan catat alasan pemilihannya." }, { title: "Simpulkan secara terbatas", explanation: "Nyatakan apa yang didukung bukti saat ini dan informasi tambahan yang masih diperlukan." }] },
      { id: `check-v2-${unit.chapter}`, type: "single_choice" as const, role: "guided_practice" as const, required: true, title: "Cek pemahaman", competencyIds: [`audit-sme-v2-${unit.chapter}`], prompt: `Apa langkah paling tepat dalam ${unit.title}?`, options: [{ id: "reasoned", text: "Menghubungkan fakta, risiko, bukti, dan pertimbangan yang didokumentasikan" }, { id: "copy", text: "Menyalin keputusan periode sebelumnya tanpa menilai fakta tahun berjalan" }], hints: ["Mulai dari fakta entitas dan tujuan audit.", "Dokumentasi harus menjelaskan alasan."], remediation: { onIncorrect: { targetBlockId: `understand-v2-${unit.chapter}` } }, grading: { correctOptionId: "reasoned", points: 10, explanation: "Keputusan audit harus dapat ditelusuri pada fakta, risiko, bukti, dan pertimbangan." } },
      { id: `workpaper-v2-${unit.chapter}`, type: "audit_workpaper" as const, role: "independent_practice" as const, required: true, title: unit.artifact ? `Workpaper · ${unit.artifact}` : "Catatan kerja junior auditor", competencyIds: [`audit-sme-v2-${unit.chapter}`], workpaper: { artifactId: unit.artifact || `analysis-v2-${unit.chapter}`, caseId: index % 2 === 0 ? "dephta" : "kumar", fields: fields.map((label, fieldIndex) => ({ id: `field-${fieldIndex + 1}`, label, required: true, placeholder: "Tulis jawaban singkat berbasis fakta kasus." })), carryForwardTo: index < units.length - 1 ? [`workpaper-v2-${units[index + 1]!.chapter}`] : [] } },
      { id: `deep-v2-${unit.chapter}`, type: "deep_dive" as const, role: "deep_dive" as const, title: "Pendalaman", content: `Bandingkan keputusan untuk Dephta dan Kumar. Ukuran entitas tidak menghapus kebutuhan bukti yang cukup dan tepat; dampaknya adalah cara auditor merancang prosedur yang proporsional.` },
      { id: `reflection-v2-${unit.chapter}`, type: "reflection" as const, role: "reflect" as const, required: true, reviewMode: "self" as const, title: "Self-evaluation", competencyIds: [`audit-sme-v2-${unit.chapter}`], prompt: `Apa satu keputusan pada V2-${unit.chapter} yang perlu kamu periksa ulang, dan bukti apa yang akan kamu cari?`, rubric: ["Menyebutkan keputusan", "Menghubungkan dengan bukti atau risiko"] },
      { id: `reference-v2-${unit.chapter}`, type: "reference" as const, role: "understand" as const, title: "Referensi IFAC", referenceIds: ["ifac-v2-2010"] },
    ] };
  }),
};
