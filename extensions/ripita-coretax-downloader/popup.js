const $ = (id) => document.getElementById(id);
let timer;

async function tab() {
  const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
  return t;
}
async function send(msg) {
  const t = await tab();
  try { return await chrome.tabs.sendMessage(t.id, msg); }
  catch { return null; }
}
const noTab = () => ($("out").textContent = "Buka halaman Coretax (pajak.go.id) lalu muat ulang halaman, kemudian coba lagi.");

function render(s) {
  const busy = s.running;
  $("start").disabled = busy; $("scan").disabled = busy;
  $("pause").disabled = !busy; $("stop").disabled = !busy;
  $("pause").textContent = s.paused ? "Lanjutkan" : "Jeda";
  $("out").textContent =
    `${s.message}\nDipicu: ${s.clicked} · Dilewati: ${s.skipped} · Gagal: ${s.failed}` +
    (s.current ? `\nSaat ini: ${s.current}` : "");
  if (!busy) { clearInterval(timer); timer = null; }
}
function poll() {
  clearInterval(timer);
  timer = setInterval(async () => { const s = await send({ type: "status" }); if (s) render(s); }, 500);
}

$("scan").onclick = async () => {
  const r = await send({ type: "scan", kind: $("kind").value });
  if (!r) return noTab();
  $("out").textContent = `Terdeteksi ${r.total} ${r.plural} di halaman ini, ${r.ready} siap diunduh.`;
};
$("start").onclick = async () => {
  const r = await send({ type: "start", kind: $("kind").value, delayMs: Number($("delay").value) * 1000 });
  if (!r) return noTab();
  if (!r.ok) { $("out").textContent = r.error; return; }
  poll();
};
$("pause").onclick = () => send({ type: "pause" });
$("stop").onclick = () => send({ type: "stop" });

send({ type: "status" }).then((s) => { if (s) { render(s); if (s.running) poll(); } });
