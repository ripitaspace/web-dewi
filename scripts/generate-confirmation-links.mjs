import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const args = process.argv.slice(2);
const readArg = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : ""; };
const input = readArg("--file");
const baseUrl = (readArg("--base-url") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

if (!input || !fs.existsSync(input)) {
  console.error("Gunakan: node scripts/generate-confirmation-links.mjs --file /path/K000001.xlsx --base-url https://domain-anda");
  process.exit(1);
}

const workbook = XLSX.readFile(input, { cellDates: true });
const setting = XLSX.utils.sheet_to_json(workbook.Sheets.PENGATURAN, { defval: "" })[0];
const clientCode = String(setting?.kode_klien || "").trim();
if (!/^[A-Za-z0-9_-]{3,100}$/.test(clientCode)) throw new Error("PENGATURAN.kode_klien harus diisi dengan kode aman.");

const links = [];
const seenCodes = new Set();
const seenTokens = new Set();
for (const sheetName of ["PIUTANG", "UTANG", "BANK", "LAINNYA"]) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet ${sheetName} tidak ditemukan.`);
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headers = rows[0].map((value) => String(value).trim());
  const codeIndex = headers.indexOf("kode_konfirmasi");
  const tokenIndex = headers.indexOf("token_akses");
  if (codeIndex < 0 || tokenIndex < 0) throw new Error(`Header kode_konfirmasi atau token_akses tidak ditemukan di ${sheetName}.`);
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row.some((value) => String(value).trim())) continue;
    const code = String(row[codeIndex] || "").trim() || `KF-${sheetName}-${String(rowIndex).padStart(6, "0")}`;
    const token = randomBytes(32).toString("base64url");
    if (seenCodes.has(code)) throw new Error(`Kode konfirmasi duplikat: ${code}`);
    if (seenTokens.has(token)) throw new Error("Token duplikat terdeteksi. Jalankan ulang skrip.");
    seenCodes.add(code); seenTokens.add(token);
    row[codeIndex] = code; row[tokenIndex] = token;
    sheet[XLSX.utils.encode_cell({ r: rowIndex, c: codeIndex })] = { t: "s", v: code };
    sheet[XLSX.utils.encode_cell({ r: rowIndex, c: tokenIndex })] = { t: "s", v: token };
    links.push({ type: sheetName, code, url: `${baseUrl}/kerja-bersama/konfirmasi/${encodeURIComponent(clientCode)}/${encodeURIComponent(token)}` });
  }
}

XLSX.writeFile(workbook, input, { bookType: "xlsx" });
console.table(links);
console.log(`Workbook diperbarui: ${path.resolve(input)}`);
