// Standalone JavaScript: no extension APIs, credentials, or external requests.
const script = `(async function () {
  if (window.__ripitaInvoiceDownloadRunning) {
    alert('Antrean download RIPITA masih berjalan. Tunggu sampai proses klik selesai.');
    return;
  }
  window.__ripitaInvoiceDownloadRunning = true;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const ready = (button) => button.isConnected &&
    button.getClientRects().length > 0 &&
    getComputedStyle(button).visibility === 'visible' &&
    !button.disabled && button.getAttribute('aria-disabled') !== 'true';
  try {
    const started = Date.now();
    let buttons = [];
    while (Date.now() - started < 10000) {
      buttons = Array.from(document.querySelectorAll('[id="DownloadButton"]')).filter(ready);
      if (buttons.length) break;
      await sleep(250);
    }
    if (!buttons.length) {
      alert('Tombol download aktif tidak ditemukan. Buka tabel faktur di Coretax, tunggu tabel dimuat, dan pastikan faktur siap diunduh.');
      return;
    }
    let clicked = 0;
    let skipped = 0;
    let failed = 0;
    for (const button of buttons) {
      if (!ready(button)) { skipped++; continue; }
      try { button.click(); clicked++; } catch (_) { failed++; }
      await sleep(700);
    }
    alert('Proses klik selesai: ' + clicked + ' tombol diklik, ' + skipped + ' dilewati, ' + failed + ' gagal diklik.\\nPeriksa daftar Download browser untuk memastikan file berhasil tersimpan. Bookmarklet tidak dapat memastikan hasil unduhan.');
  } catch (_) {
    alert('Proses terhenti. Periksa daftar Download browser sebelum mencoba lagi agar tidak mengunduh file yang sama dua kali.');
  } finally {
    delete window.__ripitaInvoiceDownloadRunning;
  }
})();`;

export const INVOICE_BOOKMARKLET_URL = `javascript:${encodeURIComponent(script)}`;
