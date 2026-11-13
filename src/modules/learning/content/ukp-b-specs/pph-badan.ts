import data from "../ukp-b/pph-badan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { pickSummaries } from "../ukp-ab-shared";
import { pphBadanSpec as tierCSpec } from "../ukp-c-specs/pph-badan";

/** Original practice items; summaries and review are shared with the Tingkat C module on the same law. NOT yet verified. */
export const pphBadanBSpec: UkpModuleSpec = {
  tier: "B",
  number: 7,
  slug: "pph-badan",
  title: "PPh Badan",
  summary: "17 soal latihan orisinal UKP Tingkat B: objek, biaya, fasilitas Pasal 31E, penyusutan, kompensasi kerugian, tarif, dan PPh 25.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 17 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan tingkat menengah dan belum ditinjau terhadap sumber resmi. Ringkasan dan ketentuan mengacu pada bahan UKP Tingkat C per Oktober 2026. Ini bukan soal ujian asli; periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# PPh Badan\n\nMata uji ini mencakup objek, biaya, fasilitas Pasal 31E, penyusutan, kompensasi kerugian, tarif, dan PPh 25.\n\nIni latihan tingkat menengah. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan. Soal hitungan dijawab dengan **mengetik angka**.",
  summaries: pickSummaries(tierCSpec.summaries, { "Objek dan pengecualian": "DN - Objek dan pengecualian", "Biaya yang dikurangkan": "DN - Biaya yang dikurangkan", "Fasilitas Pasal 31E": "DN - Tarif dan fasilitas Pasal 31E", "Penyusutan dan hubungan istimewa": "TI - Harga perolehan, hubungan istimewa, dan penyusutan", "Kompensasi, tarif, dan kredit pajak": "TI - Kompensasi, tarif, kredit pajak, dan SPT" }),
  review: tierCSpec.review,
};
