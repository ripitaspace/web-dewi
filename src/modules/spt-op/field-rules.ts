import type { Field } from './model';

/** Jenis masukan angka. Nilai tetap disimpan sebagai string; kosong ('') berbeda dari '0'. */
export type NumberKind = 'currency' | 'decimal' | 'percent' | 'integer' | 'year' | 'month';

const monthKeys = new Set(['fromMonth', 'toMonth', 'MonthOfAcquisition']);
const percentKeys = new Set(['norm']);
const integerKeys = new Set(['amendment']);

/** Kunci identitas (NIK/NPWP) — disimpan sebagai string agar nol di depan tidak hilang. */
export const isIdentityKey = (key: string) => key === 'tin' || key === 'spouseTin' || key === 'TINCode' || /[a-z]Tin$/.test(key);
export const identityLength = 16;

export function numberKind(f: Pick<Field, 'key' | 'type'>): NumberKind | null {
  if (f.type === 'money') return 'currency';
  if (f.type === 'year') return 'year';
  if (f.type !== 'number') return null;
  if (monthKeys.has(f.key)) return 'month';
  if (percentKeys.has(f.key)) return 'percent';
  if (integerKeys.has(f.key)) return 'integer';
  return 'decimal';
}

export const digitsOnly = (value: string, max?: number) => { const digits = value.replace(/\D/g, ''); return max ? digits.slice(0, max) : digits; };

/** Aturan rentang/format di luar pemeriksaan "angka valid"; dipakai bersama oleh form baris, kolom isian, dan tab Pemeriksaan. */
export function rangeIssue(f: Pick<Field, 'key' | 'type'>, value: string): string | null {
  if (!value) return null;
  if (isIdentityKey(f.key) && /\D/.test(value)) return 'hanya angka (tanpa titik, spasi, atau tanda hubung)';
  const kind = numberKind(f);
  if (kind === 'month' && !(/^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 12)) return 'bulan 1–12';
  if (kind === 'percent') { const n = Number(value.replace(',', '.')); if (Number.isFinite(n) && (n < 0 || n > 100)) return 'persentase 0–100'; }
  if (kind === 'integer' && !/^\d+$/.test(value)) return 'gunakan bilangan bulat';
  return null;
}

export interface ChoiceOption { value: string; label: string }
export interface Choice { mode: 'segmented' | 'radio'; options: ChoiceOption[]; clearable: boolean }
/** Pilihan yang saling eksklusif (satu jawaban). Select dengan banyak kode (PTKP, hubungan keluarga, kode harta) tetap select. */
const radioKeys = new Set(['sptStatus', 'idType', 'maritalTax', 'bookMethod', 'sector', 'ownership', 'method', 'pps', 'refund', 'capacity']);
export function choiceOf(f: Pick<Field, 'key' | 'type' | 'options' | 'required'>): Choice | null {
  const yesNo = f.type === 'yesno';
  if (!yesNo && !(f.type === 'select' && radioKeys.has(f.key))) return null;
  // Opsi berkunci kosong hanya dianggap pilihan nyata untuk PPS ("Tidak terkait"); pada lainnya kosong = belum dijawab.
  const emptyIsChoice = f.key === 'pps';
  const options = (yesNo ? ['ya|Ya', 'tidak|Tidak'] : f.options).map(item => { const [value, label] = item.split('|'); return { value, label: label || value }; }).filter(option => option.value || emptyIsChoice);
  return { mode: yesNo || options.length <= 2 ? 'segmented' : 'radio', options, clearable: !f.required && !emptyIsChoice };
}

/** Kolom yang hanya relevan/wajib bila jawaban lain tertentu (mis. data pemilik hanya bila harta atas nama pihak lain). */
const dependsOn: Record<string, { key: string; equals: string }> = { ownerTin: { key: 'ownership', equals: 'Other' }, ownerName: { key: 'ownership', equals: 'Other' } };
export const isHidden = (f: Pick<Field, 'key'>, values: Record<string, string>) => { const rule = dependsOn[f.key]; return !!rule && values[rule.key] !== rule.equals; };
export const isRequired = (f: Pick<Field, 'key' | 'required'>, values: Record<string, string>) => f.required && !isHidden(f, values);
/** Kolom bulan m1..m12 pada Lampiran 3B. */
export const monthColumn = /^m(?:[1-9]|1[0-2])$/;
