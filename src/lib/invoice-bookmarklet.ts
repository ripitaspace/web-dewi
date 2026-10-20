// Standalone JavaScript: no extension APIs, credentials, or external requests.
export const LAPTOP_KENTANG_DELAY_SECONDS = 2;

export type CoretaxBookmarkletKind = "invoice" | "withholding-slip";

export interface CoretaxBookmarkletConfig {
  tableSelector: string;
  recordLabel: string;
  recordSingular: string;
  recordPlural: string;
}

export const CORETAX_BOOKMARKLET_CONFIGS: Record<CoretaxBookmarkletKind, CoretaxBookmarkletConfig> = {
  invoice: {
    tableSelector: "#table-el",
    recordLabel: "Nomor Faktur Pajak",
    recordSingular: "Faktur",
    recordPlural: "faktur",
  },
  "withholding-slip": {
    tableSelector: ".p-datatable-wrapper table",
    recordLabel: "Nomor Pemotongan",
    recordSingular: "Bukti potong",
    recordPlural: "bukti potong",
  },
};

export function createInvoiceBookmarkletSource(kind: CoretaxBookmarkletKind = "invoice"): string {
  const clickDelayMs = LAPTOP_KENTANG_DELAY_SECONDS * 1000;
  const config = CORETAX_BOOKMARKLET_CONFIGS[kind];

  return `(async function () {
  if (window.__ripitaInvoiceDownloadRunning) {
    alert('Antrean download RIPITA masih berjalan. Tunggu sampai proses klik selesai.');
    return;
  }

  window.__ripitaInvoiceDownloadRunning = true;

  const TABLE_SELECTOR = ${JSON.stringify(config.tableSelector)};
  const BUTTON_SELECTOR = '[id="DownloadButton"]';
  const INVOICE_LABEL = ${JSON.stringify(config.recordLabel)};
  const RECORD_SINGULAR = ${JSON.stringify(config.recordSingular)};
  const RECORD_PLURAL = ${JSON.stringify(config.recordPlural)};
  const CLICK_DELAY_MS = ${clickDelayMs};
  const WAIT_TIMEOUT_MS = 10000;
  const POLL_INTERVAL_MS = 250;
  const attemptedInvoiceNumbers = new Set();
  const skippedInvoiceNumbers = new Set();
  const failedInvoiceNumbers = new Set();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalizeText = (value) => (value || '').replace(/\\s+/g, ' ').trim();
  const isReady = (button) => button && button.isConnected &&
    button.getClientRects().length > 0 &&
    getComputedStyle(button).visibility === 'visible' &&
    getComputedStyle(button).display !== 'none' &&
    !button.disabled && button.getAttribute('aria-disabled') !== 'true';

  function getInvoiceNumber(row) {
    const cell = Array.from(row.querySelectorAll('td')).find((candidate) => {
      const label = candidate.querySelector('.p-column-title');
      return normalizeText(label && label.textContent) === INVOICE_LABEL;
    });

    if (!cell) return '';
    const label = cell.querySelector('.p-column-title');
    return normalizeText((cell.textContent || '').replace(label ? label.textContent || '' : '', ''));
  }

  function inspectTable() {
    const rows = Array.from(document.querySelectorAll(TABLE_SELECTOR + ' tbody tr'));
    let hasPendingRows = false;

    for (const row of rows) {
      const invoiceNumber = getInvoiceNumber(row);
      const button = row.querySelector(BUTTON_SELECTOR);
      if (!invoiceNumber || !button || attemptedInvoiceNumbers.has(invoiceNumber)) continue;

      hasPendingRows = true;
      if (isReady(button)) return { candidate: { row, button, invoiceNumber }, hasPendingRows };
    }

    return { candidate: null, hasPendingRows };
  }

  async function waitForCandidate() {
    const startedAt = Date.now();
    let state = inspectTable();

    while (!state.candidate && state.hasPendingRows && Date.now() - startedAt < WAIT_TIMEOUT_MS) {
      await sleep(POLL_INTERVAL_MS);
      state = inspectTable();
    }

    return state;
  }

  let stopRequested = false;

  function showProgress(clicked, invoiceNumber, status) {
    if (!document.body || !document.createElement) return;

    const existing = document.getElementById('ripita-download-summary');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ripita-download-summary';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ripita-download-summary-title');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647', display: 'grid',
      placeItems: 'center', padding: '24px', background: 'rgba(28, 18, 14, 0.48)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    });

    const card = document.createElement('section');
    Object.assign(card.style, {
      width: 'min(100%, 620px)', boxSizing: 'border-box', borderRadius: '20px',
      padding: '28px', background: '#fffaf8', color: '#2c211e', boxShadow: '0 24px 70px rgba(0, 0, 0, 0.3)'
    });

    const title = document.createElement('h2');
    title.id = 'ripita-download-summary-title';
    title.textContent = 'RIPITA says';
    Object.assign(title.style, { margin: '0 0 18px', fontSize: '28px', lineHeight: '1.15' });

    const details = document.createElement('p');
    details.textContent =
      'Sedang memproses download.\\n' +
      'Status: ' + status + '\\n' +
      RECORD_SINGULAR + ' saat ini: ' + invoiceNumber + '\\n\\n' +
      '• Tombol dipicu: ' + clicked + '\\n' +
      '• Dilewati: ' + skippedInvoiceNumbers.size + '\\n' +
      '• Gagal dipicu: ' + failedInvoiceNumbers.size;
    Object.assign(details.style, { margin: '0', whiteSpace: 'pre-line', fontSize: '17px', lineHeight: '1.65' });

    const advice = document.createElement('p');
    advice.textContent = stopRequested
      ? 'Penghentian aman diminta. RIPITA akan selesai setelah ' + RECORD_PLURAL + ' ini. 🥔'
      : 'Bookmarklet sedang memicu klik; periksa daftar Download setelah proses selesai.';
    Object.assign(advice.style, { margin: '20px 0 0', padding: '14px 16px', borderRadius: '12px', background: '#f4e7dc', fontWeight: '700', lineHeight: '1.5' });

    const stop = document.createElement('button');
    stop.type = 'button';
    stop.textContent = stopRequested ? 'Berhenti setelah ' + RECORD_PLURAL + ' ini' : 'Hentikan dengan aman';
    stop.disabled = stopRequested;
    Object.assign(stop.style, { display: 'block', margin: '24px 0 0 auto', border: '0', borderRadius: '999px', padding: '11px 22px', background: '#8d4f18', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '700' });
    stop.addEventListener('click', () => {
      stopRequested = true;
      showProgress(clicked, invoiceNumber, 'penghentian aman sedang disiapkan');
    });

    card.append(title, details, advice, stop);
    overlay.append(card);
    document.body.append(overlay);
  }

  function showSummary(clicked, stopReason) {
    const summary =
      'Proses klik selesai.\\n' +
      '• Tombol dipicu: ' + clicked + '\\n' +
      '• Dilewati: ' + skippedInvoiceNumbers.size + '\\n' +
      '• Gagal dipicu: ' + failedInvoiceNumbers.size + '\\n' +
      '• Status: ' + stopReason + '\\n\\n' +
      'Periksa daftar Download browser untuk memastikan file berhasil tersimpan. ' +
      'Bookmarklet hanya memicu klik dan tidak dapat menjamin unduhan berhasil.';

    // Native alert titles always use the current website's domain. Render our own
    // dialog so the result is clearly attributed to RIPITA instead.
    if (!document.body || !document.createElement) {
      alert(summary);
      return;
    }

    const existing = document.getElementById('ripita-download-summary');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ripita-download-summary';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ripita-download-summary-title');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647', display: 'grid',
      placeItems: 'center', padding: '24px', background: 'rgba(28, 18, 14, 0.48)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    });

    const card = document.createElement('section');
    Object.assign(card.style, {
      width: 'min(100%, 620px)', boxSizing: 'border-box', borderRadius: '20px',
      padding: '28px', background: '#fffaf8', color: '#2c211e', boxShadow: '0 24px 70px rgba(0, 0, 0, 0.3)'
    });

    const title = document.createElement('h2');
    title.id = 'ripita-download-summary-title';
    title.textContent = 'RIPITA says';
    Object.assign(title.style, { margin: '0 0 18px', fontSize: '28px', lineHeight: '1.15' });

    const details = document.createElement('p');
    details.textContent = summary;
    Object.assign(details.style, { margin: '0', whiteSpace: 'pre-line', fontSize: '17px', lineHeight: '1.65' });

    const advice = document.createElement('p');
    advice.textContent = failedInvoiceNumbers.size || skippedInvoiceNumbers.size
      ? 'Kalau gagal, kamu coba nabung deh biar Mbak Pus nggak pusing. 🥔'
      : 'Tetap periksa hasil download dulu ya, jangan sampai ' + RECORD_PLURAL + ' dobel. 🥔';
    Object.assign(advice.style, { margin: '20px 0 0', padding: '14px 16px', borderRadius: '12px', background: '#f4e7dc', fontWeight: '700', lineHeight: '1.5' });

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Mengerti';
    Object.assign(close.style, { display: 'block', margin: '24px 0 0 auto', border: '0', borderRadius: '999px', padding: '11px 22px', background: '#8d4f18', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '700' });
    close.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });

    card.append(title, details, advice, close);
    overlay.append(card);
    document.body.append(overlay);
    close.focus();
  }

  let clicked = 0;

  try {
    let state = await waitForCandidate();

    if (!state.candidate) {
      showSummary(clicked, state.hasPendingRows
        ? 'dihentikan aman karena tombol ' + RECORD_PLURAL + ' tidak siap dalam 10 detik'
        : 'tidak ada tombol download ' + RECORD_PLURAL + ' yang aman untuk diproses');
      return;
    }

    while (state.candidate) {
      const { row, button, invoiceNumber } = state.candidate;
      attemptedInvoiceNumbers.add(invoiceNumber);
      showProgress(clicked, invoiceNumber, 'menyiapkan klik download');

      // Revalidate immediately before clicking because Coretax can rerender the table.
      if (getInvoiceNumber(row) !== invoiceNumber || !isReady(button)) {
        skippedInvoiceNumbers.add(invoiceNumber);
        showProgress(clicked, invoiceNumber, 'tombol tidak lagi siap, ' + RECORD_PLURAL + ' dilewati');
      } else {
        try {
          button.click();
          clicked++;
          showProgress(clicked, invoiceNumber, 'klik dipicu, menunggu browser memproses download');
        } catch (_) {
          failedInvoiceNumbers.add(invoiceNumber);
          showProgress(clicked, invoiceNumber, 'klik gagal dipicu, ' + RECORD_PLURAL + ' tidak akan diulang otomatis');
        }
      }

      await sleep(CLICK_DELAY_MS);
      if (stopRequested) {
        showSummary(clicked, 'dihentikan aman atas permintaan pengguna');
        return;
      }
      state = await waitForCandidate();
    }

    showSummary(clicked, state.hasPendingRows
      ? 'dihentikan aman karena tombol ' + RECORD_PLURAL + ' berikutnya tidak siap dalam 10 detik'
      : 'tidak ada ' + RECORD_PLURAL + ' baru yang aman untuk diproses');
  } catch (_) {
    showSummary(clicked, 'dihentikan aman karena tabel berubah atau browser mengalami masalah');
  } finally {
    delete window.__ripitaInvoiceDownloadRunning;
  }
})();`;
}

export function createInvoiceBookmarkletUrl(kind: CoretaxBookmarkletKind = "invoice"): string {
  return `javascript:${encodeURIComponent(createInvoiceBookmarkletSource(kind))}`;
}

export const INVOICE_BOOKMARKLET_URL = createInvoiceBookmarkletUrl();
