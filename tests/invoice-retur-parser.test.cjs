const assert = require("assert");

global.window = { location: { search: "?mode=invoice-retur" }, setTimeout, clearTimeout };
global.invoices = [];
global.products = [];
global.urls = new Map();
global.all = function () {};
global.put = function () {};
global.del = function () {};
global.document = {
  readyState: "complete",
  body: { dataset: {}, insertAdjacentHTML() {} },
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() { return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, querySelector() { return null; } }; }
};

require("../public/tools/invoice-retur/invoice-retur-ux.js");

function bsp(note, original, name, quantity, price, returned, discount, net, ppn) {
  return [
    "NOTA RETUR", "No.: " + note,
    "Atas Faktur Pajak Nomor : " + original + " Tgl.: 31 Aug 2026",
    "PEMBELI", "Nama : PT.CITRA WAHAMA BERSAMA", "Alamat : MALANG", "NPWP : 0869536334623000",
    "KEPADA PENJUAL", "Nama : PT. BINA SAN PRIMA", "Alamat : BANDUNG", "NPWP : 0015887250092000",
    "No. Macam dan Jenis Barang Kena Pajak QTY Harga Satuan Faktur Pajak Harga PKP yang dikembalikan (Rp.)",
    "01 " + name + " " + quantity + " Pcs " + price + " " + returned,
    "Jumlah harga BKP yang dikembalikan " + returned,
    "Dikurangi Potongan Harga " + discount,
    "Jumlah harga BKP Netto yang dikembalikan " + net,
    "Pajak Pertambahan Nilai yang diminta kembali " + ppn,
    "Pajak Penjualan Atas Barang Mewah yang diminta kembali",
    "Malang, 01 October 2026"
  ].join("\n");
}

function generic(note, date) {
  return [
    "NOTA RETUR", "Nomor : " + note,
    "Atas Faktur Pajak Nomor : 040.001-26.15146844 Tanggal : " + date,
    "Pembeli Barang Kena Pajak", "Nama : CITRA WAHAMA BERSAMA", "Alamat : MALANG", "NPWP : 869536334623000",
    "Kepada Penjual", "Nama : PT. CIPTA NIAGA SEMESTA", "Alamat : JAKARTA", "NPWP : 315421693036000",
    "Macam dan Jenis BKP Kuantum Harga Satuan Faktur Pajak Harga Jual BKP",
    "1 CONTOH BARANG 1 KAR 100 100", "Jumlah Harga Jual BKP yang dikembalikan 100", "PPN yang diminta kembali 11"
  ].join("\n");
}

const fixtures = [
  { name: "invoice 1 FPCNS", text: generic("HO102656", "29-04-2026"), expected: { format: "GENERIC", number: "HO102656" } },
  { name: "invoice 2 BSP", text: bsp("348384", "0100002475368498", "ENFAMIL A+1 MFGM PWD 400G", "10", "220,480", "2,204,800", "22,048", "2,182,752", "240,103"), expected: { format: "BSP", date: "31 Aug 2026", discount: 22048, ppnbm: null } },
  { name: "invoice 3 BSP", text: bsp("341359", "0400032500866590", "ENFAMIL GENTLE CARE", "1", "242,050", "242,050", "2,421", "239,630", "26,359"), expected: { format: "BSP", discount: 2421, ppnbm: null } },
  { name: "invoice 4 BSP", text: bsp("341358-1", "0400032503958061", "ENFAMIL A+2", "1", "229,690", "229,690", "-", "229,690", "25,266"), expected: { format: "BSP", discount: 0, ppnbm: null } },
  { name: "invoice 5 BSP", text: bsp("341358-2", "0400032503958064", "ENFAGROW ESSENTIAL 4", "1", "93,555", "93,555", "-", "93,555", "10,291"), expected: { format: "BSP", number: "341358-2", discount: 0 } },
  { name: "invoice 6 BSP", text: bsp("341358-3", "0400032503958061", "ENFAGROW A+3", "1", "211,218", "211,218", "-", "211,218", "23,234"), expected: { format: "BSP", date: "31 Aug 2026", discount: 0, ppnbm: null } },
  { name: "invoice 7 RTR", text: generic("HO120622", "14-10-2026"), expected: { format: "GENERIC", number: "HO120622" } },
  { name: "invoice 8 ENSV", text: generic("LBK26100001", "16-03-2026"), expected: { format: "GENERIC", number: "LBK26100001" } }
];

fixtures.forEach((fixture, index) => {
  const invoice = window.parseInvoice([{ text: fixture.text, sourcePage: 1 }], fixture.name + ".pdf", fixture.name + ".pdf");
  assert.equal(invoice.format, fixture.expected.format, fixture.name + " format berubah");
  if (fixture.expected.number) assert.equal(invoice.number, fixture.expected.number, fixture.name + " nomor berubah");
  if (fixture.expected.date) assert.equal(invoice.date, fixture.expected.date, fixture.name + " tanggal salah");
  if (Object.prototype.hasOwnProperty.call(fixture.expected, "discount")) assert.equal(invoice.discountTotal, fixture.expected.discount, fixture.name + " diskon salah");
  if (Object.prototype.hasOwnProperty.call(fixture.expected, "ppnbm")) assert.equal(invoice.ppnbm, fixture.expected.ppnbm, fixture.name + " PPnBM salah");
  assert.equal(invoice.items.length, 1, fixture.name + " barang tidak terbaca");
  assert.equal(invoice.items[0].no, 1, fixture.name + " nomor barang salah");
  assert.equal(invoice.pages, 1, fixture.name + " halaman berubah");
  assert.equal(index >= 0, true);
});

console.log("Invoice Retur parser: 8 fixture lulus.");
