import data from "../ukp-a/pph-pemotongan-pemungutan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pemotonganSpec as tierCSpec } from "../ukp-c-modules";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pphPemotonganPemungutanASpec: UkpModuleSpec = {
  tier: "A",
  number: 4,
  slug: "pph-pemotongan-pemungutan",
  title: "PPh Pemotongan/Pemungutan",
  summary: "18 soal latihan orisinal UKP Tingkat A: PPh 21, 23, 4(2), dan 26: objek, tarif, serta cara penghitungan.",
  minutes: 45,
  questions: data,
  verificationNote: "Perlu Verifikasi: 18 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat dasar dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPh Pemotongan/Pemungutan\n\nMata uji ini mencakup PPh 21, 23, 4(2), dan 26: objek, tarif, serta cara penghitungan.\n\nIni latihan tingkat dasar. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "PPh 21 dan natura": "DN - Objek PPh 21", "PPh 23": "DN - PPh 23", "PPh 4(2)": "DN - PPh 4(2)", "PPh 21 pegawai dan bukan pegawai": "OP - PPh 21", "PPh 26": "TI - PPh 26" }),
  review: tierCSpec.review,
};
