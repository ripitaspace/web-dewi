import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Kebijakan Privasi RIPITA Coretax Downloader",
  description: "Kebijakan privasi extension Chrome RIPITA Coretax Downloader: tidak ada data yang dikumpulkan, disimpan, atau dikirim ke luar browser.",
  path: "/privasi",
});

export default function PrivasiPage() {
  return (
    <>
      <SiteHeader currentKey="karya" />
      <main id="main-content" className="container" style={{ maxWidth: 760, paddingBlock: "72px" }}>
        <h1>Kebijakan Privasi RIPITA Coretax Downloader</h1>
        <p>Terakhir diperbarui: 12 November 2026</p>

        <h2>Ringkasan</h2>
        <p>
          RIPITA Coretax Downloader tidak mengumpulkan, menyimpan, menjual, atau mengirim data
          pengguna ke server mana pun. Seluruh proses berjalan di dalam browser kamu.
        </p>

        <h2>Apa yang dilakukan extension</h2>
        <p>
          Extension membaca tabel Coretax pada halaman yang sedang kamu buka (nomor faktur atau nomor
          pemotongan dan tombol unduh), lalu mengklik tombol unduh yang sudah ada di halaman tersebut
          satu per satu. Informasi yang dibaca hanya dipakai sementara di memori browser untuk
          mencocokkan baris tabel dan hilang saat halaman ditutup atau dimuat ulang.
        </p>

        <h2>Data yang tidak kami kumpulkan</h2>
        <ul>
          <li>Tidak membaca atau menyimpan kata sandi dan kredensial login.</li>
          <li>Tidak mengirim isi faktur, bukti potong, NPWP, atau data lain ke pihak mana pun.</li>
          <li>Tidak memakai analitik, pelacak, atau iklan.</li>
          <li>Tidak memuat atau menjalankan kode dari server jarak jauh.</li>
        </ul>

        <h2>Izin yang digunakan</h2>
        <p>
          Extension hanya berjalan pada halaman Coretax di domain pajak.go.id. Akses ini diperlukan
          untuk membaca tabel dan mengklik tombol unduh di halaman aktif. File hasil unduhan disimpan
          oleh browser kamu, bukan oleh kami.
        </p>

        <h2>Perubahan kebijakan</h2>
        <p>
          Jika suatu saat extension menambah fitur yang memengaruhi data pengguna, kebijakan ini akan
          diperbarui terlebih dahulu dan tanggal pembaruan di atas akan berubah.
        </p>

        <h2>Kontak</h2>
        <p>
          Pertanyaan tentang kebijakan ini dapat disampaikan melalui halaman{" "}
          <a href="/kerja-bersama">Kerja Bersama</a> di website PuspitaCore.
        </p>

        <p>
          Extension ini dibuat oleh PuspitaCore dan bukan produk resmi atau afiliasi Direktorat
          Jenderal Pajak.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
