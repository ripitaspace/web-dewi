import data from "../ukp-a/bea-meterai.json";
import type { UkpModuleSpec } from "../ukp-c-builder";
import { beaMeteraiSpec as tierCSpec } from "../ukp-c-specs/bea-meterai";

/**
 * UKP A uses the same statute (UU 10/2020) as Tingkat C, so the sub-topic summaries and review
 * are shared. The 20 questions are original practice items and are NOT yet verified.
 */
export const beaMeteraiASpec: UkpModuleSpec = {
  tier: "A",
  number: 1,
  slug: "bea-meterai",
  title: "Bea Meterai",
  summary: "20 soal latihan orisinal UKP Tingkat A: objek, tarif, saat terutang, pihak yang terutang, dan pengecualian Bea Meterai menurut UU 10/2020.",
  minutes: 40,
  questions: data,
  verificationNote: "Perlu Verifikasi: 20 soal ini ditulis orisinal oleh PuspitaCore sebagai latihan Level 1 (dasar) berdasarkan UU 10/2020 dan belum ditinjau terhadap sumber resmi. Ini bukan soal ujian asli. Periksa kembali peraturan terbaru sebelum ujian.",
  intro: "# Bea Meterai\n\nMata uji ini mencakup **objek, tarif, saat terutang, pihak yang terutang, dan pengecualian** Bea Meterai berdasarkan **UU 10/2020**.\n\nIni latihan tingkat dasar: mengenali istilah, objek, dan ketentuan pokok. Baca ringkasan tiap bagian, jawab soal, lalu cocokkan dengan pembahasan.",
  summaries: tierCSpec.summaries,
  review: tierCSpec.review,
};
