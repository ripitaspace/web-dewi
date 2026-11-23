"use client";

import { useMemo, useState } from "react";
import type { PublicConfirmation } from "@/modules/confirmation/types";

type Method = "ONLINE" | "UPLOAD";

function money(value: number | null, currency: string): string {
  if (value === null) return "Tidak dicantumkan";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: currency || "IDR", maximumFractionDigits: 2 }).format(value);
}

function label(key: string): string { return key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function ConfirmationResponseClient({ confirmation }: { confirmation: PublicConfirmation }) {
  const [method, setMethod] = useState<Method | null>(null);
  const [answer, setAnswer] = useState("SESUAI");
  const [difference, setDifference] = useState("");
  const [respondentBalance, setRespondentBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [agreed, setAgreed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; time: string; duplicate: boolean } | null>(null);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const balanceChoice = confirmation.type === "PIUTANG" || confirmation.type === "UTANG";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method) { setError("Pilih metode jawaban terlebih dahulu."); return; }
    setError(""); setSubmitting(true);
    try {
      const form = new FormData();
      form.set("method", method); form.set("responseStatus", answer); form.set("differenceExplanation", difference);
      form.set("respondentBalance", respondentBalance); form.set("notes", notes); form.set("respondentName", name);
      form.set("respondentRole", role); form.set("respondentDate", date); form.set("agreed", String(agreed)); form.set("idempotencyKey", idempotencyKey);
      if (file) form.set("file", file);
      const response = await fetch(`/api/confirmation/${encodeURIComponent(confirmation.clientCode)}/${encodeURIComponent(confirmation.token)}/submit`, { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Jawaban tidak dapat dikirim.");
      setReceipt({ id: body.receiptId, time: body.receivedAt, duplicate: body.duplicate });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Jawaban tidak dapat dikirim."); }
    finally { setSubmitting(false); }
  }

  if (receipt) return (
    <main className="confirmation-page"><section className="confirmation-shell success-box"><span className="eyebrow text-sirih">Bukti Penerimaan</span><h1>Jawaban telah diterima</h1><p>Terima kasih. Dokumen jawaban disimpan untuk pemeriksaan auditor.</p><p className="muted">ID penerimaan: <strong>{receipt.id}</strong><br />Waktu penerimaan: {new Date(receipt.time).toLocaleString("id-ID")}{receipt.duplicate ? " · Pengiriman sebelumnya digunakan kembali." : ""}</p></section></main>
  );

  return (
    <main className="confirmation-page"><section className="confirmation-shell">
      <span className="eyebrow text-sirih">Jawaban Konfirmasi</span><h1>Konfirmasi {confirmation.type.toLowerCase()}</h1>
      <p className="lead">Periksa ringkasan berikut. Data ini berasal dari permintaan konfirmasi dan tidak dapat diubah di halaman ini.</p>
      <div className="card confirmation-summary"><dl><div><dt>Nomor konfirmasi</dt><dd>{confirmation.confirmationCode}</dd></div><div><dt>Entitas</dt><dd>{confirmation.entityName}</dd></div><div><dt>Penerima</dt><dd>{confirmation.recipientName}</dd></div><div><dt>Tanggal saldo</dt><dd>{confirmation.balanceDate}</dd></div><div><dt>Saldo</dt><dd>{money(confirmation.balance, confirmation.currency)}</dd></div><div><dt>Batas jawaban</dt><dd>{confirmation.expiresAt}</dd></div></dl>
      {confirmation.description ? <p><strong>Keterangan:</strong> {confirmation.description}</p> : null}
      {Object.keys(confirmation.extra).length ? <dl className="confirmation-extra">{Object.entries(confirmation.extra).map(([key, value]) => <div key={key}><dt>{label(key)}</dt><dd>{value}</dd></div>)}</dl> : null}</div>
      <div className="confirmation-methods"><button type="button" className={`card ${method === "UPLOAD" ? "selected" : ""}`} onClick={() => setMethod("UPLOAD")}><strong>Cetak & unggah</strong><span>Unduh formulir, tandatangani, lalu unggah PDF, JPG, atau PNG.</span></button><button type="button" className={`card ${method === "ONLINE" ? "selected" : ""}`} onClick={() => setMethod("ONLINE")}><strong>Isi online</strong><span>Berikan pernyataan elektronik dan sistem membuat PDF jawaban.</span></button></div>
      {method === "UPLOAD" ? <div className="confirmation-download"><a className="btn btn-secondary" href={`/api/confirmation/${encodeURIComponent(confirmation.clientCode)}/${encodeURIComponent(confirmation.token)}/document`} target="_blank" rel="noreferrer">Unduh formulir PDF</a><p className="muted">Format yang diterima: PDF, JPG, atau PNG. Maksimal 10 MB.</p></div> : null}
      <form className="card card-pad confirmation-form" onSubmit={submit} noValidate>
        {method === "UPLOAD" ? <div className="form-field full"><label htmlFor="answerFile">Dokumen jawaban yang telah diisi *</label><input id="answerFile" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} /><small>Dokumen akan dikonversi ke PDF bila Anda mengunggah JPG atau PNG.</small></div> : null}
        {method === "ONLINE" ? <><div className="form-field full"><label>Jawaban *</label>{balanceChoice ? <select value={answer} onChange={(event) => setAnswer(event.target.value)}><option value="SESUAI">Sesuai dengan catatan kami</option><option value="BERBEDA">Terdapat perbedaan</option></select> : <select value={answer} onChange={(event) => setAnswer(event.target.value)}><option value="DITERIMA">Informasi telah kami terima</option><option value="BERBEDA">Terdapat catatan atau perbedaan</option></select>}</div>{answer === "BERBEDA" ? <><div className="form-field"><label htmlFor="respondentBalance">Nilai menurut responden {balanceChoice ? "*" : ""}</label><input id="respondentBalance" inputMode="decimal" value={respondentBalance} onChange={(event) => setRespondentBalance(event.target.value)} /></div><div className="form-field"><label htmlFor="difference">Penjelasan perbedaan *</label><input id="difference" value={difference} onChange={(event) => setDifference(event.target.value)} /></div></> : null}<div className="form-field full"><label htmlFor="notes">Catatan tambahan</label><textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} /></div></> : null}
        <div className="form-grid"><div className="form-field"><label htmlFor="respondentName">Nama lengkap *</label><input id="respondentName" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></div><div className="form-field"><label htmlFor="respondentRole">Jabatan *</label><input id="respondentRole" value={role} onChange={(event) => setRole(event.target.value)} /></div><div className="form-field"><label htmlFor="respondentDate">Tanggal *</label><input id="respondentDate" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></div>
        <label className="confirmation-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> Saya menyatakan jawaban ini benar menurut catatan kami.</label><p className="muted">Pernyataan elektronik ini bukan tanda tangan elektronik tersertifikasi.</p>
        {error ? <div className="booking-alert error" role="alert">{error}</div> : null}<button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Mengirim jawaban…" : "Kirim Jawaban"}</button>
      </form><p className="confirmation-privacy">Data jawaban dipakai hanya untuk proses konfirmasi dan pemeriksaan audit.</p>
    </section></main>
  );
}
