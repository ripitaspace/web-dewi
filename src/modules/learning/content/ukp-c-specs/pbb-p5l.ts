import data from "../ukp-c/pbb-p5l.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const pbbP5lSpec: UkpModuleSpec = {
  number: 5,
  slug: "pbb-p5l",
  title: "PBB-P5L",
  summary: "40 soal latihan UKP Tingkat C: subjek dan objek PBB-P5L, pengenaan dan penghitungan, sanksi, serta upaya hukum non-keberatan.",
  minutes: 75,
  questions: data,
  intro: "# PBB-P5L\n\nMata uji ini mencakup **PBB sektor perkebunan, perhutanan, pertambangan, dan sektor lainnya**: subjek dan objek, cara menghitung PBB terutang, sanksi, serta upaya hukum non-keberatan.\n\nSoal hitungan memakai rumus **PBB = 0,5% × NJKP**, dengan NJKP persentase tertentu dari NJOP setelah NJOPTKP. Hitungan dijawab dengan mengetik angka. Beberapa ketentuan teknis dapat berubah melalui peraturan pelaksanaan; periksa peraturan terbaru.",
  summaries: {
    "Subjek & objek": {
      title: "Subjek pajak, objek, dan yang dikecualikan",
      markdown: "Subjek pajak adalah orang atau badan yang **secara nyata** mempunyai hak atas bumi, memperoleh manfaat dari bumi, atau memiliki/menguasai bangunan. PBB-P5L meliputi perkebunan, perhutanan, pertambangan (migas, panas bumi, minerba), dan sektor lainnya (misalnya jaringan pipa, kabel, jalan tol, perikanan). **PBB perdesaan dan perkotaan** adalah pajak daerah. Saat yang menentukan pajak terutang: **keadaan objek pada 1 Januari**. SPOP diisi dan dikembalikan paling lambat **30 hari** sejak diterima.",
      table: { title: "Tidak dikenakan PBB (Pasal 3 UU PBB)", columns: ["Objek", "Syarat"], rows: [["Ibadah, sosial, kesehatan, pendidikan, kebudayaan nasional", "Semata-mata untuk kepentingan umum, tidak untuk memperoleh keuntungan"], ["Hutan lindung, hutan suaka alam, hutan wisata, taman nasional", "Tidak dikenakan"], ["Tanah negara yang belum dibebani hak", "Tidak dikenakan"], ["Perwakilan diplomatik/konsulat", "Asas timbal balik"]] },
    },
    "Pengenaan": {
      title: "Menghitung PBB terutang dan sanksinya",
      markdown: "**Rumus:** PBB = 0,5% × NJKP, dengan NJKP = persentase × (NJOP − NJOPTKP). NJOPTKP setinggi-tingginya **Rp12.000.000** per WP. NJOP ditetapkan setiap 3 tahun. SPPT dilunasi paling lambat **6 bulan** sejak diterima. **Denda keterlambatan 2% per bulan**, maksimal 24 bulan, bagian bulan dihitung penuh. SKP karena SPOP tidak disampaikan atau pemeriksaan: pokok ditambah denda **25%**.",
      table: { title: "NJKP dan tarif efektif", columns: ["Objek", "NJKP", "Tarif efektif"], rows: [["Perkebunan dan perhutanan", "40%", "0,2%"], ["Objek lain, NJOP ≥ Rp1 miliar", "40%", "0,2%"], ["Objek lain, NJOP < Rp1 miliar", "20%", "0,1%"]] },
    },
    "Upaya non-keberatan": {
      title: "Pengurangan, pembetulan, dan pembatalan",
      markdown: "Upaya non-keberatan: pembetulan, pengurangan PBB, pengurangan/penghapusan denda, dan pembatalan SPPT/SKP/STP yang tidak benar. **Banding bukan upaya non-keberatan.** Keberatan diajukan dalam **3 bulan** sejak SPPT diterima. Denda 30% keberatan tidak berlaku untuk PBB (PMK 118/2024).",
      table: { title: "Pengurangan PBB (PMK 129/2023)", columns: ["Sebab", "Paling tinggi", "Catatan"], rows: [["Kondisi tertentu (kerugian komersial dan kesulitan likuiditas 2 tahun berturut-turut)", "75%", "Diajukan 3 bulan sejak SPPT diterima"], ["Bencana alam atau sebab luar biasa", "100%", "Dapat secara jabatan bila ada penetapan status bencana"], ["SPPT ganda atau salah", "Pembatalan", "Bukan pengurangan"], ["Kesalahan tulis di SPPT", "Pembetulan", "Tanpa keberatan"]] },
    },
  },
  review: {
    table: { title: "Rangkuman PBB-P5L", columns: ["Hal", "Ketentuan"], rows: [["Tarif", "0,5% dari NJKP"], ["NJOPTKP", "Paling tinggi Rp12.000.000"], ["Denda keterlambatan", "2% per bulan, maksimal 24 bulan"], ["Denda SKP (SPOP tidak disampaikan)", "25% dari pokok"], ["Jatuh tempo SPPT", "6 bulan sejak diterima"], ["Keberatan", "3 bulan sejak SPPT diterima"]] },
    pairs: [["Perkebunan dan perhutanan", "NJKP 40%"], ["Objek lain dengan NJOP di bawah Rp1 miliar", "NJKP 20%"], ["Bencana alam atau sebab luar biasa", "Pengurangan sampai 100%"], ["Kondisi tertentu (kerugian dan likuiditas)", "Pengurangan sampai 75%"], ["SPPT ganda untuk satu objek", "Permohonan pembatalan"], ["Kesalahan ketik luas areal pada SPPT", "Permohonan pembetulan"]],
  },
};
