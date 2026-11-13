import data from "../ukp-c/pajak-internasional.json";
import type { UkpModuleSpec } from "../ukp-c-builder";

export const pajakInternasionalSpec: UkpModuleSpec = {
  number: 4,
  slug: "pajak-internasional",
  title: "Pajak Internasional",
  summary: "40 soal latihan UKP Tingkat C: subjek dan BUT, P3B, metode penghindaran pajak berganda, anti-avoidance, transfer pricing, MAP/APA, dan pertukaran informasi.",
  minutes: 90,
  questions: data,
  intro: "# Pajak Internasional\n\nMata uji ini mencakup **pengertian dan ruang lingkup pajak internasional, P3B, metode penghindaran pajak berganda, anti-avoidance (CFC, thin capitalization, transfer pricing), dokumentasi TP, MAP dan APA, serta pertukaran informasi**.\n\nBanyak konsep di sini adalah istilah. Gunakan tabel di tiap bagian untuk menghafal perbedaannya, lalu uji dengan soal.",
  summaries: {
    "Pengertian": {
      title: "Apa itu pajak internasional",
      markdown: "Pajak internasional adalah gabungan **ketentuan domestik yang mengatur unsur asing** dan **ketentuan perjanjian antarnegara** (P3B, MLI). Tidak ada otoritas pajak supranasional. WP dalam negeri dipajaki atas **penghasilan dari mana saja** (world-wide income); WP luar negeri menurut **asas sumber**.",
    },
    "Ruang lingkup": {
      title: "Subjek pajak, BUT, dan PPh 26",
      markdown: "WNA ber-keahlian tertentu yang menjadi subjek pajak dalam negeri dipajaki hanya atas penghasilan dari Indonesia selama **4 tahun pajak**. WNI dapat menjadi subjek pajak luar negeri bila berada di Indonesia tidak lebih dari 183 hari dalam 12 bulan dan memenuhi syarat tertentu. Dividen luar negeri dikecualikan bila diinvestasikan di Indonesia paling sedikit **30%** dari laba setelah pajak. Tarif PPh 26 atas WPLN tanpa BUT adalah **20% atau tarif P3B**. Tarif P3B bisa dipakai bila ada DGT Form dan penerima adalah *beneficial owner*.",
      table: { title: "Jenis BUT", columns: ["Jenis", "Contoh"], rows: [["Fixed place / asset-type PE", "Kantor cabang, pabrik, bengkel"], ["Activity-type / service PE", "Proyek konstruksi; jasa lebih dari 60 hari dalam 12 bulan (UU PPh)"], ["Dependent agent PE", "Agen tidak bebas yang berwenang menutup kontrak"], ["Insurance PE", "Penerimaan premi atau penanggungan risiko di Indonesia"]] },
    },
    "P3B": {
      title: "P3B: pembagian hak pemajakan",
      markdown: "P3B membagi hak pemajakan antara negara domisili dan negara sumber. **Laba usaha** hanya dipajaki di negara domisili kecuali ada BUT. **Dividen, bunga, dan royalti** adalah hak pemajakan terbatas dengan tarif maksimum. Tie breaker untuk OP residen ganda: **tempat tinggal tetap → pusat kepentingan vital → tempat biasa tinggal → kewarganegaraan → persetujuan bersama**. Kegiatan preparatory/auxiliary (penyimpanan, pameran, pengiriman) tidak menimbulkan BUT. Pasal non-discrimination melarang perlakuan lebih memberatkan bagi warga negara atau perusahaan negara mitra.",
    },
    "Metode P3B": {
      title: "Menghilangkan pajak berganda",
      markdown: "Indonesia memakai **ordinary credit dengan batasan per negara** (Pasal 24 UU PPh): kredit tidak melebihi PPh terutang di Indonesia atas penghasilan dari negara itu. **Exemption with progression** membebaskan penghasilan luar negeri tetapi memperhitungkannya untuk menentukan tarif atas penghasilan lainnya.",
    },
    "Anti-avoidance": {
      title: "CFC, thin capitalization, transfer pricing, dan treaty shopping",
      markdown: "**CFC:** berlaku bila WP DN menguasai paling rendah 50% saham dari badan luar negeri nonbursa. **Thin cap:** DER maksimum 4:1; biaya pinjaman yang dapat dibebankan = (4 × ekuitas / utang) × biaya bunga. **Hubungan istimewa:** penyertaan modal paling rendah 25%. **Transfer pricing (PMK 172/2023):** pilih metode yang paling sesuai (most appropriate method). **Treaty shopping:** penyalahgunaan P3B lewat entitas conduit; penangkalnya uji beneficial owner, LOB, dan principal purpose test.",
    },
    "TP Docs": {
      title: "Dokumentasi transfer pricing",
      markdown: "Dokumen Induk dan Dokumen Lokal wajib bila peredaran bruto tahun sebelumnya **di atas Rp50 miliar**, atau transaksi afiliasi melewati batas tertentu, atau bertransaksi dengan afiliasi di yurisdiksi bertarif rendah. Dokumen harus tersedia **4 bulan** setelah akhir tahun pajak dan disampaikan dalam **1 bulan** sejak diminta DJP.",
      table: { title: "Dokumen TP (PMK 172/2023)", columns: ["Dokumen", "Ketentuan"], rows: [["Dokumen Induk dan Lokal", "Tersedia 4 bulan setelah akhir tahun pajak"], ["Batas peredaran bruto", "Lebih dari Rp50 miliar"], ["Laporan per negara (CbCR)", "Peredaran konsolidasi paling sedikit Rp11 triliun"], ["Penyampaian CbCR", "Paling lama 12 bulan setelah akhir tahun pajak"]] },
    },
    "MAP & APA": {
      title: "Penyelesaian sengketa dan kepastian harga transfer",
      markdown: "**MAP** diajukan bila ada tindakan otoritas pajak negara mitra yang menimbulkan pajak tidak sesuai P3B, umumnya dalam 3 tahun. **APA** berlaku paling lama **5 tahun pajak** dan dapat di-*roll back*. APA unilateral disepakati WP dan DJP; APA bilateral antara DJP dan otoritas negara mitra melalui MAP.",
    },
    "EoI & AiC": {
      title: "Pertukaran informasi dan bantuan penagihan",
      markdown: "Pelaporan domestik rekening keuangan OP: saldo agregat paling sedikit **Rp1 miliar**. **EoI on request** untuk kasus tertentu; **AEoI** periodik tanpa permintaan. **GIR** terkait pajak minimum global (15%) untuk grup PMN beromzet minimal EUR 750 juta dalam 2 dari 4 tahun sebelumnya. **Bantuan penagihan** memungkinkan negara meminta negara mitra menagih utang pajak WP.",
    },
  },
  review: {
    table: { title: "Rangkuman pajak internasional", columns: ["Hal", "Ketentuan"], rows: [["PPh 26 WPLN tanpa BUT", "20% atau tarif P3B"], ["BUT jasa (UU PPh)", "Lebih dari 60 hari dalam 12 bulan"], ["CFC", "Kepemilikan paling rendah 50%"], ["Hubungan istimewa", "Penyertaan modal paling rendah 25%"], ["Thin cap DER", "4 : 1"], ["APA", "Maksimal 5 tahun pajak"], ["CbCR", "Peredaran konsolidasi ≥ Rp11 triliun"]] },
    pairs: [["Kantor cabang atau pabrik di Indonesia", "Fixed place PE"], ["Agen tidak bebas yang menutup kontrak", "Dependent agent PE"], ["Pajak LN dikreditkan sampai batas per negara", "Ordinary credit"], ["Penghasilan LN dibebaskan tetapi dihitung untuk tarif", "Exemption with progression"], ["APA antara WP dan DJP saja", "APA unilateral"], ["Informasi dipertukarkan karena permintaan kasus tertentu", "EoI on request"]],
  },
};
