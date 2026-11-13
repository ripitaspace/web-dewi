import data from "../ukp-c/pph-orang-pribadi.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const pphOrangPribadiSpec: UkpModuleSpec = {
  number: 7,
  slug: "pph-orang-pribadi",
  title: "PPh Orang Pribadi",
  summary: "40 soal latihan UKP Tingkat C: PTKP, tarif progresif Pasal 17, penghitungan pegawai, norma, PPh keluarga (PH/MT/HB), dan penghasilan final.",
  minutes: 90,
  questions: data,
  choiceOnly: [1, 21],
  intro: "# PPh Orang Pribadi\n\nMata uji ini mencakup **PTKP, tarif progresif Pasal 17, penghitungan PPh pegawai, norma penghitungan, PPh keluarga (PH, MT, HB), dan penghasilan yang dikenai PPh final**.\n\nSebagian besar soal adalah hitungan berantai, jadi ketik angka dan periksa langkahnya di pembahasan. Angka ilustratif; tarif dan batas mengikuti ketentuan per Oktober 2026.",
  summaries: {
    "PTKP": {
      title: "PTKP: status dan tanggungan",
      markdown: "PTKP ditentukan menurut **keadaan awal tahun pajak (1 Januari)**. Tanggungan dihitung maksimal **3 orang**, yaitu keluarga sedarah atau semenda dalam garis keturunan lurus satu derajat (mertua, anak tiri termasuk) serta anak angkat. Garis menyamping (adik, kakak) tidak dihitung. Pegawai wanita kawin hanya mendapat PTKP diri sendiri kecuali ada keterangan tertulis bahwa suami tidak berpenghasilan. Warisan belum terbagi tidak mendapat PTKP.",
      table: { title: "Komponen PTKP (setahun)", columns: ["Komponen", "Jumlah"], rows: [["Diri Wajib Pajak", "Rp54.000.000"], ["Tambahan status kawin", "Rp4.500.000"], ["Istri yang penghasilannya digabung", "Rp54.000.000"], ["Setiap tanggungan (maksimal 3)", "Rp4.500.000"]] },
    },
    "Tarif": {
      title: "Tarif progresif Pasal 17 ayat (1) huruf a",
      markdown: "PKP dibulatkan ke bawah dalam ribuan rupiah penuh sebelum diterapkan tarif. Lapisan 35% hanya berlaku untuk PKP **di atas** Rp5 miliar.",
      table: { title: "Lapisan tarif orang pribadi", columns: ["Lapisan PKP", "Tarif"], rows: [["Sampai Rp60 juta", "5%"], ["Di atas Rp60 juta sampai Rp250 juta", "15%"], ["Di atas Rp250 juta sampai Rp500 juta", "25%"], ["Di atas Rp500 juta sampai Rp5 miliar", "30%"], ["Di atas Rp5 miliar", "35%"]] },
    },
    "Penghitungan - pegawai": {
      title: "PPh pegawai tetap dan pensiunan",
      markdown: "Pengurang penghasilan bruto pegawai: **biaya jabatan 5% dengan maksimal Rp6.000.000 setahun**, iuran pensiun/JHT yang dibayar pegawai, serta zakat atau sumbangan keagamaan wajib melalui pemberi kerja. Pensiunan: biaya pensiun 5% dengan maksimal Rp2.400.000 setahun. Alur: bruto − pengurang = neto; neto − PTKP = PKP; PKP × tarif Pasal 17.",
    },
    "Penghitungan - norma": {
      title: "Norma penghitungan dan PPh final PP 55/2022",
      markdown: "WP OP dengan peredaran bruto **kurang dari Rp4,8 miliar** dapat memakai norma penghitungan penghasilan neto bila memberitahukan DJP dalam **3 bulan pertama** tahun pajak dan menyelenggarakan pencatatan. Pekerjaan bebas (misalnya dokter) tidak dapat memakai PPh final 0,5% PP 55/2022. Pada PPh final 0,5%, peredaran bruto sampai **Rp500 juta setahun tidak dikenai pajak**.",
    },
    "Penghitungan - keluarga": {
      title: "Penghasilan suami istri dan anak",
      markdown: "Penghasilan anak yang belum dewasa digabung dengan orang tua. Penghasilan istri dari satu pemberi kerja yang telah dipotong PPh 21 dan tidak berhubungan dengan usaha keluarga tidak digabung dengan suami.",
      table: { title: "Status perpajakan keluarga", columns: ["Status", "Perlakuan"], rows: [["Kawin biasa (K)", "Penghasilan digabung, PPh dihitung atas neto gabungan"], ["Pisah harta (PH)", "PPh gabungan dibagi sebanding neto masing-masing"], ["Istri menjalankan hak dan kewajiban sendiri (MT)", "PPh gabungan dibagi sebanding neto masing-masing"], ["Hidup berpisah berdasarkan putusan hakim (HB)", "Dikenai pajak secara terpisah, PTKP masing-masing"]] },
    },
    "Penghitungan - lain": {
      title: "Penghasilan final dan kondisi khusus",
      markdown: "Dividen yang tidak diinvestasikan dikenai PPh final 10% dan bunga deposito 20%, sehingga **tidak digabung** dengan penghasilan yang dikenai tarif Pasal 17. Bila penghasilan neto sama dengan PTKP, PKP dan PPh terutang nihil.",
    },
  },
  review: {
    table: { title: "Rangkuman PPh Orang Pribadi", columns: ["Hal", "Ketentuan"], rows: [["PTKP diri sendiri", "Rp54.000.000"], ["Maksimal tanggungan", "3 orang"], ["Biaya jabatan", "5%, maksimal Rp6.000.000 setahun"], ["Lapisan tertinggi", "35% di atas Rp5 miliar"], ["Syarat norma", "Peredaran kurang dari Rp4,8 miliar dan pemberitahuan 3 bulan"], ["Bagian peredaran tidak dikenai PPh final 0,5%", "Rp500 juta"]] },
    pairs: [["Status K/3", "PTKP Rp72.000.000"], ["Status TK/1", "PTKP Rp58.500.000"], ["PKP sampai Rp60 juta", "Tarif 5%"], ["PKP di atas Rp5 miliar", "Tarif 35%"], ["Pasangan pisah harta (PH)", "PPh gabungan dibagi menurut neto masing-masing"], ["Dividen tidak diinvestasikan kembali", "PPh final 10%"]],
  },
};
