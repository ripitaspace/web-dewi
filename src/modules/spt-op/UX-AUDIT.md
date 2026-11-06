# SPT OP Studio — Audit UX Field & Rencana Implementasi

Status: **audit saja, tidak ada kode diubah**. Tanggal 2026-11-06. Rute `/karya/tools/spt-op`.

Batas bukti: audit berdasarkan pembacaan kode (`fields.tsx`, `editor.tsx`, `coretax-sheets.tsx`, `coretax-map.ts`, `engine.ts`, `model.ts`, `prototype.json`, CSS). Halaman **belum dijalankan di browser** untuk audit ini, dan PDF resmi DJP **belum ada di repo** (README: "Belum dilampirkan: Formulir SPT OP 2025 PDF"). Maka makna radio/checkbox di bawah disimpulkan dari pasangan centang yang sudah dipetakan di `coretax-map.ts` (`ticks`, `answerTicks`); yang tidak bisa dipastikan ditandai **[VERIFIKASI PDF]**. Tidak ada pilihan/kode baru yang dikarang.

---

## 1. Arsitektur saat ini (penting untuk rencana)

| Hal | Fakta | Lokasi |
|---|---|---|
| Sumber data | Satu `Draft` (`profile, questions, extras, partner, declaration, documentNotes, tables, books, overrides`), semua nilai `string` | `model.ts:25` |
| Tampilan 1 (pratinjau/cetak) | `CoretaxPage` merender 17 sheet F4 dari draft; `print=true` menghilangkan interaksi | `coretax-sheets.tsx` |
| Tampilan 2 (isian) | Panel Inspector memakai `Fields` generik (semua field = `<input type=text>` atau `<select>`) | `fields.tsx`, `editor.tsx` |
| Interaksi di sheet | `Tick` hanya **berpindah section** saat diklik, tidak mengubah nilai; hanya `Digits` (tahun, bulan, NIK) berupa input langsung | `coretax-sheets.tsx:35-45, 25-31` |
| Tabel | Satu baris = satu dialog modal berisi form 2 kolom (`Fields`) | `editor.tsx:40-45` |
| Validasi | `errors()` per baris saat "Simpan baris" (pesan digabung `; `); `validate()` di tab Pemeriksaan | `engine.ts` |

Kesimpulan: **fondasi dua-lapisan dengan satu sumber data sudah ada** (draft → sheet). Yang kurang adalah *tipe kontrol*: seluruh isian lewat satu komponen generik yang hanya mengenal `select`, `yesno` (juga `select`), `date`, dan "semua lainnya = text".

---

## 2. Temuan UX (urut dampak × risiko salah input)

| # | Temuan | Bukti kode | Risiko |
|---|---|---|---|
| T1 | **Semua field uang (`money`) adalah `<input type=text>`** tanpa format ribuan, tanpa filter karakter, `inputMode="decimal"`. Parser `numeric()` menerima `1.500` sebagai 1500 tetapi `1.5` sebagai 1,5; `1,500` → 1500. Pengguna bisa mengetik "1.500" bermaksud 1,5 (mis. luas m², norma %). | `fields.tsx:7`, `engine.ts:3-9` | **Tinggi** (nilai pajak salah ×1000 tanpa peringatan) |
| T2 | **Ya/Tidak = dropdown 3 pilihan** ("Belum ditentukan/Ya/Tidak") untuk 22 pertanyaan Induk; butuh 2 klik + scroll, tidak terlihat sekaligus. Centang di sheet hanya menavigasi, tidak mengubah. | `fields.tsx` (`yesno`), `coretax-sheets.tsx:Tick` | Tinggi (kenyamanan) |
| T3 | **Centang di sheet tampak interaktif tetapi tidak toggle** (`title="Ubah di editor data"`); target ±4 mm (sangat kecil di zoom <100%). | `coretax-sheets.tsx:41-45`, css `.tick` | Sedang |
| T4 | **Identitas (NIK/NPWP/NPWP pasangan/NPWP pihak lain, ±14 field) = text bebas.** Tidak ada filter digit, panjang, atau mask; hanya `validate()` Induk yang cek 16 digit — field TIN di tabel (`debtorTin`, `payerTin`, `employerTin`, dst.) **tidak pernah divalidasi** (tipe `text`, hanya "wajib"). Overlay `Digits` di sheet juga tidak menyaring non-digit (hanya `maxLength`). | `model.ts` field, `engine.ts:errors`, `coretax-sheets.tsx:28` | **Tinggi** |
| T5 | **Kode resmi diketik manual** pada kolom `text`: `investments.code`, `otherassets.code`, `debts.code`, `finalincome.code`, `exempt.code`, `otherdomestic.code`, `deductions.code`, `taxrelief.code`, `entertainment/…` serta `fiscalCode` buku besar. Katalog `select` hanya ada untuk cash, receivables, movable, immovable. | `prototype.json` tables | Tinggi (kode salah → XML/rekap salah) |
| T6 | **Negara**: `cash.country` select 9 opsi (termasuk `OTHER`), tetapi `receivables/investments/debts/foreign.country` text bebas, `currency` text bebas. Tidak konsisten. | `prototype.json` | Sedang |
| T7 | **Kosong vs 0 vs Tidak tercampur**: `numeric('') = 0`. Field `extras` kosong tampil "0" di sheet (`R` memakai `money(numeric(raw))`) dan masuk perhitungan sebagai 0. Tabel bulanan UMKM (`m1..m12`) `required` sehingga **pengguna dipaksa mengetik "0"** — tidak ada pembeda "belum diisi" vs "sengaja 0". Opsi sektor `|Tidak ada` difilter (`filter(x=>x.split('|')[0])`) sehingga "Tidak ada" tidak bisa dipilih—tercampur dengan "Belum ditentukan". | `engine.ts:3`, `coretax-sheets.tsx:R`, `fields.tsx:7` | Tinggi |
| T8 | **Tahun/bulan sebagai text desimal**: `year` & `number` (bulan, `MonthOfAcquisition`, `fromMonth/toMonth`) tanpa `maxLength`, tanpa rentang, keyboard desimal (bukan numerik). Rentang bulan baru dicek di tab Pemeriksaan, bukan di field. | `fields.tsx`, `engine.ts:validate` | Sedang |
| T9 | **Radio tak dikelompokkan** — tidak ada radio/checkbox di form isian sama sekali; opsi eksklusif (Normal/Pembetulan, KTP/KITAS/PASPOR, PH/MT, Taxpayer/Other, 1/2 metode pembukuan) semuanya dropdown. Di sheet, kelompok tick eksklusif tidak dienforce karena tidak ada aksi. | `fields.tsx` | Sedang |
| T10 | **Field teks yang seharusnya pilihan**: `declaration.refund` (G) dan `declaration.capacity` (K) adalah teks bebas yang ditafsirkan **regex** (`/pemeriksaan/i`, `/pendahuluan/i`, `/wajib pajak/i`, `/kuasa\|wakil/i`) untuk menggambar centang. Salah ketik = centang tidak muncul tanpa peringatan. Juga `DeductionMethod`, `TypeOfFulfillment` (piutang tak tertagih) text bebas. | `coretax-map.ts:ticks[4]`, `model.ts:84` | **Tinggi** (beda form ↔ cetak) |
| T11 | **Pembeda form ↔ cetak**: 2 centang Induk hal.1 dan 11 centang hal.2 dipetakan `noTick` (tidak terhubung data); `profile.name`, `idNumber`, `phone`, `email`, `idType` ✓ tick tetapi **nama/telepon/email tidak punya slot cetak** (hanya TIN, tahun, bulan, PTKP, spouseTin); `maritalTax='Gabung'` tidak punya kotak. Sesuai README ("belum semuanya dipetakan"). | `coretax-map.ts:ticks/boxSlots` | Sedang (diketahui) |
| T12 | **Turunan centang rawan**: tick "hasNorm = tidak" bergantung ganda pada `bookMethod` (`Pencatatan` vs bukan) — satu jawaban memengaruhi dua kotak; pengguna tidak melihat hubungannya. | `coretax-map.ts:ticks[3]` | Sedang |
| T13 | **Error tidak dekat field**: pesan digabung satu baris `; ` di bawah dialog; tanpa `aria-invalid`/`aria-describedby`; hanya " *" untuk wajib. Kegagalan validasi baru muncul saat klik "Simpan baris". | `editor.tsx:43`, `fields.tsx` | Sedang |
| T14 | **Tabel sulit diisi**: satu baris butuh membuka modal dan mengisi 8–12 kolom dalam grid 2 kolom; 12 kolom bulan UMKM/OPPT/Norma = 12 input terpisah per TKU tanpa baris kalender, tanpa tab-ke-bulan-berikut, tanpa total langsung. Harta lampiran 1 (20–50 baris) tidak bisa diisi cepat. | `editor.tsx`, `Fields` | Sedang–Tinggi |
| T15 | **`ownerTin`/`ownerName` bertanda wajib** saat `ownership=Taxpayer` (milik sendiri) → memaksa pengguna mengisi data pemilik padahal tidak relevan. Perlu **kondisional** (hanya jika `Other`). | `prototype.json movable` | Sedang |
| T16 | `incomeSource` (Pekerjaan / Kegiatan Usaha / Pekerjaan Bebas) = single select, padahal pertanyaan 1a/1b terpisah (hasJobs, hasBusiness) bisa keduanya "Ya". **[VERIFIKASI PDF]** apakah di formulir bagian ini pilihan tunggal atau jamak. | `model/prototype` | Sedang |
| T17 | Tombol aksi kecil (padding 8 px, `.spt-record button` 11 px), `label` 11–12 px, `.tick` 3.4–4.6 mm: di bawah target sentuh 44 px. Focus-visible sudah ada (outline 3 px) — baik. | `studio.css` | Sedang |
| T18 | `confirm()` native untuk Hapus baris; tanpa undo. Tidak ada "Bersihkan nilai" per field. | `editor.tsx:40` | Rendah–Sedang |
| T19 | Paste: tidak ada penanganan paste khusus (angka dengan "Rp", spasi, titik/koma); mengandalkan `numeric()` yang ambigu (lihat T1). Impor CSV/XLSX sudah ada (kekuatan). | — | Sedang |

Kekuatan yang dipertahankan: IDs `htmlFor` ada; focus ring ada; `tin` disimpan string (nol depan aman); `<input type=date>` + validasi kalender; impor dengan duplikat; autosave IndexedDB; nilai manual sebagai override beralasan.

---

## 3. Inventaris & klasifikasi field

Keterangan kontrol: **RG** radio group, **CG** checkbox group, **SEG** segmented (Ya/Tidak), **TXT**, **NUM** numerik, **CUR** rupiah, **ID** identitas, **DATE**, **YM** tahun/bulan, **SEL** select, **SS** searchable select, **RO** read-only, **ROW** repeatable row.
"Kini" = komponen sekarang. Semua nilai tersimpan `string`.

### 3.1 Formulir Induk — Identitas (hal. 3, section `profile`, file `prototype.json` `profileFields`, `model.ts:82`)

| Field ID | Label | Wajib | Tipe data | Kini | Rekomendasi | Pilihan | Aturan validasi | Format | Masalah | Prioritas |
|---|---|---|---|---|---|---|---|---|---|---|
| year | Tahun pajak | Ya | tahun | text | **YM** (stepper/angka 4 digit) | — | `^\d{4}$`; 2025 = ruleset | `inputMode=numeric maxLength=4` | T8 | P1 |
| sptStatus | Status SPT | Ya | enum | select | **SEG/RG** Normal \| Pembetulan | tunggal: `Normal`,`Pembetulan` | wajib | — | T9 | P1 |
| amendment | Nomor pembetulan | Ya jika Pembetulan | int ≥1 | text | **NUM** muncul hanya bila Pembetulan | — | `^[1-9]\d*$`; di-reset ke 0 jika Normal | numeric | selalu tampil | P2 |
| fromMonth / toMonth | Periode mulai/akhir (bulan) | Ya | int 1–12 | text decimal | **YM** (select 1–12 atau stepper) | 1–12 | `from ≤ to` inline | numeric | T8 | P1 |
| tin | NIK/NPWP 16 digit | Ya | string digit | text | **ID** | — | `^\d{16}$` | 16 kotak, auto-strip non-digit | T4 | **P0** |
| name | Nama WP | Ya | teks | text | **TXT** | — | non-kosong, trim | — | tidak ada slot cetak (T11) | P2 |
| idType | Jenis identitas | — | enum | select | **RG** | tunggal: `KTP`,`KITAS`,`PASPOR` | — | — | T9 | P2 |
| idNumber | Nomor ID | — | string | text | **ID** (jenis mengikuti `idType`) | — | KTP: 16 digit; selain itu alfanumerik **[VERIFIKASI PDF]** | — | T4 | P2 |
| phone | Telepon | — | string | text | **TXT** `type=tel` | — | digit, +, spasi | — | tanpa tipe tel | P3 |
| email | Email | — | string | text | **TXT** `type=email` | — | format email | — | — | P3 |
| incomeSource | Sumber penghasilan | — | enum | select | **RG** atau **CG** **[VERIFIKASI PDF]** | `Pekerjaan`,`Kegiatan Usaha`,`Pekerjaan Bebas` | — | — | T16 | P1 |
| bookMethod | Metode pembukuan | — | enum | select | **RG** | `Pencatatan`,`Pembukuan Stelsel Kas`,`Pembukuan Stelsel Akrual` | — | — | memengaruhi tick hasNorm (T12) | P1 |
| ptkp | Status PTKP | — | enum | select | **SEL** (12 opsi, dikelompokkan TK/K/K-I) | 12 opsi existing | — | — | OK; label "perlu verifikasi" tetap | P3 |
| maritalTax | Status pajak suami–istri | — | enum | select | **RG** | `Gabung`,`PH`,`MT` | — | — | `Gabung` tak punya kotak cetak | P2 |
| spouseTin | NIK/NPWP pasangan | — | string | text | **ID** muncul bila K/I atau PH/MT | — | 16 digit bila diisi | 16 kotak | T4 | P1 |

### 3.2 Induk — Pertanyaan A–K (hal. 3–4, section `questions`, `questionFields`)

Semua `type=yesno`, saat ini `select` (Belum ditentukan/Ya/Tidak). **Rekomendasi seragam: SEG tri-state** (Ya | Tidak, dengan tombol "Hapus jawaban" → kosong). Nilai tersimpan tetap `'ya' | 'tidak' | ''` (kompatibel dengan `ticks` dan `questionFor`). Tidak memengaruhi rumus.

| Field ID | Label | Kini | Rekomendasi | Catatan |
|---|---|---|---|---|
| hasJobs, hasBusiness | 1a, 1b | select | SEG | memicu `sectionStatus` |
| hasUMKM, hasOPPT | 1b-2 | select | SEG, **ringkas jadi satu RG** "Tidak / UMKM / OPPT" **hanya jika PDF mengonfirmasi eksklusif** — tick kini `hasUMKM=tidak ∧ hasOPPT=tidak` menandakan 3 kotak saling eksklusif (sheet idx 17-19) | [VERIFIKASI PDF] |
| hasNorm | 1b-3 | select | SEG | tick ganda bergantung `bookMethod` (T12) |
| sector | 1b-4 | select | **RG** `dagangan`,`jasa`,`industri` + eksplisit "Tidak ada" (T7) | tick idx 22-24 eksklusif |
| hasOtherDomestic, hasForeign, hasDeductions, hasTaxRelief, hasWithholding, hasForeignRefund | 1c,1d,3,8,10a,10d | select | SEG | |
| hasDeferral, hasP25, hasCustomP25, hasOPPTP25, hasDebt, hasFinal, hasExempt, hasDepreciation, hasSpecialCosts, hasForeignDividend | 11b,13a-c,14b-g | select | SEG | hal. 4 |

### 3.3 Induk — Penyesuaian & hasil (section `extras`, `partner`, `declaration`, `overrides`)

| Field ID | Label | Kini | Rekomendasi | Masalah |
|---|---|---|---|---|
| businessNeto, p25Paid, p25STP, foreignRefund, deferral, previousBalance, compLoss, otherDeduction, otherTaxRelief, nextP25, phmtTax | 11 nilai rupiah | text | **CUR** (kosong ≠ 0) | T1, T7; sheet menampilkan "0" untuk kosong |
| partner.wpNet, spouseNet, wpDed, spouseDed, combinedPtkp | L4B | text | **CUR**; `combinedPtkp` tetap bertanda "perlu verifikasi" | T1 |
| overrides.business/deductions: `enabled` | checkbox | **CG tunggal / switch** (OK) | ✓ |
| overrides.*.value / reason | text / text | **CUR** + **TXT multiline**; alasan wajib saat enabled (sudah) | error sudah ada, jauhkan jadi inline |
| declaration.refund (G) | text bebas + regex | **RG** `Pemeriksaan` \| `Pendahuluan` (+ kosong) | T10; opsi persis dari tick `coretax-map.ts` idx 1–2 hal. 4 **[VERIFIKASI PDF]** teks resmi |
| declaration.additional (J) | text | **TXT** multiline atau **CG** lampiran **[VERIFIKASI PDF]** | |
| declaration.signer (K) | text | **TXT** | punya `boxSlots` |
| declaration.capacity (K) | text bebas + regex | **RG** `Wajib Pajak` \| `Kuasa/Wakil` | T10 |
| declaration.date (K) | date | **DATE** (OK); cetak pecah D/M/Y via `datePart` | tambahkan "Hari ini" |
| declaration.place, notes | text | **TXT** | |
| documentNotes.* | text | **TXT** multiline | |

### 3.4 Lampiran 1–5 (tabel, section = key tabel; semua **ROW**)

Setiap tabel: kontrol yang direkomendasikan per kolom. File: `prototype.json` (`tables.<key>.columns`), pengikatan cetak `coretax-map.ts:tableBindings`.

| Hal | Lampiran / key | Kolom (kini → rekomendasi) | Masalah utama |
|---|---|---|---|
| 5 | L1A Kas `cash` | code SEL(9) ✓ → **SEL**; account TXT; owner TXT; bank TXT; country SEL(9) → **SS** daftar negara; year YM; balance **CUR**; pps SEL→**RG** (`Tidak terkait`,`01`,`02`) | T1; negara hanya 9 + OTHER |
| 5 | L1A Piutang `receivables` | code SEL(3) ✓; description TXT; country text → **SS**; debtorTin text → **ID**; debtor TXT; principal/balance **CUR**; year YM; pps RG | T4, T6 |
| 5 | L1A Investasi `investments` | **code text → SS (kode resmi)**; country → SS; issuerTin → **ID**; issuer; account TXT; cost/current **CUR**; year YM; pps RG | T5 |
| 5 | L1A Harta bergerak `movable` | code SEL(13) ✓; type, model, registration TXT; ownership select → **RG** (`Taxpayer`,`Other`); ownerTin → **ID**, ownerName kondisional; year YM; cost/current **CUR** | T15 |
| 6 | L1A Tidak bergerak `immovable` | code SEL(8) ✓; description; address TXT multiline; landArea/buildingArea **NUM** (m², boleh desimal, tegaskan separator); source select(6) → **SEL**; certificate TXT; year; cost/current **CUR** | T1 (m² "1.500") |
| 6 | L1A Lainnya `otherassets` | **code text → SS**; description; year; proof; notes; cost/current **CUR** | T5 |
| 6 | L1B Utang `debts` | **code text → SS**; description; creditorTin → **ID**; creditor; country → SS; year YM; balance **CUR**; notes | T4, T5 |
| 7 | L1C Keluarga `family` | name; tin → **ID** (NIK); birth **DATE** ✓; relation select(5) → **SEL**; occupation | T4 |
| 7 | L1D Pekerjaan `jobs` | employer; employerTin → **ID**; gross, expense **CUR**; net **RO** ✓ (computed) | T4 |
| 7 | L1E Bupot `withholding` | payerTin → **ID**; payerName; slipNo TXT; slipDate **DATE**; taxType select(5) → **SEL**; gross, withheld **CUR** | T4 |
| 8 | L2A Final `finalincome` | payerTin → ID; payerName; **code text → SS**; type text → terisi otomatis dari kode (RO/SS); base, tax **CUR** | T5 |
| 8 | L2B Nonobjek `exempt` | **code text → SS**; type; sourceTin → ID; sourceName; gross **CUR** | T5 |
| 8 | L2C Luar negeri `foreign` | source; country text → **SS**; date **DATE**; type; net **CUR**; taxForex **NUM** (valas); taxIDR **CUR**; currency text → **SS** (ISO 4217); credit **CUR** | T6 |
| 9–11 | L3A rekonsiliasi `dagangan/jasa/industri` (buku besar) | per akun: commercial, nonobject, final, nonfinal, positive, negative **CUR**; fiscalCode text → **SS** (kode koreksi); fiscal **RO** ✓ | T5; ~30+ akun per sektor tampil sebagai tombol, bukan tabel |
| 12 | L3A-4A `nppn` | tku TXT; business TXT; gross **CUR**; norm **NUM %** (0–100, validasi sudah ada di tab); net **RO** ✓ | T1 |
| 12 | L3A-4B `otherdomestic` | **code text → SS**; type; net **CUR** | T5 |
| 13 | L3B-A `umkm` | tku; m1..m12 **CUR** (12 bulan, `required`) → **grid bulanan** + total RO | T7, T14 |
| 13 | L3B-B `opent` | tku; method select → **RG** `1 Pencatatan`/`2 Pembukuan`; m1..m12 CUR | T14 |
| 13 | L3B-C `normmonths` | tku; business; m1..m12 CUR | T14 |
| 14 | L3C Penyusutan `depreciation` | CodeOfAsset; GroupOfAsset SEL(7); MonthOfAcquisition **YM bulan 1–12**; YearOfAcquisition **YM**; AcquisitionPrice, RemainingValue **CUR**; CommercialMethode SEL(7); FiscalMethode SEL(3); FiscalDepretiationThisYear **CUR**; Notes | T8 |
| 14 | Amortisasi `amortization` | idem (GroupOfAsset 5 opsi) | |
| 15 | L3D-A `entertainment` | Date DATE; Location, Address, Type, Name, Position, CompanyName, BusinessType, Notes TXT; Amount CUR | |
| 15 | L3D-B `promotion` | TINCode → ID; NameOfRecipient; Address; DateOfPromotion DATE; TypeOfCost SEL(5, kode ber-kapital) ✓; AmountOfPromotionCost, AmountOfWithholdingTax **CUR**; WithholdingSlipNumber; Notes | README: adapter XML untuk kode promosi beda dari prototype |
| 15 | L3D-C `baddebt` | TINCode → ID; DebtorName; DebtorAddress; AmountOfDebt, AmountBadDebt **CUR**; **DeductionMethod, TypeOfFulfillment text → SEL** (pilihan resmi belum ada di repo) | T10 |
| 16 | L4 PH/MT | lihat 3.3 | |
| 17 | L5A `taxloss` | year YM; loss **CUR (boleh negatif)**; compensated **CUR** | |
| 17 | L5B `deductions` | **code text → SS**; type; amount **CUR** | T5 |
| 17 | L5C `taxrelief` | **code text → SS**; type; amount **CUR** | T5 |
| – | Status baris | `disposed` (checkbox "Harta telah dilepas") **CG tunggal ✓**; `review` checkbox ✓ | |

Hal. 1–2 (petunjuk) tidak punya field.

> Katalog `SS` untuk kode (investasi, harta lainnya, utang, final, nonobjek, penghasilan lain, pengurang, kode koreksi fiskal, negara, mata uang) **tidak ada di repo**. Daftar tidak boleh dikarang; sumbernya harus dari lampiran/PDF DJP atau Coretax. Sampai tersedia: pertahankan input teks tetapi tambahkan format hint + validasi pola, dan tandai "kode belum terverifikasi".

---

## 4. Daftar field bertipe/kontrol salah (ringkas)

1. Semua `money` (~150 kolom) → text; harus **CUR**.
2. Semua `yesno` (22) → dropdown; harus **SEG**.
3. `sptStatus, idType, maritalTax, bookMethod, incomeSource, ownership, method (opent), sector, pps` → dropdown; harus **RG**.
4. Semua `*Tin`, `tin`, `idNumber`, `spouseTin`, `TINCode`, `ownerTin` → text; harus **ID**.
5. `year`, `MonthOfAcquisition`, `fromMonth`, `toMonth` → text; harus **YM**.
6. `declaration.refund`, `declaration.capacity` → text + regex; harus **RG**.
7. Kolom `code`/`fiscalCode`/`country`/`currency` bertipe text → **SS**.
8. `DeductionMethod`, `TypeOfFulfillment` → text; kemungkinan **SEL** (menunggu daftar resmi).
9. `landArea`, `buildingArea`, `norm`, `taxForex` → "number" tanpa rumus separator tegas; harus **NUM** dengan aturan desimal eksplisit.
10. `ownerTin/ownerName` wajib tidak kondisional.

---

## 5. Rekomendasi desain interaksi

**Prinsip**: satu `Draft`, dua view. Pratinjau F4 tetap persis (struktur, urutan, kotak resmi); komponen isian baru hanya mengganti *cara memasukkan* nilai, bukan model data (string), sehingga `engine.ts` (rumus), `coretax-map.ts` (pengikatan cetak), backup v2, dan impor tetap kompatibel.

### Kontrak perilaku umum
- **Kosong ≠ 0 ≠ Tidak.** Simpan `''` (belum dijawab), `'0'` (angka nol disengaja), `'tidak'` (jawaban). CUR menampilkan placeholder `—`/"Belum diisi" untuk kosong, tidak otomatis `0`. Sheet `R` dan `Box` harus menampilkan kotak kosong untuk `''`, bukan "0". Untuk grid bulanan: tombol "Isi kosong dengan 0" eksplisit (bukan paksaan `required`).
- **Tidak ada auto-focus melompat.** Fokus hanya (a) membuka dialog baris → ke field pertama, (b) setelah klik tick di sheet → ke kontrol field terkait (sudah ada `focusId`), dan (c) setelah "Tambah baris". ID tidak auto-advance saat 16 digit lengkap (hanya indikator "16/16 ✓").
- **Select-all saat fokus** pada CUR/NUM (klik pertama memilih seluruh nilai; klik kedua menempatkan caret) — bukan pada TXT.
- **Paste**: CUR menormalkan `Rp 1.500.000,50`, spasi, NBSP; ID menyaring non-digit dan memotong ke panjang; bila hasil ambigu (satu pemisah dengan ≠3 digit di belakang) tampilkan konfirmasi inline, jangan tebak.
- **Error inline** di bawah field (`aria-invalid`, `aria-describedby`), validasi saat blur dan saat simpan; ringkasan error di atas dialog dengan tautan ke field.
- **Disabled vs read-only**: `computed` → RO (teks, bukan input), dengan keterangan sumber rumus; kontrol kondisional disembunyikan, bukan di-disable, kecuali bila perlu menjelaskan alasan.
- **Reset aman**: tombol "Bersihkan" per field (kembali ke `''`), undo 1 langkah (toast) untuk hapus baris, ganti `window.confirm`.
- **Mobile**: `inputMode="numeric"` untuk CUR/ID/YM, `type=tel` telepon, `type=email`, target ≥44 px, grid 1 kolom ≤560 px (sudah), SEG/RG vertikal di layar sempit.
- **Keyboard**: RG/SEG panah ←→, Space memilih, Tab keluar grup (WAI-ARIA `radiogroup`); tabel: Tab per sel, Enter simpan baris, Esc tutup; Tab order mengikuti urutan formulir DJP.
- **Aksesibilitas**: fieldset+legend untuk RG/CG/SEG; label tidak hanya warna; focus ring dipertahankan; tick di sheet menjadi `role="checkbox"/"radio"` dengan `aria-checked` dan nama dari label formulir.

### Perilaku sheet (lapisan cetak yang interaktif)
- Tick klik → **toggle langsung** untuk field pemetaannya (RG: pilih; SEG: set Ya/Tidak) — hanya untuk tick yang punya pemetaan satu-ke-satu. Tick turunan (`hasNorm` ganda, `noTick`) tetap membuka editor. Perbesar hit-area tick ke ≥24 px lewat pseudo-element tanpa mengubah gambar cetak.
- `Digits` NIK: terima paste 16 digit, hanya digit, `inputMode=numeric`.
- `print=true` tetap tanpa kontrol; tampilan sama dengan sekarang, hanya sumber nilainya lebih bersih (RG→ tanda ✓ pada kotak yang sesuai; ID→ 16 kotak).

---

## 6. Rencana komponen reusable

Prinsip: **jangan membuat banyak komponen baru**. Ganti `Fields` generik dengan dispatcher kecil memilih komponen dari `Field.type` (perluas union type secara kompatibel), dan satu set primitif.

| Komponen | Perlu baru? | Props kontrak (ringkas) | Catatan |
|---|---|---|---|
| `TaxField` (pengganti `Fields` per item) | Ubah existing | `{ field, value, onChange, error?, disabled?, prefix }` → memilih komponen menurut `field.type` | satu tempat untuk label/error/aria |
| `TaxChoiceGroup` | **Baru, gabungan** radio & checkbox & segmented | `{ legend, name, value: string | string[], options: {value,label,hint?}[], mode: 'radio'|'checkbox'|'segmented', clearable?, onChange }` | mencakup TaxRadioGroup/TaxCheckboxGroup/TaxYesNoField (yesno = preset `mode='segmented'`, options `ya/tidak`) |
| `TaxTextField` | Existing `<input>` dibungkus | `{ multiline?, type: 'text'|'tel'|'email', maxLength?, pattern? }` | |
| `TaxNumberField` | **Baru, satu** untuk NUM+CUR+YM | `{ kind: 'currency'|'number'|'year'|'month'|'percent', min?, max?, allowNegative?, decimals? }` | menyimpan string kanonik (`'1500000.5'`, titik desimal, tanpa pemisah ribuan); menampilkan format id-ID saat blur; kosong tetap `''`. Menggantikan `numeric()` ambigu **hanya di jalur input**; parser `numeric()` untuk data lama/impor tidak diubah |
| `TaxIdentityField` | **Baru** | `{ kind: 'nik'|'npwp'|'passport', length }` | digit-only, string, indikator n/16, tanpa auto-advance |
| `TaxDateField` | Existing `type=date` + tombol "Hari ini" | `{ min?, max? }` | |
| `TaxCodeSelect` | **Baru** (SS) | `{ options, allowFree?: boolean, search }` | pakai `<datalist>` / combobox ARIA; `allowFree` hanya selama katalog resmi belum lengkap |
| `TaxReadOnlyField` | Existing `computed` | `{ value, formula? }` | |
| `TaxRepeatableTable` | Ubah existing `Editor` | grid sel inline (Tab/Enter), "Tambah baris", baris total; dialog tetap sebagai mode detail | mulai dari tabel panjang: L1A, L1E, L3B |

Binding state: tetap `dispatch({type:'field'|'rows'})` — tidak ada perubahan reducer. Validasi dipindah ke satu modul `field-rules.ts` (per tipe: pola, rentang, kondisional `requiredWhen`) yang dipakai oleh `errors()` dan komponen (satu sumber aturan). Rumus pajak tidak disentuh.

Styling: pakai `.spt-root` token yang ada (`--navy`, outline fokus); tambahkan kelas `.spt-seg`, `.spt-radio`, `.spt-num`; jangan mengubah `coretax-sheets.css`.

---

## 7. Prioritas perbaikan

### Per dampak/risiko (urut)
1. **P0** — Identitas ID + CUR/NUM (T1, T4): risiko salah nilai/identitas tertinggi.
2. **P0** — Kosong ≠ 0 ≠ Tidak (T7).
3. **P1** — SEG untuk 22 pertanyaan Induk + RG kelompok eksklusif + toggle tick di sheet (T2, T3, T9).
4. **P1** — `declaration.refund/capacity` → RG (T10); `YM` tahun/bulan (T8).
5. **P1** — Error inline & aksesibilitas (T13, T17).
6. **P2** — Grid bulanan L3B & tabel inline L1 (T14); kondisional `ownerTin` (T15).
7. **P2** — Katalog kode (SS) (T5, T6) — tergantung ketersediaan daftar resmi.
8. **P3** — Paste/undo/mobile polish, telepon/email.

### Per halaman
| Halaman | Prioritas |
|---|---|
| Induk hal.3 (identitas, A–E) | ID, YM, RG, SEG, toggle tick |
| Induk hal.4 (F–K) | SEG, RG refund/capacity, DATE |
| L1 (5–7) | CUR, ID, SS kode, tabel inline, kondisional pemilik |
| L2 (8) | CUR, ID, SS kode final/nonobjek, SS negara/valas |
| L3A (9–12) | CUR dalam akun, SS fiscalCode, NUM norma % |
| L3B (13) | grid bulanan CUR + total |
| L3C (14) | YM bulan/tahun, CUR |
| L3D (15) | ID, DATE, SEL metode (menunggu daftar) |
| L4 (16), L5 (17) | CUR, SS kode, YM |

---

## 8. Contoh before → after

**A. Pertanyaan Ya/Tidak (hasJobs)**
- Before: `<select>` Belum ditentukan / Ya / Tidak; klik tick sheet hanya pindah panel.
- After: `[ Ya | Tidak ]` segmented, `aria-checked`, tombol kecil "Hapus jawaban"; klik kotak "Ya" di sheet langsung memilih; cetak: ✓ di kotak sesuai (logika `ticks` tidak berubah).

**B. Rupiah (jobs.gross)**
- Before: text `1500000` atau `1.500.000` atau `1.5`(!) → ambigu.
- After: ketik `1500000` → blur tampil `1.500.000`; paste `Rp 1.500.000,00` dinormalkan; `1.5` memicu pesan "Maksud Anda 1,5 atau 1.500? pilih"; kosong tampil `—`, bukan 0.

**C. NIK**
- Before: text bebas; `validate()` baru mengeluh di tab Pemeriksaan.
- After: 16 kotak (cetak sama), digit-only, "12/16" indikator, pasting `0123 4567 …` dibersihkan, nol depan aman (string).

**D. Pengembalian (G)**
- Before: teks bebas "pemeriksaan" memunculkan centang via regex.
- After: radio `Pemeriksaan | Pendahuluan` → centang pada kotak yang sama; salah ketik mustahil.

**E. UMKM bulanan**
- Before: dialog 2 kolom, 12 input `required`.
- After: grid 12 bulan (3×4), Tab berurutan, total langsung, tombol "Isi kosong dengan 0".

---

## 9. Rencana pengujian interaksi

Otomatis (Vitest, modul): parser input CUR/NUM (`1.500`, `1,500`, `Rp 1.500.000,50`, negatif, kosong vs `0`), ID filter/pad, YM batas, `requiredWhen`, kompatibilitas `numeric()` untuk data lama, backup v1/v2 round-trip, `ticks`/`answerTicks` tidak berubah untuk nilai yang sama.
Komponen (Testing Library): RG eksklusif, CG jamak, SEG tri-state (kosong→ya→tidak→kosong via Hapus), keyboard panah/Space/Tab, `aria-invalid`/`aria-describedby`, select-all saat fokus CUR, paste.
Browser (in-app, desktop 1440 & mobile 390): klik tick di sheet = nilai di panel = ✓ di Print preview; NIK 16 digit tampil di kotak; Save+reload; tab order mengikuti formulir; zoom 50–150 % target tick; cetak F4 identik sebelum/sesudah untuk draft DUMMY yang sama (snapshot bandingkan).
Regresi: semua 17 halaman terbuka; hasil `compute()` untuk draft dummy identik byte-per-byte sebelum/sesudah; impor CSV/XLSX tidak berubah.
Aksesibilitas: axe, navigasi hanya keyboard, pembaca layar membaca legend+opsi.

## 10. Urutan implementasi usulan

1. `field-rules.ts` + `TaxNumberField` + `TaxIdentityField` + uji (P0, tanpa perubahan UI luas).
2. `TaxChoiceGroup` + migrasi `yesno`/enum eksklusif di `fields.tsx` (P1).
3. Toggle tick di `coretax-sheets.tsx` (hanya tick pemetaan 1:1) + hit-area.
4. `declaration.refund/capacity` → RG (menjaga kompatibilitas draf lama: petakan teks lama ke opsi, fallback tetap menampilkan nilai lama).
5. Inline error + a11y.
6. Grid bulanan dan tabel inline.
7. `TaxCodeSelect` setelah daftar kode resmi tersedia.

## 11. Yang perlu keputusan/sumber dari Anda

- PDF Formulir SPT OP 2025 (untuk memastikan: `incomeSource` tunggal/jamak, UMKM/OPPT eksklusif, teks resmi G dan K, 13 centang `noTick`).
- Daftar kode resmi (investasi, harta lain, utang, final, nonobjek, penghasilan lain, pengurang, kode koreksi fiskal, negara, mata uang, metode pembebanan/pemenuhan piutang).
- Persetujuan mengganti `window.confirm` dengan undo-toast dan menambah toggle langsung di sheet (mengubah perilaku klik sekarang).

---

## 12. Tambahan: hover & penanda "bisa diklik / diisi / dicentang" di sheet

**Kondisi sekarang (dari CSS)**
- `.spt-coretax .tick, .sq { cursor: default }` — kotak centang tidak memberi isyarat apa pun saat disorot.
- `Digits` memakai `<input>` transparan (`opacity:0`) di atas kotak; hanya kursor teks yang muncul, tanpa outline, sehingga tidak terlihat bahwa kotak NIK/tahun bisa diisi.
- Sel tabel (`C`), kotak hasil (`R`) dan `Box` memang `onClick`, tetapi tidak punya gaya `:hover`/`:focus-visible`; hanya atribut `title`.
- Satu-satunya `:hover` di studio ada di tombol dan pohon navigasi.

**Usulan (hanya tampilan, tidak mengubah data/rumus/layout cetak)**

| Elemen | Hover (pointer) | Focus-visible (keyboard) | Kursor | Tooltip |
|---|---|---|---|---|
| Tick/radio (kotak centang) | outline biru 2 px + latar `#e9f1ff`, hit-area diperluas ≥24 px lewat pseudo-element | cincin fokus 3 px (seperti `.spt-root :focus-visible`) | `pointer` | "Klik untuk memilih: {label}" |
| Tick turunan (belum 1:1, buka editor) | outline putus-putus | sama | `pointer` | "Buka editor {section}" |
| Kotak digit (NIK, tahun, bulan) | seluruh baris diberi latar kuning muda `#fffbe1` + outline | outline pada baris | `text` | "Klik untuk mengisi NIK/NPWP" |
| Sel tabel & kotak isian (`C`, `Box`, `R`) | latar kuning muda + outline tipis | sama | `pointer` / `text` | "Klik untuk mengedit baris/tabel" |
| Sel read-only (hasil hitung) | tanpa highlight; kursor `default` | — | `default` | "Dihitung otomatis" |

Aturan:
1. Semua gaya hanya berlaku saat `print=false`: tambahkan kelas `.is-interactive` pada akar `CoretaxPage` dan batasi selector `.spt-coretax.is-interactive …`; `@media print` dan mode `print` tidak terpengaruh, jadi cetak/PDF tetap identik.
2. Elemen yang bisa diisi harus fokusable: `Tick` dan sel klik menjadi `role="checkbox|radio|button"` dengan `tabIndex=0`, Enter/Space memicu aksi.
3. Perangkat sentuh tidak punya hover: gunakan `@media (hover:hover)` untuk hover, dan sediakan tombol "Tampilkan kotak yang bisa diisi" (toggle) di toolbar yang menyorot semua kotak interaktif sekaligus; berguna juga di desktop.
4. Bedakan tiga isyarat warna dengan ikon/outline, bukan warna saja: *bisa dicentang* (kotak + pointer), *bisa diketik* (kursor teks + latar kuning), *otomatis* (abu-abu, tanpa hover).
5. Transisi 120 ms, hormati `prefers-reduced-motion`.

File yang terkena: `coretax-sheets.css` (gaya), `coretax-sheets.tsx` (kelas `is-interactive`, atribut `role/tabIndex/aria-checked`, `title`). Prioritas: **P1**, dikerjakan bersama toggle tick (langkah 3 di bagian 10), karena hover "bisa dicentang" baru jujur bila klik memang mengubah nilai.

Pengujian: hover tiap jenis elemen di desktop; keyboard Tab+Space pada tick; layar sentuh dengan toggle sorot; cetak/PDF sebelum vs sesudah harus identik (tidak ada outline/latar muncul).

---

## 13. Status implementasi (2026-11-06)

Sudah dikerjakan: hover/fokus sheet (§12); klik langsung 55 centang Induk + refund/capacity (`tickSets`); P0 angka/identitas (`field-rules.ts`, `number-input.ts`, `inputs.tsx`); P1 `TaxChoiceGroup` (radio/segmented) untuk 22 Ya/Tidak dan enum eksklusif (`sptStatus, idType, maritalTax, bookMethod, sector, ownership, method, pps, refund, capacity`).
Keputusan P1: `incomeSource` tetap select sampai PDF memastikan tunggal/jamak; `sector` tidak memiliki "Tidak ada" (kosong = belum dijawab); `pps` memakai "Tidak terkait" sebagai pilihan nyata (opsi berkunci kosong di katalog); nilai lama teks bebas pada G/K ditampilkan sebagai catatan "Nilai lama …" dan tidak dihapus.
Belum: grid bulanan & tabel inline (P2), kondisional `ownerTin`, katalog kode (menunggu daftar resmi), toolbar "sorot kotak interaktif" untuk sentuh.

**P2 (sebagian) selesai:** grid kalender 12 bulan untuk L3B-A/B/C (Tab Januari→Desember, total setahun, tombol "Isi N bulan kosong dengan 0"); `ownerTin`/`ownerName` hanya tampil dan wajib bila `ownership = Other` (aturan `dependsOn` di `field-rules.ts`, dipakai `errors()`, impor, dan `cellParts`).
Belum dari P2: edit tabel inline (L1A dkk.) — ditunda karena mengubah pola interaksi tabel dan perlu keputusan sendiri.
