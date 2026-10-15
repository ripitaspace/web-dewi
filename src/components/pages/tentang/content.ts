export const questionGroups = [
  { title: "Pekerjaan", items: ["Mengapa pekerjaan bertambah tetapi kebingungan tidak berkurang?", "Mengapa pekerjaan yang sama dilakukan berulang kali?", "Mengapa prosedur dipertahankan hanya karena kebiasaan?"] },
  { title: "Informasi", items: ["Mengapa organisasi memiliki banyak data tetapi sulit memahami bisnisnya?", "Mengapa laporan tersedia tetapi keputusan belum tentu dipahami?", "Kapan data benar-benar menjadi informasi?"] },
  { title: "Teknologi", items: ["Mengapa manusia harus mengikuti cara berpikir software?", "Bisakah sistem memahami bagaimana manusia bekerja?", "Bisakah pekerjaan profesional menjadi sederhana tanpa kehilangan kedalaman?"] },
] as const;

export const timeline = [
  ["Accounting", "Melihat Jejak", "Transaksi, bukti, laporan, kontrol, risiko."],
  ["Professional Practice", "Melihat Konteks", "Angka adalah hasil dari keputusan dan tindakan manusia."],
  ["Business Process", "Melihat Pola", "Memahami bagaimana pekerjaan benar-benar terjadi dan di mana masalah bermula."],
  ["Technology", "Membentuk Logika", "Menerjemahkan proses menjadi workflow, database, dan automation."],
  ["Product Building", "Membuatnya Bisa Digunakan", "Mengubah logika menjadi tools dan produk untuk orang lain."],
] as const;

export const values = [
  ["Contextual Intelligence", "Memahami situasi yang tidak selalu hitam putih."],
  ["Adaptability", "Beradaptasi dengan perubahan, keterbatasan, dan kondisi yang belum ideal."],
  ["Human Connection", "Mengingat bahwa teknologi pada akhirnya digunakan oleh manusia."],
  ["Resourcefulness", "Membangun sesuatu yang berguna dengan memahami kebutuhan dan sumber daya secara cerdas."],
  ["Independent Thinking", "Berani memahami, mempertanyakan, merancang, dan membangun."],
] as const;

export const transformation = [
  ["Experience", "Apa yang dialami dan dikerjakan."],
  ["Knowledge", "Apa yang dipahami dari pengalaman."],
  ["Logic", "Pola yang dapat dijelaskan."],
  ["System", "Cara kerja yang dapat diulang."],
  ["Product", "Sistem yang dapat digunakan orang lain."],
  ["Ecosystem", "Produk dan pengetahuan yang saling menguatkan."],
] as const;
