import type { LearningModule } from "../types";

type AuditModuleSpec = {
  number: string;
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  objective: string;
  concept: string;
  glossary: [string, string][];
  example: string;
  question: string;
  options: [string, string][];
  correctOption: string;
  trueFalsePrompt: string;
  trueFalseAnswer: boolean;
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
  edition: "Digunakan sebagai rujukan konsep; seluruh contoh dan latihan diadaptasi untuk belajar mandiri.",
};

const specs: AuditModuleSpec[] = [
  {
    number: "01", slug: "dasar-audit", title: "Dasar Audit", minutes: 18,
    summary: "Mulai dari tujuan audit, informasi yang diperiksa, dan enam unsur dalam sebuah penugasan.",
    objective: "Mengidentifikasi tujuan audit dan enam unsur audit pada cerita usaha sederhana.",
    concept: "Audit adalah proses mengumpulkan dan mengevaluasi bukti mengenai informasi untuk menentukan kesesuaiannya dengan kriteria, lalu melaporkan hasilnya kepada pihak yang berkepentingan. Enam unsur yang perlu terlihat adalah informasi, kriteria, bukti, auditor yang kompeten dan independen, serta laporan hasil pemeriksaan.",
    glossary: [["Informasi", "Hal yang dinilai, misalnya laporan penjualan."], ["Kriteria", "Tolok ukur untuk menilai informasi."], ["Bukti", "Dasar yang mendukung kesimpulan auditor."]],
    example: "Pemilik toko ingin mengetahui apakah angka kas akhir bulan dapat dipercaya. Auditor membandingkan catatan kas dengan bukti penerimaan dan pengeluaran, memakai prosedur yang disepakati, lalu menyampaikan kesimpulannya.",
    question: "Dalam cerita toko, apa informasi utama yang diperiksa?", options: [["laporan-kas", "Angka dan catatan kas"], ["seragam", "Seragam auditor"], ["jadwal", "Jadwal rapat pemilik"]], correctOption: "laporan-kas",
    trueFalsePrompt: "Audit dimulai dengan kesimpulan tanpa memeriksa bukti.", trueFalseAnswer: false,
    scenario: "Seorang pemeriksa menerima catatan penjualan tetapi tidak memiliki standar pembanding untuk menilainya.", decision: "Apa yang paling perlu ditetapkan sebelum menarik kesimpulan?", decisionOptions: [["kriteria", "Kriteria atau tolok ukur penilaian"], ["tebakan", "Tebakan berdasarkan pengalaman"]], correctDecision: "kriteria",
    reflection: "Sebutkan satu informasi di sekitar kamu yang akan lebih dipercaya jika diperiksa secara independen.",
  },
  {
    number: "02", slug: "bukti-kriteria-dan-independensi", title: "Bukti, Kriteria, dan Independensi", minutes: 18,
    summary: "Pelajari cara memilih bukti, memakai kriteria, dan menjaga kompetensi serta independensi auditor.",
    objective: "Memilih bukti yang relevan dan menjelaskan mengapa auditor harus kompeten serta independen.",
    concept: "Bukti yang banyak belum tentu cukup. Auditor membutuhkan bukti yang relevan dan andal terhadap kriteria yang jelas. Kompetensi membuat auditor mampu mengevaluasi bukti, sedangkan independensi membantu kesimpulan tidak dipengaruhi kepentingan pihak yang diperiksa.",
    glossary: [["Relevan", "Berkaitan langsung dengan pertanyaan yang diuji."], ["Andal", "Layak dipercaya berdasarkan sumber dan cara diperolehnya."], ["Independensi", "Sikap objektif tanpa kepentingan yang mengganggu penilaian."]],
    example: "Untuk memeriksa saldo piutang, auditor dapat menelaah faktur, dokumen pengiriman, dan konfirmasi pelanggan. Pesan promosi perusahaan bukan bukti utama karena tidak menjawab apakah piutang benar ada.",
    question: "Bukti mana yang paling langsung mendukung keberadaan piutang pelanggan?", options: [["konfirmasi", "Konfirmasi dari pelanggan"], ["iklan", "Materi iklan perusahaan"], ["rumor", "Rumor di media sosial"]], correctOption: "konfirmasi",
    trueFalsePrompt: "Auditor boleh mengaudit perusahaan miliknya sendiri selama bukti yang dikumpulkan banyak.", trueFalseAnswer: false,
    scenario: "Auditor diminta menyimpulkan bahwa persediaan benar ada hanya dari daftar yang dibuat manajer gudang.", decision: "Langkah terbaik berikutnya adalah…", decisionOptions: [["tambah-bukti", "Memperoleh bukti tambahan, misalnya observasi fisik"], ["langsung-lapor", "Langsung menerbitkan kesimpulan"]], correctDecision: "tambah-bukti",
    reflection: "Bukti seperti apa yang menurutmu paling sulit dikumpulkan tanpa sikap independen?",
  },
  {
    number: "03", slug: "mengapa-audit-dibutuhkan", title: "Mengapa Audit Dibutuhkan", minutes: 17,
    summary: "Pahami mengapa pengguna informasi memerlukan audit dan bedakan risiko informasi dari risiko usaha.",
    objective: "Membedakan risiko informasi dari risiko usaha dalam keputusan pengguna laporan.",
    concept: "Pengguna laporan sering membuat keputusan tanpa melihat kegiatan perusahaan secara langsung. Risiko informasi muncul ketika informasi yang dipakai untuk mengambil keputusan salah atau tidak lengkap. Risiko usaha adalah ketidakpastian dari kegiatan bisnis itu sendiri; audit mengurangi risiko informasi, bukan menjamin bisnis akan berhasil.",
    glossary: [["Risiko informasi", "Risiko keputusan dibuat berdasarkan informasi yang keliru."], ["Risiko usaha", "Risiko kegiatan bisnis tidak mencapai hasil yang diharapkan."], ["Pengguna informasi", "Pihak yang memakai laporan untuk membuat keputusan."]],
    example: "Bank mempertimbangkan pinjaman berdasarkan laporan keuangan distributor. Audit dapat membantu bank menilai apakah laporan tersebut dapat diandalkan, tetapi tidak dapat menjamin distributor akan selalu laku menjual produknya.",
    question: "Risiko mana yang terutama dikurangi oleh audit laporan keuangan?", options: [["informasi", "Risiko informasi"], ["cuaca", "Risiko cuaca buruk"], ["pasar", "Seluruh risiko pasar"]], correctOption: "informasi",
    trueFalsePrompt: "Laporan yang diaudit menjamin perusahaan tidak akan mengalami kerugian usaha.", trueFalseAnswer: false,
    scenario: "Investor ragu karena laporan laba perusahaan dibuat oleh manajemen yang juga akan menerima bonus berdasarkan laba tersebut.", decision: "Manfaat audit yang paling tepat adalah…", decisionOptions: [["kurangi-risiko", "Mengurangi risiko informasi bagi investor"], ["jamin-laba", "Menjamin laba perusahaan tahun depan"]], correctDecision: "kurangi-risiko",
    reflection: "Pernahkah kamu membuat keputusan dengan informasi yang ternyata tidak lengkap? Apa dampaknya?",
  },
  {
    number: "04", slug: "risiko-informasi", title: "Sumber dan Pengurangan Risiko Informasi", minutes: 19,
    summary: "Kenali penyebab informasi tidak andal dan cara menguranginya secara proporsional.",
    objective: "Mengidentifikasi sumber risiko informasi dan memilih cara pengurangannya.",
    concept: "Risiko informasi dapat muncul karena informasi terlalu jauh dari pengguna, pihak yang menyiapkan informasi memiliki insentif berbeda, data sangat banyak dan rumit, atau pengguna tidak memiliki keahlian untuk memeriksa sendiri. Audit independen, akses langsung, dan pembagian risiko melalui perjanjian adalah beberapa cara yang dapat digunakan.",
    glossary: [["Kompleksitas", "Banyaknya detail atau perhitungan yang menyulitkan penilaian."], ["Konflik kepentingan", "Kepentingan pihak penyusun tidak selalu sama dengan pengguna."], ["Mitigasi", "Langkah untuk mengurangi risiko."]],
    example: "Pemberi pinjaman berada di kota lain, sedangkan gudang dan transaksi ada di banyak lokasi. Jarak, jumlah transaksi, dan target bonus manajemen membuat pemberi pinjaman membutuhkan informasi yang lebih dapat dipercaya.",
    question: "Manakah contoh konflik kepentingan yang meningkatkan risiko informasi?", options: [["bonus", "Manajer memperoleh bonus jika laba tinggi"], ["alamat", "Bank mengetahui alamat perusahaan"], ["arsip", "Pelanggan menyimpan kuitansi"]], correctOption: "bonus",
    trueFalsePrompt: "Semakin rumit data, semakin mudah pengguna memeriksanya sendiri tanpa bantuan.", trueFalseAnswer: false,
    scenario: "Koperasi ingin memberi kredit kepada usaha yang jauh lokasinya dan mempunyai ribuan transaksi setiap bulan.", decision: "Kombinasi langkah yang paling masuk akal adalah…", decisionOptions: [["audit", "Meminta informasi yang diperiksa secara independen"], ["abaikan", "Mengabaikan laporan karena transaksi terlalu banyak"]], correctDecision: "audit",
    reflection: "Penyebab risiko informasi mana yang paling sering kamu lihat pada organisasi kecil?",
  },
  {
    number: "05", slug: "akuntansi-vs-audit", title: "Akuntansi vs Audit", minutes: 17,
    summary: "Bedakan pekerjaan menyusun informasi dengan pekerjaan memeriksa bukti atas informasi tersebut.",
    objective: "Membedakan tanggung jawab akuntan dan auditor pada transaksi sederhana.",
    concept: "Akuntansi mengidentifikasi, mencatat, mengklasifikasikan, dan menyajikan transaksi. Audit memeriksa bukti serta menilai apakah informasi yang disajikan sesuai kriteria. Auditor tidak mengambil alih tanggung jawab manajemen untuk menyusun laporan keuangan.",
    glossary: [["Akuntansi", "Proses menghasilkan informasi keuangan."], ["Audit", "Pemeriksaan bukti atas informasi dengan kriteria."], ["Manajemen", "Pihak yang bertanggung jawab atas penyusunan informasi."]],
    example: "Staf akuntansi mencatat penjualan kredit dan membuat laporan piutang. Auditor kemudian memilih sampel faktur, dokumen pengiriman, dan pembayaran pelanggan untuk menguji apakah angka piutang wajar.",
    question: "Siapa yang terutama bertanggung jawab menyusun laporan keuangan?", options: [["manajemen", "Manajemen perusahaan"], ["auditor", "Auditor eksternal"], ["bank", "Bank pemberi pinjaman"]], correctOption: "manajemen",
    trueFalsePrompt: "Auditor menggantikan staf akuntansi dalam mencatat seluruh transaksi harian.", trueFalseAnswer: false,
    scenario: "Auditor menemukan faktur penjualan yang belum dicatat oleh perusahaan.", decision: "Tindakan auditor yang paling tepat adalah…", decisionOptions: [["komunikasikan", "Mengumpulkan bukti dan mengomunikasikan temuan kepada manajemen"], ["catat-rahasia", "Mencatatnya diam-diam tanpa memberi tahu manajemen"]], correctDecision: "komunikasikan",
    reflection: "Bagian mana dari pekerjaan akuntansi yang semula kamu kira dilakukan auditor?",
  },
  {
    number: "06", slug: "prosedur-audit-dan-tanggung-jawab", title: "Prosedur Audit dan Tanggung Jawab", minutes: 18,
    summary: "Lihat contoh prosedur audit dan pahami batas tanggung jawab auditor maupun manajemen.",
    objective: "Memilih prosedur audit yang sesuai untuk menguji pernyataan manajemen.",
    concept: "Prosedur audit adalah langkah untuk memperoleh bukti, misalnya inspeksi dokumen, observasi, konfirmasi, dan perhitungan ulang. Pemilihan prosedur bergantung pada pernyataan yang diuji. Manajemen bertanggung jawab atas laporan; auditor bertanggung jawab atas kesimpulan berdasarkan bukti yang diperoleh.",
    glossary: [["Inspeksi", "Menelaah dokumen atau aset fisik."], ["Konfirmasi", "Meminta tanggapan langsung dari pihak ketiga."], ["Pernyataan", "Klaim manajemen yang diuji auditor."]],
    example: "Untuk menguji apakah barang benar telah dikirim, auditor dapat menelaah faktur dan surat jalan. Untuk menguji apakah pelanggan mengakui saldo piutang, auditor dapat mengirimkan konfirmasi.",
    question: "Prosedur yang paling langsung memperoleh jawaban dari pelanggan adalah…", options: [["konfirmasi", "Konfirmasi"], ["wawancara-internal", "Wawancara internal saja"], ["promosi", "Membaca materi promosi"]], correctOption: "konfirmasi",
    trueFalsePrompt: "Satu prosedur audit selalu cukup untuk membuktikan semua pernyataan manajemen.", trueFalseAnswer: false,
    scenario: "Perusahaan mengklaim semua persediaan di gudang benar ada pada akhir tahun.", decision: "Prosedur paling relevan untuk memulai pengujian adalah…", decisionOptions: [["observasi", "Mengobservasi perhitungan fisik persediaan"], ["desain", "Menilai desain logo kemasan"]], correctDecision: "observasi",
    reflection: "Mengapa bukti dari pihak ketiga sering berguna untuk audit?",
  },
  {
    number: "07", slug: "audit-review-dan-asurans", title: "Audit, Review, dan Asurans", minutes: 19,
    summary: "Bandingkan audit, review, dan jasa asurans dari tujuan, prosedur, serta tingkat keyakinannya.",
    objective: "Membedakan audit, review, dan asurans berdasarkan kebutuhan pengguna serta keluaran penugasan.",
    concept: "Jasa asurans meningkatkan kualitas informasi bagi pengambil keputusan. Audit memberikan tingkat keyakinan yang tinggi melalui prosedur yang lebih luas. Review umumnya memberikan keyakinan terbatas dengan prosedur yang lebih terbatas. Tidak ada jasa asurans yang menjanjikan kepastian mutlak.",
    glossary: [["Asurans", "Jasa untuk meningkatkan kualitas informasi bagi pengguna."], ["Audit", "Penugasan asurans dengan pemeriksaan lebih luas."], ["Review", "Penugasan dengan keyakinan terbatas."]],
    example: "Yayasan yang ingin meyakinkan donor besar dapat memerlukan audit laporan keuangan. Organisasi yang hanya membutuhkan penelaahan terbatas untuk kebutuhan internal mungkin mempertimbangkan review sesuai kebutuhannya.",
    question: "Pernyataan yang paling tepat tentang asurans adalah…", options: [["meningkatkan", "Meningkatkan keyakinan pengguna, bukan menjamin kepastian mutlak"], ["menjamin", "Menjamin semua keputusan pengguna pasti benar"], ["mencatat", "Selalu berarti mencatat transaksi harian"]], correctOption: "meningkatkan",
    trueFalsePrompt: "Review dan audit selalu menggunakan prosedur dengan keluasan yang sama.", trueFalseAnswer: false,
    scenario: "Donor meminta keyakinan yang lebih tinggi atas laporan keuangan sebelum memberi dana besar.", decision: "Jenis kebutuhan yang paling sesuai adalah…", decisionOptions: [["audit", "Audit laporan keuangan"], ["pembukuan", "Sekadar jasa pembukuan"]], correctDecision: "audit",
    reflection: "Dalam situasi apa keyakinan terbatas mungkin sudah cukup?",
  },
  {
    number: "08", slug: "asurans-lain-dan-non-asurans", title: "Asurans Lain dan Non-Asurans", minutes: 17,
    summary: "Kenali perbedaan jasa asurans lain, pembukuan, konsultasi, dan permintaan klien yang perlu diperjelas.",
    objective: "Mengklasifikasikan kebutuhan klien sebagai jasa asurans atau non-asurans.",
    concept: "Tidak semua jasa profesional adalah audit atau asurans. Pembukuan membantu menyiapkan informasi, konsultasi membantu memecahkan masalah, sedangkan asurans menilai atau meningkatkan keyakinan atas informasi tertentu. Ruang lingkup, pengguna laporan, dan jenis keluaran harus diperjelas sebelum menerima penugasan.",
    glossary: [["Non-asurans", "Jasa yang tidak memberikan kesimpulan asurans."], ["Konsultasi", "Bantuan analisis atau rekomendasi untuk klien."], ["Ruang lingkup", "Batas pekerjaan yang disepakati."]],
    example: "Usaha kecil meminta bantuan menyusun pembukuan bulanan. Pekerjaan itu membantu menghasilkan informasi, tetapi belum menjadi audit karena tidak ada pemeriksaan independen dan kesimpulan asurans.",
    question: "Menyusun transaksi ke buku besar untuk klien terutama merupakan…", options: [["pembukuan", "Jasa pembukuan non-asurans"], ["audit", "Audit laporan keuangan"], ["opini", "Pemberian opini audit otomatis"]], correctOption: "pembukuan",
    trueFalsePrompt: "Setiap jasa yang dilakukan akuntan pasti memberikan asurans.", trueFalseAnswer: false,
    scenario: "Klien berkata, 'Tolong audit semua usaha saya,' tetapi belum menyebut informasi, periode, atau pengguna hasilnya.", decision: "Respons profesional yang tepat adalah…", decisionOptions: [["jelaskan", "Memperjelas tujuan, ruang lingkup, dan keluaran terlebih dahulu"], ["janji", "Langsung menjanjikan opini tanpa informasi tambahan"]], correctDecision: "jelaskan",
    reflection: "Informasi apa yang harus kamu tanyakan sebelum menyebut sebuah pekerjaan sebagai audit?",
  },
  {
    number: "09", slug: "audit-laporan-keuangan", title: "Audit Laporan Keuangan", minutes: 18,
    summary: "Fokus pada tujuan audit laporan keuangan, kriteria, bukti, dan pengguna hasilnya.",
    objective: "Menjelaskan tujuan serta kriteria utama audit laporan keuangan.",
    concept: "Audit laporan keuangan menilai apakah laporan keuangan disajikan secara wajar, dalam semua hal yang material, sesuai kerangka pelaporan yang berlaku. Auditor mengumpulkan bukti atas berbagai pernyataan manajemen sebelum menyampaikan laporan kepada pengguna yang berkepentingan.",
    glossary: [["Material", "Cukup penting untuk memengaruhi keputusan pengguna."], ["Penyajian wajar", "Penyajian yang sesuai kerangka pelaporan dalam hal material."], ["Kerangka pelaporan", "Aturan atau standar yang menjadi kriteria laporan."]],
    example: "Kreditur menelaah laporan keuangan perusahaan sebelum memperpanjang pinjaman. Mereka menggunakan laporan auditor sebagai salah satu masukan untuk menilai kualitas informasi, bersama informasi lain tentang perusahaan.",
    question: "Kriteria utama dalam audit laporan keuangan adalah…", options: [["kerangka", "Kerangka pelaporan keuangan yang berlaku"], ["selera", "Selera pribadi auditor"], ["target", "Target penjualan pemilik"]], correctOption: "kerangka",
    trueFalsePrompt: "Audit laporan keuangan bertujuan menjamin tidak ada kesalahan sekecil apa pun.", trueFalseAnswer: false,
    scenario: "Kreditur meminta kepastian apakah laporan keuangan yang dipakai untuk memberi pinjaman disajikan secara wajar.", decision: "Jenis audit yang relevan adalah…", decisionOptions: [["laporan", "Audit laporan keuangan"], ["operasional", "Audit operasional atas efisiensi gudang"]], correctDecision: "laporan",
    reflection: "Mengapa konsep materialitas penting ketika memeriksa laporan keuangan?",
  },
  {
    number: "10", slug: "audit-kepatuhan", title: "Audit Kepatuhan", minutes: 17,
    summary: "Uji pemenuhan kontrak atau aturan dengan kriteria kepatuhan yang jelas.",
    objective: "Mengidentifikasi tujuan dan kriteria audit kepatuhan pada kasus sederhana.",
    concept: "Audit kepatuhan menilai apakah aktivitas atau informasi telah memenuhi ketentuan yang ditetapkan, seperti perjanjian kredit, kebijakan internal, atau peraturan. Kriteria kepatuhan harus spesifik agar auditor dapat membandingkan kondisi sebenarnya dengan kewajiban yang berlaku.",
    glossary: [["Kepatuhan", "Pemenuhan terhadap ketentuan yang berlaku."], ["Ketentuan", "Aturan, kontrak, atau kebijakan sebagai kriteria."], ["Pelanggaran", "Kondisi yang tidak memenuhi ketentuan."]],
    example: "Perjanjian pinjaman mengharuskan perusahaan menjaga rasio tertentu dan menyerahkan laporan setiap tiga bulan. Auditor kepatuhan memeriksa dokumen dan perhitungan untuk menilai apakah syarat tersebut dipenuhi.",
    question: "Kriteria utama audit kepatuhan perjanjian kredit adalah…", options: [["kontrak", "Syarat dalam kontrak kredit"], ["mood", "Perasaan pemberi pinjaman"], ["iklan", "Isi iklan perusahaan"]], correctOption: "kontrak",
    trueFalsePrompt: "Audit kepatuhan hanya dapat dilakukan terhadap aturan pemerintah.", trueFalseAnswer: false,
    scenario: "Sebuah organisasi ingin memastikan pengadaan selalu melalui persetujuan dua pejabat sesuai kebijakan internal.", decision: "Fokus pemeriksaan yang tepat adalah…", decisionOptions: [["otorisasi", "Bukti otorisasi sesuai kebijakan"], ["laba", "Prediksi laba tahun depan"]], correctDecision: "otorisasi",
    reflection: "Sebutkan satu aturan sederhana yang dapat diuji melalui audit kepatuhan.",
  },
  {
    number: "11", slug: "audit-operasional", title: "Audit Operasional", minutes: 18,
    summary: "Nilai efisiensi dan efektivitas proses kerja dengan tujuan serta ukuran kinerja yang tepat.",
    objective: "Membedakan audit operasional dari audit laporan keuangan dan memilih ukuran proses yang relevan.",
    concept: "Audit operasional mengevaluasi efisiensi dan efektivitas kegiatan organisasi. Fokusnya bukan hanya apakah angka dicatat dengan benar, tetapi apakah proses mencapai tujuan dengan sumber daya yang wajar. Kriterianya dapat berupa target waktu, tingkat kesalahan, biaya, atau standar proses yang disetujui.",
    glossary: [["Efisiensi", "Menggunakan sumber daya secara hemat untuk menghasilkan keluaran."], ["Efektivitas", "Tingkat pencapaian tujuan yang ditetapkan."], ["Proses", "Rangkaian kegiatan untuk menghasilkan keluaran."]],
    example: "Gudang sering terlambat mengirim pesanan. Audit operasional dapat memetakan alur pesanan, mengukur waktu proses, mencari hambatan, dan merekomendasikan perbaikan.",
    question: "Ukuran yang paling relevan untuk audit operasional proses pengiriman adalah…", options: [["waktu", "Waktu dari pesanan diterima sampai barang dikirim"], ["warna", "Warna seragam staf"], ["logo", "Ukuran logo gudang"]], correctOption: "waktu",
    trueFalsePrompt: "Audit operasional hanya memeriksa apakah laporan keuangan disajikan wajar.", trueFalseAnswer: false,
    scenario: "Direktur ingin mengetahui mengapa banyak pesanan terlambat walaupun stok tersedia.", decision: "Tujuan audit yang paling tepat adalah…", decisionOptions: [["efektivitas", "Menilai efektivitas dan efisiensi proses pemenuhan pesanan"], ["opini-lk", "Memberi opini atas laporan keuangan"]], correctDecision: "efektivitas",
    reflection: "Proses apa yang menurutmu layak dievaluasi efisiensi dan efektivitasnya?",
  },
  {
    number: "12", slug: "jenis-audit-dan-peran-auditor", title: "Jenis Audit dan Peran Auditor", minutes: 20,
    summary: "Satukan tiga jenis audit dan peran auditor internal maupun eksternal lewat kasus klasifikasi penutup.",
    objective: "Mengklasifikasikan jenis audit dan menjelaskan peran auditor internal serta eksternal.",
    concept: "Audit laporan keuangan berfokus pada kewajaran laporan, audit kepatuhan pada pemenuhan ketentuan, dan audit operasional pada efisiensi serta efektivitas. Auditor internal bekerja untuk membantu organisasi memperbaiki tata kelola dan pengendalian, sedangkan auditor eksternal memberikan penilaian independen sesuai penugasan. Jenis audit tidak ditentukan hanya oleh siapa auditornya, tetapi oleh tujuan dan kriterianya.",
    glossary: [["Auditor internal", "Pemeriksa yang membantu organisasi mengevaluasi dan memperbaiki proses."], ["Auditor eksternal", "Pemeriksa independen dari luar organisasi."], ["Klasifikasi", "Menentukan jenis audit berdasarkan tujuan dan kriteria."]],
    example: "Satu gudang dapat diperiksa dari tiga sudut: kewajaran angka persediaan dalam laporan keuangan, kepatuhan pada prosedur penerimaan barang, atau efisiensi proses penyimpanan. Tujuan pemeriksaan menentukan jenis auditnya.",
    question: "Apa penentu utama untuk mengklasifikasikan jenis audit?", options: [["tujuan", "Tujuan dan kriteria penugasan"], ["jabatan", "Jabatan orang yang bertanya"], ["lokasi", "Lokasi kantor auditor"]], correctOption: "tujuan",
    trueFalsePrompt: "Auditor internal dan auditor eksternal selalu menjalankan tujuan audit yang sama.", trueFalseAnswer: false,
    scenario: "Direktur meminta pemeriksaan untuk mengetahui apakah prosedur penerimaan barang dipatuhi, lalu ingin rekomendasi agar prosesnya lebih cepat.", decision: "Langkah paling tepat adalah…", decisionOptions: [["pisahkan", "Memisahkan tujuan kepatuhan dan operasional, lalu menetapkan kriteria masing-masing"], ["campur", "Menyebut semuanya audit laporan keuangan tanpa membedakan tujuan"]], correctDecision: "pisahkan",
    reflection: "Bagaimana kamu akan menjelaskan perbedaan tiga jenis audit kepada rekan kerja dalam dua kalimat?",
  },
];

function moduleFrom(spec: AuditModuleSpec, index: number): LearningModule {
  const id = `audit-mikro-${spec.number}`;
  const competencyId = `kompetensi-audit-${spec.number}`;
  const introId = `${id}-pahami`;
  const practiceId = `${id}-latihan`;
  const applyId = `${id}-terapkan`;
  const readingId = `${id}-bacaan`;
  const choiceId = `${id}-pilihan`;
  const truthId = `${id}-benar-salah`;
  const decisionId = `${id}-kasus`;
  const reflectionId = `${id}-refleksi`;

  return {
    kind: "plf.module",
    schemaVersion: "1.1.0",
    id,
    revision: 1,
    metadata: {
      title: `${spec.number} · ${spec.title}: Pengantar Audit`,
      summary: spec.summary,
      subject: "Audit dan Asurans",
      level: "beginner",
      estimatedMinutes: spec.minutes,
      tags: ["audit", "pengantar audit", "micro-learning", spec.slug],
      author: "PuspitaCore Belajar",
    },
    experience: { profile: "mixed", navigation: "flexible", allowResume: false },
    prerequisites: {
      moduleIds: index ? [`audit-mikro-${specs[index - 1]!.number}`] : [],
      competencyIds: [],
      notes: index ? "Modul sebelumnya direkomendasikan agar alur konsep tetap utuh." : "Tidak memerlukan pengalaman audit sebelumnya.",
    },
    competencies: [{ id: competencyId, title: spec.objective }],
    learningPolicy: { allowRetry: true, feedbackTiming: "after_submit", hintMode: "guided_only", timerMode: "advisory", allowSkip: true, remediationEnabled: true, solutionsAfterAttempt: true },
    assessment: { passingScore: 75, requireAllRequired: true, attemptPolicy: "best" },
    reportPolicy: { scope: "learning_unit", formats: ["json", "print"], downloadOnCompletion: true, dataLocation: "client_only" },
    references: [sourceReference],
    outline: [{ type: "section", id: `${id}-section`, title: spec.title, children: [{ type: "unit", unitId: `${id}-unit` }] }],
    learningUnits: [{
      id: `${id}-unit`, title: spec.title, learningObjectives: [spec.objective], competencyIds: [competencyId], prerequisiteUnitIds: [], pageIds: [introId, practiceId, applyId],
      worksheets: [
        { id: `${id}-guided`, title: "Latihan terbimbing", mode: "guided", difficulty: "easy", complexityWeight: 1, targetMinutes: { min: 4, max: 6 }, scoreWeight: 1, blockIds: [choiceId, truthId] },
        { id: `${id}-independent`, title: "Penerapan mandiri", mode: "independent", difficulty: "medium", complexityWeight: 2, targetMinutes: { min: 5, max: 7 }, scoreWeight: 2, blockIds: [decisionId] },
      ],
      masteryCriteria: { minimumScore: 75, requiredWorksheetIds: [`${id}-independent`] }, report: { enabled: true },
    }],
    pages: [
      {
        id: introId, title: `Pahami · ${spec.title}`, blocks: [
          { id: readingId, type: "reading", role: "discover", required: true, title: "Mulai dari konsep", competencyIds: [competencyId], markdown: `# ${spec.title}\n\n${spec.concept}\n\n**Target sesi:** ${spec.objective}` },
          { id: `${id}-glosarium`, type: "glossary", role: "understand", required: false, title: "Istilah penting", glossaryItems: spec.glossary.map(([term, definition]) => ({ term, definition })) },
          { id: `${id}-referensi`, type: "reference", role: "understand", required: false, title: "Dasar materi", referenceIds: [sourceReference.id] },
        ],
      },
      {
        id: practiceId, title: `Coba · ${spec.title}`, blocks: [
          { id: `${id}-contoh`, type: "worked_example", role: "observe", required: false, title: "Contoh singkat", steps: [{ title: "Situasi", explanation: spec.example }, { title: "Cara berpikir", explanation: "Tentukan tujuan, informasi atau kegiatan yang diuji, lalu pilih bukti dan kriteria yang sesuai." }] },
          { id: choiceId, type: "single_choice", role: "guided_practice", required: true, title: "Cek pemahaman", competencyIds: [competencyId], prompt: spec.question, options: spec.options.map(([optionId, text]) => ({ id: optionId, text })), hints: ["Kembali ke contoh dan pilih jawaban yang paling langsung menjawab pertanyaan."], remediation: { onIncorrect: { targetBlockId: readingId } }, grading: { correctOptionId: spec.correctOption, points: 10, explanation: "Periksa kembali tujuan pemeriksaan dan konsep utama pada materi." } },
          { id: truthId, type: "true_false", role: "guided_practice", required: true, title: "Benar atau salah", competencyIds: [competencyId], prompt: spec.trueFalsePrompt, grading: { correct: spec.trueFalseAnswer, points: 10, explanation: "Jawaban ini mengikuti batas tujuan audit dan peran pihak-pihak yang terlibat." } },
        ],
      },
      {
        id: applyId, title: `Terapkan · ${spec.title}`, blocks: [
          { id: decisionId, type: "case_decision", role: "independent_practice", required: true, title: "Kasus mini", competencyIds: [competencyId], scenario: spec.scenario, prompt: spec.decision, options: spec.decisionOptions.map(([optionId, text]) => ({ id: optionId, text })), grading: { optionScores: Object.fromEntries(spec.decisionOptions.map(([optionId]) => [optionId, optionId === spec.correctDecision ? 1 : 0])), points: 20, explanation: "Pilih tindakan yang selaras dengan tujuan penugasan dan bukti yang dibutuhkan." } },
          { id: `${id}-catatan`, type: "callout", role: "deep_dive", required: false, variant: "note", title: "Ingat", content: "Hasil audit membantu pengguna menilai informasi atau proses. Hasil tersebut bukan jaminan bahwa semua risiko hilang." },
          { id: reflectionId, type: "reflection", role: "reflect", required: true, reviewMode: "self", title: "Refleksi", competencyIds: [competencyId], prompt: spec.reflection, rubric: ["Menghubungkan konsep dengan situasi nyata", "Menjelaskan alasan secara singkat"] },
        ],
      },
    ],
  };
}

export const auditMicroModules = specs.map(moduleFrom);
export const auditMicroModulesBySlug = Object.fromEntries(
  specs.map((spec, index) => [spec.slug, auditMicroModules[index]!]),
);
