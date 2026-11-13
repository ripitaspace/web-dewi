import data from "../ukp-b/pph-orang-pribadi.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pphOrangPribadiSpec as tierCSpec } from "../ukp-c-specs/pph-orang-pribadi";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pphOrangPribadiBSpec: UkpModuleSpec = {
  tier: "B",
  number: 5,
  slug: "pph-orang-pribadi",
  title: "PPh Orang Pribadi",
  summary: "15 soal latihan orisinal UKP Tingkat B: PTKP, tarif progresif, PPh pegawai, norma, dan pemajakan penghasilan keluarga.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 15 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPh Orang Pribadi\n\nMata uji ini mencakup PTKP, tarif progresif, PPh pegawai, norma, dan pemajakan penghasilan keluarga.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "PTKP": "PTKP", "Tarif": "Tarif", "Penghitungan - pegawai": "Penghitungan - pegawai", "Penghitungan - norma": "Penghitungan - norma", "Penghitungan - keluarga": "Penghitungan - keluarga", "Penghitungan - lain": "Penghitungan - lain" }),
  review: tierCSpec.review,
};
