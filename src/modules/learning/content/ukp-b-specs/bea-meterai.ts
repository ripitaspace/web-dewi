import data from "../ukp-b/bea-meterai.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { beaMeteraiSpec as tierCSpec } from "../ukp-c-specs/bea-meterai";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const beaMeteraiBSpec: UkpModuleSpec = {
  tier: "B",
  number: 2,
  slug: "bea-meterai",
  title: "Bea Meterai",
  summary: "15 soal latihan orisinal UKP Tingkat B: objek, tarif, saat terutang, pihak terutang, dan pengecualian Bea Meterai untuk orang pribadi.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 15 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# Bea Meterai\n\nMata uji ini mencakup objek, tarif, saat terutang, pihak terutang, dan pengecualian Bea Meterai untuk orang pribadi.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "Objek": "Objek", "Tarif": "Tarif", "Saat terutang": "Saat terutang", "Pihak terutang": "Pihak terutang", "Pengecualian": "Pengecualian" }),
  review: tierCSpec.review,
};
