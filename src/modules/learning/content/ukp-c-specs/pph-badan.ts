import data from "../ukp-c/pph-badan.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const pphBadanSpec: UkpModuleSpec = {
  number: 6,
  slug: "pph-badan",
  title: "PPh Badan",
  summary: "40 soal latihan UKP Tingkat C: objek, biaya, tarif dan fasilitas, BUT, penyusutan, kompensasi kerugian, kredit pajak luar negeri, dan PPh 25.",
  minutes: 90,
  questions: data,
  intro: "# PPh Badan\n\nMata uji ini mencakup **PPh badan dalam negeri dan transaksi internasional**: objek dan pengecualian, biaya, tarif dan fasilitas Pasal 31E, BUT, penyusutan, kompensasi kerugian, kredit pajak luar negeri, dan angsuran PPh 25.\n\nSoal hitungan dijawab dengan mengetik angka. Angka pada soal bersifat ilustratif.",
  summaries: {
    "DN - Objek dan pengecualian": {
      title: "Objek PPh badan dan yang dikecualikan",
      markdown: "Keuntungan karena pembebasan utang dan keuntungan pengalihan harta adalah objek PPh. **Dikecualikan:** setoran modal, dividen DN yang diterima WP badan DN (tanpa syarat kepemilikan minimal), bagian laba anggota persekutuan/firma/CV, dan iuran dana pensiun yang disahkan OJK.",
    },
    "DN - Biaya yang dikurangkan": {
      title: "Biaya yang boleh dan tidak boleh dikurangkan",
      markdown: "Pajak Penghasilan tidak boleh dikurangkan. Biaya untuk kepentingan pribadi pemegang saham tidak boleh dikurangkan dan dapat dianggap dividen terselubung. Sumbangan tertentu (PP 93/2010) paling tinggi **5%** dari penghasilan neto fiskal tahun sebelumnya.",
      table: { title: "Fasilitas pengurangan penghasilan bruto", columns: ["Fasilitas", "Pengurangan paling tinggi"], rows: [["Vokasi (praktik kerja/pemagangan)", "200% dari biaya"], ["Litbang tertentu", "300% dari biaya"], ["Sumbangan PP 93/2010", "5% dari penghasilan neto fiskal tahun sebelumnya"]] },
    },
    "DN - Tarif dan fasilitas Pasal 31E": {
      title: "Fasilitas Pasal 31E",
      markdown: "WP badan DN dengan peredaran bruto **sampai Rp50 miliar** memperoleh pengurangan tarif **50%** atas PKP dari bagian peredaran bruto sampai **Rp4,8 miliar**. Bila peredaran bruto di atas Rp4,8 miliar, bagian PKP yang mendapat fasilitas = (Rp4,8 M / peredaran bruto) × PKP. Bila peredaran bruto sampai Rp4,8 miliar, seluruh PKP mendapat fasilitas.",
    },
    "TI - Subjek dan kewajiban subjektif": {
      title: "BUT dan subjek pajak luar negeri",
      markdown: "BUT dipersamakan dengan subjek pajak badan. Badan asing yang menerima penghasilan dari Indonesia tanpa BUT adalah subjek pajak luar negeri, dipajaki lewat **PPh 26**. Kewajiban subjektif SPLN dengan BUT dimulai saat menjalankan usaha melalui BUT; tanpa BUT dimulai saat menerima penghasilan dari Indonesia. Organisasi internasional tertentu dikecualikan sebagai subjek pajak.",
    },
    "TI - Penghasilan dan biaya BUT": {
      title: "Penghasilan dan biaya BUT",
      markdown: "**Force of attraction** (Pasal 5 ayat 1 huruf b): penjualan oleh kantor pusat yang sejenis dengan yang dilakukan BUT dianggap penghasilan BUT. Royalti, imbalan manajemen, dan bunga antara BUT dan kantor pusat **tidak diperhitungkan** sebagai biaya maupun penghasilan BUT (bunga usaha perbankan dikecualikan). Biaya administrasi kantor pusat yang berkaitan dengan BUT boleh dibebankan. Sewa bangunan oleh BUT dikenai PPh final 10%; bunga deposito 20%.",
      table: { title: "Branch profit tax", columns: ["Langkah", "Contoh PKP Rp2 miliar"], rows: [["PPh Badan 22%", "440 juta"], ["PKP setelah pajak", "1.560 juta"], ["PPh 26 ayat (4) 20% (tanpa P3B)", "312 juta"], ["Total", "752 juta"]] },
    },
    "TI - Harga perolehan, hubungan istimewa, dan penyusutan": {
      title: "Harga perolehan, afiliasi, dan penyusutan",
      markdown: "Harga perolehan/penjualan dalam tukar-menukar dan inbreng dinilai berdasarkan **harga pasar**. DJP berwenang menentukan kembali penghasilan dan pengurangan atas transaksi afiliasi sesuai prinsip kewajaran dan kelaziman usaha. Biaya pendirian dan perluasan modal dibebankan pada tahun pengeluaran atau diamortisasi.",
      table: { title: "Penyusutan fiskal harta berwujud bukan bangunan (Pasal 11)", columns: ["Kelompok", "Masa manfaat", "Garis lurus", "Saldo menurun"], rows: [["I", "4 tahun", "25%", "50%"], ["II", "8 tahun", "12,5%", "25%"], ["III", "16 tahun", "6,25%", "12,5%"], ["IV", "20 tahun", "5%", "10%"]] },
    },
    "TI - Kompensasi, tarif, kredit pajak, dan SPT": {
      title: "Kompensasi kerugian, tarif, PPh 24, PPh 25, dan SPT",
      markdown: "**Kompensasi kerugian** berurutan paling lama **5 tahun** (fasilitas tertentu dapat 10 tahun). **Tarif** WP badan DN dan BUT adalah **22%**; perseroan terbuka dengan saham beredar minimal 40% dapat memperoleh tarif 3 poin lebih rendah. **Kredit PPh 24** dibatasi per negara: batas = (penghasilan dari negara itu / PKP) × PPh terutang, kredit adalah yang terendah antara pajak luar negeri dan batas itu. **PPh 25 bulanan** = (PPh terutang tahun lalu − kredit PPh 21, 22, 23, dan 24) / 12. **SPT Tahunan Badan:** 4 bulan setelah akhir tahun pajak, dapat diperpanjang 2 bulan dengan pemberitahuan.",
    },
  },
  review: {
    table: { title: "Rangkuman PPh Badan", columns: ["Hal", "Ketentuan"], rows: [["Tarif WP badan DN dan BUT", "22%"], ["Kompensasi kerugian", "Maksimal 5 tahun"], ["Fasilitas Pasal 31E", "Peredaran sampai Rp50 miliar; diskon 50% untuk bagian sampai Rp4,8 miliar"], ["Branch profit tax", "20% atau tarif P3B atas PKP setelah pajak"], ["Sewa bangunan oleh BUT", "PPh final 10%"], ["SPT Tahunan Badan", "4 bulan + perpanjangan 2 bulan"]] },
    pairs: [["Dividen DN diterima WP badan DN", "Dikecualikan dari objek PPh"], ["Pembebasan utang", "Objek PPh"], ["Jasa manajemen BUT kepada kantor pusat", "Tidak boleh dikurangkan"], ["Tukar menukar harta", "Dinilai dengan harga pasar"], ["Vokasi (praktik kerja/pemagangan)", "Pengurangan sampai 200%"], ["Litbang tertentu", "Pengurangan sampai 300%"]],
  },
};
