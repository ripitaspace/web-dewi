"use client";

import { useMemo, useState } from "react";
import styles from "./bea-cukai-calculator.module.css";
import theme from "./bea-cukai-calculator-theme.module.css";
import {
  calculatePassengerImport,
  emptyScenario,
  EXAMPLE_SCENARIOS,
  exampleScenario,
  PASSENGER_IMPORT_RULES,
  SUPPORTED_CURRENCIES,
  type Currency,
  type ItemCategory,
  type ItemStatus,
  type ShoppingItem,
  type TravelScenario,
} from "@/modules/customs/passenger-import-calculator";

const STORAGE_KEY = "puspitacore-bea-cukai-calculator-v1";
const moneyIdr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const moneyUsd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const squareIconButtonStyle = { width: "42px", height: "42px", padding: 0 };

const categoryLabels: Record<ItemCategory, string> = {
  general: "Barang pribadi non-mewah",
  "mobile-device": "HP, tablet, atau perangkat seluler",
  "alcohol-tobacco": "Alkohol atau tembakau",
  luxury: "Barang mewah",
  commercial: "Jastip atau untuk dijual kembali",
};

const statusLabels: Record<ItemStatus, string> = {
  "purchased-abroad": "Dibeli di luar negeri",
  preowned: "Sudah dimiliki sebelum perjalanan",
  review: "Status perlu peninjauan",
};

function newId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function makeSummary(scenario: TravelScenario, totalLevyIdr: number) {
  return [
    "Simulasi Bea Cukai Calculator — PuspitaCore",
    `Asal perjalanan: ${scenario.originCountry || "Belum diisi"}`,
    `Tanggal tiba: ${scenario.arrivalDate || "Belum diisi"}`,
    `Penumpang: ${scenario.passengers.map((passenger) => passenger.name || "Tanpa nama").join(", ")}`,
    `Estimasi pungutan: ${moneyIdr.format(Math.round(totalLevyIdr))}`,
    `Kurs: ${scenario.rates.source || "Manual"} · ${scenario.rates.period || "Periode belum diisi"}`,
    "Perhitungan ini merupakan estimasi untuk membantu perencanaan biaya perjalanan. Hasil akhir dapat berbeda berdasarkan klasifikasi barang, penetapan nilai pabean, kurs, ketentuan yang berlaku, dan pemeriksaan pejabat Bea Cukai. Kalkulator ini bukan layanan resmi Direktorat Jenderal Bea dan Cukai.",
  ].join("\n");
}

export function BeaCukaiCalculatorClient() {
  const [scenario, setScenario] = useState<TravelScenario>(emptyScenario);
  const [notice, setNotice] = useState("Isi perjalanan, kurs, dan barang belanjaanmu. Semua proses berjalan di perangkat ini.");
  const [exampleIndex, setExampleIndex] = useState(0);

  const result = useMemo(() => calculatePassengerImport(scenario), [scenario]);
  const activeCurrencies = useMemo(() => Array.from(new Set<Currency>(["USD", "IDR", ...scenario.items.map((item) => item.currency)])), [scenario.items]);

  function updateScenario(patch: Partial<TravelScenario>) {
    setScenario((current) => ({ ...current, ...patch }));
  }

  function addPassenger() {
    setScenario((current) => ({
      ...current,
      passengers: [...current.passengers, { id: newId("passenger"), name: `Penumpang ${current.passengers.length + 1}` }],
    }));
  }

  function updatePassenger(id: string, name: string) {
    setScenario((current) => ({ ...current, passengers: current.passengers.map((passenger) => passenger.id === id ? { ...passenger, name } : passenger) }));
  }

  function removePassenger(id: string) {
    setScenario((current) => {
      if (current.passengers.length === 1) return current;
      const passengers = current.passengers.filter((passenger) => passenger.id !== id);
      const ownerId = passengers[0]!.id;
      return { ...current, passengers, items: current.items.map((item) => item.ownerId === id ? { ...item, ownerId } : item) };
    });
  }

  function addItem() {
    setScenario((current) => ({
      ...current,
      items: [...current.items, { id: newId("item"), name: "", category: "general", quantity: 1, unitPrice: "", discount: "0", currency: "USD", ownerId: current.passengers[0]?.id ?? "", status: "purchased-abroad" }],
    }));
  }

  function updateItem(id: string, patch: Partial<ShoppingItem>) {
    setScenario((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  }

  function removeItem(id: string) {
    setScenario((current) => current.items.length === 1 ? current : { ...current, items: current.items.filter((item) => item.id !== id) });
  }

  function setRate(currency: Currency, value: string) {
    setScenario((current) => ({ ...current, rates: { ...current.rates, idrPerUnit: { ...current.rates.idrPerUnit, [currency]: value } } }));
  }

  function useExample() {
    const example = EXAMPLE_SCENARIOS[exampleIndex]!;
    setScenario(exampleScenario(exampleIndex));
    setExampleIndex((current) => (current + 1) % EXAMPLE_SCENARIOS.length);
    setNotice(`Contoh ${example.title} telah dimuat. Klik lagi untuk contoh berbeda; kursnya hanya ilustrasi.`);
  }

  function clearAll() {
    setScenario(emptyScenario());
    window.localStorage.removeItem(STORAGE_KEY);
    setNotice("Simulasi dikosongkan dari halaman dan perangkat ini.");
  }

  function saveScenario() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenario));
    setNotice("Simulasi disimpan hanya di perangkat ini.");
  }

  function loadScenario() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setNotice("Belum ada simulasi tersimpan di perangkat ini.");
        return;
      }
      setScenario(JSON.parse(saved) as TravelScenario);
      setNotice("Simulasi tersimpan berhasil dimuat dari perangkat ini.");
    } catch {
      setNotice("Simulasi tersimpan tidak dapat dibaca. Kamu bisa mulai dari data baru.");
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(makeSummary(scenario, result.totalLevyIdr));
      setNotice("Ringkasan hasil sudah disalin.");
    } catch {
      setNotice("Browser tidak mengizinkan penyalinan. Kamu tetap bisa mencetak ringkasannya.");
    }
  }

  return (
    <div className={`${styles.calculator} ${theme.calculator}`}>
      <section className={`${styles.notice} ${theme.notice}`} aria-label="Privasi kalkulator">
        <span aria-hidden="true">⌁</span>
        <p><strong>Privat di perangkatmu.</strong> Data perjalanan dan belanjaan tidak dikirim ke server PuspitaCore.</p>
      </section>

      <div className={styles.actions}>
        <button type="button" className={`${styles.secondaryButton} ${theme.secondaryButton}`} onClick={useExample}>Gunakan contoh lain</button>
        <button type="button" className={styles.textButton} onClick={clearAll}>Kosongkan</button>
      </div>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <section className={`${styles.panel} ${theme.panel}`} aria-labelledby="travel-title">
            <div className={styles.sectionHeading}><span>01 · PERJALANAN</span><h2 id="travel-title">Mulai dari perjalananmu.</h2></div>
            <div className={styles.fieldGrid}>
              <label>Negara asal perjalanan<input value={scenario.originCountry} onChange={(event) => updateScenario({ originCountry: event.target.value })} placeholder="Contoh: Jepang" /></label>
              <label>Tanggal tiba di Indonesia<input type="date" value={scenario.arrivalDate} onChange={(event) => updateScenario({ arrivalDate: event.target.value })} /></label>
            </div>
          </section>

          <section className={`${styles.panel} ${theme.panel}`} aria-labelledby="passenger-title">
            <div className={styles.sectionHeadingRow}><div className={styles.sectionHeading}><span>02 · PENUMPANG</span><h2 id="passenger-title">Fasilitas dihitung per orang.</h2></div><button type="button" className={styles.secondaryButton} onClick={addPassenger}>+ Tambah penumpang</button></div>
            <p className={styles.help}>Setiap penumpang memiliki pembebasan sendiri. Barang harus dikaitkan kepada pemiliknya.</p>
            <div className={styles.passengers}>{scenario.passengers.map((passenger, index) => <div className={styles.passengerRow} key={passenger.id}><label>Nama penumpang {index + 1}<input value={passenger.name} onChange={(event) => updatePassenger(passenger.id, event.target.value)} /></label>{scenario.passengers.length > 1 && <button type="button" className={styles.iconButton} onClick={() => removePassenger(passenger.id)} aria-label={`Hapus ${passenger.name || `penumpang ${index + 1}`}`}>×</button>}</div>)}</div>
          </section>

          <section className={`${styles.panel} ${theme.panel}`} aria-labelledby="rate-title">
            <div className={styles.sectionHeading}><span>03 · KURS MANUAL</span><h2 id="rate-title">Masukkan kurs Bea Cukai.</h2></div>
            <p className={styles.help}>Isi IDR per 1 unit mata uang. Untuk JPY, masukkan nilai per 1 JPY, bukan per 100 JPY.</p>
            <div className={styles.fieldGrid}>
              {activeCurrencies.map((currency) => <label key={currency}>1 {currency} = IDR<input inputMode="decimal" value={scenario.rates.idrPerUnit[currency] ?? ""} onChange={(event) => setRate(currency, event.target.value)} placeholder={currency === "IDR" ? "1" : "0"} /></label>)}
              <label>Periode berlaku<input value={scenario.rates.period} onChange={(event) => updateScenario({ rates: { ...scenario.rates, period: event.target.value } })} placeholder="Contoh: 21–27 Oktober 2026" /></label>
              <label>Sumber kurs<input value={scenario.rates.source} onChange={(event) => updateScenario({ rates: { ...scenario.rates, source: event.target.value } })} /></label>
            </div>
            <a className={styles.officialLink} href="https://www.beacukai.go.id/kurs" target="_blank" rel="noreferrer">Buka kurs resmi Bea Cukai ↗</a>
          </section>

          <section className={`${styles.panel} ${theme.panel}`} aria-labelledby="items-title">
            <div className={styles.sectionHeadingRow}><div className={styles.sectionHeading}><span>04 · BELANJAAN</span><h2 id="items-title">Apa saja yang kamu bawa?</h2></div><button type="button" className={styles.primaryButton} onClick={addItem}>+ Tambah barang</button></div>
            <p className={styles.help}>Subtotal belanja: <strong>{moneyIdr.format(Math.round(result.totalShoppingIdr))}</strong></p>
            <div className={styles.items}>{scenario.items.map((item, index) => <article className={styles.item} key={item.id} aria-label={`Barang ${index + 1}`}>
              <div className={styles.itemHeading}><strong>Barang {index + 1}</strong>{scenario.items.length > 1 && <button type="button" className={styles.textButton} onClick={() => removeItem(item.id)}>Hapus</button>}</div>
              <div className={styles.fieldGrid}>
                <label className={styles.full}>Nama barang<input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} placeholder="Contoh: Tas" /></label>
                <label>Kategori<select value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value as ItemCategory })}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>Pemilik<select value={item.ownerId} onChange={(event) => updateItem(item.id, { ownerId: event.target.value })}>{scenario.passengers.map((passenger) => <option key={passenger.id} value={passenger.id}>{passenger.name || "Penumpang tanpa nama"}</option>)}</select></label>
                <label>Jumlah<input type="number" min="1" step="1" inputMode="numeric" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })} /></label>
                <label>Harga per unit<input inputMode="decimal" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: event.target.value })} placeholder="0" /></label>
                <label>Diskon total<input inputMode="decimal" value={item.discount} onChange={(event) => updateItem(item.id, { discount: event.target.value })} placeholder="0" /></label>
                <label>Mata uang<select value={item.currency} onChange={(event) => updateItem(item.id, { currency: event.target.value as Currency })}>{SUPPORTED_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></label>
                <label className={styles.full}>Status barang<select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value as ItemStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
              {item.category === "mobile-device" && <label className={styles.checkbox}><input type="checkbox" checked={item.imeiAtArrival ?? false} onChange={(event) => updateItem(item.id, { imeiAtArrival: event.target.checked })} /> Perangkat akan diregistrasikan pada saat kedatangan.</label>}
            </article>)}</div>
          </section>
        </div>

        <aside className={`${styles.summary} ${theme.summary}`} aria-label="Ringkasan estimasi">
          <span>ESTIMASI PUNGUTAN</span>
          <h2>Total Pungutan</h2>
          <strong className={`${styles.total} ${!result.isReady ? theme.pendingTotal : ""}`}>{result.isReady ? moneyIdr.format(Math.round(result.totalLevyIdr)) : "Lengkapi kurs"}</strong>
          <p className={styles.totalUsd}>{result.isReady ? moneyUsd.format(result.totalLevyUsd) : ""}</p>
          {result.reviews.length > 0 ? <p className={styles.message}>Ada barang yang belum dimasukkan ke estimasi karena memerlukan peninjauan khusus.</p> : result.isReady && result.totalLevyUsd === 0 ? <p className={styles.message}>Belanjaanmu masih berada dalam batas pembebasan USD 500 untuk barang pribadi.</p> : <p className={styles.message}>Nilai belanjaan yang dapat dihitung melewati batas pembebasan. Ini adalah estimasi, bukan penetapan resmi.</p>}
          <dl className={styles.breakdown}>
            <div><dt>Total belanjaan</dt><dd>{moneyIdr.format(Math.round(result.totalShoppingIdr))}</dd></div>
            <div><dt>Nilai pribadi yang dihitung</dt><dd>{moneyUsd.format(result.totalShoppingUsd)}</dd></div>
            <div><dt>Batas pembebasan</dt><dd>{moneyUsd.format(result.allowanceUsd)}</dd></div>
            <div><dt>Nilai terkena pungutan</dt><dd>{moneyUsd.format(result.dutiableUsd)}</dd></div>
            <div><dt>Bea masuk</dt><dd>{moneyUsd.format(result.importDutyUsd)}</dd></div>
            <div><dt>PPN impor</dt><dd>{moneyUsd.format(result.vatUsd)}</dd></div>
            <div><dt>PPnBM (bila ada)</dt><dd>{moneyUsd.format(result.ppnbmUsd)}</dd></div>
            <div className={styles.emphasis}><dt>Total belanja + pungutan</dt><dd>{moneyIdr.format(Math.round(result.totalCostIdr))}</dd></div>
          </dl>
          <div className={styles.passengerBreakdown}><h3>Fasilitas per penumpang</h3>{result.passengers.map((entry) => { const passenger = scenario.passengers.find((candidate) => candidate.id === entry.passengerId); return <div key={entry.passengerId}><div className={styles.progressLabel}><span>{passenger?.name || "Penumpang"}</span><b>{moneyUsd.format(entry.eligibleValueUsd)} / USD 500</b></div><div className={styles.progress}><i style={{ width: `${entry.allowanceUsedPercent}%` }} /></div></div>; })}</div>
          {result.errors.length > 0 && <div className={styles.errors} role="alert"><strong>Lengkapi data berikut:</strong><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
          {result.reviews.length > 0 && <div className={styles.review} role="status"><strong>Perlu Peninjauan</strong>{result.reviews.map((review) => <p key={review.itemId}><b>{review.itemName}:</b> {review.message}</p>)}</div>}
          <div className={styles.summaryActions} role="group" aria-label="Aksi simulasi"><button type="button" className={styles.iconButton} style={squareIconButtonStyle} onClick={saveScenario} aria-label="Simpan di perangkat" title="Simpan di perangkat"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v13" /><path d="m6.5 11.5 5.5 5.5 5.5-5.5" /><path d="M5 21h14" /></svg></button><button type="button" className={styles.iconButton} style={squareIconButtonStyle} onClick={loadScenario} aria-label="Muat simpanan" title="Muat simpanan"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65" /><path d="M4 4v5h5" /></svg></button><button type="button" className={styles.iconButton} style={squareIconButtonStyle} onClick={copySummary} aria-label="Salin ringkasan" title="Salin ringkasan"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1" /><path d="M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4" /></svg></button><button type="button" className={styles.iconButton} style={squareIconButtonStyle} onClick={() => window.print()} aria-label="Cetak" title="Cetak"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 8V3h10v5" /><rect x="4" y="8" width="16" height="9" rx="2" /><path d="M7 14h10v7H7z" /><path d="M17 11h.01" /></svg></button></div>
          <p className={styles.status}>Aturan estimasi: <a href="https://jdih.kemenkeu.go.id/dok/pmk-34-tahun-2025" target="_blank" rel="noreferrer">{PASSENGER_IMPORT_RULES.version}</a> · efektif {PASSENGER_IMPORT_RULES.effectiveFrom}.</p>
          <p className={styles.status} role="status">{notice}</p>
        </aside>
      </div>

      <section className={styles.education} aria-labelledby="how-title"><span>CATATAN PENTING</span><h2 id="how-title">Cara menghitung dan kapan perlu memeriksa ulang.</h2><div className={styles.accordions}>
        <details><summary>Apa itu pembebasan USD 500?</summary><p>Fasilitas ini diperhitungkan per penumpang untuk barang pribadi yang memenuhi ketentuan, bukan digabungkan untuk seluruh rombongan.</p></details>
        <details><summary>Kenapa PPN dihitung setelah bea masuk?</summary><p>Dalam model estimasi ini, nilai impor untuk PPN dihitung dari nilai yang terkena pungutan ditambah bea masuk.</p></details>
        <details><summary>Kenapa kurs pajak bisa berbeda dari kurs bank?</summary><p>Gunakan Nilai Dasar Penetapan Bea Masuk (NDPBM) pada periode kedatangan. Kalkulator ini meminta kurs manual agar tidak mengklaim kurs live.</p></details>
        <details><summary>Kapan HP perlu registrasi IMEI?</summary><p>HKT yang diperoleh dari luar negeri membutuhkan registrasi IMEI untuk jaringan seluler Indonesia. Registrasi tidak dipungut biaya administrasi, tetapi pungutan impor dapat tetap timbul.</p></details>
        <details><summary>Kenapa hasilnya dapat berbeda dari petugas?</summary><p>Petugas dapat menetapkan berdasarkan klasifikasi barang, nilai pabean, kurs, dokumen, dan ketentuan yang berlaku saat kedatangan.</p></details>
      </div></section>
      <p className={styles.disclaimer}>Perhitungan ini merupakan estimasi untuk membantu perencanaan biaya perjalanan. Hasil akhir dapat berbeda berdasarkan klasifikasi barang, penetapan nilai pabean, kurs, ketentuan yang berlaku, dan pemeriksaan pejabat Bea Cukai. Kalkulator ini bukan layanan resmi Direktorat Jenderal Bea dan Cukai.</p>
    </div>
  );
}
