import { missionById, missions } from "./content";
import type { Evaluation, MissionDefinition, MissionStatus, RipintarState } from "./types";

export const RIPINTAR_SCHEMA_VERSION = 1 as const;

export function createInitialState(): RipintarState {
  return { schemaVersion: RIPINTAR_SCHEMA_VERSION, onboardingSeen: false, missionStatuses: { "rookie-01": "AVAILABLE" }, attempts: {}, stars: [], medals: {}, typingHistory: [], workpapers: {}, completedAt: {}, achievements: [] };
}

export function statusFor(state: RipintarState, missionId: string): MissionStatus {
  return state.missionStatuses[missionId] || "LOCKED";
}

export function canOpenMission(state: RipintarState, mission: MissionDefinition) {
  return mission.playable && ["AVAILABLE", "IN_PROGRESS", "REVISION_REQUIRED", "MASTERED"].includes(statusFor(state, mission.id));
}

const exactly = (value: unknown, expected: string) => String(value || "").trim() === expected;
const result = (passed: boolean, category: string, feedback: string, hint: string, snapshot: Record<string, unknown>, medal?: Evaluation["medal"]): Evaluation => ({ passed, category, feedback, hint, snapshot, medal });

export function validateMission(mission: MissionDefinition, answer: Record<string, unknown>): Evaluation {
  switch (mission.kind) {
    case "click": { const steps = answer.steps as string[] || []; const yes = steps.join(",") === "single,double,context"; return result(yes, "Urutan tindakan", yes ? "Semua tindakan mouse dikenali dengan tepat." : "Satu atau lebih tindakan belum sesuai.", "Baca kembali label pada tiap dokumen; satu klik, dua klik, dan klik kanan adalah tindakan yang berbeda.", { steps }, yes ? "Teliti" : undefined); }
    case "drag": { const yes = answer.dropped === "periksa" && answer.scrolled === true; return result(yes, "Pemindahan berkas", yes ? "Berkas sudah di baki pemeriksaan dan daftar telah digulir." : "Berkas atau posisi daftar belum tepat.", "Seret kartu Bukti Kas ke area Periksa, lalu gerakkan penggeser sampai penanda muncul.", answer); }
    case "navigate": { const path = answer.path as string[] || []; const yes = path.join(",") === "documents,home,tasks"; return result(yes, "Navigasi", yes ? "Kamu mengikuti alur kerja yang diminta." : "Rute belum mengikuti urutan penugasan.", "Mulai dari Dokumen, kembali ke Beranda, kemudian buka Tugas Hari Ini.", { path }); }
    case "characters": { const yes = exactly(answer.text, "INV-2026/07"); return result(yes, "Ketepatan input", yes ? "Kode dokumen tepat." : "Kode belum sama persis.", "Perhatikan tanda hubung, garis miring, dan angka pada kode.", { text: answer.text }, yes ? "Teliti" : undefined); }
    case "shortcut": { const yes = exactly(answer.text, "PT Kinasih Abadi") && answer.usedUndo === true; return result(yes, "Koreksi keyboard", yes ? "Teks akhir tepat dan pintasan undo terdeteksi." : "Teks akhir atau penggunaan undo belum memenuhi tugas.", "Perbaiki menjadi ‘PT Kinasih Abadi’ dan tekan Ctrl/Cmd+Z setidaknya sekali sebelum mengirim.", { text: answer.text, usedUndo: answer.usedUndo }); }
    case "typing": { const wpm = Number(answer.wpm), accuracy = Number(answer.accuracy), completed = answer.completed === true, pasted = answer.pasted === true; const yes = completed && !pasted && wpm >= 15 && accuracy >= 95; return result(yes, "Kinerja mengetik", yes ? `Lulus dengan ${wpm.toFixed(1)} WPM dan akurasi ${accuracy.toFixed(1)}%.` : pasted ? "Paste tidak dapat digunakan untuk assessment." : "Target WPM, akurasi, atau kelengkapan teks belum tercapai.", "Ketik seluruh teks dengan tenang. Prioritaskan akurasi, kemudian tingkatkan ritme.", { wpm, accuracy, completed, pasted }, accuracy >= 98 ? "Teliti" : wpm >= 20 ? "Cekatan" : undefined); }
    case "classify": { const values = answer.values as Record<string, string> || {}; const yes = values.invoice === "PDF document" && values.arsip === "Folder" && values.data === "Spreadsheet file"; return result(yes, "Klasifikasi berkas", yes ? "Semua jenis berkas dikenali." : "Masih ada jenis berkas yang tertukar.", "Ekstensi .pdf adalah dokumen, ikon folder adalah wadah, dan .xlsx adalah spreadsheet.", { values }); }
    case "rename": { const yes = exactly(answer.name, "Penerimaan_Kas_Juli.pdf"); return result(yes, "Penamaan file", yes ? "Nama file sesuai standar dan ekstensi dipertahankan." : "Nama atau ekstensi belum sesuai standar.", "Gunakan garis bawah di antara kata dan pertahankan akhiran .pdf.", { name: answer.name }, yes ? "Teliti" : undefined); }
    case "organize": { const folders = answer.folders as Record<string, string> || {}; const yes = folders["Faktur Penjualan.pdf"] === "Penjualan" && folders["Bukti Kas Masuk.pdf"] === "Kas" && folders["Surat Pesanan.docx"] === "Pembelian"; return result(yes, "Struktur arsip", yes ? "Semua dokumen berada pada folder kerja yang benar." : "Satu atau lebih dokumen belum ke folder yang tepat.", "Kelompokkan menurut proses kerja: penjualan, kas, atau pembelian.", { folders }, yes ? "Tuntas" : undefined); }
    case "promotion": { const yes = exactly(answer.code, "KM-0726") && answer.folder === "Kas" && Number(answer.amount) === 2750000; return result(yes, "Pemeriksaan terpadu", yes ? "Paket kerja Hari Pertama selesai dengan benar." : "Masih ada data administrasi yang perlu diperiksa.", "Cek kembali kode, kelompok arsip, dan angka nominal tanpa pemisah ribuan.", { code: answer.code, folder: answer.folder, amount: answer.amount }, yes ? "Tuntas" : undefined); }
  }
}

export function submitMission(state: RipintarState, missionId: string, answer: Record<string, unknown>): { state: RipintarState; evaluation: Evaluation } {
  const mission = missionById[missionId];
  if (!mission || !canOpenMission(state, mission)) throw new Error("Mission is not available.");
  const evaluation = validateMission(mission, answer);
  const status: MissionStatus = evaluation.passed ? "MASTERED" : "REVISION_REQUIRED";
  const alreadyMastered = statusFor(state, missionId) === "MASTERED";
  const next = missions.find((candidate) => candidate.prerequisites.includes(missionId));
  const missionStatuses = { ...state.missionStatuses, [missionId]: status };
  // A rank can be visibly unlocked before all of its future practice content ships.
  // `canOpenMission` remains the gate that prevents unfinished content being entered.
  if (evaluation.passed && next && next.prerequisites.every((id) => missionStatuses[id] === "MASTERED")) missionStatuses[next.id] = "AVAILABLE";
  const attempts = [...(state.attempts[missionId] || []), { at: new Date().toISOString(), passed: evaluation.passed, category: evaluation.category, feedback: evaluation.feedback, snapshot: evaluation.snapshot }];
  const stars = evaluation.passed && !alreadyMastered && !mission.isPromotion ? [...state.stars, missionId] : state.stars;
  const medals = evaluation.passed && evaluation.medal && !state.medals[missionId] ? { ...state.medals, [missionId]: evaluation.medal } : state.medals;
  const achievements = evaluation.passed && mission.isPromotion && !state.achievements.includes("rookie-promotion") ? [...state.achievements, "rookie-promotion"] : state.achievements;
  return { state: { ...state, missionStatuses, attempts: { ...state.attempts, [missionId]: attempts }, stars, medals, workpapers: { ...state.workpapers, [missionId]: evaluation.snapshot }, completedAt: evaluation.passed && !alreadyMastered ? { ...state.completedAt, [missionId]: new Date().toISOString() } : state.completedAt, achievements }, evaluation };
}

export function rankProgress(state: RipintarState, rankId: string) {
  const core = missions.filter((mission) => mission.rankId === rankId && !mission.isPromotion);
  return { complete: core.filter((mission) => statusFor(state, mission.id) === "MASTERED").length, total: core.length };
}
