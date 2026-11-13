import data from "../ukp-b/ppn-dan-spt-ppn.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { ppnSpec as tierCSpec } from "../ukp-c-specs/ppn-dan-spt-ppn";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const ppnDanSptPpnBSpec: UkpModuleSpec = {
  tier: "B",
  number: 8,
  slug: "ppn-dan-spt-ppn",
  title: "PPN dan SPT PPN",
  summary: "18 soal latihan orisinal UKP Tingkat B: objek PPN, DPP dan tarif, faktur pajak, pengkreditan Pajak Masukan, dan PPN orang pribadi.",
  minutes: 45,
  questions: data,
  verificationNote: "Perlu Verifikasi: 18 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPN dan SPT PPN\n\nMata uji ini mencakup objek PPN, DPP dan tarif, faktur pajak, pengkreditan Pajak Masukan, dan PPN orang pribadi.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "Objek PPN": "DN - Objek", "DPP dan tarif": "DN - DPP & tarif", "Faktur pajak": "DN - Faktur", "Pajak Masukan": "DN - Pajak Masukan", "PPN orang pribadi": "OP - Objek" }),
  review: tierCSpec.review,
};
