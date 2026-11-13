import data from "../ukp-a/pph-orang-pribadi.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pphOrangPribadiSpec as tierCSpec } from "../ukp-c-specs/pph-orang-pribadi";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pphOrangPribadiASpec: UkpModuleSpec = {
  tier: "A",
  number: 3,
  slug: "pph-orang-pribadi",
  title: "PPh Orang Pribadi",
  summary: "17 soal latihan orisinal UKP Tingkat A: PTKP, tarif Pasal 17, penghitungan PPh pegawai, norma, dan penghasilan final.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 17 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat dasar dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPh Orang Pribadi\n\nMata uji ini mencakup PTKP, tarif Pasal 17, penghitungan PPh pegawai, norma, dan penghasilan final.\n\nIni latihan tingkat dasar. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "PTKP": "PTKP", "Tarif": "Tarif", "Penghitungan - pegawai": "Penghitungan - pegawai", "Penghitungan - norma": "Penghitungan - norma", "Penghitungan - lain": "Penghitungan - lain" }),
  review: tierCSpec.review,
};
