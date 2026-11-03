import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { rupi } from './engine.js';
import { COMPONENTS } from './catalog.js';
import { categoryLabel, componentLabel, payrollColumns, type DocumentSnapshot, type PayrollPerson } from './documents';

const navy = rgb(16 / 255, 40 / 255, 59 / 255), maroon = rgb(120 / 255, 27 / 255, 52 / 255);
const muted = rgb(.36, .40, .43), line = rgb(.86, .85, .83), cream = rgb(.965, .902, .816);
function wrap(text: string, font: PDFFont, size: number, width: number) {
    const lines: string[] = []; let current = '';
    const measure = (value: string) => {
        try { return font.widthOfTextAtSize(value, size); }
        catch { throw new Error('Font PDF belum mendukung karakter pada dokumen ini. Periksa nama atau keterangan penerima.'); }
    };
    for (const word of text.trim().split(/\s+/)) {
        const candidate = current ? `${current} ${word}` : word;
        if (measure(candidate) <= width) { current = candidate; continue; }
        if (current) { lines.push(current); current = ''; }
        for (const char of word) {
            if (measure(current + char) > width && current) { lines.push(current); current = ''; }
            current += char;
        }
    }
    if (current || !lines.length) lines.push(current);
    return lines;
}
async function basePdf() {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    pdf.setCreator('PuspitaCore · Payroll & PPh 21 Studio');
    return { pdf, font, bold };
}
function footers(pdf: PDFDocument, font: PDFFont) {
    pdf.getPages().forEach((page, index) => {
        page.drawLine({ start: { x: 36, y: 36 }, end: { x: page.getWidth() - 36, y: 36 }, color: line, thickness: .5 });
        page.drawText('Dokumen internal · Bukan bukti potong resmi atau bukti pembayaran bank.', { x: 36, y: 23, size: 7, font, color: muted });
        page.drawText(`${index + 1} / ${pdf.getPageCount()}`, { x: page.getWidth() - 65, y: 23, size: 7, font, color: muted });
    });
}
async function embedLogo(pdf: PDFDocument, logo: string) {
    if (logo.startsWith('data:image/png')) return pdf.embedPng(logo);
    if (logo.startsWith('data:image/jpeg')) return pdf.embedJpg(logo);
    if (!logo.startsWith('data:image/')) throw new Error('Format logo tidak didukung.');
    const bitmap = await createImageBitmap(await (await fetch(logo)).blob());
    try {
        const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const context = canvas.getContext('2d'); if (!context) throw new Error('Logo tidak dapat diproses.');
        context.drawImage(bitmap, 0, 0); return await pdf.embedPng(canvas.toDataURL('image/png'));
    } finally { bitmap.close(); }
}
export async function slipPdf(snapshot: DocumentSnapshot, person: PayrollPerson, logo = '', preview = false) {
    if (person.errors.length && !preview) throw new Error(person.errors.join(' '));
    const { pdf, font, bold } = await basePdf();
    let page: PDFPage, y = 0;
    function addPage() { page = pdf.addPage([595.28, 841.89]); y = 793; }
    function ensure(height: number) { if (y - height < 58) { addPage(); text(`${person.title} · ${person.recipient.employeeId} · ${snapshot.period}`, 10, bold); y -= 12; } }
    function text(value: string, size = 10, face = font, color = navy, x = 40, width = 515) {
        const lines = wrap(value, face, size, width);
        lines.forEach(s => { ensure(size + 5); page.drawText(s, { x, y, size, font: face, color }); y -= size + 5; });
    }
    function section(value: string) { ensure(48); y -= 14; text(value.toUpperCase(), 10, bold, maroon); page.drawLine({ start: { x: 40, y: y + 4 }, end: { x: 555, y: y + 4 }, color: line, thickness: .7 }); y -= 6; }
    function row(label: string, amount: number, strong = false) {
        const lines = wrap(label, strong ? bold : font, 10, 355); ensure(lines.length * 15 + 7);
        const top = y; lines.forEach(s => { page.drawText(s, { x: 40, y, size: 10, font: strong ? bold : font, color: strong ? navy : muted }); y -= 15; });
        const value = rupi(amount), face = strong ? bold : font;
        page.drawText(value, { x: 555 - face.widthOfTextAtSize(value, 10), y: top, size: 10, font: face, color: navy }); y -= 5;
    }
    addPage();
    const logoImage = logo ? await embedLogo(pdf, logo) : null;
    if (logoImage) { const size = logoImage.scaleToFit(48, 48); page!.drawImage(logoImage, { x: 40, y: y - 35, width: size.width, height: size.height }); }
    text('PUSPITACORE · DOKUMEN INTERNAL', 9, bold, maroon, logoImage ? 102 : 40, logoImage ? 453 : 515);
    text(snapshot.state.company.name || 'Perusahaan belum diisi', 14, bold, navy, logoImage ? 102 : 40, logoImage ? 453 : 515);
    y -= 20; text(person.title, 26, bold); text(`Periode ${snapshot.period} · ID ${person.recipient.employeeId}`, 11);
    if (person.errors.length) { text('PRATINJAU · PERLU PERBAIKAN', 11, bold, maroon); person.errors.forEach(e => text(e, 9, font, maroon)); }
    section('Penerima');
    text(person.recipient.name || 'Nama belum diisi', 15, bold);
    text(`${categoryLabel(person.recipient.kind)} · ${person.recipient.position || 'Jabatan / profesi belum diisi'}`);
    text(`${person.recipient.residency === 'SPLN' ? 'TIN' : 'NIK / NPWP'}: ${person.recipient.residency === 'SPLN' ? person.recipient.foreignTin || '—' : person.recipient.tin || '—'}`, 9, font, muted);
    section('Penghasilan / imbalan');
    Object.entries(person.parts).filter(([key, value]) => value !== 0 && COMPONENTS[key as keyof typeof COMPONENTS]?.cash !== -1).forEach(([key, amount]) => row(`${componentLabel(key)}${COMPONENTS[key as keyof typeof COMPONENTS]?.cash === 0 ? ' (nontunai)' : ''}`, amount));
    row('Penghasilan tunai', person.summary.cash, true);
    section('Potongan & pajak');
    Object.entries(person.parts).filter(([key, value]) => value !== 0 && COMPONENTS[key as keyof typeof COMPONENTS]?.cash === -1).forEach(([key, amount]) => row(componentLabel(key), amount));
    row(person.summary.tax < 0 ? 'PPh 21/26 · pengembalian rekonsiliasi' : 'PPh 21/26', person.summary.tax);
    row('Total potongan termasuk pajak', person.summary.deductions + person.summary.tax, true);
    ensure(90); y -= 12; page!.drawRectangle({ x: 36, y: y - 58, width: 523, height: 78, color: navy });
    text('BERSIH DIBAYARKAN', 10, bold, cream, 50); y -= 14; text(rupi(person.summary.netCash), 25, bold, rgb(1, 1, 1), 50); y -= 15;
    section('Ringkasan perhitungan'); row('Bruto pajak', person.summary.gross);
    text([...new Set(person.summary.rows.map(r => r.method))].join(' · '), 9, font, muted);
    text('Penghasilan nontunai masuk bruto pajak sesuai perhitungan, tetapi bukan pembayaran tunai.', 8, font, muted);
    footers(pdf, font); return pdf.save();
}

export async function payrollPdf(snapshot: DocumentSnapshot) {
    const { pdf, font, bold } = await basePdf(), columns = payrollColumns(snapshot);
    // Keep the same identity columns on each horizontal group, at legible type sizes.
    const groupSize = Math.ceil(columns.length / Math.ceil(columns.length / 4));
    for (let offset = 0; offset < columns.length; offset += groupSize) {
        const group = columns.slice(offset, offset + groupSize), widths = [76, 142, 130, ...group.map(() => 420 / group.length)];
        let page: PDFPage, y = 0;
        function tableRow(values: string[], strong = false, fill = false) {
            const face = strong ? bold : font, cells = values.map((v, i) => wrap(v, face, 8, widths[i] - 12));
            const height = Math.max(...cells.map(c => c.length)) * 11 + 14;
            if (y - height < 54) newPage();
            if (fill) page.drawRectangle({ x: 36, y: y - height, width: widths.reduce((a, b) => a + b, 0), height, color: cream });
            let x = 36;
            cells.forEach((lines, i) => { lines.forEach((s, n) => page.drawText(s, { x: x + 6, y: y - 13 - n * 11, font: face, size: 8, color: navy })); x += widths[i]; });
            y -= height; page.drawLine({ start: { x: 36, y }, end: { x: 804, y }, color: line, thickness: .4 });
        }
        function newPage() {
            page = pdf.addPage([841.89, 595.28]); y = 550;
            for (const s of wrap(snapshot.state.company.name || 'Perusahaan belum diisi', bold, 13, 765)) { page.drawText(s, { x: 36, y, font: bold, size: 13, color: navy }); y -= 17; }
            page.drawText(`Rekap Payroll Internal · ${snapshot.period} · ${snapshot.people.length} penerima · Kelompok ${offset / groupSize + 1}`, { x: 36, y: y - 4, font, size: 10, color: maroon }); y -= 27;
            tableRow(['ID', 'Nama', 'Kategori', ...group.map(c => c.label)], true, true);
        }
        newPage();
        snapshot.people.forEach(p => tableRow([p.recipient.employeeId, p.recipient.name, categoryLabel(p.recipient.kind), ...group.map(c => rupi(c.value(p)))]));
        tableRow(['TOTAL', `${snapshot.people.length} penerima`, '', ...group.map(c => rupi(snapshot.people.reduce((sum, p) => sum + c.value(p), 0)))], true, true);
    }
    const issues = snapshot.people.filter(p => p.errors.length);
    if (issues.length) {
        let page = pdf.addPage([841.89, 595.28]), y = 550;
        page.drawText('Catatan validasi pembayaran', { x: 36, y, font: bold, size: 15, color: maroon }); y -= 28;
        for (const p of issues) for (const s of wrap(`${p.recipient.employeeId} · ${p.recipient.name}: ${p.errors.join(' ')}`, font, 10, 760)) {
            if (y < 60) { page = pdf.addPage([841.89, 595.28]); y = 550; }
            page.drawText(s, { x: 36, y, font, size: 10, color: navy }); y -= 16;
        }
    }
    footers(pdf, font); return pdf.save();
}
