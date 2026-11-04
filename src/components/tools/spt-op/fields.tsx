import { type Field, type Values } from '@/modules/spt-op/model';
export function Fields({ fields, values, onChange, prefix = 'field' }: {
    fields: Field[];
    values: Values;
    onChange: (k: string, v: string) => void;
    prefix?: string;
}) { return <div className="spt-formgrid">{fields.map(f => <label key={f.key} htmlFor={prefix + '-' + f.key}>{f.label}{f.required ? ' *' : ''}{f.type === 'select' || f.type === 'yesno' ? <select id={prefix + '-' + f.key} value={values[f.key] || ''} onChange={e => onChange(f.key, e.target.value)}><option value="">Belum ditentukan</option>{(f.type === 'yesno' ? ['ya|Ya', 'tidak|Tidak'] : f.options).filter(x => x.split('|')[0]).map(o => { const [k, label] = o.split('|'); return <option key={k} value={k}>{label || k}</option>; })}</select> : <input id={prefix + '-' + f.key} value={values[f.key] || ''} readOnly={f.type === 'computed'} type={f.type === 'date' ? 'date' : 'text'} inputMode={['money', 'number', 'year'].includes(f.type) ? 'decimal' : undefined} onChange={e => onChange(f.key, e.target.value)} autoComplete="off"/>}</label>)}</div>; }
