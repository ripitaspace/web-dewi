"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./quotation-generator.module.css";

type LineItem = {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  price: number;
};

type Party = {
  name: string;
  address: string;
  contact: string;
};

type TemplateId = "standard" | "logistics";

type LogisticsDetails = {
  service: string;
  commodity: string;
  origin: string;
  destination: string;
  equipment: string;
  pickupPlan: string;
  conditions: string;
  senderSignatory: string;
  senderRole: string;
  clientSignatory: string;
};

const DOCUMENT_TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "standard", name: "Quotation Standar", description: "Penawaran produk dan layanan umum." },
  { id: "logistics", name: "Quotation Logistik", description: "Format pengiriman dengan rute dan ketentuan." },
];

type Quotation = {
  number: string;
  date: string;
  validUntil: string;
  seller: Party;
  client: Party;
  items: LineItem[];
  discountRate: number;
  taxRate: number;
  note: string;
  paymentTerms: string;
  logo: string;
  logistics: LogisticsDetails;
};

const freshQuotation = (): Quotation => ({
  number: "QTN-001",
  date: "",
  validUntil: "",
  seller: { name: "Nama Usaha Anda", address: "Alamat usaha, kota", contact: "email@usahaanda.com · 08xx xxxx xxxx" },
  client: { name: "Nama Klien", address: "Alamat klien", contact: "PIC / nomor kontak" },
  items: [{ id: 1, description: "Nama produk atau layanan", quantity: 1, unit: "paket", price: 0 }],
  discountRate: 0,
  taxRate: 11,
  note: "Terima kasih atas kepercayaan Anda. Kami siap membantu apabila ada penyesuaian ruang lingkup pekerjaan.",
  paymentTerms: "Pembayaran dilakukan sesuai kesepakatan sebelum pekerjaan atau pengiriman dimulai.",
  logo: "",
  logistics: {
    service: "Door to CY On Truck",
    commodity: "Jenis barang / komoditas",
    origin: "Lokasi asal pengiriman",
    destination: "Lokasi tujuan pengiriman",
    equipment: "Jenis kendaraan atau kontainer",
    pickupPlan: "Rencana tanggal penjemputan",
    conditions: "Harga berlaku sesuai masa berlaku quotation dan ketersediaan jadwal kapal/vendor.\nHarga di luar biaya asuransi barang, storage, demurrage, dan biaya tambahan di luar ruang lingkup.\nPerubahan lokasi, kondisi lapangan, atau jadwal dapat menyebabkan penyesuaian harga.\nPenawaran ini dapat dikonversi menjadi SPK setelah disetujui customer.",
    senderSignatory: "Nama penanggung jawab",
    senderRole: "Marketing",
    clientSignatory: "Nama & cap perusahaan",
  },
});

const toNumber = (value: string) => Math.max(0, Number(value) || 0);
const formatMoney = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const toInputDate = (date: Date) => date.toISOString().slice(0, 10);
const formatDate = (value: string) => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—";

function downloadJson(quotation: Quotation) {
  const href = URL.createObjectURL(new Blob([JSON.stringify(quotation, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = `${quotation.number.trim() || "quotation"}.json`;
  link.click();
  URL.revokeObjectURL(href);
}

export function QuotationGeneratorClient() {
  const [quotation, setQuotation] = useState<Quotation>(freshQuotation);
  const [template, setTemplate] = useState<TemplateId>("standard");
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [notice, setNotice] = useState("Isi data penawaran di panel kiri. Perubahan langsung terlihat pada dokumen.");
  const logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setQuotation((current) => {
        if (current.date) return current;
        const today = new Date();
        const validUntil = new Date(today);
        validUntil.setDate(today.getDate() + 14);
        return { ...current, date: toInputDate(today), validUntil: toInputDate(validUntil) };
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const afterPrint = () => document.body.classList.remove("quotation-printing");
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("afterprint", afterPrint);
      document.body.classList.remove("quotation-printing");
    };
  }, []);

  const totals = useMemo(() => {
    const subtotal = quotation.items.reduce((total, item) => total + item.quantity * item.price, 0);
    const discount = subtotal * quotation.discountRate / 100;
    const taxable = subtotal - discount;
    const tax = taxable * quotation.taxRate / 100;
    return { subtotal, discount, tax, total: taxable + tax };
  }, [quotation.discountRate, quotation.items, quotation.taxRate]);

  const update = <K extends keyof Quotation>(key: K, value: Quotation[K]) => setQuotation((current) => ({ ...current, [key]: value }));
  const updateParty = (party: "seller" | "client", key: keyof Party, value: string) => setQuotation((current) => ({ ...current, [party]: { ...current[party], [key]: value } }));
  const updateLogistics = (key: keyof LogisticsDetails, value: string) => setQuotation((current) => ({ ...current, logistics: { ...current.logistics, [key]: value } }));
  const updateItem = (id: number, key: keyof Omit<LineItem, "id">, value: string) => setQuotation((current) => ({
    ...current,
    items: current.items.map((item) => item.id === id ? { ...item, [key]: key === "quantity" || key === "price" ? toNumber(value) : value } : item),
  }));
  const addItem = () => setQuotation((current) => ({ ...current, items: [...current.items, { id: Date.now(), description: "Produk atau layanan baru", quantity: 1, unit: "unit", price: 0 }] }));
  const removeItem = (id: number) => setQuotation((current) => current.items.length === 1 ? current : { ...current, items: current.items.filter((item) => item.id !== id) });
  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logo", String(reader.result || ""));
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handlePrint = () => {
    document.body.classList.add("quotation-printing");
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  const selectTemplate = (nextTemplate: TemplateId) => {
    setTemplate(nextTemplate);
    setTemplatesOpen(false);
    setNotice(`${DOCUMENT_TEMPLATES.find((item) => item.id === nextTemplate)?.name} dipilih. Isi dokumen tetap aman dan preview diperbarui.`);
  };

  return <div className={styles.studio}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.kicker}>RIPITA · BUSINESS ESSENTIALS</span>
        <h2>Quotation Generator</h2>
        <p>Susun penawaran harga profesional, lalu cetak atau simpan sebagai PDF langsung dari browser.</p>
      </div>
      <div className={styles.actions}>
        <TemplatePicker template={template} isOpen={templatesOpen} onToggle={() => setTemplatesOpen((open) => !open)} onSelect={selectTemplate} />
        <button className={styles.iconButton} type="button" aria-label="Unduh data quotation" data-tooltip="Unduh data" onClick={() => downloadJson(quotation)}><DownloadIcon /></button>
        <button className={`${styles.iconButton} ${styles.primary}`} type="button" aria-label="Print atau simpan PDF" data-tooltip="Print / PDF" onClick={handlePrint}><PrintIcon /></button>
      </div>
    </header>

    <div className={styles.layout}>
      <section className={styles.editor} aria-label="Editor quotation">
        <section className={styles.card}>
          <div className={styles.cardHeading}><span>01</span><div><h3>Identitas quotation</h3><p>Nomor dan masa berlaku penawaran.</p></div></div>
          <div className={styles.fieldGrid}>
            <Field label="Nomor quotation"><input value={quotation.number} onChange={(event) => update("number", event.target.value)} /></Field>
            <Field label="Tanggal"><input type="date" value={quotation.date} onChange={(event) => update("date", event.target.value)} /></Field>
            <Field label="Berlaku sampai"><input type="date" value={quotation.validUntil} onChange={(event) => update("validUntil", event.target.value)} /></Field>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}><span>02</span><div><h3>Pihak yang terlibat</h3><p>Identitas usaha dan penerima quotation.</p></div></div>
          <div className={styles.partyGrid}>
            <PartyFields title="Dari" party={quotation.seller} onChange={(key, value) => updateParty("seller", key, value)} />
            <PartyFields title="Kepada" party={quotation.client} onChange={(key, value) => updateParty("client", key, value)} />
          </div>
          <div className={styles.logoRow}>
            <div className={styles.logoPreview}>{quotation.logo ? <img src={quotation.logo} alt="Logo usaha" /> : <span>LOGO<br />USAHA</span>}</div>
            <div><button className={styles.button} type="button" onClick={() => logoInput.current?.click()}>Unggah logo</button><button className={styles.textButton} type="button" onClick={() => update("logo", "")}>Hapus</button><p>Logo bersifat opsional dan hanya dipakai pada quotation ini.</p></div>
            <input ref={logoInput} className={styles.visuallyHidden} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} />
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}><span>03</span><div><h3>Rincian penawaran</h3><p>Tambahkan produk atau layanan beserta harganya.</p></div></div>
          <div className={styles.itemEditor}>
            <div className={styles.itemEditorHeader}><span>Deskripsi</span><span>Qty</span><span>Satuan</span><span>Harga satuan</span><span aria-hidden="true" /></div>
            {quotation.items.map((item) => <div className={styles.itemRow} key={item.id}>
              <input aria-label="Deskripsi item" value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} />
              <input aria-label="Kuantitas" type="number" min="0" step="0.01" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} />
              <input aria-label="Satuan" value={item.unit} onChange={(event) => updateItem(item.id, "unit", event.target.value)} />
              <input aria-label="Harga satuan" type="number" min="0" step="1000" value={item.price} onChange={(event) => updateItem(item.id, "price", event.target.value)} />
              <button className={styles.removeItem} type="button" aria-label={`Hapus ${item.description}`} onClick={() => removeItem(item.id)} disabled={quotation.items.length === 1}>×</button>
            </div>)}
          </div>
          <button className={styles.addItem} type="button" onClick={addItem}>+ Tambah item</button>
        </section>

        {template === "logistics" && <section className={styles.card}>
          <div className={styles.cardHeading}><span>04</span><div><h3>Detail pengiriman</h3><p>Informasi ini hanya muncul pada template quotation logistik.</p></div></div>
          <div className={styles.logisticsGrid}>
            <Field label="Service"><input value={quotation.logistics.service} onChange={(event) => updateLogistics("service", event.target.value)} /></Field>
            <Field label="Komoditas"><input value={quotation.logistics.commodity} onChange={(event) => updateLogistics("commodity", event.target.value)} /></Field>
            <Field label="Asal pengiriman"><textarea value={quotation.logistics.origin} onChange={(event) => updateLogistics("origin", event.target.value)} /></Field>
            <Field label="Tujuan pengiriman"><textarea value={quotation.logistics.destination} onChange={(event) => updateLogistics("destination", event.target.value)} /></Field>
            <Field label="Equipment"><input value={quotation.logistics.equipment} onChange={(event) => updateLogistics("equipment", event.target.value)} /></Field>
            <Field label="Pickup plan"><input value={quotation.logistics.pickupPlan} onChange={(event) => updateLogistics("pickupPlan", event.target.value)} /></Field>
          </div>
          <div className={styles.logisticsTextareas}>
            <Field label="Kondisi penawaran (satu kondisi per baris)"><textarea value={quotation.logistics.conditions} onChange={(event) => updateLogistics("conditions", event.target.value)} /></Field>
            <div className={styles.signatoryGrid}><Field label="Penanda tangan usaha"><input value={quotation.logistics.senderSignatory} onChange={(event) => updateLogistics("senderSignatory", event.target.value)} /></Field><Field label="Jabatan"><input value={quotation.logistics.senderRole} onChange={(event) => updateLogistics("senderRole", event.target.value)} /></Field><Field label="Konfirmasi customer"><input value={quotation.logistics.clientSignatory} onChange={(event) => updateLogistics("clientSignatory", event.target.value)} /></Field></div>
          </div>
        </section>}

        <section className={styles.card}>
          <div className={styles.cardHeading}><span>{template === "logistics" ? "05" : "04"}</span><div><h3>Nilai & ketentuan</h3><p>Atur potongan, pajak, dan pesan penutup.</p></div></div>
          <div className={styles.fieldGrid}>
            <Field label="Diskon (%)"><input type="number" min="0" max="100" value={quotation.discountRate} onChange={(event) => update("discountRate", Math.min(100, toNumber(event.target.value)))} /></Field>
            <Field label="Pajak / PPN (%)"><input type="number" min="0" max="100" value={quotation.taxRate} onChange={(event) => update("taxRate", Math.min(100, toNumber(event.target.value)))} /></Field>
          </div>
          <div className={styles.textareaGrid}>
            <Field label="Ketentuan pembayaran"><textarea value={quotation.paymentTerms} onChange={(event) => update("paymentTerms", event.target.value)} /></Field>
            <Field label="Catatan untuk klien"><textarea value={quotation.note} onChange={(event) => update("note", event.target.value)} /></Field>
          </div>
          <p className={styles.notice}>{notice}</p>
        </section>
      </section>

      <aside className={styles.previewColumn} aria-label="Preview quotation">
        <div className={styles.previewTop}><div><span>LIVE PREVIEW</span><strong>Siap dibagikan</strong></div></div>
        {template === "logistics" ? <LogisticsPreview quotation={quotation} totals={totals} /> : <article className={styles.paper}>
          <header className={styles.documentHeader}>
            <div className={styles.sellerIdentity}>{quotation.logo ? <img src={quotation.logo} alt={`Logo ${quotation.seller.name}`} /> : <div className={styles.documentMark}>Q</div>}<div><strong>{quotation.seller.name}</strong><p>{quotation.seller.address}</p><p>{quotation.seller.contact}</p></div></div>
            <div className={styles.documentTitle}><span>QUOTATION</span><b>{quotation.number || "—"}</b><p>Tanggal {formatDate(quotation.date)}</p></div>
          </header>
          <section className={styles.documentParties}><div><span>Kepada</span><strong>{quotation.client.name}</strong><p>{quotation.client.address}</p><p>{quotation.client.contact}</p></div><div><span>Berlaku sampai</span><strong>{formatDate(quotation.validUntil)}</strong></div></section>
          <p className={styles.intro}>Berikut kami sampaikan penawaran harga untuk kebutuhan Anda:</p>
          <table className={styles.documentTable}><thead><tr><th>No.</th><th>Deskripsi</th><th>Qty</th><th>Harga satuan</th><th>Jumlah</th></tr></thead><tbody>{quotation.items.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><strong>{item.description || "Produk atau layanan"}</strong><small>{item.quantity} {item.unit || "unit"}</small></td><td>{item.quantity} {item.unit}</td><td>{formatMoney(item.price)}</td><td>{formatMoney(item.quantity * item.price)}</td></tr>)}</tbody></table>
          <section className={styles.totals}><div><span>Subtotal</span><b>{formatMoney(totals.subtotal)}</b></div>{quotation.discountRate > 0 && <div><span>Diskon ({quotation.discountRate}%)</span><b>− {formatMoney(totals.discount)}</b></div>}{quotation.taxRate > 0 && <div><span>Pajak / PPN ({quotation.taxRate}%)</span><b>{formatMoney(totals.tax)}</b></div>}<div className={styles.totalLine}><strong>TOTAL PENAWARAN</strong><strong>{formatMoney(totals.total)}</strong></div></section>
          <section className={styles.documentNotes}><div><span>Ketentuan pembayaran</span><p>{quotation.paymentTerms}</p></div><div><span>Catatan</span><p>{quotation.note}</p></div></section>
          <footer className={styles.documentFooter}><p>Hormat kami,</p><div className={styles.signatureLine} /><strong>{quotation.seller.name}</strong><small>Dokumen ini dibuat secara digital.</small></footer>
        </article>}
      </aside>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className={styles.field}><span>{label}</span>{children}</label>;
}

function PartyFields({ title, party, onChange }: { title: string; party: Party; onChange: (key: keyof Party, value: string) => void }) {
  return <div className={styles.partyFields}><h4>{title}</h4><Field label="Nama"><input value={party.name} onChange={(event) => onChange("name", event.target.value)} /></Field><Field label="Alamat"><textarea value={party.address} onChange={(event) => onChange("address", event.target.value)} /></Field><Field label="Kontak"><input value={party.contact} onChange={(event) => onChange("contact", event.target.value)} /></Field></div>;
}

function TemplatePicker({ template, isOpen, onToggle, onSelect }: { template: TemplateId; isOpen: boolean; onToggle: () => void; onSelect: (template: TemplateId) => void }) {
  const selected = DOCUMENT_TEMPLATES.find((item) => item.id === template);
  return <div className={styles.templateControl}><button className={styles.button} type="button" aria-expanded={isOpen} aria-haspopup="listbox" onClick={onToggle}>Template Dokumen <span aria-hidden="true">⌄</span></button>{isOpen && <div className={styles.templateMenu} role="listbox" aria-label="Pilih template dokumen">{DOCUMENT_TEMPLATES.map((item) => <button key={item.id} type="button" role="option" aria-selected={template === item.id} className={template === item.id ? styles.templateSelected : ""} onClick={() => onSelect(item.id)}><strong>{item.name}</strong><span>{item.description}</span>{template === item.id && <b>Dipilih</b>}</button>)}<p>Template aktif: <strong>{selected?.name}</strong></p></div>}</div>;
}

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
}

function PrintIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></svg>;
}

function LogisticsPreview({ quotation, totals }: { quotation: Quotation; totals: { subtotal: number; discount: number; tax: number; total: number } }) {
  const firstItem = quotation.items[0];
  const conditions = quotation.logistics.conditions.split("\n").map((condition) => condition.trim()).filter(Boolean);
  const shipmentRows: [string, string][] = [["Service", quotation.logistics.service], ["Commodity", quotation.logistics.commodity], ["Origin", quotation.logistics.origin], ["Destination", quotation.logistics.destination], ["Equipment", quotation.logistics.equipment], ["Pickup Plan", quotation.logistics.pickupPlan]];
  return <article className={`${styles.paper} ${styles.logisticsPaper}`}>
    <header className={styles.logisticsHeader}><div className={styles.logisticsBrand}>{quotation.logo ? <img src={quotation.logo} alt={`Logo ${quotation.seller.name}`} /> : <span className={styles.logisticsMark}>L</span>}<div><strong>{quotation.seller.name}</strong><p>{quotation.seller.address}</p><p>{quotation.seller.contact}</p></div></div><div className={styles.recipientBox}><b>KEPADA</b><strong>{quotation.client.name}</strong><p>{quotation.client.contact}</p><p>{quotation.client.address}</p></div></header>
    <section className={styles.logisticsTitle}><h2>PENAWARAN HARGA</h2><p>No. {quotation.number || "—"} · Tanggal {formatDate(quotation.date)} · Berlaku s.d. {formatDate(quotation.validUntil)}</p></section>
    <p className={styles.logisticsIntro}>Dengan hormat, berikut kami sampaikan penawaran harga jasa sesuai kebutuhan pengiriman customer:</p>
    <table className={styles.logisticsTable}><thead><tr><th>No</th><th>Keterangan Pengiriman</th><th>Harga</th></tr></thead><tbody><tr><td>1</td><td><table className={styles.shipmentDetails}><tbody>{shipmentRows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value || "—"}</td></tr>)}</tbody></table></td><td><strong>{formatMoney(totals.total)}</strong><small>{firstItem?.quantity || 1} {firstItem?.unit || "unit"} · {firstItem?.description || "Jasa pengiriman"}</small>{quotation.taxRate > 0 && <small>Termasuk pajak / PPN {quotation.taxRate}%</small>}</td></tr></tbody></table>
    <section className={styles.logisticsConditions}><strong>Kondisi Penawaran:</strong><ol>{conditions.map((condition, index) => <li key={`${condition}-${index}`}>{condition}</li>)}</ol></section>
    <section className={styles.confirmationBox}><strong>Konfirmasi Customer</strong><p>Dengan menandatangani dokumen ini, customer menyetujui harga dan ruang lingkup sebagai dasar pembuatan SPK.</p><div><section><span>{quotation.seller.name}</span><strong>{quotation.logistics.senderSignatory}</strong><small>{quotation.logistics.senderRole}</small></section><section><span>CUSTOMER</span><strong>{quotation.client.name}</strong><small>{quotation.logistics.clientSignatory}</small></section></div></section>
    <footer className={styles.logisticsFooter}><span>Dokumen dibuat secara digital · {quotation.number || "Quotation"}</span><span>{formatDate(quotation.date)}</span></footer>
  </article>;
}
