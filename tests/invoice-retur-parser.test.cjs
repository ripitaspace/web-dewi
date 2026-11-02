const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const parser = require("../public/tools/invoice-retur/invoice-retur-parser.js");

// Run with the same browser library versions using PDFJS_TEST_MODULE,
// PDFJS_TEST_WORKER and XLSX_TEST_MODULE. Source documents stay outside Git.
global.window = { location: { search: "?mode=invoice-retur" }, setTimeout, clearTimeout, ReturnNoteParser: parser };
global.invoices = []; global.products = []; global.urls = new Map();
global.all = global.put = global.del = function () {};
global.document = {
  readyState: "complete", body: { dataset: {}, insertAdjacentHTML() {} },
  getElementById() { return null; }, querySelector() { return null; },
  querySelectorAll() { return []; }, addEventListener() {},
  createElement() { return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, querySelector() { return null; } }; }
};
require("../public/tools/invoice-retur/invoice-retur-ux.js");

assert.equal(parser.number("No.: 341358 - 1"), "341358-1");
assert.equal(parser.amount("13986.000000000002"), 13986);
assert.equal(parser.amount("31,464,000"), 31464000);
assert.equal(parser.amount("-"), 0);
assert.equal(parser.amount(""), null);
assert.equal(parser.amount("Malang, 2026"), null);
assert.equal(parser.taxInvoiceNumber("Atas Faktur Pajak Nomor : 040.001-26.15146844 Tanggal : 29-04-2026"), "0400012615146844");
assert.equal(parser.taxInvoiceNumber("Atas Faktur Pajak Nomor : 040.001 - 26.15146844 Tgl.: 31 Aug 2026"), "0400012615146844");
assert.equal(parser.taxInvoiceNumber("Atas Faktur Pajak Nomor : 040.001-26.1514684"), "");
const identity = "Pembeli\nNama: BUYER\nNPWP: 001\nKepada Penjual\nNama: SELLER\nNPWP: 002";
const pg = (n, extra = "") => ({ text: "NOTA RETUR\nNo.: " + n + "\n" + identity + extra, sourcePage: 1 });
assert.equal(parser.group([pg("341358 - 1"), pg("341358 - 2"), pg("341358 - 3")]).length, 3);
assert.equal(parser.group([pg("341358-1"), pg("341358-1")]).length, 1);
assert.equal(parser.group([pg("341358-1"), { text: "halaman tanpa identitas", sourcePage: 2 }]).length, 2);
assert.equal(parser.group([pg("341358-1"), { text: identity, sourcePage: 2 }]).length, 1);
assert.equal(parser.group([pg("341358-1"), { text: pg("341358-1").text.replace("002", "003"), sourcePage: 2 }]).length, 2);

const expected = [
  { file:"FPCNS CITRA HO102656.pdf", notes:[
    ["HO102656","17-09-2026","0400012615146844",858836,null,null,94471,0,[
      ["TORA MOKA 12RCX10SCX28G",.833,"KAR",169103,140863],
      ["TORABIKA DUO 12RCX10SCX24G",2.833,"KAR",177956,504149],
      ["TORACAFE MILKY LATTE RCG 12RCX10SCX20G",.167,"KAR",150946,25208],
      ["TORACAFE CAPPUCCINO RCG 12RCX10SCX20G",.25,"KAR",151248,37812],
      ["ENERGEN VANILA ALODOK 16RCX10SCX34G",.063,"KAR",275381,17349],
      ["TORASUSU 12RCX10SCX30G",.75,"KAR",177940,133455]]]
  ] },
  { file:"BSP 10-2026.pdf", notes:[
    ["348384","01-10-2026","0100002475368498",2204800,22048,2182752,240103,null,[["Enfamil A+1 MFGM PWD 400G",10,"PCS",220480,2204800]]],
    ["341359","01-10-2026","0400032500866590",242050,2421,239630,26359,null,[["Enfamil A+ GENTLE CARE STAGE 1 350G",1,"PCS",242050,242050]]],
    ["341358-1","01-10-2026","0400032503958061",229690,0,229690,25266,null,[["Enfamil A+2 MFGM Gentle Care 350G",1,"PCS",229690,229690]]],
    ["341358-2","01-10-2026","0400032503958064",93555,0,93555,10291,null,[["Enfagrow Essential 4 400G",1,"PCS",93555,93555]]],
    ["341358-3","01-10-2026","0400032503958061",211218,0,211218,23234,null,[["Enfagrow A+ 3 MFGM PWD Plain 400G",1,"PCS",211218,211218]]]
  ] },
  { file:"RTR FPCNS CITRA HO120622.pdf", notes:[
    ["HO120622","16-10-2026","0400012632260622",1269192,null,null,139610,0,[
      ["TORA MOKA 12RCX10SCX28G",1,"KAR",168186,168186],
      ["TORABIKA JAHE SUSU INSTANT 12RCX10SCX20G",2.333,"KAR",169980,396563],
      ["TORABIKA DUO 12RCX10SCX24G",1.083,"KAR",177093,191792],
      ["TORACAFE CHOCO LATTE RCG 12RCX10SCX20G",1,"KAR",150483,150483],
      ["TORACAFE MILKY LATTE RCG 12RCX10SCX20G",1.333,"KAR",150522,200646],
      ["TORASUSU 12RCX10SCX30G",.833,"KAR",177114,147536],
      ["T. CREAMY LATTE EMAS 12RCX10SCX18G",.083,"KAR",168506,13986]]]
  ] },
  { file:"ENSV LBK26100001.pdf", notes:[
    ["LBK26100001","23-10-2026","0400002689669540",31464000,1560614,29903386,3289372,null,[["PRENAGEN UHT STR 185 ML",4560,"pcs",6900,31464000]]]
  ] }
];
const expectedCompanies = {
  HO102656: ["CITRA WAHAMA BERSAMA", "PT. CIPTA NIAGA SEMESTA"],
  "348384": ["PT. CITRA WAHAMA BERSAMA", "PT. BINA SAN PRIMA"],
  "341359": ["PT. CITRA WAHAMA BERSAMA", "PT. BINA SAN PRIMA"],
  "341358-1": ["PT. CITRA WAHAMA BERSAMA", "PT. BINA SAN PRIMA"],
  "341358-2": ["PT. CITRA WAHAMA BERSAMA", "PT. BINA SAN PRIMA"],
  "341358-3": ["PT. CITRA WAHAMA BERSAMA", "PT. BINA SAN PRIMA"],
  HO120622: ["CITRA WAHAMA BERSAMA", "PT. CIPTA NIAGA SEMESTA"],
  LBK26100001: ["PT. CITRA WAHAMA BERSAMA", "PT. ENSEVAL PUTERA MEGATRADING TBK."]
};

async function main() {
  const dir = process.env.RETURN_PDF_DIR;
  if (!dir) { console.log("Parser unit checks passed. Set RETURN_PDF_DIR to run the original-PDF acceptance suite."); return; }
  window.pdfjsLib = process.env.PDFJS_TEST_MODULE ? require(process.env.PDFJS_TEST_MODULE) : await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (process.env.PDFJS_TEST_WORKER) window.pdfjsLib.GlobalWorkerOptions.workerSrc = process.env.PDFJS_TEST_WORKER;
  assert.ok(process.env.XLSX_TEST_MODULE, "Set XLSX_TEST_MODULE to test workbook serialization");
  window.XLSX = require(process.env.XLSX_TEST_MODULE);
  for (const fixture of expected) {
    const bytes = fs.readFileSync(path.join(dir, fixture.file));
    const notes = await window.extractReturnInvoicesFromPdf(bytes, fixture.file, fixture.file);
    assert.equal(notes.length, fixture.notes.length, fixture.file);
    notes.forEach((n, i) => {
      const e = fixture.notes[i];
      assert.deepEqual([n.number,n.date,n.originalInvoiceNumber,n.grossTotal,n.discountTotal,n.dpp,n.ppn,n.ppnbm],e.slice(0,8),fixture.file);
      assert.deepEqual(n.items.map(x => [x.name,x.qty,x.unit,x.unitPrice,x.gross]),e[8],n.number);
      assert.ok(n.buyer && n.seller && n.buyerNPWP && n.sellerNPWP && n.buyerAddress && n.sellerAddress,n.number+" party missing");
      assert.deepEqual([n.buyer, n.seller], expectedCompanies[n.number], n.number + " nama perusahaan salah");
      assert.equal(n.buyerNPWP, "0869536334623000", n.number + " NPWP pembeli harus 16 digit");
      assert.ok(n.originalInvoiceDate,n.number+" original date missing");
      assert.equal(n.pages,1);
      assert.equal(n.pageRange,String(i+1));
      assert.deepEqual(n.items.map(x=>x.no),n.items.map((_,j)=>j+1));
      assert.ok(n.items.every(x=>x.sourcePage===i+1));
      assert.ok(n.raw.length);
      n.invoiceId = "INV-"+String(invoices.length+1).padStart(6,"0");
      invoices.push(n);
    });
    const repeated = await window.extractReturnInvoicesFromPdf(bytes,fixture.file,fixture.file);
    assert.ok(repeated.every(n=>invoices.some(existing=>existing.key===n.key)),"reimport keys changed");
  }
  assert.equal(invoices.length,8);
  assert.equal(new Set(invoices.map(n=>n.key)).size,8);
  assert.equal(invoices.reduce((s,n)=>s+n.items.length,0),19);
  assert.equal(invoices.at(-1).sellerNPWP,"013425723054000 / 0013425723054000");
  let workbook;
  window.XLSX.writeFile = wb => { workbook=window.XLSX.read(window.XLSX.write(wb,{bookType:"xlsx",type:"buffer"}),{type:"buffer"}); };
  window.exportExcel();
  const sheet=workbook.Sheets["Nota Retur"], rows=window.XLSX.utils.sheet_to_json(sheet,{defval:""});
  assert.equal(rows.length,19);
  const sums=["Jumlah Harga Retur SUM","Potongan Harga SUM","Netto Retur SUM","PPN SUM","PPnBM SUM"];
  for(const n of invoices) {
    const rr=rows.filter(r=>r["Nomor Nota Retur"]===n.number);
    assert.equal(rr.length,n.items.length);
    rr.forEach((r,i)=>{
      assert.equal(r["Tanggal Nota Retur"],n.date);
      assert.equal(r["Nomor Faktur Pajak Asal"],n.originalInvoiceNumber);
      assert.equal(String(r["Nomor Faktur Pajak Asal"]).replace(/\D/g,""),n.originalInvoiceNumber.replace(/\D/g,""));
      assert.equal(r["NPWP Penjual"],n.sellerNPWP);
      assert.equal(r["Nilai Barang Dikembalikan"],n.items[i].gross);
      assert.equal(r["Halaman Sumber"],n.items[i].page);
      if(i) sums.forEach(key=>assert.equal(r[key],""));
    });
    assert.equal(n.originalInvoiceNumber.replace(/\D/g, "").length, 16, n.number + " faktur asal harus 16 digit");
    assert.equal(rr[0]["Potongan Harga SUM"],n.discountTotal ?? "");
    assert.equal(rr[0]["PPnBM SUM"],n.ppnbm ?? "");
  }
  assert.equal(sheet.F8.t,"s"); // Nomor Faktur Pajak Asal preserves leading zeros.
  console.log("PASS: PDF.js "+window.pdfjsLib.version+", 4 original PDFs, 8 notes, 19 items, identities/dates/totals, reimport keys, and XLSX round-trip.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
