import data from "../ukp-b/akuntansi-perpajakan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { akuntansiPerpajakanSpec as tierCSpec } from "../ukp-c-specs/akuntansi-perpajakan";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const akuntansiPerpajakanBSpec: UkpModuleSpec = {
  tier: "B",
  number: 1,
  slug: "akuntansi-perpajakan",
  title: "Akuntansi Perpajakan",
  summary: "17 soal latihan orisinal UKP Tingkat B: jurnal PPh, aspek pajak akun neraca, koreksi fiskal, rekonsiliasi fiskal, dan PPh final jasa konstruksi.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 17 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# Akuntansi Perpajakan\n\nMata uji ini mencakup jurnal PPh, aspek pajak akun neraca, koreksi fiskal, rekonsiliasi fiskal, dan PPh final jasa konstruksi.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "Jurnal PPh Pot/Put": "Jurnal PPh Pot/Put", "Aspek pajak akun neraca": "Aspek pajak akun neraca", "Pendapatan & biaya": "Pendapatan & biaya", "Rekonsiliasi fiskal": "Rekonsiliasi fiskal", "Jasa konstruksi": "Jasa konstruksi" }),
  review: tierCSpec.review,
};
