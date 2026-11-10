// Usage: node scripts/build-spt-sheets.cjs [template.html] [--slots]  (default: scripts/coretax-template.html)
// Converts the 17-sheet Coretax F4 template into scoped CSS plus a generated TSX module.
// Fillable spots become slot components (Digits, Q, R, Box, Tick, C) whose bindings live in
// src/components/tools/spt-op/sheet-map.ts; this script only does the mechanical conversion.
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const args = process.argv.slice(2);
const flag = args.find(arg => arg.startsWith('--'));
const source = args.find(arg => !arg.startsWith('--')) || path.resolve(__dirname, 'coretax-template.html');
const html = fs.readFileSync(source, 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const sheets = [...html.matchAll(/<section class="sheet[^"]*"[\s\S]*?<\/section>/g)].map(match => match[0]);
if (sheets.length !== 17) throw Error('Expected 17 sheets, got ' + sheets.length);

const SCOPE = '.spt-coretax';
const root = postcss.parse(css);
root.walkRules(rule => {
  if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector => ['html', 'body', ':root', 'html,body'].includes(selector.trim()) ? SCOPE : SCOPE + ' ' + selector.trim());
});
const styles = `${root.toString()}
${SCOPE}{width:max-content;flex:none;background:transparent;font-size:7pt;--navy:#202c5c;--yellow:#ffc20c;--blue:#bacce9;--light:#e4e7e7;--border:#181818;--ink:#070707;color:#070707}
${SCOPE} .sheet{margin:0 0 15px;box-sizing:border-box}
${SCOPE} .digitrow{position:relative}
${SCOPE} .digitrow i{font-style:normal;font-size:8pt;line-height:4.2mm;text-align:center;font-weight:700;color:#111;font-family:Arial,Helvetica,sans-serif}
${SCOPE} .digitrow input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:text;border:0;padding:0;margin:0;background:transparent}
${SCOPE} .digitrow:focus-within{outline:2px solid var(--yellow);outline-offset:1px}
${SCOPE} .slot-input{font:inherit;color:#111;background:transparent;border:0;padding:0 .6mm;width:100%;height:100%;min-width:0;box-shadow:none;font-weight:700}
${SCOPE} .slot-input:focus{outline:2px solid var(--yellow);outline-offset:-1px}
${SCOPE} .tick.on,${SCOPE} .sq.on{background:#111;box-shadow:inset 0 0 0 1.2px #fff}
${SCOPE} .tick,${SCOPE} .sq{cursor:default}
${SCOPE} td.num,${SCOPE} .r-val,${SCOPE} .emptybox{text-align:right}
${SCOPE} .r-val,${SCOPE} .emptybox,${SCOPE} .qval{font-weight:700;color:#111;font-size:7.5pt}
${SCOPE} td.empty,${SCOPE} td{font-size:6.4pt;overflow:hidden;word-break:break-word}
${SCOPE} .sub-line{white-space:nowrap;overflow:hidden;text-overflow:clip;font-weight:600;color:#111}
${SCOPE} .sub-line:empty{display:none}
${SCOPE} .cb{display:inline-block;width:2.6mm;height:2.6mm;border:.25mm solid #2464bf;margin-right:1mm;vertical-align:middle;background:#fff}
${SCOPE} .cb.on{background:#111}
${SCOPE} td[data-sub]{text-align:left}
@media print{${SCOPE}{width:max-content;background:#fff}${SCOPE} .sheet{margin:0}}
`;

let slotLog = [];
const capacities = {}, dataRows = {};
function convert(sheet, n) {
  let digit = 0, qval = 0, rval = 0, box = 0, tick = 0, table = 0;
  let out = sheet;
  out = out.replace(/<img[^>]*>/g, '<img src="/images/branding/kemenkeu-seal.webp" alt="Kementerian Keuangan" />');
  out = out.replace(/<span class="(digitrow[^"]*)">((?:<i><\/i>)+)<\/span>/g, (_, cls, boxes) => {
    const count = (boxes.match(/<i>/g) || []).length;
    slotLog.push(`s${n} digits#${digit} count=${count}`);
    return `<Digits s={${n}} i={${digit++}} cls="${cls}" count={${count}} />`;
  });
  out = out.replace(/<div class="qval"( style="[^"]*")?><\/div>/g, (_, style) => {
    slotLog.push(`s${n} q#${qval}${style ? ' hidden' : ''}`);
    return `<Q s={${n}} i={${qval++}}${style ? ' hidden' : ''} />`;
  });
  out = out.replace(/<span class="r-val"><\/span>/g, () => `<R s={${n}} i={${rval++}} />`);
  if (n === 3) out = out.replace(/<span class="emptybox ptkpbox" style="width:26mm"><\/span>/g, '<Box s={3} i={4} style={{"width":"26mm"}} />');
  out = out.replace(/<span class="emptybox" style="([^"]*)"><\/span>/g, (_, style) => `<Box s={${n}} i={${box++}} style={{${styleObject(style)}}} />`);
  if (n === 3) out = out.replace(/(<div class="r"><b>(?:2\. NAMA|4\. NO\. ID|5\. NO\. TELEPON|6\. EMAIL)<\/b>)<em><\/em>/g, (_, prefix) => `${prefix}<Box s={${n}} i={${box++}} />`);
  out = out.replace(/<span class="tick"><\/span>/g, () => `<Tick s={${n}} i={${tick++}} />`);
  // Tables: every empty body cell becomes <C>, keyed by table ordinal, row and column.
  out = out.replace(/<table class="([^"]*)">([\s\S]*?)<\/table>/g, (whole, cls, inner) => {
    const t = table++;
    const book = /\b(account|balance)\b/.test(cls);
    let r = -1;
    const [head, bodyAndTail] = inner.split('<tbody>');
    const body = bodyAndTail.replace(/<\/tbody>[\s\S]*$/, '');
    let group = '', heading = 0, data = 0;
    const perGroup = {};
    const rows = body.replace(/<tr([^>]*)>([\s\S]*?)<\/tr>/g, (_row, attrs, cells) => {
      r++;
      let c = -1;
      if (!/class="sum"/.test(attrs) && cells.replace(/<[^>]+>/g, '').trim()) group = 'h' + heading++;
      const code = (cells.match(/<td class="code">([^<]+)<\/td>/) || [])[1];
      let fillableCells = 0;
      const filled = cells.replace(/<td([^>]*)>([\s\S]*?)<\/td>/g, (_cell, tdAttrs, text) => {
        c++;
        const empty = text.trim() === '';
        const sum = empty && /class="sumtag"/.test(tdAttrs);
        const tall = empty && /height:2\.45mm/.test(tdAttrs);
        const fillable = sum || (book ? empty && !/class="code"/.test(tdAttrs) : empty && (/class="empty"/.test(tdAttrs) || tall));
        if (!fillable) return `<td${tdAttrs}>${text}</td>`;
        fillableCells++;
        const klass = (tdAttrs.match(/class="([^"]*)"/) || [])[1];
        const style = (tdAttrs.match(/style="([^"]*)"/) || [])[1];
        const k = perGroup[group] || 0;
        const dataSub = (tdAttrs.match(/data-sub="([^"]*)"/) || [])[1];
        const dataLead = (tdAttrs.match(/data-lead="([^"]*)"/) || [])[1];
        const dataTag = (tdAttrs.match(/data-tag="([^"]*)"/) || [])[1];
        const props = [`s={${n}} t={${t}} r={${r}} c={${c}}`, code ? `code="${code}"` : '', tall ? `g=${JSON.stringify(group)} k={${k}}` : '', sum ? 'sum' : '', dataSub ? `sub=${JSON.stringify(dataSub)}` : '', dataLead ? `lead=${JSON.stringify(dataLead)}` : '', dataTag ? `tag=${JSON.stringify(dataTag)}` : '', klass ? `className="${klass}"` : '', style ? `style={{${styleObject(style)}}}` : ''].filter(Boolean).join(' ');
        return `<C ${props} />`;
      });
      if (fillableCells && /height:2\.45mm/.test(cells)) perGroup[group] = (perGroup[group] || 0) + 1;
      if (fillableCells && !book && !/sumtag/.test(cells)) data++;
      return `<tr${attrs}>${filled}</tr>`;
    });
    const groups = Object.keys(perGroup).length ? ' groups=' + JSON.stringify(perGroup) : '';
    slotLog.push(`s${n} table#${t} class="${cls}" rows=${r + 1}${book ? ' book' : ''}${groups}`);
    capacities[`${n}.${t}`] = perGroup;
    dataRows[`${n}.${t}`] = data;
    return `<table className="${cls}">${head}<tbody>${rows}</tbody></table>`;
  });
  out = out.replace(/\bclass=/g, 'className=').replace(/\bcolspan="(\d+)"/g, 'colSpan={$1}').replace(/\browspan="(\d+)"/g, 'rowSpan={$1}').replace(/\bstart="(\d+)"/g, 'start={$1}');
  out = out.replace(/style="([^"]*)"/g, (_, style) => `style={{${styleObject(style)}}}`);
  out = out.replace(/<(br|col|hr)(\s[^>]*?)?>/g, '<$1$2 />').replace(/<\/(br|col|hr)>/g, '');
  // className on <table> is already rewritten above; avoid double conversion.
  return out;
}
function styleObject(style) {
  return style.split(';').filter(item => item.trim()).map(item => {
    const split = item.indexOf(':');
    const key = item.slice(0, split).trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return `${JSON.stringify(key)}:${JSON.stringify(item.slice(split + 1).trim())}`;
  }).join(',');
}
function parseAttrs(attrs) {
  const result = {};
  for (const match of attrs.matchAll(/(\w+)="([^"]*)"/g)) if (match[1] !== 'class' || match[2] !== 'empty') result[match[1]] = match[2];
  return result;
}

const components = sheets.map((sheet, index) => {
  const body = convert(sheet, index + 1);
  return `function Sheet${index + 1}({ slots: { Digits, Q, R, Box, Tick, C } }: SheetProps) {\n  return (${body});\n}`;
});
const names = sheets.map((_, index) => `Sheet${index + 1}`);
const label = sheets.map(sheet => sheet.match(/aria-label="([^"]*)"/)[1]);
const generated = `/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars */
// Generated by scripts/build-spt-sheets.cjs from SPT_OP_Coretax_F4_Lengkap_17_Halaman.html. Do not edit by hand.
import type { ComponentType, CSSProperties, ReactNode } from 'react';

export interface SlotComponents {
  Digits: ComponentType<{ s: number; i: number; cls: string; count: number }>;
  Q: ComponentType<{ s: number; i: number; hidden?: boolean }>;
  R: ComponentType<{ s: number; i: number }>;
  Box: ComponentType<{ s: number; i: number; style?: CSSProperties }>;
  Tick: ComponentType<{ s: number; i: number }>;
  C: ComponentType<{ s: number; t: number; r: number; c: number; code?: string; g?: string; k?: number; sum?: boolean; sub?: string; lead?: string; tag?: string; className?: string; style?: CSSProperties }>;
}
export interface SheetProps { slots: SlotComponents }
export type { ReactNode };

${components.join('\n\n')}

export const sheetTitles: string[] = ${JSON.stringify(label)};
export const sheetComponents: ComponentType<SheetProps>[] = [${names.join(', ')}];
`;
const dir = path.resolve(__dirname, '../src/components/tools/spt-op');
if (flag === '--slots') { console.log(slotLog.join('\n')); process.exit(0); }
fs.writeFileSync(path.join(dir, 'coretax-sheets.generated.tsx'), generated);
fs.writeFileSync(path.join(dir, 'coretax-sheets.css'), styles);
fs.writeFileSync(path.resolve(__dirname, '../src/modules/spt-op/coretax-layout.generated.ts'), `// Generated by scripts/build-spt-sheets.cjs. Do not edit by hand.\nexport const tableDataRows: Record<string, number> = ${JSON.stringify(dataRows)};\nexport const tableGroups: Record<string, Record<string, number>> = ${JSON.stringify(capacities)};\n`);
console.log(`Wrote ${names.length} sheets (${generated.length} bytes TSX, ${styles.length} bytes CSS).`);
