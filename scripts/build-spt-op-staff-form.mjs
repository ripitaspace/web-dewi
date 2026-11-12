import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { execFile as execFileCallback } from "node:child_process";
import sharp from "sharp";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const execFile = promisify(execFileCallback);
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../public/tools/spt-op/PuspitaCore_Formulir_SPT_OP_Staf.xlsx");
const formAsset = page => path.resolve(here, `../public/tools/spt-op/forms/page-${page}.svg`);

const pages = [
  "Petunjuk dan persyaratan", "Petunjuk umum (lanjutan)", "Induk SPT – halaman 1", "Induk SPT – halaman 2",
  "Lampiran 1 – harta 1–4", "Lampiran 1 – harta 5–7 & utang", "Lampiran 1 – keluarga & bupot",
  "Lampiran 2 – penghasilan lain", "Lampiran 3A-1 – dagang", "Lampiran 3A-2 – jasa",
  "Lampiran 3A-3 – industri", "Lampiran 3A-4 – pencatatan", "Lampiran 3B – omzet",
  "Lampiran 3C – penyusutan", "Lampiran 3D – biaya", "Lampiran 4 – PPh 25", "Lampiran 5 – pengurang",
];
const tabNames = [
  "01 Petunjuk", "02 Petunjuk II", "03 Induk 1", "04 Induk 2", "05 Harta 1", "06 Harta 2",
  "07 Keluarga", "08 Penghasilan", "09 Dagang", "10 Jasa", "11 Industri", "12 Pencatatan",
  "13 Omzet", "14 Penyusutan", "15 Biaya", "16 PPh 25", "17 Pengurang",
];
const landscapePages = new Set([13, 14, 17]);

// Coordinates use the 42 × 104 portrait and 68 × 68 landscape grids beneath the original form artwork.
// They mark only areas intended to be filled in by staff; the printed labels and lines stay in the SVG layer.
const inputZones = {
  3: [[13, 2, 5, 38], [23, 2, 6, 38], [34, 2, 6, 38], [47, 2, 8, 38], [59, 2, 11, 38], [73, 2, 11, 38]],
  4: [[12, 2, 8, 38], [24, 2, 13, 38], [40, 2, 13, 38], [57, 2, 16, 38], [78, 2, 12, 38]],
  5: [[18, 2, 67, 38]], 6: [[17, 2, 72, 38]], 7: [[17, 2, 74, 38]], 8: [[18, 2, 70, 38]],
  9: [[16, 2, 76, 38]], 10: [[16, 2, 76, 38]], 11: [[16, 2, 76, 38]], 12: [[17, 2, 72, 38]],
  13: [[12, 2, 48, 64]], 14: [[10, 2, 52, 64]], 15: [[16, 2, 73, 38]],
  16: [[16, 2, 71, 38]], 17: [[12, 2, 48, 64]],
};

async function transparentFormPng(page) {
  const source = await fs.readFile(formAsset(page));
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += info.channels) {
    const [red, green, blue] = [data[index], data[index + 1], data[index + 2]];
    // Removing the paper-white layer lets yellow Excel input cells show through while keeping form ink and colour.
    if (red > 242 && green > 242 && blue > 242) data[index + 3] = 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

function styleInputZones(sheet, page, rows, columns) {
  for (const [row, column, height, width] of inputZones[page] || []) {
    const safeHeight = Math.min(height, rows - row);
    const safeWidth = Math.min(width, columns - column);
    const range = sheet.getRangeByIndexes(row, column, safeHeight, safeWidth);
    range.format = {
      fill: "#FFF3C8",
      font: { name: "Arial", size: 8, color: "#111111" },
      verticalAlignment: "center",
      wrapText: true,
    };
  }
}

function setGrid(sheet, rows, columns, landscape) {
  const width = landscape ? 1248 : 816;
  const height = landscape ? 816 : 1248;
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0, 0, 1, columns).format.columnWidthPx = width / columns;
  sheet.getRangeByIndexes(0, 0, rows, 1).format.rowHeightPx = height / rows;
}

function writeInstructionPage(sheet, page) {
  const title = page === 1 ? "FORMULIR SURAT PEMBERITAHUAN TAHUNAN PAJAK PENGHASILAN\nWAJIB PAJAK ORANG PRIBADI" : "PETUNJUK UMUM (LANJUTAN)";
  const blocks = page === 1 ? [
    ["WAJIB PAJAK YANG DAPAT MENYAMPAIKAN SPT TAHUNAN PPh DALAM BENTUK KERTAS HARUS MEMENUHI KRITERIA BERIKUT", "1. Wajib Pajak orang pribadi.\n2. SPT berstatus nihil atau kurang bayar.\n3. Tidak diwajibkan menyampaikan SPT Masa dalam bentuk dokumen elektronik.\n4. Belum pernah menyampaikan SPT Tahunan dalam dokumen elektronik.\n5. Terdaftar di KPP Pratama.\n6. Tidak menggunakan jasa konsultan pajak dalam pengisian SPT.\n7. Laporan keuangan tidak diaudit akuntan publik.\n8. SPT yang disampaikan bukan untuk bagian tahun pajak."],
    ["PETUNJUK UMUM", "1. Formulir digunakan untuk SPT Tahunan PPh Wajib Pajak Orang Pribadi Tahun Pajak 2025 dan seterusnya.\n2. SPT dapat disampaikan paling lambat 3 bulan setelah Tahun Pajak berakhir.\n3. Untuk cetak, gunakan kertas F4/Folio 8,5 × 13 inci dan jaga kertas tetap bersih serta tidak terlipat.\n4. Isi menggunakan huruf Latin, angka Arab, nilai rupiah yang sebenarnya, dan bahasa Indonesia.\n5. Pengisian dimulai dari Induk SPT; lampiran diisi sesuai kondisi Wajib Pajak."],
  ] : [
    ["PETUNJUK UMUM", "Lampiran yang wajib diisi oleh semua Wajib Pajak meliputi Lampiran 1 Bagian A: Harta pada akhir Tahun Pajak dan Lampiran 1 Bagian C: Daftar anggota keluarga yang menjadi tanggungan. Jika tidak ada tanggungan, isi dengan tanda hubung (-)."],
    ["LAMPIRAN BERDASARKAN KONDISI", "Lampiran lain hanya diisi dan disampaikan jika sesuai jawaban pada Induk SPT Tahunan PPh."],
    ["PEMBAYARAN DAN PENYAMPAIAN", "6. Kekurangan pembayaran pajak harus dilunasi sebelum SPT disampaikan; bukti pembayaran dilampirkan.\n7. SPT kertas dapat disampaikan langsung melalui KPP/KP2KP/tempat penerimaan yang ditetapkan, atau melalui pos/jasa kurir dengan bukti pengiriman.\n8. SPT dianggap tidak disampaikan apabila tidak ditandatangani, tidak lengkap lampirannya, atau tidak memenuhi ketentuan yang berlaku."],
  ];
  sheet.mergeCells("B3:AO9");
  sheet.getRange("B3:AO9").values = [[title]];
  sheet.getRange("B3:AO9").format = { fill: "#202C5C", font: { name: "Arial", size: 14, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "medium", color: "#111111" } };
  let row = 13;
  for (const [heading, content] of blocks) {
    sheet.mergeCells(`C${row}:AN${row + 2}`);
    sheet.getRange(`C${row}:AN${row + 2}`).values = [[heading]];
    sheet.getRange(`C${row}:AN${row + 2}`).format = { fill: "#FFC20C", font: { name: "Arial", size: 9, bold: true, color: "#111111" }, verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: "#111111" } };
    row += 4;
    const contentRows = page === 1 && heading === "WAJIB PAJAK YANG DAPAT MENYAMPAIKAN SPT TAHUNAN PPh DALAM BENTUK KERTAS HARUS MEMENUHI KRITERIA BERIKUT" ? 20 : 13;
    sheet.mergeCells(`C${row}:AN${row + contentRows}`);
    sheet.getRange(`C${row}:AN${row + contentRows}`).values = [[content]];
    sheet.getRange(`C${row}:AN${row + contentRows}`).format = { fill: "#FFFFFF", font: { name: "Arial", size: 9, color: "#111111" }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#111111" } };
    row += contentRows + 4;
  }
  sheet.mergeCells("C98:AN100");
  sheet.getRange("C98:AN100").values = [["Halaman petunjuk. Tidak ada data yang perlu diisi pada halaman ini."]];
  sheet.getRange("C98:AN100").format = { font: { name: "Arial", size: 8, italic: true, color: "#4B5563" }, horizontalAlignment: "center", verticalAlignment: "center" };
}

async function unlockInputsAndSetPrintLayout(file) {
  const stage = await fs.mkdtemp(path.join(path.dirname(output), ".spt-op-staff-"));
  try {
    await execFile("unzip", ["-qq", file, "-d", stage]);
    const stylesPath = path.join(stage, "xl/styles.xml");
    let styles = await fs.readFile(stylesPath, "utf8");
    const fillsMatch = styles.match(/<(x:)?fills[^>]*>([\s\S]*?)<\/\1fills>/);
    if (!fillsMatch) throw Error("Gaya Excel tidak memuat daftar fill.");
    const fills = fillsMatch[2].match(/<(?:x:)?fill>[\s\S]*?<\/(?:x:)?fill>/g) || [];
    const inputFill = fills.findIndex(fill => /FFF3C8/i.test(fill));
    if (inputFill < 0) throw Error("Gaya sel isian kuning tidak ditemukan.");
    const xfsMatch = styles.match(/<(x:)?cellXfs count="(\d+)"[^>]*>([\s\S]*?)<\/\1cellXfs>/);
    if (!xfsMatch) throw Error("Gaya sel Excel tidak ditemukan.");
    const xfs = xfsMatch[3].match(/<(?:x:)?xf\b[^>]*?(?:\/>|>[\s\S]*?<\/(?:x:)?xf>)/g) || [];
    const inputStyles = xfs.map((xf, index) => new RegExp(`fillId="${inputFill}"`).test(xf) ? index : -1).filter(index => index >= 0);
    if (!inputStyles.length) throw Error("Gaya sel isian tidak ditemukan.");
    const tag = xfsMatch[1] || "";
    const unlockedByStyle = new Map(inputStyles.map((style, offset) => [style, xfs.length + offset]));
    const unlockedStyles = inputStyles.map(style => xfs[style].replace(/\/>$/, `><${tag}protection locked="0"/></${tag}xf>`).replace(/<(?:x:)?protection[^>]*\/>/, `<${tag}protection locked="0"/>`));
    const replacement = `<${tag}cellXfs count="${xfs.length + unlockedStyles.length}">${xfsMatch[3]}${unlockedStyles.join("")}</${tag}cellXfs>`;
    styles = styles.replace(xfsMatch[0], replacement);
    await fs.writeFile(stylesPath, styles);

    for (let page = 1; page <= pages.length; page++) {
      const worksheetPath = path.join(stage, `xl/worksheets/sheet${page}.xml`);
      let worksheet = await fs.readFile(worksheetPath, "utf8");
      const stylePattern = /(<(?:x:)?c\b[^>]*\bs=")(\d+)(")/g;
      worksheet = worksheet.replace(stylePattern, (all, before, style, after) => unlockedByStyle.has(Number(style)) ? `${before}${unlockedByStyle.get(Number(style))}${after}` : all);
      const landscape = landscapePages.has(page);
      const pageSetup = `<pageSetup orientation="${landscape ? "landscape" : "portrait"}" paperWidth="${landscape ? "13in" : "8.5in"}" paperHeight="${landscape ? "8.5in" : "13in"}" scale="100" fitToWidth="1" fitToHeight="1"/>`;
      const protection = `<sheetProtection sheet="1" objects="1" scenarios="1" selectLockedCells="0" selectUnlockedCells="1"/>`;
      worksheet = worksheet.replace(/<(x:)?pageSetup[^>]*\/>/, `<$1pageSetup orientation="${landscape ? "landscape" : "portrait"}" paperWidth="${landscape ? "13in" : "8.5in"}" paperHeight="${landscape ? "8.5in" : "13in"}" scale="100" fitToWidth="1" fitToHeight="1"/>`);
      if (!worksheet.includes("pageSetup")) worksheet = worksheet.replace("</x:worksheet>", `<x:pageSetup orientation="${landscape ? "landscape" : "portrait"}" paperWidth="${landscape ? "13in" : "8.5in"}" paperHeight="${landscape ? "8.5in" : "13in"}" scale="100" fitToWidth="1" fitToHeight="1"/></x:worksheet>`);
      worksheet = worksheet.replace(/<(x:)?pageMargins[^>]*\/>/, `<$1sheetProtection sheet="1" objects="1" scenarios="1" selectLockedCells="0" selectUnlockedCells="1"/><$1pageMargins left="0.15" right="0.15" top="0.15" bottom="0.15" header="0.1" footer="0.1"/>`);
      if (!worksheet.includes("sheetProtection")) worksheet = worksheet.replace("</x:worksheet>", `<x:sheetProtection sheet="1" objects="1" scenarios="1" selectLockedCells="0" selectUnlockedCells="1"/></x:worksheet>`);
      await fs.writeFile(worksheetPath, worksheet);
    }
    await fs.rm(file, { force: true });
    await execFile("zip", ["-Xqr", file, "."], { cwd: stage });
  } finally {
    await fs.rm(stage, { recursive: true, force: true });
  }
}

const workbook = Workbook.create();
for (let page = 1; page <= pages.length; page++) {
  const landscape = landscapePages.has(page);
  const rows = landscape ? 68 : 104;
  const columns = landscape ? 68 : 42;
  const sheet = workbook.worksheets.add(tabNames[page - 1]);
  sheet.tabColor = page <= 2 ? "#6E7781" : "#18364C";
  setGrid(sheet, rows, columns, landscape);
  if (page <= 2) {
    writeInstructionPage(sheet, page);
    continue;
  }
  styleInputZones(sheet, page, rows, columns);
  const artwork = await transparentFormPng(page);
  sheet.images.add({
    dataUrl: `data:image/png;base64,${artwork.toString("base64")}`,
    anchor: { from: { row: 0, col: 0 }, extent: { widthPx: landscape ? 1248 : 816, heightPx: landscape ? 816 : 1248 } },
  });
  // Provide a text fallback for readers that disable images in Excel.
  sheet.getCell(rows - 1, 0).values = [[pages[page - 1]]];
  sheet.getCell(rows - 1, 0).format.font = { name: "Arial", size: 1, color: "#FFFFFF" };
}

workbook.recalculate();
await fs.mkdir(path.dirname(output), { recursive: true });
const file = await SpreadsheetFile.exportXlsx(workbook);
await file.save(output);
await unlockInputsAndSetPrintLayout(output);
console.log(`Wrote ${output}`);
