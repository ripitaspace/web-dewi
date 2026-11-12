import type { MissionDefinition, RankDefinition } from "./types";

export const ranks: RankDefinition[] = [
  ["rookie", "Rookie", "Computer Beginner", "Memulai dari kendali komputer dan dokumen kerja."],
  ["scout", "Scout", "Digital Office", "Menyiapkan ritme kerja digital yang rapi dan efisien."],
  ["apprentice", "Apprentice", "Business & Accounting Basics", "Membaca operasi bisnis dan logika transaksi."],
  ["craftsman", "Craftsman", "Bookkeeping", "Mencatat, mengelompokkan, dan menyeimbangkan pembukuan."],
  ["specialist", "Specialist", "Accounting Assistant", "Menjaga administrasi akun dan rekonsiliasi."],
  ["expert", "Expert", "Junior Accountant", "Menangani operasi akuntansi yang lebih luas."],
  ["master", "Master", "Accountant", "Menutup periode dan menyusun laporan keuangan."],
  ["grandmaster", "Grandmaster", "Senior Accountant", "Meninjau laporan, pajak, dan koreksi."],
  ["legend", "Legend", "Accounting Supervisor", "Mengawasi kualitas, kontrol, dan keputusan profesional."],
  ["pinnacle", "Pinnacle", "Integrated Professional Practice", "Mengintegrasikan praktik profesional lintas kasus."],
].map(([id, name, competency, description], index) => ({ id, name, competency, description, number: index + 1 }));

const rookie: MissionDefinition[] = [
  { id: "rookie-01", rankId: "rookie", division: "III", number: 1, title: "Klik dengan Tepat", kind: "click", objective: "Membedakan klik, klik ganda, dan klik kanan.", scenario: "Meja kerja virtual PT Kinasih menyimpan tiga dokumen yang perlu dibuka dengan tindakan yang tepat.", instructions: ["Klik satu kali pada Surat Masuk.", "Klik dua kali pada Buku Catatan.", "Klik kanan pada Folder Arsip."], competencies: ["Klik mouse", "Menu konteks"], prerequisites: [], playable: true },
  { id: "rookie-02", rankId: "rookie", division: "III", number: 2, title: "Pindah & Temukan", kind: "drag", objective: "Memindahkan berkas dan menggulir daftar dengan aman.", scenario: "Satu bukti transaksi belum masuk ke baki pemeriksaan.", instructions: ["Seret Bukti Kas ke baki Periksa.", "Gulir daftar sampai penanda arsip terlihat."], competencies: ["Drag and drop", "Scroll"], prerequisites: ["rookie-01"], playable: true },
  { id: "rookie-03", rankId: "rookie", division: "III", number: 3, title: "Navigasi Layar", kind: "navigate", objective: "Berpindah antar area kerja tanpa kehilangan konteks.", scenario: "Kamu perlu membuka Dokumen, kembali ke Beranda, lalu menuju Tugas Hari Ini.", instructions: ["Ikuti urutan navigasi pada panel kerja."], competencies: ["Navigasi antarmuka"], prerequisites: ["rookie-02"], playable: true },
  { id: "rookie-04", rankId: "rookie", division: "II", number: 4, title: "Huruf, Angka, Simbol", kind: "characters", objective: "Mengetik data dasar sesuai instruksi.", scenario: "Masukkan kode dokumen yang diterima dari staf administrasi.", instructions: ["Ketik persis: INV-2026/07."], competencies: ["Pengenalan keyboard", "Simbol"], prerequisites: ["rookie-03"], playable: true },
  { id: "rookie-05", rankId: "rookie", division: "II", number: 5, title: "Koreksi dengan Keyboard", kind: "shortcut", objective: "Memperbaiki teks dan menggunakan pintasan dasar.", scenario: "Nama pemasok salah ketik; perbaiki tanpa menggunakan tombol mouse.", instructions: ["Fokus di kolom, gunakan keyboard untuk menghasilkan teks akhir yang benar.", "Tekan Ctrl/Cmd+Z sedikitnya sekali sebelum mengirim."], competencies: ["Backspace", "Undo"], prerequisites: ["rookie-04"], playable: true },
  { id: "rookie-06", rankId: "rookie", division: "II", number: 6, title: "Uji Ketik Dasar", kind: "typing", objective: "Mencapai 15 WPM dengan akurasi minimal 95%.", scenario: "Ketik instruksi kantor berikut secara utuh. Pengukuran dimulai pada karakter pertama dan paste tidak diterima.", instructions: ["Ketik teks sumber sampai selesai.", "Target: 15 WPM dan akurasi 95%."], competencies: ["Mengetik", "Akurasi"], prerequisites: ["rookie-05"], playable: true },
  { id: "rookie-07", rankId: "rookie", division: "I", number: 7, title: "Kenali Berkas", kind: "classify", objective: "Membedakan file, folder, dan ekstensi.", scenario: "Petakan jenis setiap item sebelum arsip digital dibuat.", instructions: ["Pilih jenis yang paling tepat untuk setiap item."], competencies: ["File", "Folder", "Ekstensi"], prerequisites: ["rookie-06"], playable: true },
  { id: "rookie-08", rankId: "rookie", division: "I", number: 8, title: "Simpan, Buka, Ubah Nama", kind: "rename", objective: "Memberi nama dokumen kerja yang konsisten.", scenario: "Dokumen penerimaan kas perlu memakai standar nama perusahaan.", instructions: ["Ubah nama sesuai standar tanpa mengubah ekstensi.", "Nama tujuan: Penerimaan_Kas_Juli.pdf"], competencies: ["Rename", "Ekstensi file"], prerequisites: ["rookie-07"], playable: true },
  { id: "rookie-09", rankId: "rookie", division: "I", number: 9, title: "Arsip Dokumen Kantor", kind: "organize", objective: "Menyusun dokumen ke struktur folder yang tepat.", scenario: "PT Kinasih akan menutup hari kerja. Semua dokumen harus berada di folder yang benar.", instructions: ["Pindahkan tiap dokumen ke folder tujuan yang tepat.", "Periksa nama folder sebelum mengirim."], competencies: ["Organisasi dokumen", "Kerapian kerja"], prerequisites: ["rookie-08"], playable: true },
  { id: "rookie-promotion", rankId: "rookie", division: "PROMOTION", number: 10, title: "Hari Pertama di Kantor", kind: "promotion", objective: "Menggabungkan administrasi dokumen, ketik, dan input data sederhana.", scenario: "Kamu menerima paket kerja pertama dari PT Kinasih. Selesaikan tiga pemeriksaan sebelum meja kerja ditutup.", instructions: ["Masukkan kode transaksi.", "Tetapkan folder arsip yang tepat.", "Masukkan nominal penerimaan dengan benar."], competencies: ["Administrasi digital", "Input data", "Organisasi dokumen"], prerequisites: ["rookie-09"], isPromotion: true, playable: true },
];

const curriculum = [
  ["Efficient Typing", "Documents, PDF, Email", "Spreadsheet Fundamentals", "Digital Office Readiness Test"],
  ["Business Operations", "Transaction Documents", "Accounting Logic", "Understand a Business Transaction"],
  ["Journal Entries", "General Ledger", "Trial Balance", "First Bookkeeping Assignment"],
  ["Cash and Bank", "Accounts Receivable and Payable", "Reconciliation", "Monthly Accounting Administration"],
  ["Inventory", "Fixed Assets", "Payroll and Transaction Controls", "Accounting Operations Case"],
  ["Adjusting Entries", "Closing Process", "Financial Statements", "First Complete Monthly Closing"],
  ["Financial Analysis", "Tax Reconciliation", "Error Investigation and Correction", "Financial Reporting Review"],
  ["Team Review", "Internal Control", "Supervision and Professional Decisions", "Accounting Supervisor Simulation"],
  ["Audit and Assurance", "Accounting Systems and Advanced Reporting", "Integrated Professional Cases", "Integrated Professional Practice Capstone"],
] as const;

const future = curriculum.flatMap((items, rankOffset) => {
  const rank = ranks[rankOffset + 1]!;
  const divisionNames = ["III", "II", "I"] as const;
  return [...Array(9)].map((_, index): MissionDefinition => ({
    id: `${rank.id}-${String(index + 1).padStart(2, "0")}`,
    rankId: rank.id, division: divisionNames[Math.floor(index / 3)]!, number: index + 1,
    title: `${items[Math.floor(index / 3)]} · Mission ${String((index % 3) + 1).padStart(2, "0")}`,
    kind: "characters", objective: `Praktik ${items[Math.floor(index / 3)]} dalam konteks kerja.`,
    scenario: `Rangkaian praktik ${rank.name} sedang disiapkan.`, instructions: ["Konten praktik akan dibuka setelah Rank Rookie diselesaikan."],
    competencies: [items[Math.floor(index / 3)]!], prerequisites: index ? [`${rank.id}-${String(index).padStart(2, "0")}`] : [rankOffset === 0 ? "rookie-promotion" : `${ranks[rankOffset]!.id}-promotion`], playable: false,
  })).concat({
    id: `${rank.id}-promotion`, rankId: rank.id, division: "PROMOTION", number: 10, title: items[3], kind: "promotion",
    objective: `Assessment terpadu Rank ${rank.name}.`, scenario: "Assessment ini dirancang dalam roadmap dan belum tersedia untuk dimainkan.", instructions: ["Selesaikan sembilan misi rank ini untuk membuka challenge."], competencies: [rank.competency], prerequisites: [`${rank.id}-09`], isPromotion: true, playable: false,
  });
});

export const missions: MissionDefinition[] = [...rookie, ...future];
export const missionById = Object.fromEntries(missions.map((mission) => [mission.id, mission]));
export const typingText = "Kepada tim administrasi, simpan bukti transaksi hari ini pada folder yang sesuai dan periksa kembali nama dokumennya sebelum mengirimkan laporan.";
