// Content script: memicu tombol download yang sudah ada di tabel Coretax.
// Tidak membaca kredensial dan tidak mengirim data ke server mana pun.
(() => {
  if (window.__ripitaExtLoaded) return;
  window.__ripitaExtLoaded = true;

  const CONFIGS = {
    invoice: { tableSelector: "#table-el", label: "Nomor Faktur Pajak", plural: "faktur" },
    "withholding-slip": { tableSelector: ".p-datatable-wrapper table", label: "Nomor Pemotongan", plural: "bukti potong" },
  };
  const BUTTON_SELECTOR = '[id="DownloadButton"]';
  const WAIT_TIMEOUT_MS = 10000;
  const POLL_MS = 250;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (v) => (v || "").replace(/\s+/g, " ").trim();
  const isReady = (b) =>
    b && b.isConnected && b.getClientRects().length > 0 &&
    getComputedStyle(b).visibility === "visible" && getComputedStyle(b).display !== "none" &&
    !b.disabled && b.getAttribute("aria-disabled") !== "true";

  const state = {
    running: false, paused: false, stop: false,
    clicked: 0, skipped: 0, failed: 0, current: "", message: "Siap.", done: false,
    kind: "invoice", total: 0,
  };

  function recordNumber(row, label) {
    const cell = [...row.querySelectorAll("td")].find((c) => {
      const t = c.querySelector(".p-column-title");
      return norm(t && t.textContent) === label;
    });
    if (!cell) return "";
    const t = cell.querySelector(".p-column-title");
    return norm((cell.textContent || "").replace(t ? t.textContent || "" : "", ""));
  }

  function inspect(cfg, attempted) {
    const rows = [...document.querySelectorAll(cfg.tableSelector + " tbody tr")];
    let pending = false, total = 0, candidate = null;
    for (const row of rows) {
      const number = recordNumber(row, cfg.label);
      const button = row.querySelector(BUTTON_SELECTOR);
      if (!number || !button) continue;
      total++;
      if (attempted.has(number)) continue;
      pending = true;
      if (!candidate && isReady(button)) candidate = { row, button, number };
    }
    return { candidate, pending, total };
  }

  async function waitForCandidate(cfg, attempted) {
    const t0 = Date.now();
    let s = inspect(cfg, attempted);
    while (!s.candidate && s.pending && Date.now() - t0 < WAIT_TIMEOUT_MS) {
      await sleep(POLL_MS);
      s = inspect(cfg, attempted);
    }
    return s;
  }

  async function run(kind, delayMs) {
    const cfg = CONFIGS[kind];
    Object.assign(state, { running: true, paused: false, stop: false, clicked: 0, skipped: 0, failed: 0, current: "", done: false, kind, message: "Memproses…" });
    const attempted = new Set();
    try {
      let s = await waitForCandidate(cfg, attempted);
      state.total = s.total;
      while (s.candidate) {
        const { row, button, number } = s.candidate;
        attempted.add(number);
        state.current = number;
        if (recordNumber(row, cfg.label) !== number || !isReady(button)) {
          state.skipped++;
        } else {
          try { button.click(); state.clicked++; } catch { state.failed++; }
        }
        await sleep(delayMs);
        while (state.paused && !state.stop) await sleep(300);
        if (state.stop) { state.message = "Dihentikan atas permintaan pengguna."; return; }
        s = await waitForCandidate(cfg, attempted);
      }
      state.message = s.pending
        ? `Berhenti: tombol ${cfg.plural} berikutnya tidak siap dalam 10 detik.`
        : `Selesai. Tidak ada ${cfg.plural} baru yang bisa diproses.`;
    } catch {
      state.message = "Berhenti: tabel berubah atau terjadi masalah.";
    } finally {
      state.running = false; state.paused = false; state.done = true;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    if (msg.type === "scan") {
      const cfg = CONFIGS[msg.kind];
      const s = inspect(cfg, new Set());
      let ready = 0;
      document.querySelectorAll(cfg.tableSelector + " tbody tr").forEach((row) => {
        if (recordNumber(row, cfg.label) && isReady(row.querySelector(BUTTON_SELECTOR))) ready++;
      });
      reply({ total: s.total, ready, plural: cfg.plural });
    } else if (msg.type === "start") {
      if (state.running) return reply({ ok: false, error: "Antrean masih berjalan." });
      run(msg.kind, Math.max(500, msg.delayMs || 2000));
      reply({ ok: true });
    } else if (msg.type === "pause") { state.paused = !state.paused; reply({ ok: true });
    } else if (msg.type === "stop") { state.stop = true; reply({ ok: true });
    } else if (msg.type === "status") { reply({ ...state }); }
    return true;
  });
})();
