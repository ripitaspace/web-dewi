import data from "../ukp-b/pbb-p5l.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pbbP5lSpec as tierCSpec } from "../ukp-c-specs/pbb-p5l";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pbbP5lBSpec: UkpModuleSpec = {
  tier: "B",
  number: 4,
  slug: "pbb-p5l",
  title: "PBB-P5L",
  summary: "16 soal latihan orisinal UKP Tingkat B: subjek dan objek, penghitungan PBB terutang, sanksi, serta upaya non-keberatan.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 16 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PBB-P5L\n\nMata uji ini mencakup subjek dan objek, penghitungan PBB terutang, sanksi, serta upaya non-keberatan.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "Subjek & objek": "Subjek & objek", "Pengenaan": "Pengenaan", "Upaya non-keberatan": "Upaya non-keberatan" }),
  review: tierCSpec.review,
};
