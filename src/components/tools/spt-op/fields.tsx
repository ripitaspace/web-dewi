'use client';
import { useState, type ReactNode } from 'react';
import { type Field, type Values } from '@/modules/spt-op/model';
import { fieldError, money, numeric } from '@/modules/spt-op/engine';
import { choiceOf, identityLength, isHidden, isIdentityKey, isRequired, monthColumn, numberKind } from '@/modules/spt-op/field-rules';
import { ambiguousDecimal, TaxChoiceGroup, TaxIdentityField, TaxNumberField } from './inputs';

export function Fields({ fields, values, onChange, prefix = 'field' }: {
    fields: Field[];
    values: Values;
    onChange: (k: string, v: string) => void;
    prefix?: string;
}) {
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const touch = (key: string) => setTouched(previous => previous[key] ? previous : { ...previous, [key]: true });
    function render(f: Field) {
        const id = prefix + '-' + f.key, hintId = id + '-hint', value = values[f.key] || '', required = isRequired(f, values);
        const kind = numberKind(f), identity = f.type === 'text' && isIdentityKey(f.key);
        const issue = touched[f.key] ? fieldError(f, value, values) : null;
        const note = issue ? null : identity && value ? `${value.length}/${identityLength} digit${value.length === identityLength ? ' ✓' : ''}` : kind && ambiguousDecimal(value, kind) ? 'Dibaca 1.500 (titik = pemisah ribuan). Gunakan koma untuk desimal.' : null;
        const message = issue ? `${f.label}: ${issue}` : note;
        const choice = choiceOf(f);
        if (choice) {
            const known = choice.options.some(option => option.value === value);
            const choiceIssue = touched[f.key] && required && !value ? `${f.label}: wajib dipilih` : null;
            return <TaxChoiceGroup key={f.key} id={id} legend={f.label} required={required} mode={choice.mode} options={choice.options} value={value} clearable={choice.clearable}
                onChange={v => onChange(f.key, v)} onBlur={() => touch(f.key)} invalid={!!choiceIssue} legacy={value && !known ? value : undefined} describedBy={undefined} />;
        }
        const aria = { 'aria-invalid': issue ? true : undefined, 'aria-describedby': message ? hintId : undefined } as const;
        const control = f.type === 'select' || f.type === 'yesno'
            ? <select id={id} value={value} onChange={e => onChange(f.key, e.target.value)} onBlur={() => touch(f.key)} {...aria}><option value="">Belum ditentukan</option>{(f.type === 'yesno' ? ['ya|Ya', 'tidak|Tidak'] : f.options).filter(x => x.split('|')[0]).map(o => { const [k, label] = o.split('|'); return <option key={k} value={k}>{label || k}</option>; })}</select>
            : identity ? <TaxIdentityField id={id} value={value} onChange={v => onChange(f.key, v)} onBlur={() => touch(f.key)} invalid={!!issue} describedBy={aria['aria-describedby']} />
            : kind ? <TaxNumberField id={id} kind={kind} value={value} onChange={v => onChange(f.key, v)} onBlur={() => touch(f.key)} invalid={!!issue} describedBy={aria['aria-describedby']} />
            : <input id={id} value={value} readOnly={f.type === 'computed'} type={f.type === 'date' ? 'date' : 'text'} onChange={e => onChange(f.key, e.target.value)} onBlur={() => touch(f.key)} autoComplete="off" {...aria}/>;
        return <div className="spt-field" key={f.key}><label htmlFor={id}>{f.label}{required ? ' *' : ''}{control}</label>{message && <small id={hintId} className={issue ? 'spt-field-error' : 'spt-field-hint'} role={issue ? 'alert' : undefined}>{message}</small>}</div>;
    }
    const months = fields.filter(f => monthColumn.test(f.key));
    const items: ReactNode[] = [];
    for (const f of fields) {
        if (isHidden(f, values)) continue;
        if (!monthColumn.test(f.key)) { items.push(render(f)); continue; }
        if (f !== months[0]) continue;
        // 12 kolom bulan menjadi satu grid kalender; urutan Tab mengikuti Januari → Desember.
        const total = months.reduce((sum, m) => sum + (Number.isFinite(numeric(values[m.key])) ? numeric(values[m.key]) : 0), 0);
        const empty = months.filter(m => !(values[m.key] || '').trim());
        items.push(<fieldset className="spt-field spt-wide spt-months" key="months"><legend>Peredaran bruto per bulan (Rp)</legend>
            <div className="spt-month-grid">{months.map(render)}</div>
            <div className="spt-month-foot"><span aria-live="polite">Total setahun: <b>{money(total)}</b></span>
                {!!empty.length && <button type="button" onClick={() => empty.forEach(m => onChange(m.key, '0'))}>Isi {empty.length} bulan kosong dengan 0</button>}</div>
        </fieldset>);
    }
    return <div className="spt-formgrid">{items}</div>;
}
