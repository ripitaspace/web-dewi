(function () {
  "use strict";

  var isInvoiceReturWorkspace = new URLSearchParams(window.location.search).get("mode") === "invoice-retur";
  var filter = "all";
  var statusLabels = {
    PARSED: "Selesai",
    REVIEW: "Perlu review",
    ERROR: "Perlu perhatian",
    DUPLICATE: "Duplikat"
  };
  var icons = {
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0 4 4m-4-4L8 7M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2.5h6.5A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v5m4-5v5M9 4h6l1 3H8l1-3Zm-3 3 1 14h10l1-14"/></svg>',
    folderZip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v12H4zM8 7V4h8v3"/><path d="M12 10v5m0 0-2-2m2 2 2-2"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    package: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 8 9 5 9-5M3 8l9-5 9 5v9l-9 5-9-5V8Z"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13m0 0 4-4m-4 4-4-4M5 20h14"/></svg>',
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16v18l-3-2-2 2-3-2-3 2-2-2-3 2V3Z"/><path d="M8 8h8M8 12h8"/></svg>',
    building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h2m-2 4h2m4-4h2m-2 4h2M8 21v-5h4v5"/></svg>',
    pages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M4 6v14a2 2 0 0 0 2 2h9M10 7h5M10 11h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
    review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
  };

  function $(id) { return document.getElementById(id); }
  function workspaceTitle() { return isInvoiceReturWorkspace ? "Invoice Retur Scrapper" : "Invoice Scraper"; }
  function workspaceKicker() { return isInvoiceReturWorkspace ? "RIPITAX · INVOICE RETUR" : "RIPITAX · CORETAX"; }
  function workspaceTitleMarkup() {
    return '<div class="workspace-title"><span class="workspace-kicker">' + workspaceKicker() + "</span><strong>" + workspaceTitle() + '</strong><small id="batchSummary">Belum ada batch aktif</small></div>';
  }
  function icon(name) { return '<span class="ux-icon ux-icon-' + name + '">' + icons[name] + "</span>"; }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function getInvoices() { return typeof invoices !== "undefined" && Array.isArray(invoices) ? invoices : []; }
  function isVisibleByFilter(invoice) {
    if (filter === "all") return true;
    if (filter === "parsed") return invoice.status === "PARSED";
    if (filter === "review") return invoice.status === "REVIEW";
    if (filter === "error") return invoice.status === "ERROR" || invoice.status === "DUPLICATE";
    return true;
  }
  function showToast(message, tone) {
    var toast = $("uxToast");
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.tone = tone || "default";
    toast.hidden = false;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(function () { toast.hidden = true; }, 3600);
  }
  function focusSection(id) {
    var target = $(id);
    if (!target) return;
    document.querySelectorAll("main > section").forEach(function (section) { section.classList.add("hidden"); });
    target.classList.remove("hidden");
    document.querySelectorAll("aside button").forEach(function (button) { button.classList.toggle("active", button.dataset.view === id); });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function buildWorkspace() {
    var main = document.querySelector("body > .layout > main");
    var inbox = $("inbox");
    if (!main || !inbox || $("workspaceToolbar")) return;
    if (isInvoiceReturWorkspace) {
      document.body.dataset.workspace = "invoice-retur";
      document.title = workspaceTitle();
    }

    document.querySelectorAll("aside button").forEach(function (button) {
      var handler = button.getAttribute("onclick") || "";
      var match = handler.match(/view\('([^']+)'/);
      if (match) button.dataset.view = match[1];
      var navLabel = button.querySelector(".navtext");
      var label = navLabel ? navLabel.textContent : button.textContent;
      var navIcon = { inbox: "upload", items: "list", products: "package", export: "download" }[button.dataset.view] || "list";
      button.innerHTML = icon(navIcon) + '<span class="navtext">' + escapeHtml(label.trim()) + "</span>";
    });

    var workspaceToolbar = document.createElement("div");
    workspaceToolbar.id = "workspaceToolbar";
    workspaceToolbar.className = "workspace-toolbar";
    workspaceToolbar.innerHTML =
      workspaceTitleMarkup() +
      '<div class="workspace-actions"><button type="button" class="icon-action" id="uploadWorkspace" aria-label="Pilih PDF atau ZIP" title="Pilih PDF atau ZIP" data-tooltip="Pilih PDF atau ZIP">' + icon("upload") + '</button><button type="button" class="secondary icon-action" id="folderWorkspace" aria-label="Pilih folder" title="Pilih folder" data-tooltip="Pilih folder">' + icon("folder") + '</button><button type="button" class="secondary icon-action" id="clearWorkspace" aria-label="Kosongkan daftar" title="Kosongkan daftar" data-tooltip="Kosongkan daftar">' + icon("trash") + '</button><button type="button" class="secondary icon-action" id="zipWorkspace" aria-label="Unduh ZIP Nota Retur" title="Unduh ZIP Nota Retur" data-tooltip="Unduh ZIP Nota Retur">' + icon("folderZip") + '</button><button type="button" class="icon-action" id="exportWorkspace" aria-label="Unduh rekap Excel" title="Unduh rekap Excel" data-tooltip="Unduh rekap Excel">' + icon("download") + '</button></div>';
    workspaceToolbar.querySelector(".workspace-actions").insertAdjacentHTML("beforeend", '<button type="button" class="secondary icon-action xml-action" id="exportXmlWorkspace" aria-label="Buat XML Retur Dokumen Lain" title="Buat XML Retur Dokumen Lain" data-tooltip="Buat XML Retur Dokumen Lain"><span aria-hidden="true">XML</span></button>');
    main.insertBefore(workspaceToolbar, inbox);
    $("uploadWorkspace").addEventListener("click", function () { $("files").click(); });
    $("folderWorkspace").addEventListener("click", function () { $("folder").click(); });
    $("clearWorkspace").addEventListener("click", function () { window.clearInvoices(); });
    $("zipWorkspace").addEventListener("click", function () { if (typeof window.downloadWorkspaceZip === "function") window.downloadWorkspaceZip(); });
    $("exportWorkspace").addEventListener("click", function () { window.exportExcel(); });
    $("exportXmlWorkspace").addEventListener("click", function () { showToast("Gunakan workspace Nota Retur untuk membuat XML Retur Pajak Masukan.", "warning"); });

    var helper = document.createElement("div");
    helper.className = "workflow-guide";
    helper.innerHTML =
      '<span><b>1.</b> Masukkan faktur</span><i>→</i><span><b>2.</b> Periksa yang perlu review</span><i>→</i><span><b>3.</b> Export Excel</span>';
    inbox.insertBefore(helper, inbox.firstChild);

    var uploader = $("drop");
    if (uploader) {
      var uploadMark = uploader.querySelector(":scope > div");
      if (uploadMark) uploadMark.innerHTML = icon("upload");
      uploader.insertAdjacentHTML("beforeend",
        '<div class="upload-options" aria-label="Pilihan impor"><button type="button" class="upload-option" id="pickPdf">' + icon("file") + 'PDF atau ZIP</button><button type="button" class="upload-option" id="pickFolder">' + icon("package") + "Folder</button></div>" +
        '<span class="upload-note">Diproses langsung di browser. Dokumen tidak diunggah ke server.</span>');
      $("pickPdf").addEventListener("click", function (event) { event.stopPropagation(); $("files").click(); });
      $("pickFolder").addEventListener("click", function (event) { event.stopPropagation(); $("folder").click(); });
    }

    var stats = document.querySelector(".stats");
    if (stats) {
      var statsHeader = document.createElement("div");
      statsHeader.className = "dashboard-heading";
      statsHeader.innerHTML = "<div><span>RINGKASAN BATCH</span><strong>Pilih status untuk fokus pada pekerjaan berikutnya</strong></div><button type=\"button\" class=\"reset-filter\" id=\"resetFilter\" hidden>Lihat semua</button>";
      stats.parentNode.insertBefore(statsHeader, stats);
      var cards = Array.prototype.slice.call(stats.children);
      var filters = ["all", "parsed", "review", "error"];
      cards.forEach(function (card, index) {
        card.classList.add("stat-action");
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.dataset.filter = filters[index];
        card.addEventListener("click", function () { setFilter(card.dataset.filter); });
        card.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFilter(card.dataset.filter); } });
      });
    }

    var queuePanel = $("invoiceRows") && $("invoiceRows").closest(".panel");
    if (queuePanel) {
      var queueTools = document.createElement("div");
      queueTools.className = "queue-tools";
      queueTools.innerHTML = '<span id="queueContext">Menampilkan semua dokumen</span><button type="button" class="secondary" id="reviewAttention">' + icon("review") + "Review yang perlu perhatian</button>";
      queuePanel.querySelector("h2").insertAdjacentElement("afterend", queueTools);
      $("reviewAttention").addEventListener("click", function () {
        var next = getInvoices().find(function (invoice) { return invoice.status !== "PARSED"; });
        if (!next) { showToast("Tidak ada faktur yang perlu review. Batch siap diekspor.", "success"); return; }
        window.review(getInvoices().indexOf(next));
      });
    }

    var reviewPanel = $("reviewPanel");
    if (reviewPanel) {
      var reviewHeader = document.createElement("div");
      reviewHeader.className = "review-toolbar";
      reviewHeader.innerHTML = '<div><span class="workspace-kicker">REVIEW FAKTUR</span><strong id="reviewState">Periksa data barang sebelum export</strong></div><div><button type="button" class="secondary" id="backToQueue">' + icon("list") + 'Kembali ke antrean</button><button type="button" id="exportFromReview">' + icon("download") + "Export Excel</button></div>";
      reviewPanel.insertBefore(reviewHeader, reviewPanel.firstChild);
      $("backToQueue").addEventListener("click", function () { reviewPanel.classList.add("hidden"); $("invoiceRows").closest(".panel").scrollIntoView({ behavior: "smooth", block: "start" }); });
      $("exportFromReview").addEventListener("click", function () { window.exportExcel(); });
    }

    var itemsSearch = $("search");
    if (itemsSearch) {
      itemsSearch.setAttribute("aria-label", "Cari di semua barang");
      itemsSearch.placeholder = "Cari nama barang, nomor faktur, atau supplier…";
      itemsSearch.insertAdjacentHTML("beforebegin", '<label class="search-label" for="search">Cari seluruh data barang</label>');
    }
    document.body.insertAdjacentHTML("beforeend", '<div id="uxToast" class="ux-toast" role="status" hidden></div>');
  }
  function setFilter(nextFilter) {
    if (nextFilter === "items") { focusSection("items"); return; }
    filter = nextFilter;
    document.querySelectorAll(".stat-action").forEach(function (card) { card.classList.toggle("selected", card.dataset.filter === filter); });
    var reset = $("resetFilter");
    if (reset) {
      reset.hidden = filter === "all";
      reset.onclick = function () { setFilter("all"); };
    }
    enhanceQueue();
  }
  function enhanceQueue() {
    var rows = $("invoiceRows");
    var context = $("queueContext");
    if (!rows) return;
    var table = rows.closest("table");
    if (table) {
      table.classList.add("invoice-queue-table");
      var labels = ["File", "Nomor faktur", "Penjual", "Halaman", "Barang", "Status", "Aksi"];
      var labelIcons = ["file", "receipt", "building", "pages", "package", "check", "review"];
      table.querySelectorAll("thead th").forEach(function (heading, index) {
        heading.innerHTML = '<span class="queue-heading">' + icon(labelIcons[index]) + "<span>" + labels[index] + "</span></span>";
      });
    }
    rows.querySelectorAll(".filter-empty-row").forEach(function (row) { row.remove(); });
    var invoices = getInvoices();
    var visible = 0;
    Array.prototype.slice.call(rows.children).forEach(function (row, index) {
      var invoice = invoices[index];
      if (!invoice) return;
      var shouldShow = isVisibleByFilter(invoice);
      row.hidden = !shouldShow;
      if (shouldShow) visible += 1;
      row.dataset.status = invoice.status;
      row.classList.toggle("needs-attention", invoice.status !== "PARSED");
      var fileCell = row.children[0];
      if (fileCell) {
        var sourcePath = invoice.path || invoice.filename || "";
        var fileName = invoice.filename || "Nama file tidak tersedia";
        var sourceFolder = sourcePath && sourcePath !== fileName ? sourcePath.replace(new RegExp("/?" + fileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), "").replace(/\/$/, "") : "";
        fileCell.innerHTML = '<div class="queue-file"><strong title="' + escapeHtml(fileName) + '">' + escapeHtml(fileName) + '</strong>' + (sourceFolder ? '<small title="' + escapeHtml(sourcePath) + '">' + escapeHtml(sourceFolder) + "</small>" : "") + "</div>";
      }
      var sellerCell = row.children[2];
      if (sellerCell) {
        var sellerName = invoice.seller || "Penjual belum terbaca";
        var sellerIdentity = invoice.sellerNPWP ? "NPWP " + invoice.sellerNPWP : invoice.seller ? "Data penjual" : "Perlu review";
        sellerCell.innerHTML = '<div class="queue-seller"><strong title="' + escapeHtml(sellerName) + '">' + escapeHtml(sellerName) + "</strong><small>" + escapeHtml(sellerIdentity) + "</small></div>";
      }
      var pageCell = row.children[3];
      var sourcePages = invoice.pageRange || invoice.pages || 0;
      if (pageCell) pageCell.innerHTML = '<span class="queue-count" aria-label="halaman ' + sourcePages + '">' + sourcePages + "</span>";
      var itemCell = row.children[4];
      if (itemCell) itemCell.innerHTML = '<span class="queue-count" aria-label="' + invoice.items.length + ' barang">' + invoice.items.length + "</span>";
      var statusCell = row.children[5];
      if (statusCell) {
        statusCell.innerHTML = '<div class="queue-status"><span class="pill ' + (invoice.status === "PARSED" ? "" : invoice.status === "ERROR" ? "error" : "warn") + '">' + statusLabels[invoice.status] + '</span><small>' + escapeHtml(invoice.message || "") + "</small></div>";
      }
      var actionCell = row.children[6];
      if (actionCell) {
        actionCell.innerHTML = '<button class="secondary review-button" type="button">' + icon("review") + (invoice.status === "PARSED" ? "Lihat" : "Review") + "</button>";
        actionCell.querySelector("button").addEventListener("click", function () { window.review(index); });
      }
    });
    if (!invoices.length) rows.innerHTML = '<tr class="empty-table-row"><td colspan="7"><strong>Mulai dari impor faktur pertama</strong><span>Masukkan PDF, ZIP, atau folder untuk membuat antrean batch.</span></td></tr>';
    if (invoices.length && !visible) rows.insertAdjacentHTML("beforeend", '<tr class="empty-table-row filter-empty-row"><td colspan="7"><strong>Tidak ada dokumen pada status ini</strong><span>Pilih status lain atau lihat semua dokumen dalam batch.</span></td></tr>');
    if (context) context.textContent = filter === "all" ? "Menampilkan semua dokumen" : "Menampilkan " + visible + " dokumen sesuai filter";
  }
  function enhanceRegistry() {
    var products = $("productRows");
    if (products && !products.children.length) products.innerHTML = '<tr class="empty-table-row"><td colspan="4"><strong>Belum ada Product ID</strong><span>Product Registry dibuat otomatis setelah faktur dengan item berhasil dibaca.</span></td></tr>';
    var items = $("itemRows");
    if (items && !items.children.length) items.innerHTML = '<tr class="empty-table-row"><td colspan="9"><strong>Belum ada barang untuk ditampilkan</strong><span>Impor faktur terlebih dahulu, lalu gunakan pencarian untuk menyaring hasil.</span></td></tr>';
  }
  function updateSummary() {
    var invoices = getInvoices();
    var ready = invoices.filter(function (invoice) { return invoice.status === "PARSED"; }).length;
    var needsReview = invoices.filter(function (invoice) { return invoice.status === "REVIEW"; }).length;
    var issues = invoices.filter(function (invoice) { return invoice.status === "ERROR" || invoice.status === "DUPLICATE"; }).length;
    var summary = $("batchSummary");
    if (summary) summary.textContent = invoices.length ? invoices.length + " dokumen · " + ready + " selesai · " + (needsReview + issues) + " perlu perhatian" : "Belum ada batch aktif";
    var cards = Array.prototype.slice.call(document.querySelectorAll(".stats .stat"));
    var labels = ["Semua dokumen", "Selesai", "Perlu review", "Error / duplikat"];
    var counts = [invoices.length, ready, needsReview, issues];
    cards.forEach(function (card, index) {
      var label = card.querySelector("span");
      var count = card.querySelector("strong");
      if (label) label.textContent = labels[index];
      if (count) count.textContent = counts[index];
    });
    document.querySelectorAll("#exportWorkspace, #exportFromReview, button[onclick=\"exportExcel()\"]").forEach(function (button) {
      button.disabled = !invoices.length;
      button.title = invoices.length ? "Unduh hasil batch saat ini" : "Impor minimal satu faktur terlebih dahulu";
    });
  }
  var ocrLibraryPromise;

  function loadOcrLibrary() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (ocrLibraryPromise) return ocrLibraryPromise;
    ocrLibraryPromise = new Promise(function (resolve, reject) {
      var script = document.querySelector("script[data-ripita-ocr]");
      var needsAppend = false;
      if (!script) {
        script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.async = true;
        script.dataset.ripitaOcr = "true";
        needsAppend = true;
      }
      script.addEventListener("load", function () {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error("Library OCR tidak tersedia"));
      }, { once: true });
      script.addEventListener("error", function () {
        ocrLibraryPromise = null;
        reject(new Error("OCR tidak dapat dimuat. Periksa koneksi internet lalu coba lagi."));
      }, { once: true });
      if (needsAppend) document.head.appendChild(script);
    });
    return ocrLibraryPromise;
  }

  function renderPdfPage(page) {
    var viewport = page.getViewport({ scale: 2 });
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    return page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
      return canvas.toDataURL("image/png");
    }).finally(function () {
      canvas.width = 0;
      canvas.height = 0;
    });
  }

  function groupInvoicePages(pages) { return window.ReturnNoteParser.group(pages); }
  function sourcePageRange(pages) {
    return pages.length === 1 ? String(pages[0].sourcePage) : pages[0].sourcePage + "–" + pages[pages.length - 1].sourcePage;
  }

  function isLikelyUnit(value) {
    var unit = String(value || "").trim();
    if (!unit || unit.length > 24 || !/[A-Za-z]/.test(unit)) return false;
    if (/\bRP\b|\d{3,}|(?:^|\s)\d+(?:[.,]\d+)?(?:\s|$)/i.test(unit)) return false;
    return /^[A-Za-z0-9./ -]+$/.test(unit);
  }

  function parseTableItems(pages) { return window.ReturnNoteParser.tableItems(pages); }
  function parseReturnInvoice(pages, filename, path) { return window.ReturnNoteParser.parse(pages, filename, path); }

  function exportReturnExcel() {
    if (!window.XLSX || !getInvoices().length) return;
    var rows = [];
    getInvoices().forEach(function (invoice) {
      var items = invoice.items && invoice.items.length ? invoice.items : [{}];
      items.forEach(function (item, index) {
        rows.push({
          "Tipe Rekam": invoice.items.length ? "BARANG_RETUR" : "HEADER_ONLY",
          "ID Nota Retur": invoice.invoiceId || "", "Sumber File": invoice.path || "", "Nama File PDF": invoice.filename || "",
          "Nomor Nota Retur": invoice.returnNoteNumber || invoice.number || "", "Nomor Faktur Pajak Asal": invoice.originalInvoiceNumber || invoice.reference || "", "Tanggal Nota Retur": invoice.date || "",
          "Nama Pembeli": invoice.buyer || "", "NPWP Pembeli": invoice.buyerNPWP || "", "Alamat Pembeli": invoice.buyerAddress || "",
          "Nama Penjual": invoice.seller || "", "NPWP Penjual": invoice.sellerNPWP || "", "Alamat Penjual": invoice.sellerAddress || "",
          "Nomor Urut Barang": item.no == null ? "" : item.no, "Nama Barang": item.name || "", "Kuantitas": item.qty == null ? "" : item.qty, "Satuan": item.unit || "",
          "Harga Satuan Faktur": item.unitPrice == null ? "" : item.unitPrice, "Nilai Barang Dikembalikan": item.returnedValue == null ? item.gross ?? "" : item.returnedValue,
          "Jumlah Harga Retur": invoice.grossTotal == null ? "" : invoice.grossTotal, "Potongan Harga": invoice.discountTotal == null ? "" : invoice.discountTotal,
          "Jumlah Harga Retur Netto": invoice.dpp == null ? "" : invoice.dpp, "PPN Diminta Kembali": invoice.ppn == null ? "" : invoice.ppn, "PPnBM Diminta Kembali": invoice.ppnbm == null ? "" : invoice.ppnbm,
          "Jumlah Harga Retur SUM": index === 0 ? invoice.grossTotal ?? "" : "", "Potongan Harga SUM": index === 0 ? invoice.discountTotal ?? "" : "", "Netto Retur SUM": index === 0 ? invoice.dpp ?? "" : "", "PPN SUM": index === 0 ? invoice.ppn ?? "" : "", "PPnBM SUM": index === 0 ? invoice.ppnbm ?? "" : "",
          "Halaman Sumber": item.page || invoice.pageRange || "", "Status Parsing": invoice.status || "", "Pesan Validasi": invoice.message || "", "Raw Text PDF": invoice.raw || ""
        });
      });
    });
    var workbook = window.XLSX.utils.book_new();
    var sheet = window.XLSX.utils.json_to_sheet(rows);
    sheet["!autofilter"] = { ref: sheet["!ref"] };
    sheet["!cols"] = Object.keys(rows[0]).map(function (key) { return { wch: /Alamat|Raw Text/.test(key) ? 48 : /Nama Barang/.test(key) ? 40 : 22 }; });
    window.XLSX.utils.book_append_sheet(workbook, sheet, "Nota Retur");
    window.XLSX.writeFile(workbook, "RIPITA_Nota_Retur_Extraction.xlsx");
  }

  function itemSequenceIssues(items) {
    var issues = [];
    var previous = null;
    items.forEach(function (item) {
      var number = Number(item.no);
      if (!Number.isInteger(number) || number <= 0) {
        issues.push("nomor item tidak terbaca");
        return;
      }
      if (previous !== null && number !== previous + 1) issues.push("nomor item tidak berurutan antara " + previous + " dan " + number);
      previous = number;
    });
    return issues;
  }

  function validateItem(item) {
    var issues = [];
    if (!String(item.name || "").replace(/\s+/g, " ").trim()) issues.push("nama barang tidak terbaca");
    if (item.qty == null || item.qty <= 0) issues.push("kuantitas bukan angka positif");
    if (!isLikelyUnit(item.unit)) {
      issues.push(item.rawUnit ? "satuan terlihat seperti angka atau nominal" : "satuan tidak terbaca");
      item.unit = "";
    }
    if (item.unitPrice == null) issues.push("harga satuan bukan nominal");
    if (item.gross == null) issues.push("nilai barang dikembalikan tidak terbaca");
    if (item.gross != null && item.qty != null && item.unitPrice != null) {
      var expectedGross = item.qty * item.unitPrice;
      var tolerance = 1;
      if (Math.abs(item.gross - expectedGross) > tolerance) issues.push("harga × kuantitas tidak cocok dengan bruto");
    }
    item.validationMessage = issues.join("; ");
    item.validationStatus = issues.length ? "REVIEW" : "OK";
    return issues;
  }

  function validateInvoiceItems(invoice) {
    var issues = [];
    if (!invoice.items.length) issues.push("barang retur tidak terdeteksi");
    invoice.items.forEach(function (item) {
      var rowIssues = validateItem(item);
      if (rowIssues.length) issues.push("baris " + (item.no || "?") + ": " + rowIssues.join(", "));
    });
    if (invoice.grossTotal != null && invoice.items.length && invoice.items.every(function (item) { return item.gross != null; })) {
      var totalGross = invoice.items.reduce(function (total, item) { return total + item.gross; }, 0);
      if (Math.abs(totalGross - invoice.grossTotal) > 1) issues.push("total bruto item tidak cocok dengan total faktur");
    }
    var sequenceIssues = itemSequenceIssues(invoice.items);
    if (sequenceIssues.length) issues.push(sequenceIssues[0] + (sequenceIssues.length > 1 ? "; dan " + (sequenceIssues.length - 1) + " temuan urutan lain" : ""));
    if (isInvoiceReturWorkspace) {
      if (!invoice.originalInvoiceNumber || invoice.originalInvoiceNumber.replace(/\D/g, "").length !== 16) issues.push("nomor faktur pajak asal harus 16 digit");
      if (!invoice.date) issues.push("tanggal nota retur tidak terbaca");
      if (!/^\d{16}$/.test(invoice.buyerNPWP || "")) issues.push("NPWP pembeli harus 16 digit");
      if (!invoice.sellerNPWP) issues.push("NPWP penjual belum lengkap");
      if (!invoice.buyerAddress || !invoice.sellerAddress) issues.push("alamat pihak belum lengkap");
      if (invoice.dpp != null && invoice.discountTotal != null && invoice.grossTotal != null && Math.abs(invoice.grossTotal - invoice.discountTotal - invoice.dpp) > 1) issues.push("netto tidak cocok dengan bruto dikurangi diskon");
      if (!invoice.buyer) issues.push("data pembeli tidak terbaca");
      if (!invoice.seller) issues.push("data penjual tidak terbaca");
      if (invoice.grossTotal == null) issues.push("jumlah harga retur tidak terbaca");
      if (invoice.ppn == null) issues.push("PPN retur tidak terbaca");
    }
    return issues;
  }

  function exportValidationRows() {
    return getInvoices().flatMap(function (invoice) {
      var items = invoice.items && invoice.items.length ? invoice.items : [{}];
      return items.map(function (item) {
        return {
          status: item.validationStatus || (invoice.status === "PARSED" ? "OK" : invoice.status || "REVIEW"),
          message: item.validationMessage || invoice.message || "",
          pageRange: item.page || invoice.pageRange || "",
          source: invoice.source || "PDF"
        };
      });
    });
  }

  async function extractInvoicesFromPdf(bytes, filename, path, reportProgress) {
    var documentPdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
    var pages = [];
    var worker;
    try {
      for (var sourcePage = 1; sourcePage <= documentPdf.numPages; sourcePage += 1) {
        var page = await documentPdf.getPage(sourcePage);
        var content = await page.getTextContent();
        var pageLayout = window.ReturnNoteParser.layout(content);
        var text = pageLayout.text;
        var wasOcr = false;
        var confidence = 100;
        var ocrError = "";
        if (text.replace(/\s/g, "").length < 24) {
          wasOcr = true;
          try {
            if (!worker) {
              var Tesseract = await loadOcrLibrary();
              worker = await Tesseract.createWorker("eng", 1, {
                logger: function (message) {
                  if (!reportProgress || !message || !message.status) return;
                  var percent = typeof message.progress === "number" ? " " + Math.round(message.progress * 100) + "%" : "";
                  reportProgress("Menyiapkan OCR: " + message.status + percent);
                }
              });
            }
            if (reportProgress) reportProgress("Membaca halaman " + sourcePage + "/" + documentPdf.numPages + " dengan OCR…");
            var result = await worker.recognize(await renderPdfPage(page));
            text = String(result.data.text || "").trim();
            confidence = Math.round(Number(result.data.confidence) || 0);
          } catch (error) {
            ocrError = error instanceof Error ? error.message : "OCR gagal membaca halaman";
          }
        }
        pages.push({ layout: wasOcr ? null : pageLayout, text: text, sourcePage: sourcePage, ocr: wasOcr, confidence: confidence, ocrError: ocrError });
      }
    } finally {
      if (worker) await worker.terminate();
      await documentPdf.destroy();
    }

    return groupInvoicePages(pages).map(function (group, groupIndex) {
      var invoice = window.parseInvoice(group.pages, filename, path);
      var itemTable = parseTableItems(group.pages);
      var ocrPages = group.pages.filter(function (page) { return page.ocr; });
      var failedPages = group.pages.filter(function (page) { return page.ocrError; });
      var averageConfidence = ocrPages.length ? Math.round(ocrPages.reduce(function (total, page) { return total + page.confidence; }, 0) / ocrPages.length) : null;
      if (itemTable.items.length) invoice.items = itemTable.items;
      invoice.number = invoice.number || group.number;
      invoice.key = invoice.sellerNPWP && invoice.number ? invoice.sellerNPWP + "|" + invoice.number : "FILE|" + path + "|" + group.pages[0].sourcePage + "|" + groupIndex;
      invoice.pages = group.pages.length;
      invoice.pageRange = sourcePageRange(group.pages);
      invoice.source = ocrPages.length ? (ocrPages.length === group.pages.length ? "OCR" : "PDF + OCR") : "PDF";
      invoice.ocrConfidence = averageConfidence;
      invoice.items.forEach(function (item) {
        if (item.sourcePage) {
          item.page = item.sourcePage;
          return;
        }
        var parsedPage = Math.max(1, Number(item.page) || 1);
        item.page = group.pages[Math.min(parsedPage - 1, group.pages.length - 1)].sourcePage;
      });
      var itemIssues = validateInvoiceItems(invoice);

      if (!invoice.number) {
        invoice.status = "ERROR";
        invoice.message = invoice.source === "OCR" ? "Nomor faktur tidak terbaca dari PDF scan; periksa halaman " + invoice.pageRange : "Nomor faktur tidak ditemukan";
      } else if (itemIssues.length) {
        invoice.status = "REVIEW";
        invoice.message = "Data barang perlu review: " + itemIssues.slice(0, 2).join("; ") + (itemIssues.length > 2 ? "; dan " + (itemIssues.length - 2) + " temuan lain" : "");
      } else if (failedPages.length || (averageConfidence !== null && averageConfidence < 75)) {
        invoice.status = "REVIEW";
        invoice.message = failedPages.length ? "OCR gagal pada halaman " + failedPages.map(function (page) { return page.sourcePage; }).join(", ") + "; periksa manual" : "Keyakinan OCR " + averageConfidence + "% — periksa data sebelum ekspor";
      } else if (ocrPages.length) {
        if (invoice.status === "ERROR") invoice.status = invoice.items.length ? "PARSED" : "REVIEW";
        invoice.message = "Dibaca dari PDF scan dengan OCR pada halaman " + invoice.pageRange + (averageConfidence !== null ? " (keyakinan " + averageConfidence + "%)" : "") + ".";
      }
      return invoice;
    });
  }

  function patchRuntime() {
    var originalRender = window.render;
    var originalReview = window.review;
    var originalEditItem = window.editItem;
    var originalIngest = window.ingest;
    if (!originalRender || !originalReview || !originalEditItem || !originalIngest) return;
    window.render = function () {
      originalRender();
      window.setTimeout(function () { enhanceQueue(); enhanceRegistry(); updateSummary(); }, 0);
    };
    window.review = function (index) {
      originalReview(index);
      var invoice = getInvoices()[index];
      var reviewState = $("reviewState");
      if (reviewState && invoice) reviewState.textContent = invoice.status === "PARSED" ? "Hasil sudah dibaca — cek kembali sebelum export" : "Perlu dicek: " + (invoice.message || "lengkapi data barang");
      var preview = $("pdfPreview");
      if (preview && invoice && preview.src !== "about:blank") preview.src = preview.src.split("#")[0] + "#page=" + (invoice.items[0] && invoice.items[0].sourcePage || parseInt(invoice.pageRange, 10) || 1);
      if (preview && preview.src === "about:blank") {
        preview.setAttribute("aria-label", "Pratinjau PDF tidak tersedia untuk data yang dipulihkan dari sesi sebelumnya");
        if (reviewState) reviewState.textContent = "Pratinjau tersedia untuk PDF yang baru diimpor pada sesi ini. Impor ulang file untuk melihat dokumennya.";
      }
    };
    window.editItem = async function (invoiceIndex, itemIndex, key, value) {
      if (isInvoiceReturWorkspace) {
        var edited = invoices[invoiceIndex], row = edited.items[itemIndex];
        row[key] = key === "qty" ? window.ReturnNoteParser.quantity(String(value), row.unit) : ["unitPrice", "gross", "discount"].includes(key) ? window.ReturnNoteParser.amount(value) : value;
        if (key === "gross") row.returnedValue = row.gross;
        if (key === "qty" || key === "unitPrice") row.returnedValue = row.gross = row.qty != null && row.unitPrice != null ? Math.round(row.qty * row.unitPrice * 100) / 100 : null;
        var reviewRow = $("reviewItems") && $("reviewItems").children[itemIndex];
        var grossInput = reviewRow && reviewRow.querySelectorAll("input")[4];
        if (grossInput) grossInput.value = row.gross == null ? "" : row.gross;
        if (key === "name" || key === "unit") row.productId = await getProduct(edited, row);
        var issues = validateInvoiceItems(edited);
        edited.status = issues.length ? "REVIEW" : "PARSED";
        edited.message = issues.join("; ") || "Koreksi telah divalidasi";
        await put("invoices", edited);
        window.render();
      } else await originalEditItem(invoiceIndex, itemIndex, key, value);
      var state = $("reviewState");
      if (state) state.textContent = "Perubahan tersimpan di batch dan akan masuk ke file export";
      showToast("Perubahan item tersimpan untuk export.", "success");
      updateSummary();
    };
    var originalExport = window.exportExcel;
    window.exportExcel = function () {
      if (!getInvoices().length) { showToast("Impor minimal satu faktur sebelum export.", "warning"); return; }
      var workbookRows = exportValidationRows();
      var originalJsonToSheet = window.XLSX && window.XLSX.utils.json_to_sheet;
      var originalWriteFile = window.XLSX && window.XLSX.writeFile;
      if (originalJsonToSheet) {
        window.XLSX.utils.json_to_sheet = function (rows) {
          rows.forEach(function (row, index) {
            var validation = workbookRows[index] || {};
            row["Status Validasi Baris"] = validation.status || "";
            row["Alasan Validasi Baris"] = validation.message || "";
            row["Halaman Sumber"] = validation.pageRange || "";
            row["Sumber Pembacaan"] = validation.source || "";
          });
          return originalJsonToSheet.apply(this, arguments);
        };
      }
      if (originalWriteFile) {
        window.XLSX.writeFile = function (workbook, filename, options) {
          return originalWriteFile.call(window.XLSX, workbook, filename, Object.assign({}, options || {}, {
            bookType: "xlsx",
            bookSST: true,
            compression: true,
            ignoreEC: false
          }));
        };
      }
      try {
        originalExport();
      } finally {
        if (originalJsonToSheet) window.XLSX.utils.json_to_sheet = originalJsonToSheet;
        if (originalWriteFile) window.XLSX.writeFile = originalWriteFile;
      }
      showToast("File Excel sedang disiapkan untuk diunduh.", "success");
    };
    window.ingest = async function (files) {
      if (!window.pdfjsLib || !window.JSZip || !window.XLSX) {
        showToast("Library PDF, ZIP, atau Excel belum siap. Periksa koneksi lalu muat ulang halaman.", "warning");
        return;
      }
      var entries = [];
      for (var fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
        var file = files[fileIndex];
        if (/\.pdf$/i.test(file.name)) {
          entries.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            get: function (source) { return function () { return source.arrayBuffer(); }; }(file),
            preview: URL.createObjectURL(file)
          });
        } else if (/\.zip$/i.test(file.name)) {
          try {
            var zip = await window.JSZip.loadAsync(file);
            Object.entries(zip.files).forEach(function (pair) {
              var path = pair[0];
              var entry = pair[1];
              if (!entry.dir && /\.pdf$/i.test(path)) {
                entries.push({
                  name: path.split("/").pop(),
                  path: file.name + "/" + path,
                  get: function (zipEntry) { return function () { return zipEntry.async("arraybuffer"); }; }(entry),
                  previewFromZip: function (zipEntry) { return function () { return zipEntry.async("arraybuffer").then(function (bytes) { return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); }); }; }(entry)
                });
              }
            });
          } catch (error) {
            showToast("ZIP gagal dibaca: " + file.name, "warning");
          }
        }
      }
      if (!entries.length) {
        showToast("Pilih PDF atau ZIP yang berisi PDF.", "warning");
        return;
      }
      var processing = $("processing");
      var progress = $("progress");
      for (var index = 0; index < entries.length; index += 1) {
        var item = entries[index];
        if (processing) processing.textContent = "Memproses " + (index + 1) + "/" + entries.length + ": " + item.name;
        if (progress) progress.value = ((index + 1) / entries.length) * 100;
        await new Promise(function (resolve) { window.setTimeout(resolve, 0); });
        var parsedInvoices;
        try {
          parsedInvoices = await extractInvoicesFromPdf(await item.get(), item.name, item.path, function (message) {
            if (processing) processing.textContent = message;
          });
        } catch (error) {
          parsedInvoices = [{ key: "FILE|" + item.path + "|" + Date.now(), filename: item.name, path: item.path, number: "", seller: "", items: [], pages: 0, pageRange: "", status: "ERROR", message: error instanceof Error ? error.message : "PDF tidak dapat dibaca", raw: "", imported: new Date().toISOString() }];
        }
        var previewUrl = item.preview || await item.previewFromZip();
        var accepted = false;
        for (var parsedIndex = 0; parsedIndex < parsedInvoices.length; parsedIndex += 1) {
          var invoice = parsedInvoices[parsedIndex];
          var existing = invoices.find(function (candidate) { return candidate.key === invoice.key; });
          if (existing) {
            invoice.status = "DUPLICATE";
            invoice.message = "Nomor faktur dan NPWP penjual sudah ada; file baru dilewati";
            continue;
          }
          var nextNumber = Math.max.apply(Math, [0].concat(invoices.map(function (candidate) { return Number((candidate.invoiceId || "").replace(/\D/g, "")) || 0; }))) + 1;
          invoice.invoiceId = "INV-" + String(nextNumber).padStart(6, "0");
          for (var itemIndex = 0; itemIndex < invoice.items.length; itemIndex += 1) invoice.items[itemIndex].productId = await getProduct(invoice, invoice.items[itemIndex]);
          invoices.push(invoice);
          await put("invoices", invoice);
          urls.set(invoice.key, previewUrl);
          accepted = true;
        }
        if (!accepted) URL.revokeObjectURL(previewUrl);
        window.render();
      }
      if (processing) processing.textContent = "Selesai: " + entries.length + " PDF diproses. Klik Review untuk melihat PDF.";
      window.render();
    };
    $("files").onchange = function (event) { window.ingest(Array.prototype.slice.call(event.target.files || [])); event.target.value = ""; };
    $("folder").onchange = function (event) { window.ingest(Array.prototype.slice.call(event.target.files || [])); event.target.value = ""; };
    $("drop").ondrop = function (event) { event.preventDefault(); $("drop").classList.remove("drag"); window.ingest(Array.prototype.slice.call(event.dataTransfer.files || [])); };
  }
  function initialize() {
    // The legacy page exposes these globals. Replace only the return workspace
    // behavior before its UI wrappers capture the parser and Excel exporter.
    if (isInvoiceReturWorkspace) {
      window.parseInvoice = parseReturnInvoice;
      window.exportExcel = exportReturnExcel;
      window.extractReturnInvoicesFromPdf = extractInvoicesFromPdf;
    }
    buildWorkspace();
    patchRuntime();
    updateSummary();
    enhanceQueue();
    enhanceRegistry();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());

/* One-page workspace layer. Keeps the legacy parser and IndexedDB data model intact. */
(function () {
  "use strict";

  /* Privacy mode: keep every invoice and Product ID only in this browser tab. */
  function disablePersistence() {
    invoices = [];
    products = [];
    all = function () { return Promise.resolve([]); };
    put = function () { return Promise.resolve(); };
    del = function () { return Promise.resolve(); };
    if (typeof db !== "undefined" && db && typeof db.close === "function") db.close();
    if (typeof indexedDB !== "undefined") {
      var request = indexedDB.deleteDatabase("ripita-invoice-retur-v1");
      request.onblocked = function () { if (typeof db !== "undefined" && db && typeof db.close === "function") db.close(); };
    }
  }
  function clearSessionBatch() {
    if (!window.confirm("Kosongkan semua faktur dalam sesi ini? Data juga akan hilang saat halaman dimuat ulang.")) return;
    invoices = [];
    products = [];
    urls.forEach(function (url) { URL.revokeObjectURL(url); });
    urls.clear();
    window.render();
  }
  disablePersistence();
  window.clearInvoices = clearSessionBatch;

  var activeFilter = "all";
  var isReturnWorkspace = new URLSearchParams(window.location.search).get("mode") === "invoice-retur";
  var labels = { PARSED: "Selesai", REVIEW: "Perlu review", ERROR: "Perlu perhatian", DUPLICATE: "Duplikat" };
  var svg = {
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m0 0 4 4m-4-4L8 7M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2.5h6.5A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z"/></svg>',
    folderZip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v12H4zM8 7V4h8v3"/><path d="M12 10v5m0 0-2-2m2 2 2-2"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v5m4-5v5M9 4h6l1 3H8l1-3Zm-3 3 1 14h10l1-14"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v13m0 0 4-4m-4 4-4-4M5 20h14"/></svg>',
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16v18l-3-2-2 2-3-2-3 2-2-2-3 2V3Z"/><path d="M8 8h8M8 12h8"/></svg>',
    building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h2m-2 4h2m4-4h2m-2 4h2M8 21v-5h4v5"/></svg>',
    pages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M4 6v14a2 2 0 0 0 2 2h9M10 7h5M10 11h5"/></svg>',
    package: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 8 9 5 9-5M3 8l9-5 9 5v9l-9 5-9-5V8Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
    review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };
  function byId(id) { return document.getElementById(id); }
  function workspaceTitleMarkup() {
    return '<div class="workspace-title"><span class="workspace-kicker">RIPITAX · ' + (isReturnWorkspace ? 'INVOICE RETUR' : 'CORETAX') + '</span><strong>' + (isReturnWorkspace ? 'Invoice Retur Scrapper' : 'Invoice Scraper') + '</strong><small id="batchSummary">Belum ada batch aktif</small></div>';
  }
  function glyph(name) { return '<span class="ux-icon ux-icon-' + name + '">' + svg[name] + "</span>"; }
  function safe(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]; }); }
  function notify(message, tone) {
    var toast = byId("uxToast");
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.tone = tone || "default";
    toast.hidden = false;
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(function () { toast.hidden = true; }, 3600);
  }
  function records() { return typeof invoices !== "undefined" && Array.isArray(invoices) ? invoices : []; }
  function format(value) { var number = Number(value); return Number.isFinite(number) ? new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(number) : "—"; }
  function isVisible(invoice) {
    return activeFilter === "all" ||
      (activeFilter === "parsed" && invoice.status === "PARSED") ||
      (activeFilter === "review" && invoice.status === "REVIEW") ||
      (activeFilter === "error" && (invoice.status === "ERROR" || invoice.status === "DUPLICATE"));
  }
  function itemRowsCount() { return records().reduce(function (count, invoice) { return count + (invoice.items && invoice.items.length ? invoice.items.length : 1); }, 0); }
  function renameDate(value) {
    var text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    var match = text.match(/\b(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/i);
    if (!match) return "0000-00-00";
    var months = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12 };
    var month = months[match[2].toLowerCase()];
    return month ? match[3] + "-" + String(month).padStart(2, "0") + "-" + String(match[1]).padStart(2, "0") : "0000-00-00";
  }
  function renameSlug(value, fallback) {
    var normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var name = normalized.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
    return name || fallback;
  }
  function renameIssues(invoice) {
    var date = renameDate(invoice.date);
    return [
      date === "0000-00-00" ? "tanggal" : "",
      !invoice.reference ? "referensi" : "",
      !invoice.seller ? "penjual" : "",
      !invoice.buyer ? "pembeli" : "",
      !invoice.number ? "nomor faktur" : ""
    ].filter(Boolean);
  }
  function renamedPdfEntries() {
    var seen = {};
    if (isReturnWorkspace) {
      return records().filter(function (invoice) { return urls && urls.has(invoice.key); }).map(function (invoice) {
        var base = ["RETUR", renameSlug(invoice.returnNoteNumber || invoice.number, "TANPA-NOMOR"), renameSlug(invoice.originalInvoiceNumber || invoice.reference, "TANPA-FAKTUR")].join("_") + ".pdf";
        var duplicate = seen[base] || 0;
        seen[base] = duplicate + 1;
        return { invoice: invoice, name: duplicate ? base.replace(".pdf", "_" + (duplicate + 1) + ".pdf") : base };
      });
    }
    return records().filter(function (invoice) { return !renameIssues(invoice).length && urls && urls.has(invoice.key); }).map(function (invoice) {
      var base = [renameDate(invoice.date), "(" + renameSlug(invoice.reference, "TANPA-REFERENSI") + ")", renameSlug(invoice.seller, "PENJUAL"), renameSlug(invoice.buyer, "PEMBELI"), renameSlug(invoice.number, "TANPA-NOMOR")].join("_") + ".pdf";
      var duplicate = seen[base] || 0;
      seen[base] = duplicate + 1;
      return { invoice: invoice, name: duplicate ? base.replace(".pdf", "_" + (duplicate + 1) + ".pdf") : base };
    });
  }
  function renameRecap(entries) {
    var names = new Map(entries.map(function (entry) { return [entry.invoice.key, entry.name]; }));
    return records().map(function (invoice, index) {
      var issues = renameIssues(invoice);
      var included = names.has(invoice.key);
      var note = issues.length ? "Tidak menemukan " + issues.join(", ") : !urls || !urls.has(invoice.key) ? "PDF asli tidak tersedia pada sesi ini; impor ulang file untuk membuat ZIP." : "Data lengkap";
      return {
        No: index + 1,
        "Nama File Awal": invoice.filename || "",
        Penjual: invoice.seller || "",
        Pembeli: invoice.buyer || "",
        "Nomor Faktur": invoice.number || "",
        Tanggal: renameDate(invoice.date),
        Referensi: invoice.reference || "",
        "Nama File Baru": names.get(invoice.key) || "",
        Status: included ? "TERBACA" : "PERLU CEK",
        Catatan: note
      };
    });
  }
  async function downloadRenamedZip() {
    var button = byId("zipWorkspace");
    var entries = renamedPdfEntries();
    if (!entries.length) { notify(isReturnWorkspace ? "Impor PDF Nota Retur terlebih dahulu agar ZIP dapat diunduh." : "Tidak ada faktur dengan metadata lengkap dan PDF asli pada sesi ini untuk diarsipkan.", "warning"); return; }
    if (!window.JSZip || !window.XLSX) { notify("Library ZIP atau Excel belum siap. Periksa koneksi lalu muat ulang halaman.", "warning"); return; }
    button.disabled = true;
    button.title = "Membuat ZIP faktur rapi…";
    button.dataset.tooltip = "Membuat ZIP faktur rapi…";
    try {
      var zip = new window.JSZip();
      for (var index = 0; index < entries.length; index += 1) {
        var entry = entries[index];
        var response = await window.fetch(urls.get(entry.invoice.key));
        if (!response.ok) throw new Error("PDF tidak dapat dibaca kembali: " + entry.invoice.filename);
        zip.file(entry.name, await response.arrayBuffer());
      }
      var workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, window.XLSX.utils.json_to_sheet(renameRecap(entries)), isReturnWorkspace ? "Rekap Nota Retur" : "Rename Coretax");
      zip.file(isReturnWorkspace ? "Rekap_Nota_Retur.xlsx" : "Rekap_Rename_Coretax.xlsx", window.XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
      var url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
      var link = document.createElement("a");
      link.href = url;
      link.download = isReturnWorkspace ? "RIPITA_Nota_Retur.zip" : "Rename_Coretax.zip";
      link.click();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      notify(entries.length + (isReturnWorkspace ? " nota retur dan rekap sedang diunduh." : " faktur rapi dan rekap rename sedang diunduh."), "success");
    } catch (error) {
      notify("ZIP tidak dapat dibuat: " + (error && error.message ? error.message : "terjadi kesalahan"), "warning");
    } finally {
      updateSummary();
    }
  }
  window.downloadWorkspaceZip = downloadRenamedZip;
  function sourcePath(invoice) {
    var path = invoice.path || invoice.filename || "";
    var name = invoice.filename || "";
    return !path || path === name ? "" : path.slice(0, Math.max(0, path.length - name.length)).replace(/\/$/, "");
  }
  function headingMarkup() {
    var titles = ["File", isReturnWorkspace ? "Nomor nota retur" : "Nomor faktur", "Penjual", "Halaman", "Barang", "Status", "Aksi"];
    var glyphs = ["file", "receipt", "building", "pages", "package", "check", "review"];
    return titles.map(function (title, index) { return '<span class="queue-heading">' + glyph(glyphs[index]) + "<span>" + title + "</span></span>"; });
  }
  function itemCell(item) {
    if (!item) return '<div class="queue-item queue-item-empty"><strong>Barang belum tersedia</strong><small>Data header atau error tetap dapat diunduh.</small></div>';
    var identity = [item.productId || "Product ID belum dibuat", item.code ? "Kode " + item.code : ""].filter(Boolean).join(" · ");
    var values = [item.qty != null ? "Qty " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 6 }).format(item.qty) : "", item.unit || "", item.unitPrice != null ? "Rp " + format(item.unitPrice) : ""].filter(Boolean).join(" · ");
    var validation = item.validationMessage ? '<small class="queue-item-validation">' + safe(item.validationMessage) + "</small>" : "";
    return '<div class="queue-item"><strong title="' + safe(item.name || "Nama barang belum terbaca") + '">' + safe(item.name || "Nama barang belum terbaca") + '</strong><small>' + safe(identity) + '</small><small>' + safe(values || "Lengkapi detail saat review") + "</small>" + validation + "</div>";
  }
  function flatRow(invoice, invoiceIndex, item) {
    var filename = invoice.filename || "Nama file tidak tersedia";
    var folder = sourcePath(invoice);
    var seller = invoice.seller || "Penjual belum terbaca";
    var sellerMeta = invoice.sellerNPWP ? "NPWP " + invoice.sellerNPWP : invoice.seller ? "Data penjual" : "Perlu review";
    var statusClass = invoice.status === "PARSED" ? "" : invoice.status === "ERROR" ? "error" : "warn";
    var sourcePages = invoice.pageRange || invoice.pages || 0;
    return '<tr class="' + (invoice.status === "PARSED" ? "" : "needs-attention") + '">' +
      '<td><div class="queue-file"><strong title="' + safe(filename) + '">' + safe(filename) + '</strong>' + (folder ? '<small title="' + safe(invoice.path) + '">' + safe(folder) + "</small>" : "") + "</div></td>" +
      '<td><span class="invoice-number" title="' + safe(invoice.number || "Nomor belum terbaca") + '">' + safe(invoice.number || "Belum terbaca") + "</span></td>" +
      '<td><div class="queue-seller"><strong title="' + safe(seller) + '">' + safe(seller) + "</strong><small>" + safe(sellerMeta) + "</small></div></td>" +
      '<td><span class="queue-count" aria-label="halaman ' + sourcePages + '">' + sourcePages + "</span></td>" +
      "<td>" + itemCell(item) + "</td>" +
      '<td><div class="queue-status"><span class="pill ' + statusClass + '">' + safe(labels[invoice.status] || invoice.status || "Belum diproses") + '</span><small>' + safe(invoice.message || "") + "</small></div></td>" +
      '<td><button class="secondary review-button" type="button" data-flat-review="' + invoiceIndex + '">' + glyph("review") + (invoice.status === "PARSED" ? "Lihat" : "Review") + "</button></td>" +
      "</tr>";
  }
  function renderFlatQueue() {
    var body = byId("invoiceRows");
    if (!body) return;
    var table = body.closest("table");
    if (table) {
      table.classList.add("invoice-queue-table");
      table.querySelectorAll("thead th").forEach(function (cell, index) { cell.innerHTML = headingMarkup()[index]; });
    }
    var visible = records().filter(isVisible);
    var output = [];
    var rows = 0;
    visible.forEach(function (invoice) {
      var index = records().indexOf(invoice);
      (invoice.items && invoice.items.length ? invoice.items : [null]).forEach(function (item) { output.push(flatRow(invoice, index, item)); rows += 1; });
    });
    if (!records().length) output.push('<tr class="empty-table-row"><td colspan="7"><strong>Mulai dari impor faktur pertama</strong><span>Masukkan PDF, ZIP, atau folder untuk melihat hasil per barang di sini.</span></td></tr>');
    if (records().length && !rows) output.push('<tr class="empty-table-row"><td colspan="7"><strong>Tidak ada data pada status ini</strong><span>Pilih ringkasan status lain atau tampilkan semua hasil batch.</span></td></tr>');
    body.innerHTML = output.join("");
    body.querySelectorAll("[data-flat-review]").forEach(function (button) { button.addEventListener("click", function () { window.review(Number(button.dataset.flatReview)); }); });
    var context = byId("queueContext");
    if (context) context.textContent = activeFilter === "all" ? rows + " baris barang dari " + records().length + (isReturnWorkspace ? " nota retur" : " faktur") : rows + " baris barang pada filter ini";
  }
  function updateSummary() {
    var data = records();
    var ready = data.filter(function (invoice) { return invoice.status === "PARSED"; }).length;
    var review = data.filter(function (invoice) { return invoice.status === "REVIEW"; }).length;
    var errors = data.filter(function (invoice) { return invoice.status === "ERROR" || invoice.status === "DUPLICATE"; }).length;
    var summary = byId("batchSummary");
    if (summary) summary.textContent = data.length ? data.length + (isReturnWorkspace ? " nota retur" : " faktur") + " · " + itemRowsCount() + " baris hasil · " + (review + errors) + " perlu perhatian" : "Belum ada batch aktif";
    var cards = Array.prototype.slice.call(document.querySelectorAll(".stats .stat"));
    var titles = [isReturnWorkspace ? "Semua nota retur" : "Semua faktur", "Selesai", "Perlu review", "Error / duplikat"];
    [data.length, ready, review, errors].forEach(function (count, index) {
      if (cards[index]) { cards[index].querySelector("span").textContent = titles[index]; cards[index].querySelector("strong").textContent = count; }
    });
    [byId("exportWorkspace"), byId("exportFromReview")].forEach(function (button) { if (button) { button.disabled = !data.length; button.title = data.length ? "Unduh seluruh hasil batch" : "Impor minimal satu faktur terlebih dahulu"; } });
    var zipButton = byId("zipWorkspace");
    var renameable = renamedPdfEntries().length;
    if (zipButton) {
      zipButton.disabled = !renameable;
      zipButton.title = renameable ? "Unduh " + renameable + (isReturnWorkspace ? " PDF nota retur" : " faktur PDF dengan nama rapi") : data.length ? "Impor ulang PDF pada sesi ini untuk membuat ZIP" : "Impor faktur terlebih dahulu";
      zipButton.dataset.tooltip = renameable ? (isReturnWorkspace ? "Unduh ZIP Nota Retur" : "Unduh ZIP faktur rapi") : "ZIP belum siap";
    }
    if (byId("clearWorkspace")) byId("clearWorkspace").disabled = !data.length;
    var xmlButton = byId("exportXmlWorkspace");
    if (xmlButton) {
      xmlButton.disabled = !isReturnWorkspace || !data.length;
      xmlButton.title = !isReturnWorkspace ? "XML hanya tersedia untuk workspace Nota Retur" : data.length ? "Buat XML Retur Dokumen Lain" : "Impor minimal satu nota retur terlebih dahulu";
      xmlButton.dataset.tooltip = xmlButton.title;
    }
  }
  function closeExportDialog() { if (byId("exportConfirm")) byId("exportConfirm").hidden = true; }
  function openExportDialog() {
    var review = records().filter(function (invoice) { return invoice.status === "REVIEW"; }).length;
    var errors = records().filter(function (invoice) { return invoice.status === "ERROR" || invoice.status === "DUPLICATE"; }).length;
    var parts = [];
    if (review) parts.push(review + " perlu review");
    if (errors) parts.push(errors + " error/duplikat");
    byId("exportConfirmCopy").textContent = "Batch ini berisi " + parts.join(" dan ") + ". Anda tetap dapat mengunduh seluruh " + itemRowsCount() + " baris hasil sekarang, termasuk data header atau error.";
    byId("exportConfirm").hidden = false;
    byId("exportConfirmReview").focus();
  }
  function tinTokens(value) { return String(value || "").match(/\d{15,16}/g) || []; }
  function cleanTin(value) { return String(value || "").replace(/\D/g, ""); }
  function singleTin(value) { var tokens = tinTokens(value); return tokens.length === 1 ? tokens[0] : ""; }
  function xmlDate(value) {
    var text = String(value || "").trim();
    var match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return "";
    var date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
    return date.getUTCFullYear() === Number(match[3]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[1]) ? text : "";
  }
  function xmlAmount(value) {
    return value == null || value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 ? "" : String(Math.round(Number(value) * 100) / 100);
  }
  function xmlValue(value) { return safe(value); }
  // Nilai contoh pada sheet DATA template DJP yang dilampirkan. Nilai ini
  // dipakai sebagai titik awal batch, bukan sebagai klasifikasi otomatis nota.
  var XML_CODE_DEFAULTS = {
    input: { transactionType: "04", documentType: "01", transactionDetail: "01", transactionDocument: "08" },
    output: { transactionType: "01", documentType: "01", transactionDetail: "01", transactionDocument: "01" }
  };
  function xmlMode() { return (byId("xmlMode") || {}).value || "input"; }
  function xmlDefaultCodes(mode) { return XML_CODE_DEFAULTS[mode] || XML_CODE_DEFAULTS.input; }
  function xmlCodes() {
    return {
      transactionType: (byId("xmlTransactionType") || {}).value || "",
      documentType: (byId("xmlDocumentType") || {}).value || "",
      transactionDetail: (byId("xmlTransactionDetail") || {}).value || "",
      transactionDocument: (byId("xmlTransactionDocument") || {}).value || ""
    };
  }
  function xmlUsesDefaultCodes(codes, mode) {
    var defaults = xmlDefaultCodes(mode);
    return Object.keys(defaults).every(function (key) { return codes[key] === defaults[key]; });
  }
  function applyXmlDefaults() {
    var defaults = xmlDefaultCodes(xmlMode());
    var fields = {
      transactionType: byId("xmlTransactionType"),
      documentType: byId("xmlDocumentType"),
      transactionDetail: byId("xmlTransactionDetail"),
      transactionDocument: byId("xmlTransactionDocument")
    };
    Object.keys(fields).forEach(function (key) {
      if (fields[key]) fields[key].value = defaults[key];
    });
    renderXmlAssessment();
  }
  function xmlParty(invoice, mode) {
    return mode === "output" ? { name: invoice.seller || "", tin: singleTin(invoice.sellerNPWP), address: invoice.sellerAddress || "" } : { name: invoice.buyer || "", tin: singleTin(invoice.buyerNPWP), address: invoice.buyerAddress || "" };
  }
  function xmlCounterparty(invoice, mode) {
    return mode === "output" ? { name: invoice.buyer || "", tin: singleTin(invoice.buyerNPWP), address: invoice.buyerAddress || "" } : { name: invoice.seller || "", tin: singleTin(invoice.sellerNPWP), address: invoice.sellerAddress || "" };
  }
  function xmlDateForMode(value, mode) {
    var date = xmlDate(value);
    return mode === "output" && date ? date.slice(0, 2) + "-" + date.slice(3, 5) + "-" + date.slice(6) : mode === "input" && date ? date.slice(6) + "-" + date.slice(3, 5) + "-" + date.slice(0, 2) : "";
  }
  function xmlInvoiceWarnings(invoice, mode, codes) {
    var warnings = [];
    if (!String(invoice.originalInvoiceNumber || invoice.reference || "").trim()) warnings.push("nomor faktur asal belum terbaca");
    if (!String(invoice.returnNoteNumber || invoice.number || "").trim()) warnings.push("nomor nota retur belum terbaca");
    if (!xmlDateForMode(invoice.date, mode)) warnings.push("tanggal nota retur tidak valid");
    if (!xmlParty(invoice, mode).tin) warnings.push("TIN entitas belum tunggal atau belum terbaca");
    if (!xmlCounterparty(invoice, mode).tin) warnings.push("TIN lawan transaksi belum tunggal atau belum terbaca");
    if (mode === "output" && !xmlCounterparty(invoice, mode).address) warnings.push("alamat pembeli belum terbaca");
    if (invoice.dpp == null) warnings.push("DPP/netto belum terbaca");
    if (invoice.ppn == null) warnings.push("PPN belum terbaca");
    Object.keys(codes).forEach(function (key) { if (!codes[key]) warnings.push("kode " + key + " belum dipilih"); });
    return warnings;
  }
  function xmlAssessment() {
    var mode = xmlMode(), codes = xmlCodes(), groups = {}, warnings = [];
    records().forEach(function (invoice) {
      var party = xmlParty(invoice, mode);
      var key = party.tin || "TANPA-TIN-" + (party.name || invoice.invoiceId || invoice.number || "TIDAK-DIKENAL");
      if (!groups[key]) groups[key] = { party: party, invoices: [] };
      groups[key].invoices.push(invoice);
      xmlInvoiceWarnings(invoice, mode, codes).forEach(function (warning) { warnings.push((invoice.returnNoteNumber || invoice.number || "Tanpa nomor") + ": " + warning); });
    });
    return { mode: mode, codes: codes, groups: Object.keys(groups).map(function (key) { return groups[key]; }), warnings: warnings };
  }
  function renderXmlAssessment() {
    var summary = byId("xmlExportSummary");
    var list = byId("xmlExportWarnings");
    var button = byId("xmlDownload");
    if (!summary || !list || !button) return;
    var assessment = xmlAssessment();
    var noteCount = assessment.groups.reduce(function (total, group) { return total + group.invoices.length; }, 0);
    var codeText = [assessment.codes.transactionType, assessment.codes.documentType, assessment.codes.transactionDetail, assessment.codes.transactionDocument].join(" / ");
    var entities = assessment.groups.map(function (group) {
      return (group.party.name || "Entitas tanpa nama") + (group.party.tin ? " (TIN " + group.party.tin + ")" : " (TIN perlu diperiksa)");
    });
    summary.textContent = (assessment.mode === "input" ? "Retur Dok Lain Masukan" : "Retur Dok Lain Keluaran") + " · " + noteCount + " nota · " + entities.join("; ") + " · kode " + codeText;
    var notes = assessment.warnings.slice();
    if (xmlUsesDefaultCodes(assessment.codes, assessment.mode)) notes.unshift("Kode batch mengikuti contoh pada sheet DATA template Excel.");
    else notes.unshift("Kode batch telah disesuaikan dari contoh pada sheet DATA template Excel. Pastikan kode ini sesuai transaksi.");
    if (assessment.groups.length > 1) notes.unshift("Batch memiliki beberapa entitas. Sistem akan membuat satu XML terpisah untuk setiap TIN entitas.");
    list.innerHTML = notes.length ? notes.map(function (note) { return "<li>" + safe(note) + "</li>"; }).join("") : "<li>Semua data yang diperlukan telah terbaca. Tetap periksa hasil sebelum diunggah ke Coretax.</li>";
    button.disabled = !noteCount;
    button.textContent = "Unduh XML " + (noteCount ? "(" + noteCount + " nota)" : "");
  }
  function openXmlDialog() {
    if (!records().length) { notify("Impor minimal satu nota retur sebelum membuat XML.", "warning"); return; }
    byId("xmlExportDialog").hidden = false;
    applyXmlDefaults();
    byId("xmlMode").focus();
  }
  function closeXmlDialog() { if (byId("xmlExportDialog")) byId("xmlExportDialog").hidden = true; }
  function specialDocReturnData(invoice, mode, codes) {
    var counterparty = xmlCounterparty(invoice, mode);
    var header = [
      "\t\t\t<DocumentNumber>" + xmlValue(invoice.originalInvoiceNumber || invoice.reference || "") + "</DocumentNumber>",
      "\t\t\t<ReturnDocumentNumber>" + xmlValue(invoice.returnNoteNumber || invoice.number || "") + "</ReturnDocumentNumber>",
      "\t\t\t<TransactionType>" + xmlValue(codes.transactionType) + "</TransactionType>",
      "\t\t\t<DocumentType>" + xmlValue(codes.documentType) + "</DocumentType>",
      "\t\t\t<TransactionDetail>" + xmlValue(codes.transactionDetail) + "</TransactionDetail>",
      "\t\t\t<TransactionDocument>" + xmlValue(codes.transactionDocument) + "</TransactionDocument>",
      "\t\t\t<DocumentDate>" + xmlValue(xmlDateForMode(invoice.date, mode)) + "</DocumentDate>"
    ];
    if (mode === "input") header.push("\t\t\t<Period>" + xmlValue(xmlDate(invoice.date).slice(3, 5).replace(/^0/, "")) + "</Period>", "\t\t\t<Year>" + xmlValue(xmlDate(invoice.date).slice(6)) + "</Year>", "\t\t\t<SellerTIN>" + xmlValue(counterparty.tin) + "</SellerTIN>", "\t\t\t<SellerTaxpayerName>" + xmlValue(counterparty.name) + "</SellerTaxpayerName>");
    else header.push("\t\t\t<BuyerTIN>" + xmlValue(counterparty.tin) + "</BuyerTIN>", "\t\t\t<BuyerTaxpayerName>" + xmlValue(counterparty.name) + "</BuyerTaxpayerName>", "\t\t\t<BuyerAddress>" + xmlValue(counterparty.address) + "</BuyerAddress>");
    header.push("\t\t\t<ReturnTaxBase>" + xmlAmount(invoice.dpp) + "</ReturnTaxBase>", "\t\t\t<ReturnVAT>" + xmlAmount(invoice.ppn) + "</ReturnVAT>", "\t\t\t<ReturnSTLG>" + xmlAmount(invoice.ppnbm) + "</ReturnSTLG>");
    return ["\t\t<" + (mode === "input" ? "InputReturnData" : "OutputReturnData") + ">"].concat(header).concat(["\t\t</" + (mode === "input" ? "InputReturnData" : "OutputReturnData") + ">"] ).join("\n");
  }
  function specialDocReturnXml(group, mode, codes) {
    var input = mode === "input";
    return [
      '<?xml version="1.0" encoding="UTF-8" ?>',
      input ? "<InputSpecialDocReturn>" : '<OutputSpecialDocReturn xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
      "\t<TIN>" + xmlValue(group.party.tin) + "</TIN>",
      "\t<" + (input ? "InputReturnDataList" : "OutputReturnDataList") + ">",
      group.invoices.map(function (invoice) { return specialDocReturnData(invoice, mode, codes); }).join("\n"),
      "\t</" + (input ? "InputReturnDataList" : "OutputReturnDataList") + ">",
      input ? "</InputSpecialDocReturn>" : "</OutputSpecialDocReturn>"
    ].join("\n");
  }
  function downloadSpecialDocReturnXml() {
    var assessment = xmlAssessment();
    if (!assessment.groups.length) { renderXmlAssessment(); return; }
    var files = 0;
    assessment.groups.forEach(function (group) {
      var xml = specialDocReturnXml(group, assessment.mode, assessment.codes);
      var parsed = new DOMParser().parseFromString(xml, "application/xml");
      if (parsed.querySelector("parsererror")) { notify("XML tidak dapat dibuat karena struktur hasil tidak valid.", "warning"); return; }
      var months = group.invoices.map(function (invoice) { var date = xmlDate(invoice.date); return date ? date.slice(6) + "-" + date.slice(3, 5) : ""; }).filter(Boolean);
      var period = months.length && months.every(function (month) { return month === months[0]; }) ? months[0] : "MULTIMASA";
      var prefix = assessment.mode === "input" ? "RIPITA_Retur_Dok_Lain_Masukan" : "RIPITA_Retur_Dok_Lain_Keluaran";
      var name = prefix + "_" + renameSlug(group.party.name, "ENTITAS") + "_" + period + ".xml";
      var url = URL.createObjectURL(new Blob([xml], { type: "application/xml;charset=utf-8" }));
      var link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      files += 1;
    });
    closeXmlDialog();
    notify(files + " XML Retur Dok Lain sedang diunduh.", "success");
  }
  function setFilter(next) {
    activeFilter = next;
    document.querySelectorAll(".stat-action").forEach(function (card) { card.classList.toggle("selected", card.dataset.filter === activeFilter); });
    if (byId("resetFilter")) byId("resetFilter").hidden = activeFilter === "all";
    renderFlatQueue();
  }
  function buildSingleWorkspace() {
    var toolbar = byId("workspaceToolbar");
    var inbox = byId("inbox");
    if (!toolbar || !inbox || toolbar.dataset.singleWorkspaceReady) return;
    if (isReturnWorkspace) {
      var importHeading = inbox.querySelector(".panel h2");
      var dropTitle = byId("drop") && byId("drop").querySelector("b");
      var dropCopy = byId("drop") && byId("drop").querySelector("p");
      if (importHeading) importHeading.textContent = "Impor Nota Retur Massal";
      if (dropTitle) dropTitle.textContent = "Tarik Nota Retur PDF / ZIP ke sini";
      if (dropCopy) dropCopy.textContent = "Satu PDF dapat memuat beberapa Nota Retur. ZIP dengan subfolder didukung.";
    }
    document.querySelectorAll("main > section").forEach(function (section) { if (section !== inbox) section.classList.add("single-workspace-hidden"); });
    inbox.classList.remove("hidden");
    toolbar.dataset.singleWorkspaceReady = "true";
    toolbar.innerHTML = workspaceTitleMarkup() + '<div class="workspace-actions"><button type="button" class="icon-action" id="uploadWorkspace" aria-label="Pilih PDF atau ZIP" title="Pilih PDF atau ZIP" data-tooltip="Pilih PDF atau ZIP">' + glyph("upload") + '</button><button type="button" class="secondary icon-action" id="folderWorkspace" aria-label="Pilih folder" title="Pilih folder" data-tooltip="Pilih folder">' + glyph("folder") + '</button><button type="button" class="secondary icon-action" id="clearWorkspace" aria-label="Kosongkan daftar" title="Kosongkan daftar" data-tooltip="Kosongkan daftar">' + glyph("trash") + '</button><button type="button" class="secondary icon-action" id="zipWorkspace" aria-label="Unduh ZIP Nota Retur" title="Unduh ZIP Nota Retur" data-tooltip="Unduh ZIP Nota Retur">' + glyph("folderZip") + '</button><button type="button" class="icon-action" id="exportWorkspace" aria-label="Unduh rekap Excel" title="Unduh rekap Excel" data-tooltip="Unduh rekap Excel">' + glyph("download") + '</button></div>';
    toolbar.querySelector(".workspace-actions").insertAdjacentHTML("beforeend", '<button type="button" class="secondary icon-action xml-action" id="exportXmlWorkspace" aria-label="Buat XML Retur Dokumen Lain" title="Buat XML Retur Dokumen Lain" data-tooltip="Buat XML Retur Dokumen Lain"><span aria-hidden="true">XML</span></button>');
    byId("uploadWorkspace").addEventListener("click", function () { byId("files").click(); });
    byId("folderWorkspace").addEventListener("click", function () { byId("folder").click(); });
    byId("clearWorkspace").addEventListener("click", function () { window.clearInvoices(); });
    byId("zipWorkspace").addEventListener("click", downloadRenamedZip);
    byId("exportWorkspace").addEventListener("click", function () { window.exportExcel(); });
    byId("exportXmlWorkspace").addEventListener("click", openXmlDialog);
    var guide = document.querySelector(".workflow-guide");
    if (guide) guide.innerHTML = '<span><b>1.</b> Masukkan ' + (isReturnWorkspace ? "nota retur" : "faktur") + '</span><i>→</i><span><b>2.</b> Lihat hasil per barang</span><i>→</i><span><b>3.</b> Review bila perlu</span><i>→</i><span><b>4.</b> Unduh Excel atau XML</span>';
    var importPanel = byId("drop").closest(".panel");
    var uploadNote = document.querySelector(".upload-note");
    if (uploadNote) uploadNote.textContent = "Diproses langsung di browser. Tidak diunggah dan tidak disimpan; data hilang saat halaman dimuat ulang.";
    var legacyToolbar = importPanel.querySelector(".toolbar");
    var processing = byId("processing");
    var progress = byId("progress");
    if (legacyToolbar && processing && progress) {
      var status = document.createElement("div");
      status.className = "import-status";
      status.innerHTML = '<div class="import-status-line">' + glyph("package") + "</div>";
      status.querySelector(".import-status-line").appendChild(processing);
      status.appendChild(progress);
      importPanel.appendChild(status);
      legacyToolbar.hidden = true;
    }
    var queuePanel = byId("invoiceRows").closest(".panel");
    queuePanel.querySelector("h2").textContent = isReturnWorkspace ? "Hasil Ekstraksi Nota Retur" : "Hasil Ekstraksi Barang";
    var reviewHeader = document.querySelector(".review-toolbar");
    if (reviewHeader) {
      var reviewKicker = reviewHeader.querySelector(".workspace-kicker");
      if (isReturnWorkspace && reviewKicker) reviewKicker.textContent = "REVIEW NOTA RETUR";
      var controls = reviewHeader.querySelector("div:last-child");
      controls.querySelector("#backToQueue").innerHTML = glyph("close") + "Tutup review";
      controls.querySelector("#exportFromReview").innerHTML = glyph("download") + "Unduh rekap Excel";
    }
    document.body.insertAdjacentHTML("beforeend", '<div id="exportConfirm" class="export-confirm" hidden><div class="export-confirm-backdrop" data-close-export></div><section class="export-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="exportConfirmTitle"><span class="workspace-kicker">KONFIRMASI UNDUH</span><h2 id="exportConfirmTitle">Ada data yang perlu perhatian</h2><p id="exportConfirmCopy"></p><div class="export-confirm-actions"><button type="button" class="secondary" data-close-export>Batal</button><button type="button" class="secondary" id="exportConfirmReview">' + glyph("review") + 'Periksa antrean</button><button type="button" id="exportConfirmContinue">' + glyph("download") + 'Tetap unduh semua</button></div></section></div>');
    document.body.insertAdjacentHTML("beforeend", '<div id="xmlExportDialog" class="xml-export" hidden><div class="xml-export-backdrop" data-close-xml></div><section class="xml-export-dialog" role="dialog" aria-modal="true" aria-labelledby="xmlExportTitle"><span class="workspace-kicker">XML CORETAX</span><h2 id="xmlExportTitle">Buat XML Retur Dokumen Lain</h2><p>Pilih jenis XML dan kode transaksi. Nama serta TIN entitas akan diambil otomatis dari pembeli atau penjual pada hasil ekstraksi.</p><div class="xml-export-fields"><label>Jenis XML<select id="xmlMode"><option value="input">Retur Dok Lain Masukan</option><option value="output">Retur Dok Lain Keluaran</option></select></label><label>Jenis transaksi<select id="xmlTransactionType"><option value="">Pilih kode</option><option value="01">01 · Penyerahan</option><option value="02">02 · Ekspor</option><option value="03">03 · Impor</option><option value="04">04 · Pembelian</option><option value="05">05 · Tidak dikreditkan</option></select></label><label>Jenis dokumen<select id="xmlDocumentType"><option value="">Pilih kode</option><option value="01">01 · Normal</option><option value="02">02 · Pengganti</option></select></label><label>Detail transaksi<select id="xmlTransactionDetail"><option value="">Pilih kode</option><option value="01">01 · Bukan pemungut PPN</option><option value="02">02 · Instansi pemerintah</option><option value="03">03 · Pemungut PPN selain pemerintah</option><option value="04">04 · DPP lain</option><option value="05">05 · Nilai lain</option><option value="06">06 · VAT refund turis</option><option value="07">07 · PPN tidak dipungut</option><option value="08">08 · PPN dibebaskan</option><option value="09">09 · Aset tidak terkait usaha</option><option value="10">10 · Penyerahan barang/jasa lain</option><option value="11">11 · Ekspor barang berwujud</option><option value="12">12 · Ekspor barang tidak berwujud</option><option value="13">13 · Ekspor jasa</option><option value="14">14 · Impor BKP</option><option value="15">15 · Pemanfaatan BKP/JKP</option></select></label><label>Dokumen transaksi<select id="xmlTransactionDocument"><option value="">Pilih kode</option><option value="01">01 · Dokumen dipersamakan faktur</option><option value="02">02 · Cukai rokok</option><option value="03">03 · Dokumen kawasan berikat</option><option value="04">04 · PEB</option><option value="05">05 · PEB jasa/BKP tidak berwujud</option><option value="06">06 · PIB dan pembayaran</option><option value="07">07 · Pembayaran</option><option value="08">08 · Dokumen khusus</option><option value="09">09 · SKPKB/SKPKBT</option><option value="10">10 · PIB</option></select></label></div><div class="xml-export-result"><strong id="xmlExportSummary">Pilih jenis XML untuk melihat entitas yang terdeteksi.</strong><ul id="xmlExportWarnings"></ul></div><p class="xml-export-note">XML dibuat dari template Retur Dok Lain DJP. Peringatan perlu diperiksa sebelum file diunggah ke Coretax.</p><div class="export-confirm-actions"><button type="button" class="secondary" data-close-xml>Batal</button><button type="button" id="xmlDownload">Unduh XML</button></div></section></div>');
    document.querySelectorAll("[data-close-export]").forEach(function (button) { button.addEventListener("click", closeExportDialog); });
    byId("exportConfirmReview").addEventListener("click", function () { closeExportDialog(); var next = records().find(function (invoice) { return invoice.status !== "PARSED"; }); if (next) window.review(records().indexOf(next)); });
    document.querySelectorAll("[data-close-xml]").forEach(function (button) { button.addEventListener("click", closeXmlDialog); });
    byId("xmlMode").addEventListener("change", applyXmlDefaults);
    ["xmlTransactionType", "xmlDocumentType", "xmlTransactionDetail", "xmlTransactionDocument"].forEach(function (id) { byId(id).addEventListener("change", renderXmlAssessment); });
    byId("xmlDownload").addEventListener("click", downloadSpecialDocReturnXml);
  }
  function patchSingleWorkspaceRuntime() {
    var baseRender = window.render;
    var baseReview = window.review;
    var baseEdit = window.editItem;
    var baseExport = window.exportExcel;
    if (!baseRender || !baseReview || !baseEdit || !baseExport) return;
    window.render = function () { baseRender(); window.setTimeout(function () { renderFlatQueue(); updateSummary(); }, 20); };
    window.review = function (index) {
      baseReview(index);
      var invoice = records()[index];
      var state = byId("reviewState");
      if (state && invoice) state.textContent = invoice.status === "PARSED" ? "Hasil terbaca. Edit hanya jika perlu, lalu unduh kapan saja." : "Perlu dicek: " + (invoice.message || "lengkapi data barang");
      if (byId("pdfPreview") && byId("pdfPreview").src === "about:blank" && state) state.textContent = "Pratinjau hanya tersedia untuk PDF yang diimpor pada sesi ini. Impor ulang file untuk melihat dokumennya.";
    };
    window.editItem = async function () { await baseEdit.apply(null, arguments); renderFlatQueue(); updateSummary(); };
    window.exportExcel = function () {
      if (!records().length) { notify("Impor minimal satu faktur sebelum mengunduh rekap.", "warning"); return; }
      if (isReturnWorkspace) { baseExport(); notify("Rekap Nota Retur sedang diunduh.", "success"); return; }
      if (records().some(function (invoice) { return invoice.status !== "PARSED"; })) { openExportDialog(); return; }
      baseExport();
    };
    byId("exportConfirmContinue").addEventListener("click", function () { closeExportDialog(); baseExport(); });
  }
  function initializeSingleWorkspace() {
    buildSingleWorkspace();
    patchSingleWorkspaceRuntime();
    document.querySelectorAll(".stat-action").forEach(function (card) {
      card.onclick = function () { setFilter(card.dataset.filter); };
      card.onkeydown = function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setFilter(card.dataset.filter); } };
    });
    if (byId("resetFilter")) byId("resetFilter").onclick = function () { setFilter("all"); };
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (byId("exportConfirm") && !byId("exportConfirm").hidden) closeExportDialog();
      if (byId("xmlExportDialog") && !byId("xmlExportDialog").hidden) closeXmlDialog();
    });
    renderFlatQueue();
    updateSummary();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeSingleWorkspace);
  else initializeSingleWorkspace();
}());
