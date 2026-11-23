(() => {
  "use strict";
  const DATA_KEY = "ripidit-utpi-confirmation-v1",
    SETTINGS_KEY = "ripidit-utpi-settings-v1";
  const DEFAULT_SETTINGS = {
    officeName: "",
    officeAddress: "",
    officeCity: "",
    attention: "",
    phone: "",
    email: "",
    replyMethod: "",
  };
  const fallbackStore = {};
  const storage = {
    get(k) {
      try {
        return window.localStorage.getItem(k);
      } catch (e) {
        return fallbackStore[k] ?? null;
      }
    },
    set(k, v) {
      try {
        window.localStorage.setItem(k, v);
        return true;
      } catch (e) {
        fallbackStore[k] = String(v);
        return false;
      }
    },
  };
  const state = {
    letters: [],
    selected: new Set(),
    editingCode: null,
    lastBatchId: null,
    downloadCancelled: false,
    downloadBusy: false,
    settings: { ...DEFAULT_SETTINGS },
    scale: 0.37,
    search: "",
    type: "receivable",
  };
  const $ = (id) => document.getElementById(id);
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#039;",
          '"': "&quot;",
        })[c],
    );
  const safe = (v) => String(v ?? "").trim();
  const norm = (v) =>
    String(v ?? "")
      .toLowerCase()
      .replace(/\*/g, "")
      .replace(/[\s_\-\/().]/g, "")
      .replace(/[^a-z0-9]/g, "");
  const money = (v) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    let x = String(v ?? "").trim();
    if (!x) return 0;
    x = x.replace(/[^0-9,.-]/g, "");
    let n;
    if (x.includes(",") && x.includes("."))
      n = Number(x.replace(/\./g, "").replace(",", "."));
    else if (x.includes(",")) n = Number(x.replace(",", "."));
    else n = Number(x);
    return Number.isFinite(n) ? n : 0;
  };
  const iso = (v) => {
    let x = String(v ?? "").trim();
    if (!x) return "";
    if (/^\d+(\.\d+)?$/.test(x) && Number(x) > 20000 && Number(x) < 70000) {
      let d = new Date(Math.round((Number(x) - 25569) * 86400000));
      return isNaN(d) ? "" : d.toISOString().slice(0, 10);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(x)) return x.slice(0, 10);
    let m = x.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
    if (m) {
      let y = m[3].length === 2 ? "20" + m[3] : m[3];
      return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
    let d = new Date(x);
    return isNaN(d) ? x : d.toISOString().slice(0, 10);
  };
  const fmtDate = (v) => {
    let d = iso(v);
    if (!d) return "....................";
    let x = new Date(d + "T00:00:00");
    return isNaN(x)
      ? safe(v)
      : new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(x);
  };
  const fmtMoney = (v, c = "IDR") => {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: c || "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(money(v));
    } catch (e) {
      return (
        new Intl.NumberFormat("id-ID", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(money(v)) +
        " " +
        (c || "")
      );
    }
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const statusMap = {
    draft: "Draft",
    ready: "Siap Cetak",
    sent: "Sudah Dikirim",
    answered: "Sudah Dijawab",
    difference: "Ada Selisih",
    noreply: "Tidak Ada Balasan",
  };
  const typeText = (t) => (t === "payable" ? "Utang" : "Piutang");
  const typeCounterparty = (t) => (t === "payable" ? "Supplier" : "Pelanggan");
  const nextCode = (t) =>
    `${t === "payable" ? "KU" : "KP"}-${today().replaceAll("-", "")}-${String(state.letters.length + 1).padStart(3, "0")}`;
  function toast(msg, type = "ok") {
    let e = $("toast");
    e.textContent = msg;
    e.className = "toast " + type + " show";
    clearTimeout(toast.t);
    toast.t = setTimeout(() => e.classList.remove("show"), 3200);
  }
  function saveState() {
    storage.set(
      DATA_KEY,
      JSON.stringify({
        letters: state.letters,
        selected: [...state.selected],
        lastBatchId: state.lastBatchId,
      }),
    );
  }
  function loadState() {
    try {
      let o = JSON.parse(storage.get(DATA_KEY) || "{}");
      state.letters = Array.isArray(o.letters) ? o.letters : [];
      state.selected = new Set(
        (o.selected || []).filter((c) =>
          state.letters.some((l) => l.code === c),
        ),
      );
      state.lastBatchId = o.lastBatchId || null;
    } catch (e) {}
    try {
      state.settings = {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(storage.get(SETTINGS_KEY) || "{}"),
      };
    } catch (e) {}
  }
  function switchView(v) {
    document
      .querySelectorAll(".view")
      .forEach((x) => x.classList.remove("active"));
    document
      .querySelectorAll(".main-nav button")
      .forEach((x) => x.classList.remove("active"));
    $(v).classList.add("active");
    document
      .querySelector(`.main-nav button[data-view="${v}"]`)
      ?.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function setType(t, resetCode = false) {
    state.type = t;
    document
      .querySelectorAll(".type-card")
      .forEach((b) => b.classList.toggle("active", b.dataset.type === t));
    $("counterpartyCaption").textContent =
      "Data " +
      typeCounterparty(t) +
      (t === "payable" ? " / kreditur" : " / debitur");
    $("counterpartyLabel").innerHTML =
      "Nama " + typeCounterparty(t) + ' <span class="required">*</span>';
    $("counterpartyAddressLabel").innerHTML =
      "Alamat " + typeCounterparty(t) + " <small>(opsional)</small>";
    $("fCounterparty").placeholder = "PT / CV / Nama " + typeCounterparty(t);
    if (resetCode) $("fCode").value = nextCode(t);
    renderPreview();
  }
  function detailRow(d = {}) {
    let r = document.createElement("div");
    r.className = "detail-row";
    r.innerHTML = `<input class="dDate" type="date"><input class="dDoc" placeholder="No. Invoice"><input class="dDesc" placeholder="Uraian"><input class="dDue" type="date"><input class="dAmount" inputmode="decimal" placeholder="0"><input class="dPayment" inputmode="decimal" placeholder="0"><button type="button" class="remove-detail">×</button>`;
    r.querySelector(".dDate").value = d.date || "";
    r.querySelector(".dDoc").value = d.document || "";
    r.querySelector(".dDesc").value = d.description || "";
    r.querySelector(".dDue").value = d.dueDate || "";
    r.querySelector(".dAmount").value = d.amount ?? "";
    r.querySelector(".dPayment").value = d.payment ?? "";
    r.querySelectorAll("input").forEach((i) =>
      i.addEventListener("input", renderPreview),
    );
    r.querySelector(".remove-detail").onclick = () => {
      if (document.querySelectorAll(".detail-row").length === 1) {
        toast("Sisakan minimal satu baris rincian.", "warn");
        return;
      }
      r.remove();
      renderPreview();
    };
    $("details").appendChild(r);
  }
  function getDetails() {
    return [...document.querySelectorAll(".detail-row")]
      .map((r) => ({
        date: r.querySelector(".dDate").value,
        document: safe(r.querySelector(".dDoc").value),
        description: safe(r.querySelector(".dDesc").value),
        dueDate: r.querySelector(".dDue").value,
        amount: money(r.querySelector(".dAmount").value),
        payment: money(r.querySelector(".dPayment").value),
      }))
      .filter(
        (x) =>
          x.date ||
          x.document ||
          x.description ||
          x.dueDate ||
          x.amount ||
          x.payment,
      );
  }
  function getForm() {
    return {
      type: state.type,
      code: safe($("fCode").value),
      number: safe($("fNumber").value),
      client: safe($("fClient").value),
      clientAddress: safe($("fClientAddress").value),
      city: safe($("fCity").value),
      letterDate: $("fLetterDate").value,
      balanceDate: $("fBalanceDate").value,
      deadlineDays: Math.max(1, Number($("fDeadlineDays").value || 7)),
      counterparty: safe($("fCounterparty").value),
      counterpartyAddress: safe($("fCounterpartyAddress").value),
      attention: safe($("fAttention").value),
      phone: safe($("fPhone").value),
      email: safe($("fEmail").value),
      amount:
        safe($("fAmount").value) === "" ? null : money($("fAmount").value),
      currency: $("fCurrency").value,
      reference: safe($("fReference").value),
      explanation: safe($("fExplanation").value),
      recipientName: safe($("fRecipientName").value),
      recipientAddress: safe($("fRecipientAddress").value),
      recipientCity: safe($("fRecipientCity").value),
      recipientAttention: safe($("fRecipientAttention").value),
      recipientPhone: safe($("fRecipientPhone").value),
      replyContact: safe($("fReplyContact").value),
      replyMethod: safe($("fReplyMethod").value),
      signer: safe($("fSigner").value),
      role: safe($("fRole").value),
      note: safe($("fNote").value),
      includeDetail: $("fIncludeDetail").checked,
      qrEnabled: $("fQrEnabled").checked,
      qrFormUrl: safe($("fQrFormUrl").value),
      qrEntryCode: safe($("fQrEntryCode").value),
      qrEntryType: safe($("fQrEntryType").value),
      qrEntryYear: safe($("fQrEntryYear").value),
      qrEntryCounterparty: safe($("fQrEntryCounterparty").value),
      qrEntryClient: safe($("fQrEntryClient").value),
      qrCaption: safe($("fQrCaption").value),
      status: $("fStatus").value,
      details: getDetails(),
    };
  }
  function setVal(id, v) {
    $(id).value = v ?? "";
  }
  function setForm(l = {}) {
    state.type = l.type || "receivable";
    setVal("fCode", l.code || nextCode(state.type));
    setVal("fNumber", l.number);
    setVal("fClient", l.client);
    setVal("fClientAddress", l.clientAddress);
    setVal("fCity", l.city);
    setVal("fLetterDate", l.letterDate || today());
    setVal("fBalanceDate", l.balanceDate);
    setVal("fDeadlineDays", l.deadlineDays || 7);
    setVal("fCounterparty", l.counterparty);
    setVal("fCounterpartyAddress", l.counterpartyAddress);
    setVal("fAttention", l.attention);
    setVal("fPhone", l.phone);
    setVal("fEmail", l.email);
    setVal("fAmount", l.amount ?? "");
    $("fCurrency").value = l.currency || "IDR";
    setVal("fReference", l.reference);
    setVal("fExplanation", l.explanation);
    setVal("fRecipientName", l.recipientName);
    setVal("fRecipientAddress", l.recipientAddress);
    setVal("fRecipientCity", l.recipientCity);
    setVal("fRecipientAttention", l.recipientAttention);
    setVal("fRecipientPhone", l.recipientPhone);
    setVal("fReplyContact", l.replyContact);
    setVal("fReplyMethod", l.replyMethod);
    setVal("fSigner", l.signer);
    setVal("fRole", l.role);
    setVal("fNote", l.note);
    $("fIncludeDetail").checked = !!l.includeDetail;
    $("fQrEnabled").checked = !!l.qrEnabled;
    setVal("fQrFormUrl", l.qrFormUrl);
    setVal("fQrEntryCode", l.qrEntryCode);
    setVal("fQrEntryType", l.qrEntryType);
    setVal("fQrEntryYear", l.qrEntryYear);
    setVal("fQrEntryCounterparty", l.qrEntryCounterparty);
    setVal("fQrEntryClient", l.qrEntryClient);
    setVal(
      "fQrCaption",
      l.qrCaption || "Pindai untuk mengunggah jawaban konfirmasi",
    );
    $("fStatus").value = l.status || "draft";
    $("details").innerHTML = "";
    (l.details?.length ? l.details : [{}]).forEach(detailRow);
    setType(state.type, false);
    renderQrSetupPreview(getForm());
  }
  const BATCH_COMMON_FIELDS = [
    "type",
    "client",
    "clientAddress",
    "city",
    "letterDate",
    "balanceDate",
    "deadlineDays",
    "currency",
    "recipientName",
    "recipientAddress",
    "recipientCity",
    "recipientAttention",
    "recipientPhone",
    "replyContact",
    "replyMethod",
    "signer",
    "role",
    "note",
    "status",
    "qrEnabled",
    "qrFormUrl",
    "qrEntryCode",
    "qrEntryType",
    "qrEntryYear",
    "qrEntryCounterparty",
    "qrEntryClient",
    "qrCaption",
  ];
  function getEditingLetter() {
    return state.letters.find((x) => x.code === state.editingCode) || null;
  }
  function currentBatchId() {
    return getEditingLetter()?.batchId || null;
  }
  function batchItems(id = currentBatchId()) {
    return id ? state.letters.filter((x) => x.batchId === id) : [];
  }
  function updateBatchUI() {
    let id = currentBatchId(),
      items = batchItems(id),
      banner = $("batchBanner"),
      saveCurrent = $("saveCurrent"),
      saveBtn = $("saveForm");
    if (id && items.length) {
      let current = getEditingLetter();
      banner.hidden = false;
      $("batchTitle").textContent =
        "Batch impor: " + (current?.importName || id);
      $("batchDescription").textContent =
        "Input umum akan diterapkan ke seluruh surat pada batch ini. Nama lawan transaksi, alamat tujuan, saldo, nomor surat, dan rincian invoice tetap dipertahankan per surat.";
      $("batchCount").textContent = items.length + " surat";
      saveCurrent.style.display = "inline-flex";
      saveBtn.textContent =
        "Terapkan data umum ke kelompok impor (" + items.length + " surat)";
    } else {
      banner.hidden = true;
      saveCurrent.style.display = "none";
      saveBtn.textContent = "Simpan surat";
    }
  }
  function applyFormToBatch() {
    let saved = saveForm(false);
    if (!saved) return null;
    let id = saved.batchId,
      items = batchItems(id);
    if (!id || items.length < 2) {
      toast("Surat berhasil disimpan.");
      updateBatchUI();
      return saved;
    }
    for (let item of items) {
      if (item.code === saved.code) continue;
      for (let key of BATCH_COMMON_FIELDS) item[key] = saved[key];
    }
    saveState();
    renderList();
    updateBatchUI();
    $("formHint").textContent =
      "Input umum diterapkan ke " +
      items.length +
      " surat dalam batch. Data saldo dan lawan transaksi tidak berubah.";
    toast("Input umum diterapkan ke " + items.length + " surat.");
    return saved;
  }
  function saveOrApply() {
    return currentBatchId() ? applyFormToBatch() : saveForm();
  }
  function newLetter() {
    state.editingCode = null;
    setForm({});
    $("editorTitle").textContent = "Buat surat konfirmasi baru";
    $("editorDescription").textContent =
      "Pilih jenis surat dan lengkapi saldo yang akan dikonfirmasikan.";
    $("editorStatus").textContent = "Draft baru";
    $("formHint").textContent =
      "Belum disimpan. Kamu dapat mencetak draf meskipun informasi tertentu masih kosong.";
    updateBatchUI();
    switchView("workspace");
  }
  function editLetter(code) {
    let l = state.letters.find((x) => x.code === code);
    if (!l) return;
    state.editingCode = code;
    setForm(l);
    $("editorTitle").textContent = "Edit surat - " + l.code;
    $("editorDescription").textContent = l.batchId
      ? "Isi data umum sekali, lalu terapkan ke seluruh surat dalam batch impor ini."
      : "Perubahan akan memperbarui surat konfirmasi yang sudah tersimpan.";
    $("editorStatus").textContent = statusMap[l.status] || "Draft";
    $("formHint").textContent = l.batchId
      ? "Data lawan transaksi, saldo, dan rincian tetap khusus untuk surat ini."
      : "Mode edit. Klik Simpan surat untuk memperbarui data.";
    updateBatchUI();
    switchView("workspace");
  }
  function validate(l) {
    if (l.amount == null) return "Saldo";
    let fields = [
      ["code", "Kode Konfirmasi"],
      ["client", "Nama Klien"],
      ["city", "Kota Surat"],
      ["letterDate", "Tanggal Surat"],
      ["balanceDate", "Tanggal Saldo"],
      ["counterparty", "Nama " + typeCounterparty(l.type)],
      ["signer", "Nama Penandatangan"],
      ["role", "Jabatan"],
    ];
    let x = fields.find(([k]) => !safe(l[k]));
    return x ? x[1] : "";
  }
  function saveForm(show = true) {
    let l = getForm(),
      m = validate(l);
    if (m) {
      toast(m + " wajib diisi.", "err");
      return null;
    }
    let previous =
      state.letters.find((x) => x.code === state.editingCode) || null;
    if (previous) {
      l.batchId = previous.batchId || null;
      l.importName = previous.importName || "";
      l.importedAt = previous.importedAt || "";
    }
    let conflict = state.letters.find(
      (x) => x.code === l.code && x.code !== state.editingCode,
    );
    if (conflict) {
      toast("Kode Konfirmasi sudah dipakai. Gunakan kode berbeda.", "err");
      $("fCode").focus();
      return null;
    }
    if (state.editingCode) {
      let i = state.letters.findIndex((x) => x.code === state.editingCode);
      if (i >= 0) state.letters[i] = l;
      state.selected.delete(state.editingCode);
      state.selected.add(l.code);
    } else {
      state.letters.push(l);
      state.selected.add(l.code);
    }
    state.editingCode = l.code;
    saveState();
    renderList();
    $("editorTitle").textContent = "Edit surat - " + l.code;
    $("editorStatus").textContent = statusMap[l.status] || "Draft";
    $("formHint").textContent = "Perubahan tersimpan lokal pada browser ini.";
    updateBatchUI();
    if (show) toast("Surat berhasil disimpan.");
    return l;
  }
  function recipient(l) {
    let s = state.settings;
    return {
      name: safe(l.recipientName || s.officeName),
      address: safe(l.recipientAddress || s.officeAddress),
      city: safe(l.recipientCity || s.officeCity),
      attention: safe(l.recipientAttention || s.attention),
      phone: safe(l.recipientPhone || s.phone),
      email: safe(l.replyContact || s.email),
      method: safe(l.replyMethod || s.replyMethod),
    };
  }
  function yearOf(d) {
    return iso(d)?.slice(0, 4) || "....";
  }
  function direction(l) {
    return l.type === "payable"
      ? {
          title: "Pengukuhan Saldo Utang Dagang",
          subject: "utang",
          counter: "piutang kami kepada",
          answer: "saldo piutang kami kepada",
        }
      : {
          title: "Pengukuhan Saldo Piutang Dagang",
          subject: "piutang",
          counter: "utang",
          answer: "saldo utang kami kepada",
        };
  }
  function normalizeEntryId(v) {
    let x = safe(v);
    if (!x) return "";
    x = x.replace(/^.*?(entry\.\d+).*$/i, "$1");
    return /^entry\.\d+$/i.test(x) ? x : "";
  }
  function buildQrUrl(l) {
    if (!l?.qrEnabled) return "";
    let raw = safe(l.qrFormUrl);
    if (!raw) return "";
    if (!/^https:\/\//i.test(raw)) return "";
    try {
      let u = new URL(raw),
        pairs = [
          [l.qrEntryCode, l.code],
          [l.qrEntryType, l.type === "payable" ? "UTANG" : "PIUTANG"],
          [l.qrEntryYear, yearOf(l.balanceDate)],
          [l.qrEntryCounterparty, l.counterparty],
          [l.qrEntryClient, l.client],
        ];
      for (let [id, val] of pairs) {
        let key = normalizeEntryId(id);
        if (key && safe(val)) u.searchParams.set(key, safe(val));
      }
      if (
        !u.searchParams.has("usp") &&
        /docs\.google\.com\/forms/i.test(u.hostname + u.pathname)
      )
        u.searchParams.set("usp", "pp_url");
      return u.toString();
    } catch (e) {
      return "";
    }
  }
  function ensureQrReady(timeout = 15000) {
    if (typeof QRCode !== "undefined") return Promise.resolve();
    if (window.__RIPIDIT_QR_LOAD_ERROR)
      return Promise.reject(
        new Error(
          "Generator QR gagal dimuat. Periksa koneksi internet lalu buka ulang HTML.",
        ),
      );
    return new Promise((resolve, reject) => {
      let done = false,
        ok = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve();
        },
        bad = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          reject(
            new Error(
              "Generator QR gagal dimuat. Periksa koneksi internet lalu buka ulang HTML.",
            ),
          );
        },
        timer = setTimeout(bad, timeout);
      window.addEventListener("ripidit-qr-ready", ok, { once: true });
      window.addEventListener("ripidit-qr-error", bad, { once: true });
    });
  }
  function qrMatrix(text) {
    if (!text) throw new Error("Link QR belum diisi.");
    if (typeof QRCode === "undefined")
      throw new Error(
        "Generator QR belum termuat. Sambungkan internet lalu buka ulang HTML.",
      );
    let holder = document.createElement("div");
    holder.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:16px;height:16px;overflow:hidden";
    document.body.appendChild(holder);
    try {
      let q = new QRCode(holder, {
        text,
        width: 128,
        height: 128,
        correctLevel: QRCode.CorrectLevel.M,
      });
      let m = q?._oQRCode?.modules;
      if (!Array.isArray(m) || !m.length)
        throw new Error(
          "QR tidak dapat dibentuk. Link mungkin terlalu panjang.",
        );
      return m.map((row) => row.map(Boolean));
    } finally {
      holder.remove();
    }
  }
  function qrSvgMarkup(text) {
    let m = qrMatrix(text),
      n = m.length,
      b = 4,
      size = n + b * 2,
      path = [];
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (m[r][c]) path.push(`M${c + b} ${r + b}h1v1h-1z`);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-label="QR code"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path.join("")}" fill="#000"/></svg>`;
  }
  function qrBlockHtml(l) {
    let url = buildQrUrl(l);
    if (!url) return "";
    try {
      return `<div class="qr-letter-block">${qrSvgMarkup(url)}<b>${esc(l.qrCaption || "Pindai untuk mengunggah jawaban konfirmasi")}</b><span>Kode: ${esc(l.code || "-")}</span></div>`;
    } catch (e) {
      return `<div class="qr-letter-block"><b>QR belum tersedia</b><span>${esc(e.message || "Periksa link Google Form")}</span></div>`;
    }
  }
  function renderQrSetupPreview(l = getForm()) {
    let box = $("qrSetupPreview"),
      status = $("qrUrlStatus");
    if (!box || !status) return;
    let url = buildQrUrl(l);
    if (!l.qrEnabled) {
      box.innerHTML =
        '<div class="qr-empty">Aktifkan “Tampilkan QR pada surat”.</div>';
      status.textContent = "QR belum diaktifkan.";
      return;
    }
    if (!url) {
      box.innerHTML =
        '<div class="qr-empty">Tempel link Google Form yang diawali https://.</div>';
      status.textContent = "Link Google Form belum valid.";
      return;
    }
    try {
      box.innerHTML = qrSvgMarkup(url);
      status.textContent = "Link unik: " + url;
    } catch (e) {
      box.innerHTML =
        '<div class="qr-empty">' +
        esc(e.message || "QR tidak dapat dibuat.") +
        "</div>";
      status.textContent = e.message || "QR tidak dapat dibuat.";
    }
  }
  function openQrLink() {
    let l = getForm(),
      url = buildQrUrl(l);
    if (!url) {
      toast("Aktifkan QR dan isi link Google Form yang valid.", "err");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }
  function drawQrPdf(pdf, matrix, x, y, size) {
    let n = matrix.length,
      b = 4,
      total = n + b * 2,
      u = size / total;
    pdf.rect(x, y, size, size, 0.18, false);
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (matrix[r][c])
          pdf.fillRect(x + (c + b) * u, y + (r + b) * u, u + 0.015, u + 0.015);
  }
  function mainPage(l) {
    let r = recipient(l),
      d = direction(l),
      dest = r.name || "................................................";
    let answerIntro =
      l.type === "payable"
        ? `Bersama ini kami menyatakan Benar / *Tidak Benar bahwa ${d.answer} ${esc(l.client || "................................................")} per ${esc(fmtDate(l.balanceDate))} sebesar`
        : `Bersama ini kami menyatakan Benar / *Tidak Benar bahwa ${d.answer} ${esc(l.client || "................................................")} per ${esc(fmtDate(l.balanceDate))} sebesar`;
    return `<div class="letter-page"><div class="doc-topline">${esc(l.city || "")}, ${esc(fmtDate(l.letterDate))}</div><div class="to-block">Kepada Yth.<br><b>${esc(l.counterparty || "................................................")}</b>${l.attention ? "<br>u.p. " + esc(l.attention) : ""}<br>${esc(l.counterpartyAddress || "................................................")}</div><div class="subject"><div>Perihal</div><div>:</div><div><b>${d.title} Per ${esc(fmtDate(l.balanceDate))}</b>${l.number ? '<br><span style="font-size:8.7pt">No. ' + esc(l.number) + "</span>" : ""}</div></div><p class="paragraph">Dengan hormat,</p><p class="paragraph">Sehubungan dengan kegiatan pemeriksaan keuangan tahun buku ${esc(yearOf(l.balanceDate))} yang sedang berlangsung pada <b>${esc(l.client || "................................................")}</b>, bersama ini kami mohon pengukuhan (pernyataan) atas kebenaran saldo ${d.subject} kami. Kami mohon penjelasannya pada lembar jawaban konfirmasi ${typeText(l.type)} di bawah ini.</p><p class="paragraph">Jawaban segera kami harapkan dari Saudara dengan mengembalikan bagian bawah surat ini ${r.method ? esc(r.method) : "melalui pos / email"} langsung kepada <b>${esc(dest)}</b>${r.address ? " di " + esc(r.address) : ""}${r.email ? " / " + esc(r.email) : ""}.</p><p class="paragraph">Jawaban Saudara sangat kami perlukan untuk penyelesaian pemeriksaan akuntan atas laporan keuangan kami. Bila jawaban tidak diterima oleh auditor kami paling lambat ${esc(l.deadlineDays || 7)} (${esc(terbilang(l.deadlineDays || 7).toLowerCase())}) hari setelah tanggal tersebut di atas, maka kami anggap bahwa saldo perkiraan ${d.subject} kami adalah benar.</p>${l.note ? '<p class="paragraph" style="font-size:8.8pt">Catatan: ' + esc(l.note) + "</p>" : ""}<div class="signature">Hormat Kami,<br><b>${esc(l.client || "................................................")}</b><div class="sig-space"></div><div class="signature-name">${esc(l.signer || "................................................")}</div><div class="signature-role">${esc(l.role || "................................................")}</div></div>${qrBlockHtml(l)}<div class="divider"></div><div class="not-billing">SURAT INI BUKAN PENAGIHAN</div><div class="confirm-title">JAWABAN KONFIRMASI ${typeText(l.type).toUpperCase()} DAGANG</div><div class="confirm-counterparty">${esc(l.counterparty || "................................................")}</div><div class="receiver">Kepada Yth.<br><b>${esc(dest)}</b>${r.attention ? "<br>Up. " + esc(r.attention) : ""}<br>${esc(r.address || "................................................")}${r.city ? "<br>" + esc(r.city) : ""}</div><p class="answer-copy">Dengan hormat,</p><p class="answer-copy">${answerIntro}</p><div class="amount-grid"><div>*Jumlah</div><div>:</div><div>${esc(l.currency || "IDR")}</div><div>:</div><div class="amount-line">${esc(fmtMoney(l.amount, l.currency || "IDR").replace(/^Rp\s?/, ""))}</div></div><div class="words">(${esc(terbilang(l.amount, l.currency))})</div><div class="explain-grid"><div>Penjelasan</div><div>:</div><div class="explain-line">${esc(l.explanation || "")}</div></div><div class="explain-grid"><div></div><div>:</div><div class="explain-line"></div></div><div class="confirm-date">................................, ...................................................</div><div class="answer-footer"><div class="sign-fields">Nama : <span class="short-line"></span><br>Stempel & Jabatan : <span class="short-line"></span></div><div class="nb">NB : *coret salah satu & bila <i>tidak benar</i><br>isikan menurut catatan anda</div></div></div>`;
  }
  function terbilang(n, c = "IDR") {
    let num = Math.floor(Math.abs(money(n)));
    if (!num) return "Nol";
    let ones = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];
    function w(x) {
      x = Math.floor(x);
      if (x < 12) return ones[x];
      if (x < 20) return w(x - 10) + " Belas";
      if (x < 100)
        return (
          w(Math.floor(x / 10)) + " Puluh" + (x % 10 ? " " + w(x % 10) : "")
        );
      if (x < 200) return "Seratus" + (x % 100 ? " " + w(x % 100) : "");
      if (x < 1000)
        return (
          w(Math.floor(x / 100)) + " Ratus" + (x % 100 ? " " + w(x % 100) : "")
        );
      if (x < 2000) return "Seribu" + (x % 1000 ? " " + w(x % 1000) : "");
      if (x < 1000000)
        return (
          w(Math.floor(x / 1000)) +
          " Ribu" +
          (x % 1000 ? " " + w(x % 1000) : "")
        );
      if (x < 1000000000)
        return (
          w(Math.floor(x / 1000000)) +
          " Juta" +
          (x % 1000000 ? " " + w(x % 1000000) : "")
        );
      if (x < 1000000000000)
        return (
          w(Math.floor(x / 1000000000)) +
          " Milyar" +
          (x % 1000000000 ? " " + w(x % 1000000000) : "")
        );
      return (
        w(Math.floor(x / 1000000000000)) +
        " Triliun" +
        (x % 1000000000000 ? " " + w(x % 1000000000000) : "")
      );
    }
    return w(num) + (c && c !== "IDR" ? " " + c : "");
  }
  function detailPages(l) {
    if (!l.includeDetail || !l.details?.length) return "";
    let chunks = [];
    for (let i = 0; i < l.details.length; i += 14)
      chunks.push(l.details.slice(i, i + 14));
    return chunks
      .map(
        (rows, idx) =>
          `<div class="letter-page"><div class="doc-title">LAMPIRAN RINCIAN ${l.type === "payable" ? "TAGIHAN / UTANG" : "INVOICE / PIUTANG"}</div><div class="continuation-note">${esc(l.counterparty)} - ${esc(l.client)} - per ${esc(fmtDate(l.balanceDate))}${idx ? " - lanjutan " + (idx + 1) : ""}</div><table class="detail-table"><thead><tr><th>Tanggal</th><th>No. Dokumen</th><th>Uraian</th><th>Jatuh Tempo</th><th>Nilai</th><th>Pembayaran / Kredit</th><th>Saldo</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${esc(fmtDate(x.date))}</td><td>${esc(x.document)}</td><td>${esc(x.description)}</td><td>${esc(fmtDate(x.dueDate))}</td><td class="num">${esc(fmtMoney(x.amount, l.currency))}</td><td class="num">${esc(fmtMoney(x.payment, l.currency))}</td><td class="num">${esc(fmtMoney(Math.max(0, money(x.amount) - money(x.payment)), l.currency))}</td></tr>`).join("")}</tbody></table><div class="footer-note">Kode Konfirmasi: ${esc(l.code)} | Lampiran ${idx + 1}</div></div>`,
      )
      .join("");
  }
  function renderDocument(l) {
    return mainPage(l) + detailPages(l);
  }
  function renderPreview() {
    let l = getForm();
    renderQrSetupPreview(l);
    let has = l.code || l.client || l.counterparty || l.letterDate;
    if (!has) {
      $("previewWrap").innerHTML =
        '<div class="preview-placeholder"><div><b>Mulai isi data surat</b>Surat pengantar dan lembar jawaban akan muncul di sini.</div></div>';
      $("previewMeta").textContent = "Preview mengikuti data form.";
      return;
    }
    let s = state.scale;
    $("previewWrap").innerHTML =
      `<div class="preview-scale" style="zoom:${s}"><div class="preview-paper">${renderDocument(l)}</div></div>`;
    $("previewMeta").textContent =
      `${typeText(l.type)} - ${l.counterparty || "Pihak belum diisi"} - ${l.client || "Klien belum diisi"}`;
  }
  function pdfAscii(v) {
    return String(v ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—]/g, "-")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[^\x20-\x7E]/g, " ");
  }
  function pdfEsc(v) {
    return pdfAscii(v)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }
  function mm(v) {
    return (v * 72) / 25.4;
  }
  function estimateMm(text, size, bold = false) {
    return (pdfAscii(text).length * size * (bold ? 0.54 : 0.5) * 25.4) / 72;
  }
  function wrapPdf(text, width, size, bold = false) {
    let all = pdfAscii(text).split(/\r?\n/),
      lines = [];
    for (let para of all) {
      let words = para.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        continue;
      }
      let line = "";
      for (let word of words) {
        let test = line ? line + " " + word : word;
        if (estimateMm(test, size, bold) <= width || !line) line = test;
        else {
          lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
    }
    return lines;
  }
  class RipiditPDF {
    constructor() {
      this.pages = [];
      this.page = null;
      this.addPage();
    }
    addPage() {
      this.page = [];
      this.pages.push(this.page);
    }
    cmd(x) {
      this.page.push(x);
    }
    text(x, y, text, size = 9, bold = false, align = "left") {
      let t = pdfAscii(text),
        xx = x;
      if (align === "center") xx = x - estimateMm(t, size, bold) / 2;
      if (align === "right") xx = x - estimateMm(t, size, bold);
      this.cmd(
        `BT /${bold ? "F2" : "F1"} ${size.toFixed(2)} Tf 1 0 0 1 ${mm(xx).toFixed(2)} ${mm(297 - y).toFixed(2)} Tm (${pdfEsc(t)}) Tj ET`,
      );
    }
    line(x1, y1, x2, y2, w = 0.25) {
      this.cmd(
        `${mm(w).toFixed(2)} w ${mm(x1).toFixed(2)} ${mm(297 - y1).toFixed(2)} m ${mm(x2).toFixed(2)} ${mm(297 - y2).toFixed(2)} l S`,
      );
    }
    rect(x, y, w, h, lw = 0.25, fill = false) {
      this.cmd(
        `${mm(lw).toFixed(2)} w ${mm(x).toFixed(2)} ${mm(297 - y - h).toFixed(2)} ${mm(w).toFixed(2)} ${mm(h).toFixed(2)} re ${fill ? "B" : "S"}`,
      );
    }
    fillRect(x, y, w, h) {
      this.cmd(
        `${mm(x).toFixed(2)} ${mm(297 - y - h).toFixed(2)} ${mm(w).toFixed(2)} ${mm(h).toFixed(2)} re f`,
      );
    }
    wrapped(
      x,
      y,
      width,
      text,
      size = 9,
      lineH = 4.2,
      bold = false,
      maxLines = 99,
    ) {
      let lines = wrapPdf(text, width, size, bold).slice(0, maxLines);
      for (let i = 0; i < lines.length; i++)
        this.text(x, y + i * lineH, lines[i], size, bold);
      return y + lines.length * lineH;
    }
    blob() {
      let objects = [],
        pageIds = [],
        contentIds = [];
      for (let i = 0; i < this.pages.length; i++) {
        pageIds.push(5 + i * 2);
        contentIds.push(6 + i * 2);
      }
      objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
      objects[2] = `<< /Type /Pages /Kids [${pageIds.map((x) => x + " 0 R").join(" ")}] /Count ${pageIds.length} >>`;
      objects[3] =
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
      objects[4] =
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
      for (let i = 0; i < this.pages.length; i++) {
        let content = this.pages[i].join("\n");
        objects[pageIds[i]] =
          `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
        objects[contentIds[i]] =
          `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
      }
      let out = "%PDF-1.4\n%RIPIDIT\n",
        offsets = [0];
      for (let i = 1; i < objects.length; i++) {
        offsets[i] = out.length;
        out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
      }
      let xref = out.length;
      out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
      for (let i = 1; i < objects.length; i++)
        out += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
      out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
      return new Blob([out], { type: "application/pdf" });
    }
  }
  function pdfParagraph(pdf, x, y, w, text, size = 8.6, lineH = 4.1) {
    return pdf.wrapped(x, y, w, text, size, lineH, false);
  }
  function drawMainPdf(pdf, l) {
    let r = recipient(l),
      d = direction(l),
      dest = r.name || "................................................",
      left = 18,
      right = 192,
      y = 18;
    pdf.text(left, y, (l.city || "") + ", " + fmtDate(l.letterDate), 9);
    y += 9;
    pdf.text(left, y, "Kepada Yth.", 9);
    y += 4.5;
    pdf.text(
      left,
      y,
      l.counterparty || "................................................",
      9,
      true,
    );
    y += 4.5;
    if (l.attention) {
      pdf.text(left, y, "u.p. " + l.attention, 8.7);
      y += 4.2;
    }
    y =
      pdf.wrapped(
        left,
        y,
        100,
        l.counterpartyAddress ||
          "................................................",
        8.6,
        4,
        false,
        3,
      ) + 4;
    pdf.text(left, y, "Perihal", 9);
    pdf.text(left + 23, y, ":", 9);
    pdf.text(left + 28, y, d.title + " Per " + fmtDate(l.balanceDate), 9, true);
    y += 4.5;
    if (l.number) {
      pdf.text(left + 28, y, "No. " + l.number, 8);
      y += 4;
    }
    y += 3;
    pdf.text(left, y, "Dengan hormat,", 8.7);
    y += 6;
    y =
      pdfParagraph(
        pdf,
        left,
        y,
        right - left,
        `Sehubungan dengan kegiatan pemeriksaan keuangan tahun buku ${yearOf(l.balanceDate)} yang sedang berlangsung pada ${l.client || "................................................"}, bersama ini kami mohon pengukuhan (pernyataan) atas kebenaran saldo ${d.subject} kami. Kami mohon penjelasannya pada lembar jawaban konfirmasi ${typeText(l.type)} di bawah ini.`,
      ) + 3;
    y =
      pdfParagraph(
        pdf,
        left,
        y,
        right - left,
        `Jawaban segera kami harapkan dari Saudara dengan mengembalikan bagian bawah surat ini ${r.method || "melalui pos / email"} langsung kepada ${dest}${r.address ? " di " + r.address : ""}${r.email ? " / " + r.email : ""}.`,
      ) + 3;
    y =
      pdfParagraph(
        pdf,
        left,
        y,
        right - left,
        `Jawaban Saudara sangat kami perlukan untuk penyelesaian pemeriksaan akuntan atas laporan keuangan kami. Bila jawaban tidak diterima oleh auditor kami paling lambat ${l.deadlineDays || 7} (${terbilang(l.deadlineDays || 7).toLowerCase()}) hari setelah tanggal tersebut di atas, maka kami anggap bahwa saldo perkiraan ${d.subject} kami adalah benar.`,
      ) + 2;
    if (l.note)
      y =
        pdfParagraph(pdf, left, y, right - left, "Catatan: " + l.note, 8, 3.8) +
        2;
    let sigY = Math.max(y + 3, 112);
    pdf.text(left, sigY, "Hormat Kami,", 8.7);
    pdf.text(
      left,
      sigY + 5,
      l.client || "................................................",
      8.7,
      true,
    );
    pdf.text(
      left,
      sigY + 25,
      l.signer || "................................................",
      8.7,
      true,
    );
    pdf.line(left, sigY + 26, left + 52, sigY + 26, 0.2);
    pdf.text(
      left,
      sigY + 31,
      l.role || "................................................",
      8.4,
    );
    if (l.qrEnabled) {
      let qrUrl = buildQrUrl(l);
      if (qrUrl) {
        let matrix = qrMatrix(qrUrl),
          qx = 155,
          qy = sigY + 1,
          qs = 24;
        drawQrPdf(pdf, matrix, qx, qy, qs);
        pdf.text(
          qx + qs / 2,
          qy + 28,
          l.qrCaption || "Pindai untuk mengunggah jawaban",
          6.8,
          true,
          "center",
        );
        pdf.text(
          qx + qs / 2,
          qy + 32,
          "Kode: " + (l.code || "-"),
          6.3,
          false,
          "center",
        );
      }
    }
    let divY = Math.max(sigY + 38, 154);
    pdf.line(left, divY, right, divY, 0.65);
    pdf.text(left, divY + 7, "SURAT INI BUKAN PENAGIHAN", 9, true);
    pdf.text(
      105,
      divY + 15,
      "JAWABAN KONFIRMASI " + typeText(l.type).toUpperCase() + " DAGANG",
      9.2,
      true,
      "center",
    );
    pdf.line(62, divY + 16.2, 148, divY + 16.2, 0.25);
    pdf.text(
      105,
      divY + 21,
      l.counterparty || "................................................",
      8.8,
      true,
      "center",
    );
    let ay = divY + 29;
    pdf.text(left, ay, "Kepada Yth.", 8.5);
    ay += 4.3;
    pdf.text(left, ay, dest, 8.7, true);
    ay += 4.3;
    if (r.attention) {
      pdf.text(left, ay, "Up. " + r.attention, 8.3);
      ay += 4;
    }
    ay = pdf.wrapped(
      left,
      ay,
      95,
      r.address || "................................................",
      8.2,
      3.8,
      false,
      2,
    );
    if (r.city) {
      pdf.text(left, ay, r.city, 8.2);
      ay += 4;
    }
    ay += 3;
    pdf.text(left, ay, "Dengan hormat,", 8.4);
    ay += 6;
    let ans = `Bersama ini kami menyatakan Benar / *Tidak Benar bahwa ${d.answer} ${l.client || "................................................"} per ${fmtDate(l.balanceDate)} sebesar`;
    ay = pdfParagraph(pdf, left, ay, right - left, ans, 8.2, 3.8) + 2;
    pdf.text(left, ay, "*Jumlah", 8.4);
    pdf.text(left + 36, ay, ":", 8.4);
    pdf.text(left + 43, ay, l.currency || "IDR", 8.4);
    pdf.text(left + 60, ay, ":", 8.4);
    pdf.text(
      left + 67,
      ay,
      fmtMoney(l.amount, l.currency || "IDR").replace(/^Rp\s?/, ""),
      8.6,
    );
    pdf.line(left + 66, ay + 1, right, ay + 1, 0.2);
    ay += 7;
    pdf.text(
      105,
      ay,
      "(" + terbilang(l.amount, l.currency) + ")",
      8.1,
      false,
      "center",
    );
    pdf.line(left + 18, ay + 1, right - 18, ay + 1, 0.2);
    ay += 8;
    pdf.text(left, ay, "Penjelasan", 8.3);
    pdf.text(left + 36, ay, ":", 8.3);
    pdf.text(left + 42, ay, l.explanation || "", 8.1);
    pdf.line(left + 41, ay + 1, right, ay + 1, 0.2);
    ay += 6;
    pdf.text(left + 36, ay, ":", 8.3);
    pdf.line(left + 41, ay + 1, right, ay + 1, 0.2);
    ay += 10;
    pdf.text(
      left,
      ay,
      "................................, ...................................................",
      8.2,
    );
    ay += 14;
    pdf.text(left, ay, "Nama :", 8.2);
    pdf.line(left + 15, ay + 1, left + 65, ay + 1, 0.2);
    pdf.text(126, ay, "NB : *coret salah satu & bila tidak benar", 7.6);
    ay += 6;
    pdf.text(left, ay, "Stempel & Jabatan :", 8.2);
    pdf.line(left + 38, ay + 1, left + 88, ay + 1, 0.2);
    pdf.text(126, ay, "isikan menurut catatan anda", 7.6);
  }
  function detailHeaderPdf(pdf, l, pageNo) {
    pdf.text(
      105,
      16,
      "LAMPIRAN RINCIAN " +
        (l.type === "payable" ? "TAGIHAN / UTANG" : "INVOICE / PIUTANG"),
      11,
      true,
      "center",
    );
    pdf.text(
      18,
      23,
      `${l.counterparty} - ${l.client} - per ${fmtDate(l.balanceDate)}${pageNo > 1 ? " - lanjutan " + pageNo : ""}`,
      8.5,
    );
    let cols = [18, 36, 61, 109, 131, 158, 185],
      widths = [18, 25, 48, 22, 27, 27, 19],
      headers = [
        "Tanggal",
        "No. Dokumen",
        "Uraian",
        "Jatuh Tempo",
        "Nilai",
        "Pembayaran / Kredit",
        "Saldo",
      ],
      y = 29;
    for (let i = 0; i < headers.length; i++) {
      pdf.rect(cols[i], y, widths[i], 9, 0.25);
      pdf.text(
        cols[i] + widths[i] / 2,
        y + 5.8,
        headers[i],
        7.2,
        true,
        "center",
      );
    }
    return y + 9;
  }
  function drawDetailsPdf(pdf, l) {
    if (!l.includeDetail || !l.details?.length) return;
    let y = 0,
      pageNo = 0;
    for (let idx = 0; idx < l.details.length; idx++) {
      let row = l.details[idx],
        desc = wrapPdf(row.description || "", 46, 7.2),
        rowH = Math.max(9, 4 + Math.min(desc.length, 3) * 3.3);
      if (!y || y + rowH > 275) {
        pdf.addPage();
        pageNo++;
        y = detailHeaderPdf(pdf, l, pageNo);
      }
      let cols = [18, 36, 61, 109, 131, 158, 185],
        widths = [18, 25, 48, 22, 27, 27, 19],
        vals = [
          fmtDate(row.date),
          row.document || "",
          row.description || "",
          fmtDate(row.dueDate),
          fmtMoney(row.amount, l.currency),
          fmtMoney(row.payment, l.currency),
          fmtMoney(
            Math.max(0, money(row.amount) - money(row.payment)),
            l.currency,
          ),
        ];
      for (let c = 0; c < vals.length; c++) {
        pdf.rect(cols[c], y, widths[c], rowH, 0.22);
        let lines = wrapPdf(vals[c], widths[c] - 2, 7.1).slice(
          0,
          c === 2 ? 3 : 2,
        );
        for (let j = 0; j < lines.length; j++)
          pdf.text(
            c >= 4 ? cols[c] + widths[c] - 1 : cols[c] + 1.2,
            y + 4 + j * 3.2,
            lines[j],
            7.1,
            false,
            c >= 4 ? "right" : "left",
          );
      }
      y += rowH;
      pdf.text(
        18,
        286,
        "Kode Konfirmasi: " + l.code + " | Lampiran " + pageNo,
        7.2,
      );
    }
  }
  function buildPdfBlob(l) {
    let pdf = new RipiditPDF();
    drawMainPdf(pdf, l);
    drawDetailsPdf(pdf, l);
    return pdf.blob();
  }
  function cleanFilePart(v) {
    return (
      safe(v)
        .replace(/[\\/:*?"<>|]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[. ]+$/, "") || "TANPA NAMA"
    );
  }
  function pdfFileName(l, used) {
    let base = `KONFIRMASI_${l.type === "payable" ? "UTANG" : "PIUTANG"}_${yearOf(l.balanceDate)}_${cleanFilePart(l.counterparty)}_PADA_${cleanFilePart(l.client)}`,
      name = base + ".PDF",
      n = 2;
    while (used.has(name.toUpperCase())) name = base + "_" + n++ + ".PDF";
    used.add(name.toUpperCase());
    return name;
  }
  function triggerDownload(blob, name) {
    let url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  function zipFileName(docs) {
    let types = [
      ...new Set(docs.map((l) => (l.type === "payable" ? "UTANG" : "PIUTANG"))),
    ];
    let years = [...new Set(docs.map((l) => yearOf(l.balanceDate)))];
    let clients = [...new Set(docs.map((l) => cleanFilePart(l.client)))];
    let typePart = types.length === 1 ? types[0] : "UTANG_PIUTANG";
    let yearPart = years.length === 1 ? years[0] : "MULTI TAHUN";
    let clientPart = clients.length === 1 ? clients[0] : "BEBERAPA PT KLIEN";
    return `KONFIRMASI_${typePart}_${yearPart}_PADA_${clientPart}.ZIP`;
  }
  const CRC_TABLE = (() => {
    let t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++)
      c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function le16(n) {
    let b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n, true);
    return b;
  }
  function le32(n) {
    let b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n >>> 0, true);
    return b;
  }
  function joinBytes(parts) {
    let total = parts.reduce((n, p) => n + p.length, 0),
      out = new Uint8Array(total),
      offset = 0;
    for (let p of parts) {
      out.set(p, offset);
      offset += p.length;
    }
    return out;
  }
  function dosStamp(date = new Date()) {
    let y = Math.max(1980, date.getFullYear());
    let time =
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2);
    let day = ((y - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { time, date: day };
  }
  async function makeZip(entries) {
    let enc = new TextEncoder(),
      locals = [],
      centrals = [],
      offset = 0,
      stamp = dosStamp();
    for (let entry of entries) {
      let name = enc.encode(entry.name);
      let data = new Uint8Array(await entry.blob.arrayBuffer());
      let crc = crc32(data);
      let local = joinBytes([
        le32(0x04034b50),
        le16(20),
        le16(0x0800),
        le16(0),
        le16(stamp.time),
        le16(stamp.date),
        le32(crc),
        le32(data.length),
        le32(data.length),
        le16(name.length),
        le16(0),
        name,
      ]);
      locals.push(local, data);
      let central = joinBytes([
        le32(0x02014b50),
        le16(20),
        le16(20),
        le16(0x0800),
        le16(0),
        le16(stamp.time),
        le16(stamp.date),
        le32(crc),
        le32(data.length),
        le32(data.length),
        le16(name.length),
        le16(0),
        le16(0),
        le16(0),
        le16(0),
        le32(0),
        le32(offset),
        name,
      ]);
      centrals.push(central);
      offset += local.length + data.length;
    }
    let centralSize = centrals.reduce((n, p) => n + p.length, 0);
    let eocd = joinBytes([
      le32(0x06054b50),
      le16(0),
      le16(0),
      le16(entries.length),
      le16(entries.length),
      le32(centralSize),
      le32(offset),
      le16(0),
    ]);
    return new Blob([...locals, ...centrals, eocd], {
      type: "application/zip",
    });
  }
  async function downloadZipDocs(docs) {
    if (state.downloadBusy) return;
    if (!docs.length) {
      toast("Tidak ada surat yang dipilih.", "warn");
      return;
    }
    let invalid = docs.find((l) => validate(l));
    if (invalid) {
      let missing = validate(invalid);
      toast(invalid.code + ": " + missing + " wajib diisi.", "err");
      editLetter(invalid.code);
      return;
    }
    state.downloadBusy = true;
    state.downloadCancelled = false;
    let overlay = $("downloadOverlay"),
      bar = $("downloadBar"),
      counter = $("downloadCounter");
    let percent = $("downloadPercent"),
      fileName = $("downloadFileName"),
      used = new Set(),
      entries = [];
    overlay.classList.add("show");
    $("downloadTitle").textContent =
      "Menyusun ZIP berisi " + docs.length + " PDF";
    $("downloadDescription").textContent =
      "Setiap lawan transaksi tetap memiliki satu PDF terpisah, lalu seluruh file dikemas dalam satu ZIP.";
    try {
      let badQr = docs.find((l) => l.qrEnabled && !buildQrUrl(l));
      if (badQr)
        throw new Error(
          "Link Google Form pada " + badQr.code + " belum valid.",
        );
      if (docs.some((l) => l.qrEnabled)) await ensureQrReady();
      for (let i = 0; i < docs.length; i++) {
        if (state.downloadCancelled) break;
        let l = docs[i],
          name = pdfFileName(l, used);
        let pct = Math.max(1, Math.round(((i + 1) / (docs.length + 1)) * 92));
        counter.textContent = i + 1 + " dari " + docs.length;
        percent.textContent = pct + "%";
        bar.style.width = pct + "%";
        fileName.textContent = name;
        entries.push({ name, blob: buildPdfBlob(l) });
        await sleep(0);
      }
      if (state.downloadCancelled) {
        toast("Pembuatan ZIP dibatalkan.", "warn");
        return;
      }
      counter.textContent = docs.length + " dari " + docs.length;
      percent.textContent = "96%";
      bar.style.width = "96%";
      fileName.textContent = "Mengemas " + docs.length + " PDF ke dalam ZIP...";
      let zip = await makeZip(entries);
      if (state.downloadCancelled) {
        toast("Pembuatan ZIP dibatalkan.", "warn");
        return;
      }
      let name = zipFileName(docs);
      percent.textContent = "100%";
      bar.style.width = "100%";
      fileName.textContent = name;
      triggerDownload(zip, name);
      toast("ZIP berisi " + docs.length + " PDF berhasil dibuat.");
    } catch (e) {
      console.error(e);
      toast("ZIP tidak dapat dibuat: " + (e.message || e), "err");
    } finally {
      state.downloadBusy = false;
      setTimeout(
        () => overlay.classList.remove("show"),
        state.downloadCancelled ? 200 : 850,
      );
    }
  }

  async function downloadDocs(docs) {
    if (state.downloadBusy) return;
    if (!docs.length) {
      toast("Tidak ada surat yang dipilih.", "warn");
      return;
    }
    let invalid = docs.find((l) => validate(l));
    if (invalid) {
      let missing = validate(invalid);
      toast(invalid.code + ": " + missing + " wajib diisi.", "err");
      return;
    }
    state.downloadBusy = true;
    state.downloadCancelled = false;
    let overlay = $("downloadOverlay"),
      bar = $("downloadBar"),
      counter = $("downloadCounter"),
      percent = $("downloadPercent"),
      fileName = $("downloadFileName"),
      used = new Set();
    overlay.classList.add("show");
    $("downloadTitle").textContent = "Menyiapkan " + docs.length + " PDF";
    $("downloadDescription").textContent =
      "PDF surat tunggal akan diunduh langsung. Untuk unduhan massal, gunakan tombol Download ZIP PDF terpilih.";
    try {
      let badQr = docs.find((l) => l.qrEnabled && !buildQrUrl(l));
      if (badQr)
        throw new Error(
          "Link Google Form pada " + badQr.code + " belum valid.",
        );
      if (docs.some((l) => l.qrEnabled)) await ensureQrReady();
      for (let i = 0; i < docs.length; i++) {
        if (state.downloadCancelled) break;
        let l = docs[i],
          name = pdfFileName(l, used),
          pct = Math.round(((i + 1) / docs.length) * 100);
        counter.textContent = i + 1 + " dari " + docs.length;
        percent.textContent = pct + "%";
        bar.style.width = pct + "%";
        fileName.textContent = name;
        triggerDownload(buildPdfBlob(l), name);
        await sleep(260);
      }
      if (state.downloadCancelled) toast("Download PDF dibatalkan.", "warn");
      else toast(docs.length + " PDF berhasil dibuat.");
    } catch (e) {
      console.error(e);
      toast("PDF tidak dapat dibuat: " + (e.message || e), "err");
    } finally {
      state.downloadBusy = false;
      setTimeout(
        () => overlay.classList.remove("show"),
        state.downloadCancelled ? 200 : 700,
      );
    }
  }
  function printDocs(docs) {
    return downloadDocs(docs);
  }
  function printCurrent() {
    let l = getForm(),
      previous = getEditingLetter();
    if (previous) {
      l.batchId = previous.batchId;
      l.importName = previous.importName;
    }
    downloadDocs([l]);
  }

  function filtered() {
    let q = state.search.toLowerCase().trim();
    return q
      ? state.letters.filter((l) =>
          [l.type, l.code, l.client, l.counterparty, l.amount, l.balanceDate]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : state.letters;
  }
  function renderList() {
    let items = filtered();
    $("listTitle").textContent = state.letters.length
      ? state.letters.length + " surat tersimpan"
      : "Belum ada surat";
    $("listSubtitle").textContent = state.letters.length
      ? `${state.letters.filter((l) => l.type === "receivable").length} piutang dan ${state.letters.filter((l) => l.type === "payable").length} utang dari input manual maupun impor Excel.`
      : "Simpan form atau impor Excel untuk memulai.";
    $("selectionFoot").textContent = state.selected.size + " dipilih";
    if (!items.length) {
      $("listContent").innerHTML =
        `<div class="empty-state"><div class="mark">⌁</div><h3>${state.letters.length ? "Surat tidak ditemukan" : "Belum ada surat konfirmasi"}</h3><p>${state.letters.length ? "Coba kata kunci lain." : "Kamu bisa mengisi form langsung atau impor data dari Excel."}</p><button class="btn btn-primary" id="emptyNew">＋ Buat surat</button></div>`;
      $("tableFoot").textContent = state.letters.length
        ? "Ubah kata kunci pencarian."
        : "Tidak ada data.";
      $("emptyNew")?.addEventListener("click", newLetter);
      return;
    }
    $("listContent").innerHTML =
      `<table class="table"><thead><tr><th><input id="selectAllCheck" class="check" type="checkbox" ${items.every((l) => state.selected.has(l.code)) ? "checked" : ""}></th><th>Jenis & Lawan Transaksi</th><th>Klien</th><th>Saldo</th><th>Tanggal Saldo</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${items.map((l) => `<tr><td><input class="check rowCheck" type="checkbox" data-code="${esc(l.code)}" ${state.selected.has(l.code) ? "checked" : ""}></td><td><span class="kind ${l.type}">${typeText(l.type)}</span><div class="counterparty" style="margin-top:5px">${esc(l.counterparty || "Belum diisi")}</div><div class="sub">${esc(l.code)}</div></td><td>${esc(l.client || "Belum diisi")}</td><td>${esc(fmtMoney(l.amount, l.currency))}<div class="sub">${l.details?.length || 0} rincian</div></td><td>${esc(fmtDate(l.balanceDate))}</td><td><span class="badge ${esc(l.status || "draft")}">${esc(statusMap[l.status] || "Draft")}</span></td><td><button class="rowbtn editBtn" data-code="${esc(l.code)}" title="Edit">✎</button><button class="rowbtn printBtn" data-code="${esc(l.code)}" title="Cetak">▣</button><button class="rowbtn deleteBtn" data-code="${esc(l.code)}" title="Hapus">×</button></td></tr>`).join("")}</tbody></table>`;
    $("tableFoot").textContent =
      `Menampilkan ${items.length} dari ${state.letters.length} surat.`;
    $("selectAllCheck").onchange = (e) => {
      items.forEach((l) =>
        e.target.checked
          ? state.selected.add(l.code)
          : state.selected.delete(l.code),
      );
      saveState();
      renderList();
    };
    document.querySelectorAll(".rowCheck").forEach(
      (x) =>
        (x.onchange = (e) => {
          e.target.checked
            ? state.selected.add(e.target.dataset.code)
            : state.selected.delete(e.target.dataset.code);
          saveState();
          renderList();
        }),
    );
    document
      .querySelectorAll(".editBtn")
      .forEach((x) => (x.onclick = () => editLetter(x.dataset.code)));
    document.querySelectorAll(".printBtn").forEach(
      (x) =>
        (x.onclick = () => {
          let l = state.letters.find((y) => y.code === x.dataset.code);
          if (l) printDocs([l]);
        }),
    );
    document.querySelectorAll(".deleteBtn").forEach(
      (x) =>
        (x.onclick = () => {
          if (confirm("Hapus surat " + x.dataset.code + "?")) {
            state.letters = state.letters.filter(
              (y) => y.code !== x.dataset.code,
            );
            state.selected.delete(x.dataset.code);
            if (state.editingCode === x.dataset.code) newLetter();
            saveState();
            renderList();
            toast("Surat dihapus.", "warn");
          }
        }),
    );
  }
  function mapRow(row, headers) {
    return {
      g: (...names) => {
        for (let n of names) {
          let i = headers[norm(n)];
          if (i !== undefined) return row[i] ?? "";
        }
        return "";
      },
    };
  }
  function sheetFromMatrix(m) {
    let rows = m.filter((r) => r.some((v) => safe(v))),
      at = -1;
    for (let i = 0; i < Math.min(rows.length, 16); i++) {
      if (rows[i].map(norm).includes("kodekonfirmasi")) {
        at = i;
        break;
      }
    }
    if (at < 0) return { headers: {}, rows: [] };
    let h = {};
    rows[at].forEach((v, i) => {
      if (safe(v)) h[norm(v)] = i;
    });
    let data = [];
    for (let i = at + 1; i < rows.length; i++) {
      if (!rows[i].some((v) => safe(v))) continue;
      data.push(rows[i]);
    }
    return { headers: h, rows: data };
  }
  function col(ref) {
    let n = 0;
    for (let c of (ref.match(/[A-Z]+/i) || ["A"])[0].toUpperCase())
      n = n * 26 + (c.charCodeAt(0) - 64);
    return n - 1;
  }
  function xml(t) {
    let d = new DOMParser().parseFromString(t, "application/xml");
    if (d.querySelector("parsererror"))
      throw new Error("XML Excel tidak valid.");
    return d;
  }
  const tags = (root, name) =>
    [...root.getElementsByTagName("*")].filter((x) => x.localName === name);
  async function readZip(buf) {
    let v = new DataView(buf),
      p = -1;
    for (let i = v.byteLength - 22; i >= Math.max(0, v.byteLength - 66000); i--)
      if (v.getUint32(i, true) === 0x06054b50) {
        p = i;
        break;
      }
    if (p < 0) throw new Error("File bukan Excel .xlsx yang valid.");
    let count = v.getUint16(p + 10, true),
      off = v.getUint32(p + 16, true),
      entries = new Map(),
      dec = new TextDecoder("utf-8");
    for (let i = 0; i < count; i++) {
      if (v.getUint32(off, true) !== 0x02014b50)
        throw new Error("Struktur ZIP Excel tidak valid.");
      let method = v.getUint16(off + 10, true),
        size = v.getUint32(off + 20, true),
        nlen = v.getUint16(off + 28, true),
        elen = v.getUint16(off + 30, true),
        clen = v.getUint16(off + 32, true),
        loc = v.getUint32(off + 42, true),
        name = dec.decode(new Uint8Array(buf, off + 46, nlen));
      entries.set(name, { method, size, loc });
      off += 46 + nlen + elen + clen;
    }
    return {
      read: async (name) => {
        let e = entries.get(name);
        if (!e) return null;
        let vv = new DataView(buf),
          n = vv.getUint16(e.loc + 26, true),
          ex = vv.getUint16(e.loc + 28, true),
          bytes = new Uint8Array(buf, e.loc + 30 + n + ex, e.size);
        if (e.method === 0) return dec.decode(bytes);
        if (e.method === 8) {
          if (!("DecompressionStream" in window))
            throw new Error(
              "Browser belum mendukung impor .xlsx offline. Gunakan Chrome atau Edge terbaru.",
            );
          return new Response(
            new Blob([bytes])
              .stream()
              .pipeThrough(new DecompressionStream("deflate-raw")),
          ).text();
        }
        throw new Error(
          "Kompressi Excel tidak didukung. Simpan ulang sebagai .xlsx standar.",
        );
      },
    };
  }
  async function parseXlsx(file) {
    let z = await readZip(await file.arrayBuffer()),
      w = await z.read("xl/workbook.xml"),
      r = await z.read("xl/_rels/workbook.xml.rels");
    if (!w || !r) throw new Error("Struktur workbook Excel tidak ditemukan.");
    let wb = xml(w),
      rels = xml(r),
      ns =
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      map = {};
    tags(rels, "Relationship").forEach(
      (x) => (map[x.getAttribute("Id")] = x.getAttribute("Target")),
    );
    let shared = [],
      s = await z.read("xl/sharedStrings.xml");
    if (s) {
      let x = xml(s);
      shared = tags(x, "si").map((i) =>
        tags(i, "t")
          .map((t) => t.textContent || "")
          .join(""),
      );
    }
    let out = {};
    for (let sh of tags(wb, "sheet")) {
      let name = sh.getAttribute("name"),
        rid = sh.getAttributeNS(ns, "id") || sh.getAttribute("r:id"),
        target = map[rid];
      if (!target) continue;
      let path = target.startsWith("/")
          ? target.slice(1)
          : "xl/" + target.replace(/^\.\//, ""),
        raw = await z.read(path);
      if (!raw) continue;
      let doc = xml(raw),
        matrix = [];
      tags(doc, "row").forEach((row) => {
        let ri = Math.max(0, Number(row.getAttribute("r")) - 1);
        if (!matrix[ri]) matrix[ri] = [];
        tags(row, "c").forEach((cell) => {
          let ci = col(cell.getAttribute("r") || "A1"),
            t = cell.getAttribute("t"),
            val = "";
          if (t === "s") {
            let x = tags(cell, "v")[0];
            val = x ? (shared[Number(x.textContent)] ?? "") : "";
          } else if (t === "inlineStr")
            val = tags(cell, "t")
              .map((x) => x.textContent || "")
              .join("");
          else {
            let x = tags(cell, "v")[0];
            val = x ? x.textContent : "";
          }
          matrix[ri][ci] = val;
        });
      });
      out[name] = sheetFromMatrix(matrix.map((x) => x || []));
    }
    return out;
  }
  async function parseCSV(file) {
    let text = (await file.text()).replace(/^\uFEFF/, "");
    let lines = text.split(/\r?\n/).filter((x) => x.trim());
    if (!lines.length) throw new Error("CSV kosong.");
    let d =
      (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length
        ? ";"
        : ",";
    let rows = lines.map((line) => {
      let out = [],
        cur = "",
        q = false;
      for (let i = 0; i < line.length; i++) {
        let ch = line[i];
        if (ch === '"') {
          if (q && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else q = !q;
        } else if (ch === d && !q) {
          out.push(cur.trim());
          cur = "";
        } else cur += ch;
      }
      out.push(cur.trim());
      return out;
    });
    return { SURAT_PIUTANG: sheetFromMatrix(rows) };
  }
  function findSheet(sheets, n) {
    return Object.entries(sheets).find(([k]) => norm(k) === norm(n))?.[1];
  }
  function makeImported(surat, rinci, type) {
    let required = [
      "kodekonfirmasi",
      "namaklien",
      "kotasurat",
      "tanggalsurat",
      "tanggalsaldo",
      "namalawantransaksi",
      "saldo",
      "namapenandatangan",
      "jabatanpenandatangan",
    ];
    let missing = required.filter((x) => surat.headers[x] === undefined);
    if (missing.length)
      throw new Error("Kolom wajib belum lengkap: " + missing.join(", "));
    let dm = {};
    (rinci?.rows || []).forEach((row) => {
      let { g } = mapRow(row, rinci.headers || {}),
        code = safe(g("Kode Konfirmasi"));
      if (!code) return;
      let x = {
        date: iso(g("Tanggal Dokumen", "Tanggal Invoice", "Tanggal Tagihan")),
        document: g("Nomor Dokumen", "Nomor Invoice", "Nomor Invoice Supplier"),
        description: g("Uraian", "Deskripsi"),
        dueDate: iso(g("Jatuh Tempo")),
        amount: money(g("Nilai", "Nilai Invoice", "Nilai Tagihan")),
        payment: money(g("Pembayaran / Kredit", "Pembayaran / Debit Note")),
      };
      if (!dm[code]) dm[code] = [];
      dm[code].push(x);
    });
    let out = [],
      seen = new Set();
    for (let row of surat.rows) {
      let { g } = mapRow(row, surat.headers),
        code = safe(g("Kode Konfirmasi"));
      if (!code) continue;
      if (seen.has(code)) throw new Error("Kode Konfirmasi duplikat: " + code);
      seen.add(code);
      let details = dm[code] || [];
      out.push({
        type,
        code,
        number: g("Nomor Surat"),
        client: g("Nama Klien"),
        clientAddress: g("Alamat Klien"),
        city: g("Kota Surat"),
        letterDate: iso(g("Tanggal Surat")),
        balanceDate: iso(g("Tanggal Saldo", "Tanggal Neraca")),
        deadlineDays: Number(g("Batas Jawaban (Hari)", "Batas Jawaban") || 7),
        counterparty: g(
          "Nama Lawan Transaksi",
          type === "payable" ? "Nama Supplier" : "Nama Pelanggan",
        ),
        counterpartyAddress: g(
          "Alamat Lawan Transaksi",
          type === "payable" ? "Alamat Supplier" : "Alamat Pelanggan",
        ),
        attention: g("UP / PIC", "UP / PIC Lawan Transaksi"),
        phone: g("Telepon / WhatsApp"),
        email: g("Email"),
        amount: safe(g("Saldo")) === "" ? null : money(g("Saldo")),
        currency: String(g("Mata Uang") || "IDR").toUpperCase(),
        reference: g("Referensi Dokumen"),
        explanation: g("Catatan / Keterangan Saldo", "Keterangan Saldo"),
        recipientName: g("Nama Penerima Balasan"),
        recipientAddress: g("Alamat Penerima Balasan"),
        recipientCity: g("Kota Penerima Balasan"),
        recipientAttention: g("UP Penerima Balasan"),
        recipientPhone: g("Telepon Penerima Balasan"),
        replyContact: g("Email / Kontak Balasan"),
        replyMethod: g("Metode Pengiriman Balasan"),
        signer: g("Nama Penandatangan"),
        role: g("Jabatan Penandatangan"),
        note: g("Catatan untuk Lawan Transaksi", "Catatan"),
        includeDetail: details.length > 0,
        qrEnabled: false,
        qrFormUrl: "",
        qrEntryCode: "",
        qrEntryType: "",
        qrEntryYear: "",
        qrEntryCounterparty: "",
        qrEntryClient: "",
        qrCaption: "Pindai untuk mengunggah jawaban konfirmasi",
        status: g("Status") || "draft",
        details,
      });
    }
    if (!out.length)
      throw new Error(
        "Tidak ada data surat valid pada sheet " +
          (type === "payable" ? "SURAT_UTANG" : "SURAT_PIUTANG") +
          ".",
      );
    return out;
  }
  function importSheets(sheets) {
    let sp = findSheet(sheets, "SURAT_PIUTANG"),
      su = findSheet(sheets, "SURAT_UTANG"),
      rp = findSheet(sheets, "RINCIAN_PIUTANG"),
      ru = findSheet(sheets, "RINCIAN_UTANG");
    if (!sp && !su)
      throw new Error(
        "Sheet SURAT_PIUTANG atau SURAT_UTANG tidak ditemukan. Gunakan format impor yang disediakan.",
      );
    let out = [];
    if (sp) out.push(...makeImported(sp, rp, "receivable"));
    if (su) out.push(...makeImported(su, ru, "payable"));
    return out;
  }
  async function importFile(file) {
    if (!file) return;
    let res = $("importResult"),
      name = (file.name || "").toLowerCase();
    res.className = "import-result show";
    res.textContent = "Membaca " + file.name + " dan menyusun surat...";
    try {
      if (!name.endsWith(".xlsx") && !name.endsWith(".csv"))
        throw new Error("Format file tidak didukung. Gunakan .xlsx atau .csv.");
      let sheets = name.endsWith(".csv")
        ? await parseCSV(file)
        : await parseXlsx(file);
      if (!Object.keys(sheets).length)
        throw new Error(
          "Workbook terbaca, tetapi tidak ada sheet yang dapat diproses. Simpan ulang file sebagai Excel Workbook (.xlsx).",
        );
      let letters = importSheets(sheets),
        batchId =
          "BATCH-" +
          Date.now() +
          "-" +
          Math.random().toString(36).slice(2, 7).toUpperCase(),
        importedAt = new Date().toISOString();
      letters.forEach((l) => {
        l.batchId = batchId;
        l.importName = file.name;
        l.importedAt = importedAt;
      });
      let m = new Map(state.letters.map((l) => [l.code, l]));
      letters.forEach((l) => m.set(l.code, l));
      state.letters = [...m.values()];
      state.lastBatchId = batchId;
      letters.forEach((l) => state.selected.add(l.code));
      saveState();
      renderList();
      res.className = "import-result show ok";
      res.innerHTML = `Berhasil mengimpor <b>${letters.length} surat</b> dan <b>${letters.reduce((n, l) => n + (l.details?.length || 0), 0)} rincian</b> sebagai satu batch. Isi data umum pada Input Surat lalu klik <b>Terapkan data umum ke kelompok impor</b>.`;
      setTimeout(() => {
        editLetter(letters[0].code);
        toast(letters.length + " surat berhasil diimpor sebagai satu batch.");
      }, 450);
    } catch (e) {
      console.error(e);
      res.className = "import-result show err";
      res.textContent = e.message || "File tidak dapat diimpor.";
    }
  }
  function populateSettings() {
    setVal("sOfficeName", state.settings.officeName);
    setVal("sOfficeAddress", state.settings.officeAddress);
    setVal("sOfficeCity", state.settings.officeCity);
    setVal("sAttention", state.settings.attention);
    setVal("sPhone", state.settings.phone);
    setVal("sEmail", state.settings.email);
    setVal("sReplyMethod", state.settings.replyMethod);
  }
  function bind() {
    window.addEventListener("ripidit-qr-ready", () => {
      renderQrSetupPreview();
      renderPreview();
    });
    window.addEventListener("ripidit-qr-error", () => renderQrSetupPreview());
    document
      .querySelectorAll(".main-nav button")
      .forEach((b) => (b.onclick = () => switchView(b.dataset.view)));
    $("newLetterTop").onclick = newLetter;
    $("goImport").onclick = () => switchView("import");
    $("printCurrent").onclick = printCurrent;
    $("openPrintFromPreview").onclick = printCurrent;
    $("testQrLink").onclick = openQrLink;
    document
      .querySelectorAll(".type-card")
      .forEach((b) => (b.onclick = () => setType(b.dataset.type, true)));
    $("addDetail").onclick = () => detailRow();
    $("resetForm").onclick = () => {
      if (confirm("Reset semua isian form?")) newLetter();
    };
    $("saveCurrent").onclick = () => saveForm();
    $("saveForm").onclick = saveOrApply;
    $("letterForm").addEventListener("input", renderPreview);
    $("letterForm").addEventListener("change", renderPreview);
    document.querySelectorAll("[data-scale]").forEach(
      (b) =>
        (b.onclick = () => {
          state.scale = Number(b.dataset.scale);
          document
            .querySelectorAll("[data-scale]")
            .forEach((x) => x.classList.toggle("active", x === b));
          renderPreview();
        }),
    );
    $("search").oninput = (e) => {
      state.search = e.target.value;
      renderList();
    };
    $("selectAll").onclick = () => {
      let it = filtered(),
        all = it.length && it.every((l) => state.selected.has(l.code));
      it.forEach((l) =>
        all ? state.selected.delete(l.code) : state.selected.add(l.code),
      );
      saveState();
      renderList();
    };
    $("printSelected").onclick = () =>
      downloadZipDocs(state.letters.filter((l) => state.selected.has(l.code)));
    $("clearAll").onclick = () => {
      if (!state.letters.length) return;
      if (
        confirm("Hapus seluruh surat dan data rinciannya dari browser ini?")
      ) {
        state.letters = [];
        state.selected.clear();
        state.editingCode = null;
        saveState();
        renderList();
        newLetter();
        toast("Seluruh data surat dihapus.", "warn");
      }
    };
    $("cancelDownloads").onclick = () => {
      state.downloadCancelled = true;
    };
    $("saveSettings").onclick = () => {
      state.settings = {
        officeName: safe($("sOfficeName").value),
        officeAddress: safe($("sOfficeAddress").value),
        officeCity: safe($("sOfficeCity").value),
        attention: safe($("sAttention").value),
        phone: safe($("sPhone").value),
        email: safe($("sEmail").value),
        replyMethod: safe($("sReplyMethod").value),
      };
      storage.set(SETTINGS_KEY, JSON.stringify(state.settings));
      renderPreview();
      toast("Pengaturan tujuan default tersimpan.");
    };
    $("importFile").onchange = async (e) => {
      await importFile(e.target.files[0]);
      e.target.value = "";
    };
    $("chooseImportFile").onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      $("importFile").click();
    };
    let dz = $("dropzone");
    dz.addEventListener("click", (e) => {
      if (e.target.closest("#chooseImportFile")) return;
      $("importFile").click();
    });
    dz.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        $("importFile").click();
      }
    });
    ["dragenter", "dragover"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault();
        dz.classList.add("drag");
      }),
    );
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault();
        dz.classList.remove("drag");
      }),
    );
    dz.addEventListener("drop", (e) => importFile(e.dataTransfer.files[0]));
  }
  $("draftPrint").onclick = () => {
    $("printRoot").innerHTML = renderDocument(getForm());
    window.print();
  };
  loadState();
  populateSettings();
  bind();
  newLetter();
  renderList();
  renderQrSetupPreview();
  updateBatchUI();
})();
