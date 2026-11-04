import Link from "next/link";
import Image from "next/image";

type SptKind = "op" | "badan";

const content = {
  op: {
    title: "SPT Orang Pribadi",
    description: "Mulai dari data penghasilan sampai dokumen pendukung, siapkan pelaporan SPT Tahunan orang pribadi dengan urutan yang lebih tenang.",
    image: "/images/artworks/tool-spt-orang-pribadi.png",
    imageAlt: "Ilustrasi dokumen SPT orang pribadi",
    checklist: [
      "Kumpulkan bukti potong, rekap penghasilan, serta data pajak yang telah dibayar selama tahun pajak.",
      "Siapkan daftar harta, utang, dan tanggungan keluarga sesuai kondisi pada akhir tahun.",
      "Periksa kembali identitas, NPWP atau NIK, dan kontak aktif sebelum mengisi kanal pelaporan resmi.",
    ],
  },
  badan: {
    title: "SPT Badan",
    description: "Rapikan dokumen dan data perusahaan sebelum memasuki proses pelaporan SPT Tahunan badan usaha.",
    image: "/images/artworks/tool-spt-badan.png",
    imageAlt: "Ilustrasi dokumen SPT badan usaha",
    checklist: [
      "Siapkan laporan keuangan, rekonsiliasi fiskal, dan dokumen pendukung transaksi selama tahun pajak.",
      "Pastikan identitas badan, pengurus, serta data pemotongan dan pemungutan pajak telah diperbarui.",
      "Tinjau kembali kewajiban pajak dan lampiran yang relevan sebelum mengisi kanal pelaporan resmi.",
    ],
  },
} as const;

export function SptInfo({ kind }: { kind: SptKind }) {
  const guide = content[kind];

  return (
    <div className="tool-placeholder card">
      <div className="tax-tool-icon" aria-hidden="true">
        <Image src={guide.image} alt="" width={72} height={72} />
      </div>
      <div>
        <span className="topic-pill">PANDUAN PERSIAPAN</span>
        <h2>Siapkan {guide.title} dengan lebih rapi.</h2>
        <p>{guide.description}</p>
        <h3 style={{ margin: "24px 0 10px", fontSize: "1.1rem" }}>Yang perlu disiapkan</h3>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "rgba(30, 27, 24, .7)", lineHeight: 1.75 }}>
          {guide.checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p style={{ marginTop: "24px" }}><strong>Catatan:</strong> halaman ini membantu persiapan dokumen, bukan kanal pengisian atau pengiriman SPT resmi.</p>
        <Link href="/karya" className="btn btn-primary btn-small" style={{ marginTop: "8px" }}>← Kembali ke Karya</Link>
      </div>
    </div>
  );
}
