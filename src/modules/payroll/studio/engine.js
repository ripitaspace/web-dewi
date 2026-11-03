// Calculation and XML adapters ported from the supplied RIPITAX v2 HTML.
import { RULES, COMPONENTS, DOCUMENT_TYPES, TAX_CODE, XML_META, PTKP } from "./catalog.js";
const n = x => { const v = Number(x); return Number.isFinite(v) ? v : 0; };
const rupi = x => 'Rp' + Math.round(n(x)).toLocaleString('id-ID');
const pct = x => (n(x) * 100).toLocaleString('id-ID', { maximumFractionDigits: 4 }) + '%';
const cleanXml = x => String(x ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
const escXml = x => cleanXml(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export function createEngine(state) {
    function person(id) { return state.recipients.find(p => p.id === id); }
    function linesFor(id, month) { return state.entries.filter(e => e.recipientId === id && Number(e.month) === Number(month)); }
    function allLines(id) { return state.entries.filter(e => e.recipientId === id); }
    function inScope(r, month) { return month >= Number(r.startMonth) && month <= Number(r.endMonth); }
    function isPayroll(r) { return r?.kind === 'fixed' || r?.kind === 'pension'; }
    function category(r) { return RULES.category[r.ptkp] || 'A'; }
    function ter(r, gross) { const cat = category(r), t = RULES.ter[cat], i = t.upper.findIndex(x => gross <= x); return { category: cat, rate: t.rate[i], lower: i === 0 ? 0 : t.upper[i - 1] + 1, upper: t.upper[i] }; }
    function art17(amount) { const taxable = Math.max(0, n(amount)); let prev = 0, tax = 0; const segments = []; for (const tier of RULES.article17) {
        const piece = Math.max(0, Math.min(taxable, tier.cap) - prev);
        if (piece > 0) {
            const v = piece * tier.rate;
            segments.push({ base: piece, rate: tier.rate, tax: v });
            tax += v;
        }
        prev = tier.cap;
        if (taxable <= tier.cap)
            break;
    } return { tax: Math.round(tax), segments }; }
    function periodParts(r, month) { const arr = linesFor(r.id, month), out = { gross: 0, cash: 0, cashDeduct: 0, pension: 0, zakat: 0, parts: {}, entries: arr }; for (const e of arr) {
        const c = COMPONENTS[e.comp];
        if (!c)
            continue;
        const amount = n(e.amount);
        out.parts[e.comp] = (out.parts[e.comp] || 0) + amount;
        if (c.tax)
            out.gross += amount;
        if (c.cash === 1)
            out.cash += amount;
        if (c.cash === -1)
            out.cashDeduct += amount;
        if (e.comp === 'pensionContribution')
            out.pension += amount;
        if (e.comp === 'zakat')
            out.zakat += amount;
    } return out; }
    function taxMethod(r) { return ['gross', 'gross_up', 'employer_borne'].includes(r.taxMethod) ? r.taxMethod : r.grossUp === 'Yes' ? 'gross_up' : 'gross'; }
    function withGrossUpAllowance(parts, allowance) {
        const manual = n(parts.parts.taxAllowance), gross = parts.gross - manual, cash = parts.cash - manual;
        return { ...parts, gross: gross + allowance, cash: cash + allowance, parts: { ...parts.parts, taxAllowance: allowance } };
    }
    function grossUpCandidates(r, baseGross) {
        const table = RULES.ter[category(r)], candidates = [];
        for (let i = 0; i < table.rate.length; i++) {
            const rate = table.rate[i], upper = table.upper[i];
            candidates.push(Math.round(baseGross * rate / (1 - rate)));
            if (Number.isFinite(upper))
                candidates.push(Math.max(0, Math.round(upper - baseGross)));
        }
        return candidates;
    }
    function solveGrossUp(taxForAllowance, seed = 0, candidates = []) {
        let allowance = Math.max(0, Math.round(seed)), iterations = [], cycle = false;
        for (let i = 0; i < 100; i++) {
            const tax = Math.max(0, Math.round(taxForAllowance(allowance))), residual = Math.abs(tax - allowance);
            iterations.push(allowance);
            if (residual <= 1) {
                const alternate = Math.max(0, Math.round(taxForAllowance(tax))), alternateResidual = Math.abs(alternate - tax);
                return alternateResidual < residual ? { allowance: tax, residual: alternateResidual, converged: true } : { allowance, residual, converged: true };
            }
            if (iterations.includes(tax)) { cycle = true; break; }
            allowance = tax;
        }
        const nearby = [...new Set([...iterations, allowance, ...candidates])].flatMap(value => [-2, -1, 0, 1, 2].map(delta => Math.max(0, Math.round(value + delta))));
        const best = nearby.map(value => ({ allowance: value, residual: Math.abs(Math.max(0, Math.round(taxForAllowance(value))) - value) })).sort((a, b) => a.residual - b.residual || a.allowance - b.allowance)[0];
        return { allowance: best?.allowance || 0, residual: best?.residual ?? Infinity, converged: !!best && best.residual <= 1, cycle };
    }
    function monthlyGrossUpParts(r, month) {
        const raw = periodParts(r, month);
        if (taxMethod(r) !== 'gross_up')
            return { parts: raw, solution: null };
        const manual = n(raw.parts.taxAllowance), baseGross = raw.gross - manual;
        const solution = solveGrossUp(allowance => {
            const gross = baseGross + allowance;
            return gross * ter(r, gross).rate;
        }, manual, grossUpCandidates(r, baseGross));
        return { parts: withGrossUpAllowance(raw, solution.allowance), solution };
    }
    function annualCalculation(r, month, currentAllowance = 0) {
        let gross = 0, pension = 0, zakat = 0, cashSum = 0;
        const prior = [], components = {};
        for (let m = Number(r.startMonth); m <= Number(r.endMonth); m++) {
            let x = periodParts(r, m);
            if (taxMethod(r) === 'gross_up')
                x = m < month ? monthlyGrossUpParts(r, m).parts : m === month ? withGrossUpAllowance(x, currentAllowance) : x;
            gross += x.gross;
            pension += x.pension;
            zakat += x.zakat;
            cashSum += x.cash;
            for (const [key, value] of Object.entries(x.parts))
                components[key] = n(components[key]) + n(value);
            if (m < month) {
                const t = ter(r, x.gross);
                prior.push({ month: m, gross: x.gross, tax: Math.round(x.gross * t.rate) });
            }
        }
        const costCap = r.kind === 'pension' ? 200000 : 500000;
        const cost = Math.min(Math.round(gross * .05), costCap * (Number(r.endMonth) - Number(r.startMonth) + 1));
        const net = Math.max(0, gross - cost - pension - zakat), ptkp = RULES.ptkp[r.ptkp] || 0, pkp = Math.floor(Math.max(0, net - ptkp) / 1000) * 1000, calc = art17(pkp), withheld = prior.reduce((a, b) => a + b.tax, 0);
        return { gross, cost, pension, zakat, net, ptkp, pkp, annualTax: calc.tax, prior: withheld, tax: calc.tax - withheld, segments: calc.segments, cashSum, components };
    }
    function payrollResult(r, month) {
        const raw = periodParts(r, month), last = Number(r.endMonth) === Number(month), active = inScope(r, month), methodOpt = taxMethod(r);
        if (!active)
            return null;
        let p = raw, terInfo = ter(r, raw.gross), tax = 0, method = '', explain = [], annual = null, issues = [];
        if (!last) {
            if (methodOpt === 'gross_up') {
                const adjusted = monthlyGrossUpParts(r, month);
                p = adjusted.parts;
                if (!adjusted.solution?.converged)
                    issues.push('Gross-up tidak konvergen hingga toleransi Rp1; perlu review manual.');
            }
            terInfo = ter(r, p.gross);
            tax = Math.round(p.gross * terInfo.rate);
            method = 'TER ' + terInfo.category + ' · ' + pct(terInfo.rate);
            explain = [`Bruto pajak: ${rupi(p.gross)}`, `PTKP ${r.ptkp} → kategori TER ${terInfo.category}`, `Lapisan bruto: ${rupi(terInfo.lower)} s.d. ${Number.isFinite(terInfo.upper) ? rupi(terInfo.upper) : 'tak terbatas'}`, `PPh 21 = ${rupi(p.gross)} × ${pct(terInfo.rate)} = ${rupi(tax)}`];
            if (methodOpt === 'gross_up')
                explain.unshift(`Gross-up otomatis: tunjangan PPh ${rupi(p.parts.taxAllowance)}.`);
        }
        else {
            let calculated = annualCalculation(r, month);
            if (methodOpt === 'gross_up' && calculated.tax > 0) {
                const adjusted = solveGrossUp(allowance => Math.max(0, annualCalculation(r, month, allowance).tax), n(raw.parts.taxAllowance));
                p = withGrossUpAllowance(raw, adjusted.allowance);
                calculated = annualCalculation(r, month, adjusted.allowance);
                if (!adjusted.converged)
                    issues.push('Gross-up masa terakhir tidak konvergen hingga toleransi Rp1; perlu review manual.');
            }
            else if (methodOpt === 'gross_up')
                p = withGrossUpAllowance(raw, 0);
            tax = calculated.tax;
            method = 'Pasal 17 · masa terakhir';
            annual = calculated;
            explain = [`Bruto selama masa kerja: ${rupi(calculated.gross)}`, `Biaya ${r.kind === 'pension' ? 'pensiun' : 'jabatan'}: min(5% × bruto, batas per bulan × masa kerja) = ${rupi(calculated.cost)}`, `Iuran pensiun/JHT pengurang: ${rupi(calculated.pension)}`, `Zakat wajib melalui perusahaan: ${rupi(calculated.zakat)}`, `Neto: ${rupi(calculated.net)}`, `PTKP ${r.ptkp}: ${rupi(calculated.ptkp)}`, `PKP setelah pembulatan ribuan: ${rupi(calculated.pkp)}`, ...calculated.segments.map(s => `${rupi(s.base)} × ${pct(s.rate)} = ${rupi(s.tax)}`), `PPh setahun/periode: ${rupi(calculated.annualTax)}`, `Potongan sebelumnya: ${rupi(calculated.prior)}`, `PPh masa terakhir: ${rupi(tax)}`];
            if (methodOpt === 'gross_up')
                explain.unshift(`Gross-up otomatis masa terakhir: tunjangan PPh ${rupi(p.parts.taxAllowance)}.`);
            if (tax < 0)
                explain.push('Pemotongan negatif: perlu pengembalian/penyesuaian kelebihan potong sesuai ketentuan.');
            if (!r.annualComplete)
                issues.push('Riwayat penghasilan satu masa kerja belum dikonfirmasi lengkap.');
            if (r.whStatus === 'Annualized' || r.subject !== 'existing')
                issues.push('Kondisi disetahunkan/perubahan kewajiban subjektif memerlukan review khusus.');
            if (r.workForSecondEmployer === 'Yes')
                issues.push('Penggabungan penghasilan pemberi kerja sebelumnya perlu review bukti potong.');
        }
        const employerBorne = methodOpt === 'employer_borne';
        return { recipientId: r.id, month, kind: r.kind, docType: last ? (r.sector === 'government' ? 'BPA2' : 'BPA1') : 'BPMP', gross: p.gross, cash: p.cash, deductions: p.cashDeduct, tax, netCash: p.cash - p.cashDeduct - (employerBorne ? 0 : tax), employerBorneTax: employerBorne ? tax : 0, rate: last ? null : terInfo.rate, method, parts: p.parts, entries: p.entries, annual, trace: explain, issues };
    }
    function nonPayrollResults(r, month) {
        const results = [];
        for (const e of linesFor(r.id, month)) {
            const c = COMPONENTS[e.comp];
            if (!c || !c.tax || n(e.amount) <= 0)
                continue;
            const gross = n(e.amount), days = Math.max(1, Math.floor(n(e.days) || 1));
            let tax = 0, rate = 0, deemed = 100, method = '', trace = [], issues = [];
            if (r.residency === 'SPLN') {
                rate = .20;
                tax = Math.round(gross * rate);
                method = 'PPh 26 · umum 20%';
                trace = [`Bruto ${rupi(gross)} × 20% = ${rupi(tax)}`];
                if (r.facility !== 'N/A')
                    issues.push('PPh 26 dengan SKD/fasilitas/tarif khusus memerlukan verifikasi manual.');
            }
            else if (r.kind === 'casual_month' || r.kind === 'commissioner') {
                const t = ter(r, gross);
                rate = t.rate;
                tax = Math.round(gross * rate);
                method = 'TER ' + t.category + ' · ' + pct(rate);
                trace = [`Bruto: ${rupi(gross)}`, `PTKP ${r.ptkp} → TER ${t.category}`, `Tarif: ${pct(rate)}`, `PPh: ${rupi(tax)}`];
            }
            else if (r.kind === 'casual_daily') {
                const daily = gross / days;
                if (daily <= 450000) {
                    rate = 0;
                    method = 'TER harian · 0%';
                    tax = 0;
                }
                else if (daily <= 2500000) {
                    rate = .005;
                    method = 'TER harian · 0,5%';
                    tax = Math.round(gross * rate);
                }
                else {
                    deemed = 50;
                    const x = art17(daily * .5);
                    tax = x.tax * days;
                    rate = x.segments.length === 1 ? x.segments[0].rate : 0;
                    method = 'Pasal 17 × 50% (harian)';
                    if (x.segments.length !== 1)
                        issues.push('Tarif Pasal 17 progresif harian tidak dapat dipetakan sebagai satu Rate XML secara aman.');
                }
                trace = [`Penghasilan total: ${rupi(gross)} untuk ${days} hari`, `Asumsi nilai per hari sama: ${rupi(daily)}`, `PPh: ${rupi(tax)}`];
                if (days > 1 && !e.equalDaily)
                    issues.push('Konfirmasi pembagian upah yang sama per hari pada Detail transaksi.');
            }
            else {
                const exclusion = n(e.excludedLabor) + n(e.excludedMaterial);
                const taxableGross = Math.max(0, gross - exclusion);
                deemed = r.kind === 'nonemployee' ? 50 : 100;
                const taxable = taxableGross * deemed / 100;
                const x = art17(taxable);
                tax = x.tax;
                rate = x.segments.length === 1 ? x.segments[0].rate : 0;
                method = `Pasal 17 × DPP ${deemed}%`;
                trace = [`Bruto: ${rupi(gross)}`, `Pengecualian biaya pihak lain/material: ${rupi(exclusion)}`, `DPP: ${rupi(taxableGross)} × ${deemed}% = ${rupi(taxable)}`, ...x.segments.map(s => `${rupi(s.base)} × ${pct(s.rate)} = ${rupi(s.tax)}`), `PPh 21: ${rupi(tax)}`];
                if (x.segments.length > 1)
                    issues.push('Tarif progresif lebih dari satu lapisan: satu angka Rate XML perlu dipastikan dengan referensi DJP.');
                if (exclusion > 0) {
                    issues.push('Pengecualian material/tenaga pihak lain membutuhkan pemetaan DPP khusus yang belum tervalidasi pada XML.');
                    if (!e.proof)
                        issues.push('Dokumen pendukung pengurang bruto belum dikonfirmasi.');
                }
            }
            if (r.kind === 'former')
                issues.push('Kode objek penghasilan mantan pegawai belum dipetakan otomatis; perlu review.');
            if (r.facility !== 'N/A' && r.residency !== 'SPLN')
                issues.push('Fasilitas pajak selain N/A memerlukan review terhadap ketentuan dan tarif khusus.');
            if (e.comp !== 'fee' && !(r.kind === 'casual_month' || r.kind === 'casual_daily' || r.kind === 'commissioner'))
                issues.push('Jenis komponen bukan honorarium/jasa: periksa klasifikasi manual.');
            const employerBorne = taxMethod(r) === 'employer_borne';
            results.push({ recipientId: r.id, entryId: e.id, month, kind: r.kind, docType: r.residency === 'SPLN' ? 'BP26' : 'BP21', gross, cash: gross, deductions: 0, netCash: gross - (employerBorne ? 0 : tax), employerBorneTax: employerBorne ? tax : 0, tax, rate, deemed, method, trace, issues, entry: e, parts: { [e.comp]: gross } });
        }
        return results;
    }
    function resultFor(r, month) { if (isPayroll(r) && r.residency === 'SPDN')
        return payrollResult(r, month); return nonPayrollResults(r, month); }
    function monthResults(r, month) { const v = resultFor(r, month); return !v ? [] : Array.isArray(v) ? v : [v]; }
    function documentKind(r, month) { if (r.residency === 'SPLN')
        return 'BP26'; if (isPayroll(r))
        return month === Number(r.endMonth) ? (r.sector === 'government' ? 'BPA2' : 'BPA1') : 'BPMP'; return 'BP21'; }
    function objectCode(r, result) { if (r.residency === 'SPLN')
        return r.taxObject || '27-100-99'; if (r.taxObject)
        return r.taxObject; if (r.kind === 'casual_daily')
        return result?.deemed === 50 ? '21-100-30' : '21-100-24'; return TAX_CODE[r.kind] || ''; }
    function taxMonthSummary(r, month) { const rs = monthResults(r, month); return { rows: rs, gross: rs.reduce((a, x) => a + x.gross, 0), cash: rs.reduce((a, x) => a + x.cash, 0), deductions: rs.reduce((a, x) => a + x.deductions, 0), tax: rs.reduce((a, x) => a + x.tax, 0), netCash: rs.reduce((a, x) => a + x.netCash, 0), employerBorneTax: rs.reduce((a, x) => a + n(x.employerBorneTax), 0), issues: rs.flatMap(x => x.issues), docType: documentKind(r, month) }; }
    function validCalendarDate(v) { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || ''))
        return false; const d = new Date(v + 'T00:00:00Z'); return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v; }
    function personError(r, type) { const errors = []; if (!r.name.trim())
        errors.push('Nama penerima belum diisi.'); if (r.residency === 'SPDN' && !/^\d{16}$/.test(r.tin))
        errors.push('NIK/NPWP penerima harus 16 digit.'); if (r.residency === 'SPLN' && !r.foreignTin.trim())
        errors.push('TIN penerima luar negeri belum diisi.'); if (r.residency === 'SPDN' && !PTKP.includes(r.ptkp))
        errors.push('Status PTKP tidak dikenali.'); if (!inScope(r, Number(state.company.month)) && isPayroll(r))
        errors.push('Masa pajak di luar periode kerja penerima.'); if (Number(r.startMonth) > Number(r.endMonth))
        errors.push('Masa awal bekerja melebihi masa akhir.'); if (['BPMP', 'BPA1', 'BPA2'].includes(type) && !r.position.trim())
        errors.push('Jabatan/posisi belum diisi.'); if (type === 'BPA2' && !r.nip.trim())
        errors.push('NIP/NRP wajib diisi untuk A2.'); if (type === 'BPA2' && !r.rank.trim())
        errors.push('Pangkat/golongan belum diisi untuk A2.'); if (type === 'BP21' && !/^\d{22}$/.test(r.tku))
        errors.push('ID TKU penerima (22 digit) belum valid.'); if (type === 'BP26' && (!/^[A-Z]{3}$/.test(r.country)))
        errors.push('Kode negara ISO tiga huruf wajib diisi.'); if (type === 'BP26' && !r.address.trim())
        errors.push('Alamat luar negeri wajib diisi.'); if (type === 'BP26' && !validCalendarDate(r.dob))
        errors.push('Tanggal lahir luar negeri belum valid.'); if (type === 'BP26' && !r.birthCity.trim())
        errors.push('Tempat lahir luar negeri belum diisi.'); if (!objectCode(r))
        errors.push('Kode objek pajak belum tersedia.'); if (r.residency === 'SPLN' && r.taxObject && r.taxObject !== '27-100-99')
        errors.push('Kode objek PPh 26 khusus perlu review tarif dan dasar pengenaan.'); if (isPayroll(r) && r.taxObject && r.taxObject !== TAX_CODE[r.kind])
        errors.push('Kode objek pegawai/pensiun khusus belum didukung otomatis.'); return errors; }
    function companyErrors() { const e = []; if (Number(state.company.year) > 2026)
        e.push('Tahun pajak setelah 2026 memerlukan verifikasi aturan dan skema terbaru.'); if (!/^\d{16}$/.test(state.company.tin))
        e.push('NPWP pemotong harus 16 digit.'); if (!/^\d{22}$/.test(state.company.tku))
        e.push('ID TKU pemotong harus 22 digit.'); if (!validCalendarDate(state.company.withholdingDate))
        e.push('Tanggal pemotongan perusahaan tidak valid.'); if (Number(state.company.withholdingDate.slice(0, 4)) !== Number(state.company.year) || Number(state.company.withholdingDate.slice(5, 7)) < Number(state.company.month))
        e.push('Tanggal pemotongan perusahaan tidak sesuai masa/tahun (tidak boleh lebih awal).'); return e; }
    function documentErrors(doc) {
        const r = person(doc.recipientId), result = doc.result, e = doc.entry, errors = [...companyErrors(), ...personError(r, doc.type), ...result.issues];
        if (!r)
            return ['Penerima tidak ditemukan.'];
        if (n(result.gross) <= 0 && doc.type !== 'BPA1' && doc.type !== 'BPA2')
            errors.push('Penghasilan bruto harus lebih dari nol.');
        if (r.facility !== 'N/A')
            errors.push('Fasilitas pajak khusus memerlukan review sebelum ekspor.');
        if (['BP21', 'BP26'].includes(doc.type)) {
            if (!DOCUMENT_TYPES[e.documentType])
                errors.push('Jenis dokumen referensi tidak dikenali.');
            if (!e.documentNo.trim())
                errors.push('Nomor dokumen referensi belum diisi.');
            if (!validCalendarDate(e.documentDate))
                errors.push('Tanggal dokumen referensi belum valid.');
            const wd = e.withholdingDate || state.company.withholdingDate;
            if (!validCalendarDate(wd) || wd.slice(0, 7) < String(state.company.year) + '-' + String(state.company.month).padStart(2, '0'))
                errors.push('Tanggal pemotongan transaksi lebih awal dari masa pajak.');
        }
        if (['BPA1', 'BPA2'].includes(doc.type)) {
            if (r.whStatus === 'FullYear' && (Number(r.startMonth) !== 1 || Number(r.endMonth) !== 12))
                errors.push('FullYear mengharuskan Januari sampai Desember.');
            if (doc.type === 'BPA2') {
                for (const [comp, amount] of Object.entries(doc.result.annual?.components || {})) {
                    if (amount > 0 && COMPONENTS[comp]?.tax && !COMPONENTS[comp]?.a2)
                        errors.push('Komponen ' + COMPONENTS[comp].label + ' tidak memiliki padanan A2, perlu koreksi.');
                }
            }
            if (doc.type === 'BPA1') {
                for (const [comp, amount] of Object.entries(doc.result.annual?.components || {})) {
                    if (amount > 0 && COMPONENTS[comp]?.tax && !COMPONENTS[comp]?.a1)
                        errors.push('Komponen ' + COMPONENTS[comp].label + ' tidak memiliki padanan A1.');
                }
            }
        }
        if (doc.type === 'BPMP' && r.residency !== 'SPDN')
            errors.push('BPMP untuk penerima luar negeri perlu review status penerima.');
        return [...new Set(errors)];
    }
    /* ====== Five XML adapters. All tag names and order mirror the supplied XML examples. ====== */
    const nil = { nil: true };
    function sumComp(r) { const totals = {}; for (const e of allLines(r.id)) {
        if (!inScope(r, Number(e.month)))
            continue;
        totals[e.comp] = (totals[e.comp] || 0) + n(e.amount);
    } return totals; }
    function fieldSetFor(type, r, res) {
        const year = Number(state.company.year), month = Number(state.company.month), company = state.company, e = res.entry || null;
        const baseWithholding = (e && e.withholdingDate) || company.withholdingDate;
        const fi = (obj, key) => n(obj[key] || 0);
        if (type === 'BPMP')
            return [
                ['TaxPeriodMonth', month], ['TaxPeriodYear', year], ['CounterpartOpt', r.citizenship], ['CounterpartPassport', r.passport || nil], ['CounterpartTin', r.tin], ['StatusTaxExemption', r.ptkp], ['Position', r.position], ['TaxCertificate', r.facility], ['TaxObjectCode', objectCode(r, res)], ['Gross', Math.round(res.gross)], ['Rate', percentNumber(res.rate)], ['IDPlaceOfBusinessActivity', company.tku], ['WithholdingDate', company.withholdingDate]
            ];
        if (type === 'BP21')
            return [
                ['TaxPeriodMonth', month], ['TaxPeriodYear', year], ['CounterpartTin', r.tin], ['IDPlaceOfBusinessActivityOfIncomeRecipient', r.tku], ['StatusTaxExemption', r.ptkp], ['TaxCertificate', r.facility], ['TaxObjectCode', objectCode(r, res)], ['Gross', Math.round(res.gross)], ['Deemed', res.deemed], ['Rate', percentNumber(res.rate)], ['Document', e.documentType], ['DocumentNumber', e.documentNo], ['DocumentDate', e.documentDate], ['IDPlaceOfBusinessActivity', company.tku], ['WithholdingDate', baseWithholding]
            ];
        if (type === 'BP26')
            return [
                ['TaxPeriodMonth', month], ['TaxPeriodYear', year], ['CounterpartTin', r.foreignTin], ['CounterpartReceiptNumber', r.receiptNo || '-'], ['CounterpartName', r.name], ['CounterpartCountry', r.country], ['CounterpartAddress', r.address], ['CounterpartDob', r.dob], ['CounterpartBirthCity', r.birthCity], ['CounterpartPassport', r.passport || nil], ['CounterpartKitas', r.kitas || nil], ['TaxCertificate', r.facility], ['TaxObjectCode', objectCode(r, res)], ['Gross', Math.round(res.gross)], ['Deemed', res.deemed], ['Rate', percentNumber(res.rate)], ['Document', e.documentType], ['DocumentNumber', e.documentNo], ['DocumentDate', e.documentDate], ['IDPlaceOfBusinessActivity', company.tku], ['WithholdingDate', baseWithholding]
            ];
        const comp = res.annual?.components || sumComp(r), status = r.whStatus === 'auto' ? (Number(r.startMonth) === 1 && Number(r.endMonth) === 12 ? 'FullYear' : 'PartialYear') : r.whStatus, months = status === 'Annualized' ? (Number(r.endMonth) - Number(r.startMonth) + 1) : 0;
        if (type === 'BPA1')
            return [
                ['WorkForSecondEmployer', r.workForSecondEmployer], ['TaxPeriodMonthStart', r.startMonth], ['TaxPeriodMonthEnd', r.endMonth], ['TaxPeriodYear', year], ['CounterpartOpt', r.citizenship], ['CounterpartPassport', r.passport || nil], ['CounterpartTin', r.tin], ['TaxExemptOpt', r.ptkp], ['StatusOfWithholding', status], ['CounterpartPosition', r.position], ['TaxObjectCode', objectCode(r, res)], ['NumberOfMonths', months], ['SalaryPensionJhtTht', fi(comp, 'salary')], ['GrossUpOpt', taxMethod(r) === 'gross_up' ? 'Yes' : 'No'], ['IncomeTaxBenefit', fi(comp, 'taxAllowance')], ['OtherBenefit', fi(comp, 'allowance') + fi(comp, 'overtime')], ['Honorarium', fi(comp, 'honorarium')], ['InsurancePaidByEmployer', fi(comp, 'employerInsurance')], ['Natura', fi(comp, 'natura')], ['TantiemBonusThr', fi(comp, 'bonus') + fi(comp, 'thr')], ['PensionContributionJhtThtFee', fi(comp, 'pensionContribution')], ['Zakat', fi(comp, 'zakat')], ['PrevWhTaxSlip', r.previousSlip || nil], ['TaxCertificate', r.facility], ['Article21IncomeTax', 0], ['IDPlaceOfBusinessActivity', company.tku], ['WithholdingDate', company.withholdingDate]
            ];
        return [
            ['WorkForSecondEmployer', r.workForSecondEmployer], ['TaxPeriodMonthStart', r.startMonth], ['TaxPeriodMonthEnd', r.endMonth], ['TaxPeriodYear', year], ['CounterpartTin', r.tin], ['CounterpartNipNrp', r.nip], ['TaxExemptOpt', r.ptkp], ['StatusOfWithholding', status], ['CounterpartPosition', r.position], ['CounterpartRank', r.rank], ['TaxObjectCode', objectCode(r, res)], ['NumberOfMonths', months], ['SalaryPensionJhtTht', fi(comp, 'salary')], ['WifeBenefit', fi(comp, 'wifeBenefit')], ['ChildBenefit', fi(comp, 'childBenefit')], ['IncomeImprovementBenefit', fi(comp, 'incomeImprovement')], ['StructuralFunctionalBenefit', fi(comp, 'structuralBenefit')], ['RiceBenefit', fi(comp, 'riceBenefit')], ['OtherBenefit', fi(comp, 'allowance') + fi(comp, 'overtime')], ['OtherRegularIncome', fi(comp, 'otherRegular')], ['PensionContributionJhtThtFee', fi(comp, 'pensionContribution')], ['Zakat', fi(comp, 'zakat')], ['PrevWhTaxSlip', r.previousSlip || nil], ['Article21IncomeTax', 0], ['IDPlaceOfBusinessActivity', company.tku], ['WithholdingDate', company.withholdingDate]
        ];
    }
    function percentNumber(rate) { return Number((n(rate) * 100).toFixed(6)); }
    function documentsForPeriod() {
        const month = Number(state.company.month), docs = [];
        for (const r of state.recipients) {
            if (isPayroll(r) && r.residency === 'SPDN') {
                if (!inScope(r, month))
                    continue;
                const result = payrollResult(r, month);
                if (!result)
                    continue;
                const anyGross = result.annual ? result.annual.gross : result.gross;
                if (anyGross <= 0)
                    continue;
                const type = result.docType, doc = { type, recipientId: r.id, result, entry: null, fields: fieldSetFor(type, r, result) };
                doc.errors = documentErrors(doc);
                docs.push(doc);
            }
            else {
                for (const result of nonPayrollResults(r, month)) {
                    const type = result.docType, doc = { type, recipientId: r.id, entry: result.entry, result, fields: fieldSetFor(type, r, result) };
                    doc.errors = documentErrors(doc);
                    docs.push(doc);
                }
            }
        }
        return docs;
    }
    function xmlNode(k, v, indent) { if (v && v.nil)
        return indent + '<' + k + ' xsi:nil="true"/>'; return indent + '<' + k + '>' + escXml(v) + '</' + k + '>'; }
    function makeXml(type, docs) { const meta = XML_META[type], items = docs.filter(d => d.type === type); const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<' + meta.root + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">', xmlNode('TIN', state.company.tin, '  '), '  <' + meta.list + '>']; for (const d of items) {
        out.push('    <' + meta.item + '>');
        for (const [k, v] of d.fields)
            out.push(xmlNode(k, v, '      '));
        out.push('    </' + meta.item + '>');
    } out.push('  </' + meta.list + '>', '</' + meta.root + '>'); return out.join('\n'); }
    function xmlBatchStatus(docs, type) { const list = docs.filter(d => d.type === type); return { list, count: list.length, issues: list.flatMap(d => d.errors.map(e => ({ name: person(d.recipientId)?.name || d.recipientId, text: e, id: d.recipientId }))), ready: list.length > 0 && list.every(d => d.errors.length === 0) }; }
    function fileName(type) { return `RIPITAX_${type}_${state.company.year}-${String(state.company.month).padStart(2, '0')}.xml`; }
    return { person, linesFor, allLines, inScope, isPayroll, category, ter, art17, periodParts, payrollResult, nonPayrollResults, monthResults, documentKind, objectCode, taxMonthSummary, companyErrors, personError, documentsForPeriod, makeXml, xmlBatchStatus, fileName };
}
export { rupi };
