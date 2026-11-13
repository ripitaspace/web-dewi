import data from "../ukp-a/kup-ppsp-pengadilan-pajak.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { kupSpec as tierCSpec } from "../ukp-c-specs/kup-ppsp-pengadilan-pajak";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const kupPpspPengadilanPajakASpec: UkpModuleSpec = {
  tier: "A",
  number: 2,
  slug: "kup-ppsp-pengadilan-pajak",
  title: "KUP, PPSP, dan Pengadilan Pajak",
  summary: "17 soal latihan orisinal UKP Tingkat A: STP dan SKP, keberatan dan banding, sanksi, serta urutan penagihan pajak.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 17 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat dasar dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# KUP, PPSP, dan Pengadilan Pajak\n\nMata uji ini mencakup STP dan SKP, keberatan dan banding, sanksi, serta urutan penagihan pajak.\n\nIni latihan tingkat dasar. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "STP dan SKP": "STP dan SKP", "Pembetulan & keberatan": "Pembetulan & keberatan", "Sanksi": "Sanksi", "PPSP": "PPSP" }),
  review: tierCSpec.review,
};
