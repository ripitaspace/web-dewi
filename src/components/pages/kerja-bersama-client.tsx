"use client";

import { useState } from "react";
import { SERVICES, formatIdDate } from "@/lib/site-data";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";

const DATES = [
  { iso: "2026-08-10", day: "Sen", date: "10" },
  { iso: "2026-08-11", day: "Sel", date: "11" },
  { iso: "2026-08-12", day: "Rab", date: "12" },
  { iso: "2026-08-13", day: "Kam", date: "13" },
  { iso: "2026-08-14", day: "Jum", date: "14", disabled: true },
  { iso: "2026-08-17", day: "Sen", date: "17" },
  { iso: "2026-08-18", day: "Sel", date: "18" },
  { iso: "2026-08-19", day: "Rab", date: "19" },
  { iso: "2026-08-20", day: "Kam", date: "20" },
  { iso: "2026-08-21", day: "Jum", date: "21" },
];

const TIMES = ["09:00", "10:30", "13:00", "15:00", "16:30"];

export function KerjaBersamaClient() {
  const [selectedService, setSelectedService] = useState<string>(SERVICES[0].id);
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-11");
  const [selectedTime, setSelectedTime] = useState<string>("10:30");

  // Booking Form fields & validation
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingOrg, setBookingOrg] = useState("");
  const [bookingRole, setBookingRole] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  // General Inquiry Form
  const [collabName, setCollabName] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [collabPurpose, setCollabPurpose] = useState("");
  const [collabMessage, setCollabMessage] = useState("");
  const [collabErrors, setCollabErrors] = useState<Record<string, string>>({});
  const [isCollabSuccess, setIsCollabSuccess] = useState(false);

  const currentServiceObj = SERVICES.find((s) => s.id === selectedService);

  const validateBooking = () => {
    const errors: Record<string, string> = {};
    if (!bookingName.trim()) errors.name = "Nama wajib diisi.";
    if (!bookingEmail.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail)) {
      errors.email = "Format email tidak valid.";
    }
    if (!bookingMessage.trim()) errors.message = "Ceritakan singkat hal yang ingin dibahas.";
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking()) return;

    setIsBookingSuccess(true);
  };

  const handleCollabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!collabName.trim()) errors.name = "Nama wajib diisi.";
    if (!collabEmail.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collabEmail)) {
      errors.email = "Format email tidak valid.";
    }
    if (!collabPurpose) errors.purpose = "Pilih tujuan komunikasi.";
    if (!collabMessage.trim()) errors.message = "Konteks singkat wajib diisi.";

    setCollabErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsCollabSuccess(true);
    }
  };

  return (
    <>
      <SiteHeader currentKey="kerja-bersama" />

      <main id="main-content" style={{ paddingTop: "var(--nav-height)" }}>
        {/* Page Hero */}
        <section className="page-hero">
          <div className="container page-hero-grid">
            <div>
              <span className="eyebrow text-sirih">Kerja Bersama</span>
              <h1 className="display-lg">Kita bisa memulai dari satu percakapan yang memiliki konteks.</h1>
              <p className="lead muted">
                Pilih jenis kebutuhan, waktu yang sesuai, lalu ceritakan persoalan yang ingin dibahas.
              </p>
            </div>
            <div className="art-placeholder art-lg" style={{ marginInline: "auto" }}>
              <strong>?</strong>
              <span>Collaboration artwork · 1000 × 1000 px</span>
            </div>
          </div>
        </section>

        {/* Booking Shell */}
        <section className="section-tight" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="container booking-shell">
            {/* Step 1: Select Service */}
            <div>
              <span className="eyebrow text-sirih">01 · Pilih Percakapan</span>
              <div className="service-options" style={{ marginTop: "16px" }}>
                {SERVICES.map((service) => {
                  const isSelected = selectedService === service.id;
                  return (
                    <label
                      key={service.id}
                      className={`service-option ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={isSelected}
                        onChange={() => setSelectedService(service.id)}
                      />
                      <span>
                        <strong style={{ fontSize: "1.05rem" }}>{service.name}</strong>
                        <small className="muted" style={{ display: "block", marginTop: "4px" }}>
                          {service.description}
                        </small>
                      </span>
                      <span style={{ textAlign: "right" }}>
                        <strong style={{ display: "block" }}>{service.duration}</strong>
                        <small className="muted" style={{ display: "block" }}>
                          {service.price}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & 3: Calendar & Form */}
            <div className="card booking-panel">
              {!isBookingSuccess ? (
                <div>
                  <div className="calendar-head">
                    <div>
                      <span className="eyebrow text-selat">02 · Pilih Jadwal</span>
                      <h3 style={{ margin: "4px 0 0" }}>Agustus 2026</h3>
                    </div>
                    <span className="badge">Prototype Calendar</span>
                  </div>

                  {/* Date Grid */}
                  <div className="date-grid">
                    {DATES.map((item) => (
                      <button
                        key={item.iso}
                        className={`date-btn ${selectedDate === item.iso ? "selected" : ""}`}
                        disabled={item.disabled}
                        onClick={() => setSelectedDate(item.iso)}
                        type="button"
                      >
                        <small>{item.day}</small>
                        {item.date}
                      </button>
                    ))}
                  </div>

                  {/* Time Grid */}
                  <div className="time-grid">
                    {TIMES.map((time) => (
                      <button
                        key={time}
                        className={`time-btn ${selectedTime === time ? "selected" : ""}`}
                        onClick={() => setSelectedTime(time)}
                        type="button"
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleBookingSubmit} noValidate style={{ marginTop: "24px" }}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="bookingName">Nama Lengkap *</label>
                        <input
                          id="bookingName"
                          name="name"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                        />
                        <span className="field-error">{bookingErrors.name}</span>
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingEmail">Email *</label>
                        <input
                          id="bookingEmail"
                          name="email"
                          type="email"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                        />
                        <span className="field-error">{bookingErrors.email}</span>
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingOrg">Organisasi / Bisnis</label>
                        <input
                          id="bookingOrg"
                          name="organization"
                          value={bookingOrg}
                          onChange={(e) => setBookingOrg(e.target.value)}
                        />
                        <span className="field-error"></span>
                      </div>
                      <div className="form-field">
                        <label htmlFor="bookingRole">Peran</label>
                        <input
                          id="bookingRole"
                          name="role"
                          value={bookingRole}
                          onChange={(e) => setBookingRole(e.target.value)}
                        />
                        <span className="field-error"></span>
                      </div>
                      <div className="form-field full">
                        <label htmlFor="bookingMessage">Apa yang ingin dibahas? *</label>
                        <textarea
                          id="bookingMessage"
                          name="message"
                          value={bookingMessage}
                          onChange={(e) => setBookingMessage(e.target.value)}
                          placeholder="Jelaskan konteks singkat masalah atau tujuan percakapan..."
                        ></textarea>
                        <span className="field-error">{bookingErrors.message}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(36, 91, 135, 0.08)",
                        borderRadius: "10px",
                        margin: "14px 0 20px",
                      }}
                    >
                      <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                        <strong>Pilihanmu:</strong> {currentServiceObj?.name} ·{" "}
                        {formatIdDate(selectedDate)} · {selectedTime} WIB
                      </p>
                    </div>

                    <button className="btn btn-primary" type="submit">
                      Ajukan Booking Sekarang →
                    </button>
                  </form>
                </div>
              ) : (
                <div className="success-box" style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>✅</div>
                  <h3 style={{ color: "var(--sirih)", marginBottom: "8px" }}>Permintaan Booking Diterima!</h3>
                  <p className="lead" style={{ fontSize: "1.05rem" }}>
                    Terima kasih, <strong>{bookingName}</strong>. Pengajuan sesi <strong>{currentServiceObj?.name}</strong> pada tanggal <strong>{formatIdDate(selectedDate)} ({selectedTime} WIB)</strong> telah dicatat.
                  </p>
                  <p className="muted" style={{ fontSize: "0.9rem", marginTop: "14px" }}>
                    Konfirmasi dan tautan meeting akan dikirimkan ke <em>{bookingEmail}</em>.
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsBookingSuccess(false);
                      setBookingName("");
                      setBookingEmail("");
                      setBookingOrg("");
                      setBookingRole("");
                      setBookingMessage("");
                    }}
                    type="button"
                    style={{ marginTop: "24px" }}
                  >
                    Ajukan Jadwal Lain
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* General Inquiry Section */}
        <section className="section" style={{ background: "rgba(184, 204, 145, 0.22)" }}>
          <div className="narrow">
            <span className="eyebrow text-sirih">Kolaborasi Lain</span>
            <h2 className="display-md">Belum membutuhkan jadwal? Kirim konteks awal.</h2>

            {!isCollabSuccess ? (
              <form
                className="card card-pad"
                onSubmit={handleCollabSubmit}
                noValidate
                style={{ marginTop: "28px" }}
              >
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="collabName">Nama *</label>
                    <input
                      id="collabName"
                      name="name"
                      value={collabName}
                      onChange={(e) => setCollabName(e.target.value)}
                    />
                    <span className="field-error">{collabErrors.name}</span>
                  </div>
                  <div className="form-field">
                    <label htmlFor="collabEmail">Email *</label>
                    <input
                      id="collabEmail"
                      name="email"
                      type="email"
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                    />
                    <span className="field-error">{collabErrors.email}</span>
                  </div>
                  <div className="form-field full">
                    <label htmlFor="collabPurpose">Tujuan Kolaborasi *</label>
                    <select
                      id="collabPurpose"
                      name="purpose"
                      className="field-control"
                      value={collabPurpose}
                      onChange={(e) => setCollabPurpose(e.target.value)}
                    >
                      <option value="">-- Pilih tujuan --</option>
                      <option value="Collaboration">Collaboration</option>
                      <option value="Speaking">Speaking & Workshop</option>
                      <option value="Education">Education & Training</option>
                      <option value="Product Development">Product & Technology</option>
                      <option value="Research & Discussion">Research & Discussion</option>
                      <option value="Professional Opportunity">Professional Opportunity</option>
                    </select>
                    <span className="field-error">{collabErrors.purpose}</span>
                  </div>
                  <div className="form-field full">
                    <label htmlFor="collabMessage">Konteks Singkat *</label>
                    <textarea
                      id="collabMessage"
                      name="message"
                      value={collabMessage}
                      onChange={(e) => setCollabMessage(e.target.value)}
                      placeholder="Jelaskan kebutuhan, ruang kolaborasi, atau latar belakang..."
                    ></textarea>
                    <span className="field-error">{collabErrors.message}</span>
                  </div>
                </div>
                <button className="btn btn-dark" type="submit" style={{ marginTop: "16px" }}>
                  Kirim Konteks Sekarang →
                </button>
              </form>
            ) : (
              <div className="card card-pad success-box" style={{ marginTop: "28px", textAlign: "center" }}>
                <h3 style={{ color: "var(--sirih)" }}>Pesan Terkirim!</h3>
                <p className="lead" style={{ fontSize: "1rem" }}>
                  Terima kasih atas konteks yang Anda kirimkan. Tim akan mempelajari dan membalas melalui email Anda secepatnya.
                </p>
                <button
                  className="btn btn-dark btn-small"
                  onClick={() => setIsCollabSuccess(false)}
                  type="button"
                  style={{ marginTop: "16px" }}
                >
                  Kirim Pesan Baru
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
