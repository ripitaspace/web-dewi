import type { LearningModule } from "../types";

type Chapter = {
  id: string;
  title: string;
  content: string;
  terms: [string, string][];
  table?: { title: string; columns: string[]; rows: (string | number)[][] };
  deepDive?: string;
};

type AuditModuleSpec = {
  number: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  objective: string;
  chapters: Chapter[];
  example: [string, string][];
  guided: { prompt: string; options: [string, string][]; correct: string };
  pairs: [string, string, string][];
  scenario: string;
  decision: string;
  decisionOptions: [string, string][];
  correctDecision: string;
  reflection: string;
};

const sourceReference = {
  id: "ref-arens-18-ch1",
  title: "Auditing and Assurance Services, Global Edition ke-18 — Bab 1",
  type: "buku teks",
  url: null,
  edition: "Konsep diadaptasi secara orisinal untuk pembelajar Indonesia; regulasi Amerika Serikat hanya konteks buku.",
};

const specs: AuditModuleSpec[] = [
  {
    number: "01", slug: "hakikat-audit", title: "Hakikat Audit", minutes: 20,
    summary: "Bangun model mental audit: informasi, kriteria, bukti, pertimbangan, dan laporan.",
    objective: "Memetakan informasi, kriteria, bukti, auditor, pengguna, dan laporan pada satu penugasan.",
    chapters: [
      { id: "definisi", title: "Kapan sebuah pemeriksaan disebut audit?", content: "# Audit adalah proses pembuktian\n\nAudit bukan sekadar mencari kesalahan. Audit mengumpulkan dan mengevaluasi bukti untuk menentukan kesesuaian informasi dengan kriteria yang ditetapkan, lalu mengomunikasikan hasilnya kepada pengguna.\n\nInformasi dapat berupa laporan keuangan, kepatuhan kontrak, atau efektivitas proses. Auditor harus tahu informasi yang diuji dan standar yang dipakai sebelum mencari bukti.", terms: [["Informasi", "Hal yang diuji."], ["Kriteria", "Tolok ukur penilaian."], ["Pengguna", "Pihak yang memakai hasil audit."]], deepDive: "Audit memberi keyakinan wajar berdasarkan bukti; audit tidak menjanjikan kepastian absolut." },
      { id: "unsur", title: "Enam unsur yang terhubung", content: "# Rantai logika audit\n\nAudit menghubungkan **informasi**, **kriteria**, **bukti**, **auditor kompeten**, **independensi**, dan **laporan**. Jika satu unsur hilang, kesimpulan audit melemah.\n\nContohnya, angka piutang adalah informasi; kebijakan akuntansi menjadi kriteria; faktur, surat jalan, dan konfirmasi pelanggan menjadi bukti.", terms: [["Kompetensi", "Kemampuan memahami kriteria dan menilai bukti."], ["Independensi", "Sikap objektif tanpa kepentingan yang mengganggu."], ["Laporan", "Komunikasi hasil audit."]], table: { title: "Peta unsur audit", columns: ["Unsur", "Pertanyaan pengarah"], rows: [["Informasi", "Apa yang diperiksa?"], ["Kriteria", "Dibandingkan dengan standar apa?"], ["Bukti", "Apa yang mendukung kesimpulan?"], ["Laporan", "Apa yang perlu diketahui pengguna?"]] } },
      { id: "alur", title: "Dari klaim menuju kesimpulan", content: "# Jangan mulai dari opini\n\nAuditor memulai dari klaim, menetapkan tujuan pemeriksaan, memilih bukti, menilai hasilnya, lalu menyusun kesimpulan. Alur ini menjadi dasar seluruh seri Audit & Asurans.", terms: [["Klaim", "Pernyataan pihak yang diperiksa."], ["Tujuan audit", "Hal yang ingin dipastikan auditor."]] },
    ],
    example: [["Situasi", "PT Sagara meminta kredit bank dengan laporan kas akhir bulan."], ["Bukti", "Auditor membandingkan catatan kas dengan bukti transaksi dan catatan bank."], ["Laporan", "Hasil pemeriksaan membantu bank menilai reliabilitas informasi."]],
    guided: { prompt: "Dalam kasus kredit PT Sagara, apa yang menjadi kriteria pemeriksaan saldo kas?", options: [["catatan-bank", "Catatan bank dan kebijakan pencatatan yang berlaku"], ["warna-logo", "Warna logo perusahaan"], ["target-penjualan", "Target penjualan bulanan"]], correct: "catatan-bank" },
    pairs: [["informasi", "Saldo kas PT Sagara", "Informasi"], ["kriteria", "Kebijakan pencatatan kas", "Kriteria"], ["bukti", "Rekening koran bank", "Bukti"]],
    scenario: "Manajemen memberi daftar penjualan tetapi tidak menjelaskan standar penilaian atau memberi dokumen pendukung.", decision: "Apa langkah paling tepat sebelum kesimpulan dibuat?", decisionOptions: [["tetapkan", "Tetapkan kriteria dan kumpulkan bukti relevan"], ["opini", "Langsung menyatakan laporan dapat dipercaya"], ["tebak", "Membandingkan dengan perkiraan pribadi"]], correctDecision: "tetapkan",
    reflection: "Pilih satu informasi di sekitar kamu. Kriteria dan bukti apa yang diperlukan agar informasi itu dapat diaudit?",
  },
  {
    number: "02", slug: "bukti-dan-pertimbangan-auditor", title: "Bukti dan Pertimbangan Auditor", minutes: 20,
    summary: "Pelajari jenis, kecukupan, ketepatan, kompetensi, dan independensi yang membentuk pertimbangan auditor.",
    objective: "Membandingkan kualitas bukti dan menjelaskan perlunya kompetensi serta independensi auditor.",
    chapters: [
      { id: "bentuk", title: "Bukti audit bukan hanya dokumen", content: "# Bukti menjawab pertanyaan audit\n\nBukti adalah informasi yang digunakan auditor untuk menilai klaim terhadap kriteria. Bukti dapat berasal dari dokumen dan data elektronik, komunikasi pihak luar, observasi auditor, maupun penjelasan pihak yang diperiksa.\n\nAuditor memilih kombinasi bukti yang paling sesuai dengan tujuan audit, bukan sekadar mengumpulkan dokumen sebanyak mungkin.", terms: [["Bukti audit", "Informasi untuk membentuk kesimpulan."], ["Observasi", "Melihat proses atau kondisi secara langsung."], ["Konfirmasi", "Tanggapan langsung dari pihak ketiga."]], deepDive: "Penjelasan manajemen memberi konteks, tetapi biasanya perlu didukung bukti lain saat risikonya tinggi." },
      { id: "mutu", title: "Cukup dan tepat", content: "# Dua pertanyaan sebelum percaya\n\nBukti yang **cukup** berkaitan dengan jumlah yang dibutuhkan. Bukti yang **tepat** berkaitan dengan relevansi dan keandalannya. Banyak bukti lemah tidak selalu lebih baik daripada sedikit bukti yang sangat relevan dan andal.\n\nAuditor memilih jenis, waktu, dan luas prosedur berdasarkan tujuan serta risiko pemeriksaan.", terms: [["Kecukupan", "Jumlah bukti yang memadai."], ["Ketepatan", "Relevansi dan keandalan bukti."], ["Pertimbangan profesional", "Penilaian beralasan berdasarkan fakta dan kompetensi."]], table: { title: "Membandingkan bukti", columns: ["Bukti", "Kegunaan utama"], rows: [["Konfirmasi pelanggan", "Mendukung keberadaan piutang"], ["Surat jalan", "Mendukung pengiriman barang"], ["Penjelasan manajemen", "Memberi konteks, perlu diuji"]] } },
      { id: "independen", title: "Kompeten tidak cukup tanpa independen", content: "# Kesimpulan harus dapat dipercaya\n\nAuditor perlu memahami kriteria dan bukti, tetapi kemampuan itu tidak cukup jika bias atau kepentingan memengaruhi penilaian. Independensi menjaga kepercayaan pengguna terhadap proses dan laporan audit.", terms: [["Bias", "Kecenderungan yang mengganggu penilaian."], ["Objektivitas", "Menilai berdasarkan fakta dan kriteria."]] },
    ],
    example: [["Klaim", "Piutang PT Sagara benar ada pada akhir tahun."], ["Bukti", "Auditor menelaah faktur, surat jalan, pembayaran setelah tanggal laporan, dan konfirmasi pelanggan."], ["Pertimbangan", "Konfirmasi pihak ketiga lebih langsung daripada materi promosi."]],
    guided: { prompt: "Bukti mana yang paling langsung mendukung keberadaan piutang pelanggan?", options: [["konfirmasi", "Konfirmasi dari pelanggan"], ["iklan", "Materi iklan perusahaan"], ["rapat", "Undangan rapat internal"]], correct: "konfirmasi" },
    pairs: [["dokumen", "Faktur penjualan", "Dokumen transaksi"], ["pihak-ketiga", "Konfirmasi pelanggan", "Bukti pihak luar"], ["observasi", "Mengamati hitung persediaan", "Observasi auditor"]],
    scenario: "Auditor diminta menyimpulkan persediaan benar ada hanya berdasarkan daftar kepala gudang.", decision: "Respons paling tepat adalah…", decisionOptions: [["tambahkan", "Memperoleh bukti tambahan, seperti observasi fisik"], ["terbitkan", "Langsung menerbitkan kesimpulan"], ["hapus", "Mengabaikan seluruh daftar tanpa prosedur lain"]], correctDecision: "tambahkan",
    reflection: "Mengapa bukti dari pihak ketiga sering lebih kuat daripada penjelasan lisan saja?",
  },
  {
    number: "03", slug: "akuntansi-bukan-audit", title: "Akuntansi Bukan Audit", minutes: 17,
    summary: "Bedakan pekerjaan menghasilkan informasi dengan pekerjaan menguji klaim dan bukti atas informasi tersebut.",
    objective: "Membedakan tanggung jawab manajemen, akuntan, dan auditor pada transaksi sederhana.",
    chapters: [
      { id: "akuntansi", title: "Akuntansi menghasilkan informasi", content: "# Dari transaksi menjadi laporan\n\nAkuntansi mengidentifikasi, mencatat, mengklasifikasikan, dan meringkas peristiwa ekonomi agar tersedia informasi untuk keputusan. Manajemen bertanggung jawab atas penyusunan dan penyajian informasi tersebut.", terms: [["Pencatatan", "Merekam transaksi ekonomi."], ["Klasifikasi", "Mengelompokkan transaksi ke akun."], ["Manajemen", "Pihak yang bertanggung jawab atas laporan."]] },
      { id: "audit", title: "Audit menguji informasi", content: "# Auditor tidak menyusun laporan untuk klien\n\nAuditor menilai apakah informasi yang dicatat mencerminkan peristiwa ekonomi yang benar-benar terjadi dan sesuai kriteria. Keahlian auditor adalah menentukan prosedur, memilih item yang diuji, dan mengevaluasi hasil bukti. Auditor tidak mengambil alih tanggung jawab manajemen.", terms: [["Prosedur audit", "Langkah untuk memperoleh bukti."], ["Pernyataan manajemen", "Klaim dalam laporan yang diuji auditor."]], table: { title: "Dua pekerjaan berbeda", columns: ["Akuntansi", "Audit"], rows: [["Mencatat transaksi", "Menguji bukti atas catatan"], ["Menyusun laporan", "Mengevaluasi kesesuaian dengan kriteria"], ["Tanggung jawab manajemen", "Kesimpulan independen auditor"]] } },
    ],
    example: [["Akuntan", "Mencatat penjualan kredit dan menyusun saldo piutang."], ["Auditor", "Memilih sampel faktur, surat jalan, dan pembayaran pelanggan."], ["Manajemen", "Menanggapi koreksi atau temuan."]],
    guided: { prompt: "Siapa yang terutama bertanggung jawab menyusun laporan keuangan?", options: [["manajemen", "Manajemen perusahaan"], ["auditor", "Auditor eksternal"], ["bank", "Bank pemberi pinjaman"]], correct: "manajemen" },
    pairs: [["mencatat", "Staf akuntansi mencatat transaksi", "Akuntansi"], ["menguji", "Auditor mengonfirmasi piutang", "Audit"], ["menyajikan", "Direksi menerbitkan laporan", "Manajemen"]],
    scenario: "Auditor menemukan faktur penjualan yang belum dicatat perusahaan.", decision: "Apa tindakan paling tepat?", decisionOptions: [["komunikasikan", "Kumpulkan bukti, nilai dampaknya, lalu komunikasikan temuan"], ["catat", "Mencatat transaksi itu sendiri sebagai pengganti manajemen"], ["abaikan", "Mengabaikannya karena auditor tidak melihat faktur"]], correctDecision: "komunikasikan",
    reflection: "Mengapa audit membutuhkan pemahaman akuntansi tetapi bukan pekerjaan akuntansi?",
  },
  {
    number: "04", slug: "mengapa-audit-dibutuhkan", title: "Mengapa Audit Dibutuhkan", minutes: 20,
    summary: "Pahami keputusan pengguna laporan, risiko informasi, penyebabnya, dan cara audit menguranginya.",
    objective: "Membedakan risiko usaha dan risiko informasi serta memilih cara proporsional untuk menguranginya.",
    chapters: [
      { id: "keputusan", title: "Keputusan kredit dimulai dari informasi", content: "# Bank tidak hanya menilai angka\n\nSaat memberi pinjaman, bank mempertimbangkan tingkat imbal hasil bebas risiko, risiko usaha peminjam, dan risiko informasi yang dipakai untuk mengambil keputusan. Audit tidak menghilangkan risiko usaha, tetapi dapat mengurangi risiko informasi.", terms: [["Risiko usaha", "Kemungkinan bisnis tidak mencapai hasil."], ["Risiko informasi", "Kemungkinan keputusan memakai informasi tidak andal."], ["Pengguna eksternal", "Pihak luar seperti bank atau investor."]] },
      { id: "penyebab", title: "Mengapa informasi menjadi tidak andal", content: "# Empat sumber risiko informasi\n\nRisiko meningkat ketika pengguna jauh dari kegiatan perusahaan, penyedia informasi memiliki kepentingan berbeda, data sangat banyak, atau transaksi sangat kompleks. Kondisi ini tidak selalu berarti fraud; kondisi tersebut menjelaskan perlunya pemeriksaan sistematis.", terms: [["Keterpencilan", "Pengguna tidak dapat memeriksa langsung."], ["Bias", "Penyajian dipengaruhi tujuan penyedia."], ["Kompleksitas", "Transaksi atau aturan sulit dipahami."]] },
      { id: "respons", title: "Tiga respons terhadap risiko", content: "# Memilih cara pengurangan risiko\n\nPengguna dapat memverifikasi sendiri, berbagi risiko dengan manajemen melalui perjanjian atau tanggung jawab hukum, atau memakai audit independen. Pilihan terbaik bergantung pada biaya, kebutuhan keputusan, dan risiko yang dapat diterima.", terms: [["Verifikasi langsung", "Pengguna memeriksa sendiri informasi."], ["Audit independen", "Pemeriksaan oleh pihak kompeten yang objektif."]], table: { title: "Respons risiko", columns: ["Respons", "Keterbatasan"], rows: [["Verifikasi sendiri", "Mahal bila setiap pengguna melakukannya"], ["Berbagi risiko", "Kerugian belum tentu pulih"], ["Audit independen", "Memerlukan biaya, dapat dipakai banyak pengguna"]] } },
    ],
    example: [["Keputusan", "Bank menilai permohonan kredit PT Sagara."], ["Risiko", "Manajemen memiliki bonus berbasis laba dan bank jauh dari operasi."], ["Nilai audit", "Laporan independen membantu menilai reliabilitas laporan."]],
    guided: { prompt: "Risiko mana yang terutama dikurangi oleh audit laporan keuangan?", options: [["informasi", "Risiko informasi"], ["pasar", "Seluruh risiko pasar"], ["cuaca", "Risiko cuaca buruk"]], correct: "informasi" },
    pairs: [["jarak", "Bank tidak mengamati gudang", "Keterpencilan"], ["bonus", "Manajer mendapat bonus saat laba tinggi", "Bias dan motif"], ["ribuan", "Ribuan transaksi diproses", "Data bervolume besar"]],
    scenario: "Koperasi hendak memberi kredit kepada usaha jauh dengan ribuan transaksi dan target laba tinggi.", decision: "Langkah paling proporsional adalah…", decisionOptions: [["audit", "Meminta informasi yang diperiksa secara independen"], ["abaikan", "Mengabaikan seluruh informasi"], ["jamin", "Menganggap laba tinggi menjamin kredit aman"]], correctDecision: "audit",
    reflection: "Kapan biaya audit mungkin lebih besar daripada manfaatnya bagi pengguna informasi?",
  },
  {
    number: "05", slug: "jasa-asurans-dan-nonasurans", title: "Jasa Asurans dan Non-Asurans", minutes: 20,
    summary: "Pahami peta jasa profesional: assurance, attestation, audit, review, dan jasa non-asurans.",
    objective: "Mengklasifikasikan kebutuhan klien sebagai audit, review, attestation, assurance lain, atau non-asurans.",
    chapters: [
      { id: "assurance", title: "Apa yang diperbaiki oleh assurance?", content: "# Assurance meningkatkan kualitas informasi\n\nJasa assurance adalah jasa profesional independen yang meningkatkan kualitas informasi bagi pengambil keputusan. Nilainya muncul dari kompetensi dan objektivitas penyedia jasa, bukan dari janji bahwa seluruh risiko pengguna hilang.\n\nAssurance dapat berlaku pada informasi keuangan maupun nonkeuangan, seperti informasi keberlanjutan atau efektivitas pengendalian.", terms: [["Assurance", "Jasa independen untuk meningkatkan kualitas informasi."], ["Keyakinan wajar", "Keyakinan tinggi, bukan absolut."], ["Informasi nonkeuangan", "Informasi selain laporan keuangan."]] },
      { id: "attestation", title: "Attestation: menguji asersi pihak lain", content: "# Ada asersi dan ada laporan\n\nAttestation adalah assurance ketika profesional memberikan laporan mengenai subjek atau asersi yang dibuat pihak lain. Audit laporan keuangan, audit pengendalian internal, dan review laporan keuangan adalah kategori penting.\n\nAudit mengumpulkan bukti lebih luas untuk keyakinan tinggi; review menyediakan keyakinan lebih terbatas.", terms: [["Attestation", "Assurance yang melaporkan atas asersi pihak lain."], ["Review", "Penugasan dengan keyakinan lebih terbatas."], ["Pengendalian internal", "Proses yang membantu mencegah atau mendeteksi salah saji."]] },
      { id: "nonassurance", title: "Tidak semua jasa akuntan adalah audit", content: "# Tujuan penugasan menentukan jenis jasa\n\nPembukuan membantu menyiapkan informasi; jasa pajak membantu kepatuhan; konsultasi menghasilkan rekomendasi bagi manajemen. Jasa tersebut tidak otomatis memberikan kesimpulan assurance.\n\nTujuan, pengguna, subjek, kriteria, dan keluaran harus diperjelas sebelum menerima penugasan.", terms: [["Pembukuan", "Jasa menyiapkan atau mencatat informasi."], ["Konsultasi", "Jasa yang terutama menghasilkan rekomendasi."], ["Ruang lingkup", "Batas pekerjaan yang disepakati."]], table: { title: "Peta jasa", columns: ["Jasa", "Keluaran utama"], rows: [["Audit", "Kesimpulan berdasarkan bukti"], ["Review", "Keyakinan terbatas"], ["Pembukuan", "Informasi tersusun"], ["Konsultasi", "Rekomendasi manajemen"]] } },
    ],
    example: [["Permintaan", "Yayasan meminta keyakinan atas laporan untuk donor."], ["Analisis", "Tentukan pengguna, tingkat keyakinan, dan asersi yang diuji."], ["Pilihan", "Audit atau review dipilih menurut kebutuhan assurance."]],
    guided: { prompt: "Pernyataan paling tepat tentang assurance adalah…", options: [["meningkatkan", "Meningkatkan keyakinan, bukan menjamin kepastian mutlak"], ["menjamin", "Menjamin seluruh keputusan pengguna benar"], ["mencatat", "Selalu berarti mencatat transaksi"]], correct: "meningkatkan" },
    pairs: [["audit", "Keyakinan tinggi atas laporan keuangan", "Audit"], ["review", "Keyakinan terbatas", "Review"], ["pembukuan", "Menyusun transaksi ke buku besar", "Non-asurans"]],
    scenario: "Klien meminta 'audit semua usaha' tanpa menyebut informasi, periode, pengguna, atau keluaran.", decision: "Respons profesional yang tepat adalah…", decisionOptions: [["jelaskan", "Memperjelas tujuan, ruang lingkup, kriteria, dan keluaran"], ["janji", "Langsung menjanjikan opini audit"], ["catat", "Mulai membukukan transaksi tanpa tujuan"]], correctDecision: "jelaskan",
    reflection: "Mengapa jasa pembukuan yang baik belum tentu merupakan jasa assurance?",
  },
  {
    number: "06", slug: "tiga-jenis-audit", title: "Tiga Jenis Audit", minutes: 20,
    summary: "Bandingkan audit laporan keuangan, kepatuhan, dan operasional melalui tujuan, kriteria, bukti, serta pengguna hasilnya.",
    objective: "Mengklasifikasikan jenis audit berdasarkan tujuan dan kriteria penugasan.",
    chapters: [
      { id: "peta", title: "Jenis audit ditentukan oleh tujuan", content: "# Jangan mulai dari jabatan auditor\n\nAudit laporan keuangan, kepatuhan, dan operasional sama-sama memakai bukti serta kriteria. Perbedaannya terletak pada pertanyaan yang dijawab: apakah laporan disajikan wajar, apakah aturan dipatuhi, atau apakah proses berjalan efektif dan efisien.\n\nJenis audit tidak ditentukan hanya oleh siapa auditornya.", terms: [["Audit laporan keuangan", "Menilai kesesuaian laporan dengan kerangka pelaporan."], ["Audit kepatuhan", "Menilai pemenuhan aturan atau kontrak."], ["Audit operasional", "Menilai efisiensi dan efektivitas proses."]] },
      { id: "operasional", title: "Audit operasional", content: "# Menilai proses, bukan hanya angka\n\nAudit operasional mengevaluasi efisiensi dan efektivitas operasi. Kriterianya dapat berupa target waktu, tingkat kesalahan, biaya, atau standar proses. Keluaran yang diharapkan sering berupa rekomendasi perbaikan.", terms: [["Efisiensi", "Menggunakan sumber daya secara hemat."], ["Efektivitas", "Mencapai tujuan yang ditetapkan."]] },
      { id: "bandingkan", title: "Kepatuhan dan laporan keuangan", content: "# Dua fokus yang berbeda\n\nAudit kepatuhan menguji pemenuhan aturan atau kontrak. Audit laporan keuangan menguji apakah laporan disajikan sesuai kerangka pelaporan dalam hal material. Keduanya membutuhkan bukti, tetapi pengguna, kriteria, dan laporan dapat berbeda.", terms: [["Material", "Cukup penting untuk memengaruhi keputusan."], ["Ketentuan", "Aturan yang menjadi kriteria."]], table: { title: "Membandingkan tiga jenis audit", columns: ["Jenis", "Kriteria", "Keluaran"], rows: [["Operasional", "Target waktu dan kesalahan", "Rekomendasi"], ["Kepatuhan", "Kontrak atau kebijakan", "Status kepatuhan"], ["Laporan keuangan", "Kerangka pelaporan", "Kesimpulan kewajaran"]] } },
    ],
    example: [["Gudang", "Persediaan dan penerimaan barang diperiksa."], ["Tiga pertanyaan", "Apakah angka wajar? Prosedur dipatuhi? Proses efisien?"], ["Kesimpulan", "Satu objek dapat menjadi tiga penugasan berbeda."]],
    guided: { prompt: "Audit yang menilai ketentuan perjanjian kredit dipenuhi disebut…", options: [["kepatuhan", "Audit kepatuhan"], ["operasional", "Audit operasional"], ["keuangan", "Audit laporan keuangan"]], correct: "kepatuhan" },
    pairs: [["wajar", "Laporan sesuai kerangka", "Laporan keuangan"], ["kontrak", "Memenuhi syarat kredit", "Kepatuhan"], ["efisien", "Mempercepat pemenuhan pesanan", "Operasional"]],
    scenario: "Direktur ingin mengetahui mengapa banyak pesanan terlambat meski stok tersedia.", decision: "Tujuan audit paling tepat adalah…", decisionOptions: [["operasional", "Menilai efektivitas dan efisiensi proses"], ["laporan", "Memberi opini atas laporan keuangan"], ["kepatuhan", "Menilai kontrak kredit"]], correctDecision: "operasional",
    reflection: "Tuliskan satu proses yang dapat diaudit operasional dan dua ukuran keberhasilannya.",
  },
  {
    number: "07", slug: "peran-dan-jenis-auditor", title: "Peran dan Jenis Auditor", minutes: 18,
    summary: "Kenali auditor eksternal, internal, pemerintah, dan pajak; pahami perbedaan tujuan serta independensinya.",
    objective: "Menjelaskan perbedaan peran, pengguna hasil, dan batas independensi pada jenis auditor utama.",
    chapters: [
      { id: "peran", title: "Auditor bekerja untuk kebutuhan berbeda", content: "# Siapa memeriksa siapa?\n\nAuditor eksternal memberikan penilaian independen sesuai penugasan, umumnya untuk pengguna luar. Auditor internal membantu organisasi mengevaluasi tata kelola, risiko, pengendalian, kepatuhan, dan operasi. Auditor pemerintah serta pemeriksa pajak bekerja dalam mandat lembaga atau aturan tertentu.", terms: [["Auditor eksternal", "Pihak independen dari luar organisasi."], ["Auditor internal", "Pemeriksa di dalam organisasi."], ["Mandat", "Wewenang pemeriksaan dari lembaga."]] },
      { id: "batas", title: "Independensi selalu bergantung konteks", content: "# Objektivitas tidak sama untuk setiap peran\n\nAuditor internal tidak sepenuhnya independen dari organisasinya karena hubungan kerja, tetapi dapat menjaga objektivitas terhadap unit operasi melalui struktur pelaporan dan tata kelola. Auditor eksternal perlu independen dari klien agar pengguna luar dapat mengandalkan kesimpulannya.\n\nContoh profesi dan lisensi di buku berasal dari Amerika Serikat; penerapan Indonesia memerlukan rujukan setempat.", terms: [["Objektivitas", "Menilai berdasarkan fakta dan kriteria."], ["Komite audit", "Pihak tata kelola yang mengawasi fungsi audit."]], table: { title: "Peran dan pengguna", columns: ["Auditor", "Pengguna utama hasil"], rows: [["Eksternal", "Kreditur, investor, atau pengguna luar"], ["Internal", "Manajemen dan tata kelola"], ["Pemerintah/pajak", "Lembaga pemberi mandat dan publik"]] } },
    ],
    example: [["Kondisi", "Komite audit meminta evaluasi proses pengadaan."], ["Pilihan", "Audit internal dapat menilai pengendalian dan proses."], ["Batas", "Tujuan, pengguna, dan independensi harus dijelaskan sejak awal."]],
    guided: { prompt: "Fungsi yang terutama membantu manajemen dan tata kelola mengevaluasi pengendalian adalah…", options: [["internal", "Audit internal"], ["eksternal", "Audit eksternal untuk investor"], ["pelanggan", "Pelanggan perusahaan"]], correct: "internal" },
    pairs: [["luar", "Kreditur memakai laporan independen", "Auditor eksternal"], ["tata-kelola", "Komite audit mengawasi pemeriksaan", "Audit internal"], ["mandat", "Menguji ketentuan lembaga", "Pemerintah/pajak"]],
    scenario: "Manajer gudang meminta auditor internal yang melapor kepadanya menilai gudangnya sendiri.", decision: "Pengamanan objektivitas paling tepat adalah…", decisionOptions: [["lapor", "Gunakan jalur pelaporan independen dari manajer gudang"], ["setuju", "Biarkan manajer gudang menyetujui seluruh kesimpulan"], ["hapus", "Hapus pemeriksaan karena internal audit tidak boleh mengaudit proses"]], correctDecision: "lapor",
    reflection: "Mengapa pengguna luar mungkin membutuhkan auditor eksternal meskipun ada audit internal kuat?",
  },
  {
    number: "08", slug: "capstone-rancangan-penugasan-audit", title: "Capstone: Rancangan Penugasan Audit", minutes: 20,
    summary: "Satukan teori menjadi rancangan penugasan: klaim, kriteria, risiko, bukti, jenis audit, dan komunikasi hasil.",
    objective: "Menyusun keputusan awal penugasan audit sederhana dari satu kasus utuh.",
    chapters: [
      { id: "brief", title: "Brief PT Sagara", content: "# Satu organisasi, beberapa kebutuhan\n\nPT Sagara mengajukan kredit bank, mengalami selisih persediaan, dan menerima keluhan atas keterlambatan pengiriman. Bank membutuhkan informasi keuangan andal; direksi ingin mengetahui apakah proses gudang dipatuhi dan efektif.\n\nKasus ini memperlihatkan bahwa satu organisasi dapat membutuhkan beberapa penugasan audit yang berbeda.", terms: [["Brief penugasan", "Ringkasan tujuan, pengguna, informasi, dan batas pekerjaan."], ["Ruang lingkup", "Bagian organisasi atau informasi yang dicakup."]] },
      { id: "rancang", title: "Rancang pertanyaan sebelum prosedur", content: "# Dari kebutuhan pengguna ke prosedur\n\nMulailah dengan pengguna dan keputusan mereka. Tentukan informasi atau proses yang diuji, kriteria, risiko informasi, dan bukti awal. Baru setelah itu pilih jenis audit serta prosedur yang proporsional.\n\nUrutan ini mencegah auditor mengumpulkan bukti tanpa tahu pertanyaan yang ingin dijawab.", terms: [["Ruang lingkup", "Batas pekerjaan yang disepakati."], ["Prosedur", "Langkah untuk memperoleh dan mengevaluasi bukti."]], table: { title: "Kanvas penugasan", columns: ["Elemen", "Pertanyaan"], rows: [["Pengguna", "Siapa memakai hasil?"], ["Klaim/proses", "Apa yang dinilai?"], ["Kriteria", "Standar apa yang dipakai?"], ["Bukti", "Apa yang mendukung kesimpulan?"], ["Laporan", "Apa yang dikomunikasikan?"]] } },
      { id: "integrasi", title: "Satu kasus, beberapa penugasan", content: "# Hindari jawaban tunggal untuk semua masalah\n\nPermintaan bank atas laporan keuangan dapat mengarah ke audit laporan keuangan. Kepatuhan penerimaan barang mengarah ke audit kepatuhan. Keterlambatan pengiriman dapat mengarah ke audit operasional.\n\nSetiap penugasan membutuhkan tujuan, kriteria, bukti, pengguna, dan bentuk laporan yang jelas.", terms: [["Integrasi", "Melihat hubungan beberapa penugasan."], ["Rekomendasi", "Saran perbaikan yang lazim pada audit operasional."]] },
    ],
    example: [["Kebutuhan bank", "Menilai apakah laporan dapat dipakai dalam keputusan kredit."], ["Kebutuhan direksi", "Menilai kepatuhan gudang dan penyebab keterlambatan."], ["Rancangan", "Pisahkan tujuan, kriteria, bukti awal, dan penerima laporan."]],
    guided: { prompt: "Langkah pertama saat menerima permintaan pemeriksaan adalah…", options: [["tujuan", "Menjelaskan pengguna, keputusan, tujuan, dan ruang lingkup"], ["bukti", "Mengumpulkan seluruh dokumen tanpa pertanyaan audit"], ["opini", "Menulis opini sebelum memahami informasi"]], correct: "tujuan" },
    pairs: [["bank", "Kewajaran laporan keuangan", "Laporan keuangan"], ["prosedur", "Kepatuhan penerimaan barang", "Kepatuhan"], ["terlambat", "Efisiensi pengiriman", "Operasional"]],
    scenario: "Direksi meminta satu audit untuk kredit bank, kepatuhan gudang, dan keterlambatan pesanan tanpa membedakan hasil yang dibutuhkan.", decision: "Rancangan awal paling kuat adalah…", decisionOptions: [["pisahkan", "Memisahkan tujuan, kriteria, bukti, dan pengguna laporan"], ["campur", "Menggunakan satu kriteria untuk seluruh masalah"], ["tebak", "Memilih prosedur berdasarkan dokumen termudah"]], correctDecision: "pisahkan",
    reflection: "Buat ringkasan tiga baris: pengguna, informasi/proses, dan bukti awal untuk salah satu kebutuhan PT Sagara.",
  },
];

function moduleFrom(spec: AuditModuleSpec, index: number): LearningModule {
  const id = `audit-fondasi-${spec.number}`;
  const competencyId = `kompetensi-audit-fondasi-${spec.number}`;
  const chapterPages: LearningModule["pages"] = spec.chapters.map((chapter, position) => ({
    id: `${id}-${chapter.id}`,
    title: `${position === 0 ? "Mulai" : "Pahami"} · ${chapter.title}`,
    blocks: [
      { id: `${id}-${chapter.id}-materi`, type: "reading", role: position === 0 ? "discover" : "understand", required: true, title: chapter.title, competencyIds: [competencyId], markdown: chapter.content },
      { id: `${id}-${chapter.id}-glosarium`, type: "glossary", role: "understand", required: false, title: "Istilah kunci", glossaryItems: chapter.terms.map(([term, definition]) => ({ term, definition })) },
      ...(chapter.table ? [{ id: `${id}-${chapter.id}-tabel`, type: "comparison_table" as const, role: "understand" as const, required: false, title: chapter.table.title, columns: chapter.table.columns, rows: chapter.table.rows }] : []),
      ...(chapter.deepDive ? [{ id: `${id}-${chapter.id}-pendalaman`, type: "deep_dive" as const, role: "deep_dive" as const, required: false, title: "Pendalaman", content: chapter.deepDive }] : []),
      { id: `${id}-${chapter.id}-referensi`, type: "reference", role: "understand", required: false, title: "Dasar materi", referenceIds: [sourceReference.id] },
    ],
  }));
  const firstMaterialId = `${id}-${spec.chapters[0]!.id}-materi`;
  const choiceId = `${id}-pilihan-terbimbing`;
  const matchingId = `${id}-cocokkan-terbimbing`;
  const caseId = `${id}-kasus-mandiri`;
  const observeId = `${id}-amati`;
  const applyId = `${id}-terapkan`;

  return {
    kind: "plf.module", schemaVersion: "1.1.0", id, revision: 2,
    metadata: { title: `${spec.number} · ${spec.title}: Pengantar Audit`, summary: spec.summary, subject: "Audit dan Asurans", level: "beginner", estimatedMinutes: spec.minutes, tags: ["audit", "pengantar audit", "teori audit", "micro-learning", spec.slug], author: "PuspitaCore Belajar" },
    experience: { profile: "mixed", navigation: "flexible", allowResume: false },
    prerequisites: { moduleIds: index ? [`audit-fondasi-${specs[index - 1]!.number}`] : [], competencyIds: [], notes: index ? "Modul sebelumnya direkomendasikan agar alur konsep tetap utuh." : "Tidak memerlukan pengalaman audit sebelumnya." },
    competencies: [{ id: competencyId, title: spec.objective }],
    learningPolicy: { allowRetry: true, feedbackTiming: "after_submit", hintMode: "guided_only", timerMode: "advisory", allowSkip: true, remediationEnabled: true, solutionsAfterAttempt: true },
    assessment: { passingScore: 75, requireAllRequired: true, attemptPolicy: "best" },
    reportPolicy: { scope: "learning_unit", formats: ["json", "print"], downloadOnCompletion: true, dataLocation: "client_only" },
    references: [sourceReference], outline: [{ type: "section", id: `${id}-section`, title: spec.title, children: [{ type: "unit", unitId: `${id}-unit` }] }],
    learningUnits: [{ id: `${id}-unit`, title: spec.title, learningObjectives: [spec.objective], competencyIds: [competencyId], prerequisiteUnitIds: [], pageIds: [...chapterPages.map((page) => page.id), observeId, applyId], worksheets: [
      { id: `${id}-guided`, title: "Latihan terbimbing", mode: "guided", difficulty: "easy", complexityWeight: 1, targetMinutes: { min: 4, max: 6 }, scoreWeight: 1, blockIds: [choiceId, matchingId] },
      { id: `${id}-independent`, title: "Penerapan mandiri", mode: "independent", difficulty: "medium", complexityWeight: 2, targetMinutes: { min: 5, max: 7 }, scoreWeight: 2, blockIds: [caseId] },
    ], masteryCriteria: { minimumScore: 75, requiredWorksheetIds: [`${id}-independent`] }, report: { enabled: true } }],
    pages: [...chapterPages,
      { id: observeId, title: `Amati · ${spec.title}`, blocks: [
        { id: `${id}-contoh`, type: "worked_example", role: "observe", required: false, title: "Membaca kasus dengan cara auditor", steps: spec.example.map(([title, explanation]) => ({ title, explanation })) },
        { id: choiceId, type: "single_choice", role: "guided_practice", required: true, title: "Cek pemahaman", competencyIds: [competencyId], prompt: spec.guided.prompt, options: spec.guided.options.map(([optionId, text]) => ({ id: optionId, text })), hints: ["Kembali ke bab teori yang menjelaskan tujuan dan kriteria penugasan."], remediation: { onIncorrect: { targetBlockId: firstMaterialId } }, grading: { correctOptionId: spec.guided.correct, points: 10, explanation: "Periksa lagi hubungan antara tujuan, informasi, kriteria, dan bukti." } },
        { id: matchingId, type: "matching", role: "guided_practice", required: true, title: "Pasangkan konsep", competencyIds: [competencyId], prompt: "Pasangkan contoh dengan konsep audit yang tepat.", pairs: spec.pairs.map(([pairId, left, right]) => ({ id: pairId, left, right })), grading: { points: 10, partialCredit: true, explanation: "Setiap pasangan memperlihatkan fungsi konsep dalam penugasan audit." } },
      ] },
      { id: applyId, title: `Terapkan · ${spec.title}`, blocks: [
        { id: caseId, type: "case_decision", role: "independent_practice", required: true, title: "Kasus mandiri", competencyIds: [competencyId], scenario: spec.scenario, prompt: spec.decision, options: spec.decisionOptions.map(([optionId, text]) => ({ id: optionId, text })), grading: { optionScores: Object.fromEntries(spec.decisionOptions.map(([optionId]) => [optionId, optionId === spec.correctDecision ? 1 : 0])), points: 20, explanation: "Pilih langkah yang selaras dengan tujuan penugasan, kriteria, dan bukti yang diperlukan." } },
        { id: `${id}-catatan`, type: "callout", role: "deep_dive", required: false, variant: "note", title: "Prinsip yang dibawa ke modul berikutnya", content: "Audit adalah proses penalaran berbasis bukti. Jawaban yang baik menjelaskan informasi, kriteria, bukti, dan pengguna hasilnya." },
        { id: `${id}-refleksi`, type: "reflection", role: "reflect", required: true, reviewMode: "self", title: "Refleksi", competencyIds: [competencyId], prompt: spec.reflection, rubric: ["Menghubungkan teori dengan situasi", "Menjelaskan alasan secara singkat"] },
      ] },
    ],
  };
}

export const auditMicroModules = specs.map(moduleFrom);
export const auditMicroModulesBySlug = Object.fromEntries(specs.map((spec, index) => [spec.slug, auditMicroModules[index]!])) as Record<string, LearningModule>;
