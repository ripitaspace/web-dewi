// Pengaman cetakan SPT OP: watermark diagonal berulang + footer identitas/ID dokumen.
// Ditempel ke tiap `.sheet` sesaat sebelum cetak/ekspor PDF, lalu dilepas lagi.
import type { Draft } from '@/modules/spt-op/model';

const ATTR = 'data-spt-stamp';

export function stampId(draft: Draft, at = new Date()) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const when = `${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}-${pad(at.getHours())}${pad(at.getMinutes())}`;
    return { id: `SPTOP-${(draft.id || 'x').replace(/-/g, '').slice(0, 8).toUpperCase()}-R${draft.revision ?? 0}-${when}`, at };
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));


// --- Guilloche + microtext, polanya diturunkan dari ID dokumen (unik per cetakan) ---
function rng(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Hypotrochoid (spirograf) -> path tertutup. R, r, d dalam mm.
function rosette(cx: number, cy: number, R: number, r: number, d: number, steps = 1400) {
    const total = Math.PI * 2 * Math.max(1, Math.round(r * 10 / gcd(Math.round(R * 10), Math.round(r * 10))));
    let out = '';
    for (let i = 0; i <= steps; i++) {
        const t = (total * i) / steps, k = (R - r) / r;
        const x = cx + (R - r) * Math.cos(t) + d * Math.cos(k * t), y = cy + (R - r) * Math.sin(t) - d * Math.sin(k * t);
        out += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    return out + 'Z';
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

// Pita gelombang bersilangan (seperti border ijazah).
function ribbon(y: number, w: number, amp: number, rand: () => number, lines = 7) {
    let out = '';
    const f = 2 + rand() * 2, ph = rand() * 6.28;
    for (let l = 0; l < lines; l++) {
        let d = '';
        for (let x = 0; x <= w; x += 2) {
            const yy = y + Math.sin((x / w) * Math.PI * 2 * f + ph + l * 0.5) * amp * (1 - l / (lines * 2));
            d += (x ? 'L' : 'M') + x + ' ' + yy.toFixed(2);
        }
        out += `<path d="${d}" fill="none"/>`;
    }
    return out;
}

function securityLayer(w: number, h: number, id: string, owner: string) {
    const rand = rng(id), cx = w / 2, cy = h / 2;
    const R = 48 + Math.round(rand() * 10), r = 13 + Math.round(rand() * 8), d = 14 + Math.round(rand() * 10);
    const rosettes = rosette(cx, cy, R, r, d) + rosette(cx, cy, R * 0.62, r * 0.7, d * 0.8, 900);
    const ribbons = ribbon(10, w, 3.2, rand) + ribbon(h - 12, w, 3.2, rand);
    const micro = `${id} · PUSPITACORE · ${owner} · `.repeat(14);
    const m = 1.6, path = `M${m} ${m}H${w - m}V${h - m}H${m}Z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
<g stroke="rgb(110,110,110)" stroke-opacity="0.055" stroke-width="0.14" fill="none"><path d="${rosettes}"/>${ribbons}</g>
<defs><path id="spt-mt" d="${path}"/></defs>
<text font-family="Helvetica,Arial,sans-serif" font-size="1.05" fill="rgb(90,90,90)" fill-opacity="0.4" letter-spacing="0.08"><textPath href="#spt-mt" textLength="${(2 * (w + h - 4 * m)).toFixed(1)}" lengthAdjust="spacing">${esc(micro)}</textPath></text></svg>`;
}

export function applyStamp(root: HTMLElement | null, draft: Draft): () => void {
    if (!root) return () => undefined;
    const { id, at } = stampId(draft);
    const owner = (draft.profile.name || 'Tanpa nama').toString().trim().toUpperCase().slice(0, 40);
    const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="260"><g transform="rotate(-30 190 130)" font-family="Helvetica,Arial,sans-serif" text-anchor="middle" fill="rgb(110,110,110)"><text x="190" y="135" font-size="11" font-weight="600" letter-spacing="1.5" fill-opacity="0.07">${esc(owner)} · DRAF PRIBADI</text></g></svg>`;
    const bg = `url("data:image/svg+xml;utf8,${encodeURIComponent(tile)}")`;
    const footer = `PUSPITACORE · SPT Orang Pribadi Studio · Dicetak ${at.toLocaleString('id-ID')} · ID ${id} · ${owner} · Bukan dokumen resmi DJP — periksa kembali sebelum dilaporkan`;
    const nodes: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>('.spt-coretax .sheet').forEach((sheet, i, all) => {
        const wm = document.createElement('div');
        wm.setAttribute(ATTR, '');
        wm.style.cssText = `position:absolute;inset:0;z-index:50;pointer-events:none;background-image:${bg};background-repeat:repeat;`;
        const ft = document.createElement('div');
        ft.setAttribute(ATTR, '');
        ft.append(`${footer} · Hal ${i + 1}/${all.length}`);
        ft.style.cssText = 'position:absolute;left:0;right:0;bottom:2.5mm;z-index:51;text-align:center;font:6.5pt Helvetica,Arial,sans-serif;color:#555;pointer-events:none;';
        const land = sheet.classList.contains('landscape');
        const sec = document.createElement('div');
        sec.setAttribute(ATTR, '');
        sec.style.cssText = 'position:absolute;inset:0;z-index:49;pointer-events:none;';
        sec.innerHTML = securityLayer(land ? 330.2 : 215.9, land ? 215.9 : 330.2, id, owner);
        sheet.append(sec, wm, ft);
        nodes.push(sec, wm, ft);
    });
    return () => nodes.forEach(n => n.remove());
}
