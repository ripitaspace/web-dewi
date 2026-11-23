"use client";

import { useState } from "react";

function destination(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/kerja-bersama\/konfirmasi\/([^/]+)\/([^/]+)\/?$/);
    if (match) return `/kerja-bersama/konfirmasi/${encodeURIComponent(decodeURIComponent(match[1]))}/${encodeURIComponent(decodeURIComponent(match[2]))}`;
  } catch { /* a short code is handled below */ }
  const match = raw.match(/^([A-Za-z0-9_-]{3,100})[\s/:]+([A-Za-z0-9_-]{22,})$/);
  return match ? `/kerja-bersama/konfirmasi/${encodeURIComponent(match[1])}/${encodeURIComponent(match[2])}` : null;
}

export function ConfirmationEntryForm() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = destination(value);
    if (!target) { setError("Tempel tautan konfirmasi lengkap atau isi KODEKLIEN/TOKEN."); return; }
    window.location.assign(target);
  }

  return (
    <form onSubmit={submit} className="confirmation-entry-form" noValidate>
      <label htmlFor="confirmationLink">Tautan atau kode konfirmasi</label>
      <div className="confirmation-entry-row">
        <input id="confirmationLink" value={value} onChange={(event) => setValue(event.target.value)} placeholder="K000013/TOKEN_UNIK atau tempel tautan" autoComplete="off" />
        <button className="btn btn-primary" type="submit">Periksa Konfirmasi</button>
      </div>
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </form>
  );
}
