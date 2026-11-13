import data from "../ukp-b/pph-pemotongan-pemungutan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pemotonganSpec as tierCSpec } from "../ukp-c-modules";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pphPemotonganPemungutanBSpec: UkpModuleSpec = {
  tier: "B",
  number: 6,
  slug: "pph-pemotongan-pemungutan",
  title: "PPh Pemotongan/Pemungutan",
  summary: "17 soal latihan orisinal UKP Tingkat B: PPh 21, 22, 23, 4(2), dan 26 untuk badan dalam negeri serta orang pribadi.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 17 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPh Pemotongan/Pemungutan\n\nMata uji ini mencakup PPh 21, 22, 23, 4(2), dan 26 untuk badan dalam negeri serta orang pribadi.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "PPh 22": "DN - PPh 22", "PPh 23": "DN - PPh 23", "PPh 4(2)": "DN - PPh 4(2)", "PPh 21 pegawai dan bukan pegawai": "OP - PPh 21", "PPh 26": "TI - PPh 26" }),
  review: tierCSpec.review,
};
