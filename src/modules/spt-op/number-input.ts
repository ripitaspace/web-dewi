import { numeric } from './engine';
import { digitsOnly, type NumberKind } from './field-rules';
/**
 * Nilai disimpan sebagai string kanonik: '' = belum diisi, '0' = nol disengaja, titik sebagai desimal
 * (maks 2 digit, tanpa pemisah ribuan) sehingga `numeric()` selalu membacanya tanpa ambigu.
 * Aturan masukan (locale id-ID): titik = ribuan, koma = desimal; satu titik diikuti 1–2 digit dibaca desimal (paste dari spreadsheet).
 */
export function canonicalNumber(raw: string, kind: NumberKind): string {
  const text = raw.replace(/rp\.?/gi, '').replace(/[\s ]/g, '');
  if (!text) return '';
  if (kind === 'year' || kind === 'month' || kind === 'integer') return digitsOnly(text, kind === 'year' ? 4 : kind === 'month' ? 2 : undefined);
  if (!/^-?[\d.,]+$/.test(text)) return raw;
  const n = numeric(text);
  if (!Number.isFinite(n)) return raw;
  const rounded = Math.round(n * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}
const canonicalPattern = /^-?\d+(\.\d+)?$/;
const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
export function displayNumber(value: string, kind: NumberKind): string {
  if (!value || !canonicalPattern.test(value) || kind === 'year' || kind === 'month' || kind === 'integer') return value;
  return formatter.format(Number(value));
}
/** Satu titik + tepat 3 digit pada angka desimal ("1.500") dibaca ribuan; beri tahu pengguna. */
export const ambiguousDecimal = (text: string, kind: NumberKind) => (kind === 'decimal' || kind === 'percent') && /^\d{1,3}\.\d{3}$/.test(text.trim());

