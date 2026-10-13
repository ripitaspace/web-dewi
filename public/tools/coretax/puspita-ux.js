(function () {
  "use strict";

  var filter = "all";
  var statusLabels = {
    PARSED: "Selesai",
    REVIEW: "Perlu review",
    ERROR: "Perlu perhatian",
    DUPLICATE: "Duplikat"
  };

  function $(id) { return document.getElementById(id); }
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

    document.querySelectorAll("aside button").forEach(function (button) {
      var handler = button.getAttribute("onclick") || "";
      var match = handler.match(/view\('([^']+)'/);
      if (match) button.dataset.view = match[1];
    });

    var workspaceToolbar = document.createElement("div");
    workspaceToolbar.id = "workspaceToolbar";
    workspaceToolbar.className = "workspace-toolbar";
    workspaceToolbar.innerHTML =
      '<div class="workspace-title"><span class="workspace-kicker">RIPITAX · CORETAX</span><strong>Invoice Scraper</strong><small id="batchSummary">Belum ada batch aktif</small></div>' +
      '<div class="workspace-actions"><button class="secondary" type="button" id="showInbox">Impor faktur</button><button type="button" id="exportWorkspace">Export Excel</button></div>';
    main.insertBefore(workspaceToolbar, inbox);
    $("showInbox").addEventListener("click", function () { focusSection("inbox"); });
    $("exportWorkspace").addEventListener("click", function () { window.exportExcel(); });

    var helper = document.createElement("div");
    helper.className = "workflow-guide";
    helper.innerHTML =
      '<span><b>1.</b> Masukkan faktur</span><i>→</i><span><b>2.</b> Periksa yang perlu review</span><i>→</i><span><b>3.</b> Export Excel</span>';
    inbox.insertBefore(helper, inbox.firstChild);

    var uploader = $("drop");
    if (uploader) {
      uploader.insertAdjacentHTML("beforeend",
        '<div class="upload-options" aria-label="Pilihan impor"><button type="button" class="upload-option" id="pickPdf">PDF atau ZIP</button><button type="button" class="upload-option" id="pickFolder">Folder</button></div>' +
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
      queueTools.innerHTML = '<span id="queueContext">Menampilkan semua dokumen</span><button type="button" class="secondary" id="reviewAttention">Review yang perlu perhatian</button>';
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
      reviewHeader.innerHTML = '<div><span class="workspace-kicker">REVIEW FAKTUR</span><strong id="reviewState">Periksa data barang sebelum export</strong></div><div><button type="button" class="secondary" id="backToQueue">Kembali ke antrean</button><button type="button" id="exportFromReview">Export Excel</button></div>';
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
      var statusCell = row.children[5];
      if (statusCell) {
        statusCell.innerHTML = '<span class="pill ' + (invoice.status === "PARSED" ? "" : invoice.status === "ERROR" ? "error" : "warn") + '">' + statusLabels[invoice.status] + '</span><small>' + (invoice.message || "") + "</small>";
      }
      var actionCell = row.children[6];
      if (actionCell) {
        actionCell.innerHTML = '<button class="secondary review-button" type="button">' + (invoice.status === "PARSED" ? "Lihat" : "Review") + "</button>";
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
      if (preview && preview.src === "about:blank") {
        preview.setAttribute("aria-label", "Pratinjau PDF tidak tersedia untuk data yang dipulihkan dari sesi sebelumnya");
        if (reviewState) reviewState.textContent = "Pratinjau tersedia untuk PDF yang baru diimpor pada sesi ini. Impor ulang file untuk melihat dokumennya.";
      }
    };
    window.editItem = async function (invoiceIndex, itemIndex, key, value) {
      await originalEditItem(invoiceIndex, itemIndex, key, value);
      var state = $("reviewState");
      if (state) state.textContent = "Perubahan tersimpan di batch dan akan masuk ke file export";
      showToast("Perubahan item tersimpan untuk export.", "success");
      updateSummary();
    };
    var originalExport = window.exportExcel;
    window.exportExcel = function () {
      if (!getInvoices().length) { showToast("Impor minimal satu faktur sebelum export.", "warning"); return; }
      originalExport();
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
        var invoice;
        try {
          invoice = await extractPDF(await item.get(), item.name, item.path);
        } catch (error) {
          invoice = { key: "FILE|" + item.path + "|" + Date.now(), filename: item.name, path: item.path, number: "", seller: "", items: [], pages: 0, status: "ERROR", message: String(error), raw: "", imported: new Date().toISOString() };
        }
        var existing = invoices.find(function (candidate) { return candidate.key === invoice.key; });
        if (existing) {
          invoice.status = "DUPLICATE";
          invoice.message = "Nomor faktur dan NPWP penjual sudah ada; file baru dilewati";
          if (item.preview) URL.revokeObjectURL(item.preview);
        } else {
          var nextNumber = Math.max.apply(Math, [0].concat(invoices.map(function (candidate) { return Number((candidate.invoiceId || "").replace(/\D/g, "")) || 0; }))) + 1;
          invoice.invoiceId = "INV-" + String(nextNumber).padStart(6, "0");
          for (var itemIndex = 0; itemIndex < invoice.items.length; itemIndex += 1) invoice.items[itemIndex].productId = await getProduct(invoice, invoice.items[itemIndex]);
          invoices.push(invoice);
          await put("invoices", invoice);
          var previewUrl = item.preview || await item.previewFromZip();
          urls.set(invoice.key, previewUrl);
        }
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
    buildWorkspace();
    patchRuntime();
    updateSummary();
    enhanceQueue();
    enhanceRegistry();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
