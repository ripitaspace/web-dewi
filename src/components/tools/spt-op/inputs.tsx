'use client';
import { useState, type ChangeEvent } from 'react';
import { digitsOnly, identityLength, type NumberKind } from '@/modules/spt-op/field-rules';
import { ambiguousDecimal, canonicalNumber, displayNumber } from '@/modules/spt-op/number-input';
export { ambiguousDecimal };

export function TaxNumberField({ id, kind, value, onChange, onBlur, invalid, describedBy, disabled }: {
  id: string; kind: NumberKind; value: string; onChange: (v: string) => void; onBlur?: () => void; invalid?: boolean; describedBy?: string; disabled?: boolean;
}) {
  const [typing, setTyping] = useState<string | null>(null);
  const shown = typing ?? displayNumber(value, kind);
  const numericPad = kind === 'year' || kind === 'month' || kind === 'integer';
  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const clean = numericPad ? digitsOnly(event.target.value, kind === 'year' ? 4 : kind === 'month' ? 2 : undefined) : event.target.value.replace(/rp\.?/gi, '').replace(/[^\d.,\-\s ]/g, '');
    setTyping(clean);
    onChange(canonicalNumber(clean, kind));
  };
  return <input id={id} value={shown} disabled={disabled} inputMode={numericPad ? 'numeric' : 'decimal'} autoComplete="off" spellCheck={false}
    className={kind === 'currency' || kind === 'decimal' || kind === 'percent' ? 'spt-num' : undefined}
    placeholder={kind === 'currency' ? 'Belum diisi' : kind === 'year' ? 'mis. 2025' : kind === 'month' ? '1–12' : undefined}
    aria-invalid={invalid || undefined} aria-describedby={describedBy}
    onFocus={event => { setTyping(displayNumber(value, kind)); event.currentTarget.select(); }}
    onChange={change}
    onBlur={() => { setTyping(null); onBlur?.(); }} />;
}

export function TaxIdentityField({ id, value, onChange, onBlur, invalid, describedBy, disabled }: {
  id: string; value: string; onChange: (v: string) => void; onBlur?: () => void; invalid?: boolean; describedBy?: string; disabled?: boolean;
}) {
  return <input id={id} value={value} disabled={disabled} inputMode="numeric" autoComplete="off" spellCheck={false}
    placeholder={`${identityLength} digit angka`} aria-invalid={invalid || undefined} aria-describedby={describedBy}
    onChange={event => onChange(digitsOnly(event.target.value, identityLength))} onBlur={onBlur} />;
}

/**
 * Pilihan tunggal sebagai radio group (segmented bila ≤2 opsi). Memakai <input type=radio> asli: panah ←→ memindah pilihan,
 * Tab keluar grup, dan klik pada opsi yang sudah aktif mengosongkan jawaban bila `clearable` ("" = belum dijawab, berbeda dari "Tidak").
 */
export function TaxChoiceGroup({ id, legend, required, mode, options, value, clearable, onChange, onBlur, invalid, describedBy, legacy }: {
  id: string; legend: string; required?: boolean; mode: 'segmented' | 'radio'; options: { value: string; label: string }[]; value: string; clearable: boolean;
  onChange: (v: string) => void; onBlur?: () => void; invalid?: boolean; describedBy?: string; legacy?: string;
}) {
  return <fieldset id={id} className={`spt-field spt-choice${options.length > 2 || options.some(option => option.label.length > 6) ? ' spt-wide' : ''}`} aria-invalid={invalid || undefined} aria-describedby={describedBy}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.(); }}>
    <legend>{legend}{required ? ' *' : ''}</legend>
    <div className={`spt-seg ${mode}`} role="radiogroup" aria-label={legend}>
      {options.map(option => <label className="spt-seg-opt" key={option.value || 'empty'}>
        <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)}
          onClick={() => { if (clearable && value === option.value) onChange(''); }} />
        <span>{option.label}</span>
      </label>)}
    </div>
    {legacy && <small className="spt-field-hint">Nilai lama “{legacy}” belum cocok dengan pilihan; pilih salah satu.</small>}
    {clearable && value && <button type="button" className="spt-clear" onClick={() => onChange('')}>Hapus jawaban</button>}
  </fieldset>;
}
