import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const output = fileURLToPath(new URL("../public/tools/payroll/RIPITAX_PAYROLL.xlsx", import.meta.url));
const headers = [
  "ID Transaksi", "ID Penerima", "Nama Penerima", "NIK / NPWP / TIN", "Jenis Penerima", "Subjek Pajak", "PTKP", "Sektor", "Bulan", "Status Masa", "Mulai Kerja", "Akhir Kerja",
  "Gaji / Pensiun", "Tunjangan", "Lembur", "THR", "Bonus", "Honorarium / Jasa", "JKK/JKM Perusahaan", "Natura Kena Pajak", "Tunjangan PPh", "Iuran Pensiun/JHT", "BPJS Potongan Lain", "Zakat Wajib", "Potongan Lain",
  "Metode Pajak", "Fasilitas Pajak", "Kode Objek", "Tanggal Potong", "Jenis Dokumen", "Nomor Dokumen", "Tanggal Dokumen", "ID TKU Penerima", "Negara Penerima", "Jabatan", "NIP / NRP", "Nomor SKD", "Catatan",
];
const groups = [["01  IDENTITAS", "A10:D10"], ["02  KATEGORI & PERIODE", "E10:L10"], ["03  PENGHASILAN", "M10:U10"], ["04  POTONGAN", "V10:Y10"], ["05  PENGATURAN PAJAK", "Z10:AB10"], ["06  DOKUMEN", "AC10:AF10"], ["07  KOLOM OPSIONAL", "AG10:AK10"], ["08  CATATAN", "AL10:AL10"]];
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("PAYROLL");
sheet.showGridLines = false;
sheet.tabColor = "#18364C";
sheet.mergeCells("A1:AL2");
sheet.getRange("A1").values = [["RIPITAX PAYROLL"]];
sheet.getRange("A1:AL2").format = { fill: "#18364C", font: { name: "Arial", size: 16, bold: true, color: "#FFFFFF" }, horizontalAlignment: "left", verticalAlignment: "center" };
sheet.mergeCells("A3:AL3");
sheet.getRange("A3").values = [["Template payroll · isi sel kuning, lalu unggah ke RIPITAX. Data diproses di perangkatmu."]];
sheet.getRange("A3:AL3").format = { fill: "#F4E8D8", font: { name: "Arial", size: 10, italic: true, color: "#59483D" }, verticalAlignment: "center" };
const metadata = [["NAMA PERUSAHAAN", ""], ["NPWP PEMOTONG", ""], ["ID TKU PEMOTONG", ""], ["TAHUN", new Date().getFullYear()], ["BULAN DEFAULT", ""], ["TGL POTONG", null]];
const positions = [["A5:B5", "C5:H5"], ["I5:J5", "K5:P5"], ["Q5:R5", "S5:X5"], ["Y5:Z5", "AA5:AB5"], ["AC5:AD5", "AE5:AF5"], ["AG5:AH5", "AI5:AL5"]];
metadata.forEach(([label, value], index) => {
  const [labelRange, inputRange] = positions[index];
  sheet.mergeCells(labelRange); sheet.mergeCells(inputRange);
  sheet.getRange(labelRange).values = [[label]];
  sheet.getRange(inputRange).values = [[value]];
  sheet.getRange(labelRange).format = { fill: "#9E1B3F", font: { name: "Arial", size: 9, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center" };
  sheet.getRange(inputRange).format = { fill: "#FFF3C8", font: { name: "Arial", size: 10, color: "#263746" }, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#D5B06A" } };
});
sheet.getRange("AI5").format.numberFormat = "yyyy-mm-dd";
sheet.mergeCells("A7:AL7"); sheet.getRange("A7").values = [["INPUT: Lengkapi identitas penerima dan isi nominal komponen yang diperlukan. Satu baris dapat memiliki beberapa komponen."]];
sheet.getRange("A7:AL7").format = { fill: "#FFF3C8", font: { name: "Arial", size: 9, bold: true, color: "#705620" }, verticalAlignment: "center" };
sheet.mergeCells("A8:AL8"); sheet.getRange("A8").values = [["Catatan: Periksa tanggal pemotongan dan data penerima sebelum menyiapkan XML Coretax."]];
sheet.getRange("A8:AL8").format = { fill: "#F6E3E8", font: { name: "Arial", size: 9, color: "#7C1D37" }, verticalAlignment: "center" };
groups.forEach(([label, range]) => { sheet.mergeCells(range); sheet.getRange(range.split(":")[0]).values = [[label]]; sheet.getRange(range).format = { fill: "#18364C", font: { name: "Arial", size: 9, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center" }; });
sheet.getRange("A11:AL11").values = [headers];
sheet.getRange("A11:AL11").format = { fill: "#9E1B3F", font: { name: "Arial", size: 9, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "all", style: "thin", color: "#F9EEE4" } };
sheet.getRange("A12:AL161").format = { font: { name: "Arial", size: 9, color: "#263746" }, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#E6E2DD" } };
sheet.getRange("A12:AL161").format.fill = "#FFFDF9";
sheet.getRange("B12:AL161").format.fill = "#FFF3C8";
sheet.getRange("M12:Y161").format.numberFormat = "#,##0";
sheet.getRange("AC12:AC161").format.numberFormat = "yyyy-mm-dd";
sheet.getRange("AF12:AF161").format.numberFormat = "yyyy-mm-dd";
sheet.getRange("A1:AL161").format.font = { name: "Arial", size: 9 };
sheet.getRange("A:A").format.columnWidth = 14;
sheet.getRange("B:B").format.columnWidth = 15;
sheet.getRange("C:C").format.columnWidth = 26;
sheet.getRange("D:D").format.columnWidth = 22;
sheet.getRange("E:L").format.columnWidth = 17;
sheet.getRange("M:Y").format.columnWidth = 17;
sheet.getRange("Z:AL").format.columnWidth = 19;
sheet.getRange("A1:AL1").format.rowHeight = 26;
sheet.getRange("A3:AL3").format.rowHeight = 21;
sheet.getRange("A5:AL5").format.rowHeight = 26;
sheet.getRange("A7:AL8").format.rowHeight = 22;
sheet.getRange("A10:AL10").format.rowHeight = 24;
sheet.getRange("A11:AL11").format.rowHeight = 38;
sheet.freezePanes.freezeRows(11); sheet.freezePanes.freezeColumns(3);
sheet.getRange("AE5:AF5").dataValidation = { rule: { type: "list", values: months } };
sheet.getRange("E12:E161").dataValidation = { rule: { type: "list", values: ["Pegawai tetap", "Pensiun berkala", "Tidak tetap / bulanan", "Tidak tetap / harian", "Bukan pegawai / jasa", "Peserta kegiatan", "Komisaris tidak teratur", "Mantan pegawai"] } };
sheet.getRange("F12:F161").dataValidation = { rule: { type: "list", values: ["SPDN", "SPLN"] } };
sheet.getRange("G12:G161").dataValidation = { rule: { type: "list", values: ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"] } };
sheet.getRange("H12:H161").dataValidation = { rule: { type: "list", values: ["Swasta", "Pemerintah"] } };
sheet.getRange("I12:I161").dataValidation = { rule: { type: "list", values: months } };
sheet.getRange("Z12:Z161").dataValidation = { rule: { type: "list", values: ["Gross", "Gross-up", "Ditanggung perusahaan"] } };
sheet.getRange("AA12:AA161").dataValidation = { rule: { type: "list", values: ["Normal", "DTP", "Bebas PPh 21", "SKD/P3B", "Lainnya (review)"] } };
sheet.getRange("AD12:AD161").dataValidation = { rule: { type: "list", values: ["Tagihan / Invoice", "Kontrak", "Bukti pembayaran", "Faktur Pajak", "Lainnya"] } };
workbook.recalculate();
await fs.mkdir(path.dirname(output), { recursive: true });
const file = await SpreadsheetFile.exportXlsx(workbook);
await file.save(output);
await fs.rm(`${output}.inspect.ndjson`, { force: true });
