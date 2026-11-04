// Prints an apply_patch patch; does not write files or execute supplied HTML.
const fs = require('node:fs');
const postcss = require('postcss');
const source = fs.readFileSync(process.argv[2], 'utf8');
const css = source.match(/<style>([\s\S]*?)<\/style>/)[1];
const sheets = [...source.matchAll(/<section class="sheet"[\s\S]*?<\/section>/g)].map(match => match[0]);
if (sheets.length !== 8) throw Error('Expected eight source sheets');
const root = postcss.parse(css);
root.walkRules(rule => {
  rule.selectors = rule.selectors.map(selector => {
    if (['html', 'body', ':root'].includes(selector)) return '.spt-source.spt-source.spt-source';
    return '.spt-source.spt-source.spt-source ' + selector;
  });
});
const styles = root.toString() + `\n.spt-source.spt-source.spt-source{--navy:#222852;--blue:#b2d8fa;--yellow:#ffcf00;--gold:#ffc23b;--result:#ffffa1;--gray:#f2f2f2;--border:#555;--ink:#080808;font:8.5pt/1.21 Arial,Helvetica,sans-serif;color:#080808;background:transparent;width:215mm;flex:none}.spt-source.spt-source.spt-source .sheet{margin:0 0 15px;box-sizing:border-box}.spt-source.spt-source.spt-source input{font:inherit;color:inherit;background:transparent;border:0;border-radius:0;padding:0;width:100%;height:100%;min-width:0;box-shadow:none}.spt-source.spt-source.spt-source .id-value input{color:#111}.spt-source.spt-source.spt-source .digits{position:relative}.spt-source.spt-source.spt-source .digits input{position:absolute;inset:0;letter-spacing:1.9mm;color:#111;padding-left:.5mm}.spt-source.spt-source.spt-source .yearboxes input{width:24mm;height:7mm;background:repeating-linear-gradient(to right,#e1e1e1 0,#e1e1e1 5.7mm,#555 5.7mm,#555 6mm);border:1px solid #555;letter-spacing:3.5mm;padding-left:1mm}.spt-source.spt-source.spt-source .topfield label{font-weight:normal}.spt-source.spt-source.spt-source .footer{position:absolute}@media print{.spt-source.spt-source.spt-source .sheet{page:sptTemplate;margin:0;box-shadow:none}.spt-source.spt-source.spt-source{width:215mm;background:white}}@page sptTemplate{size:215mm 330mm;margin:0}\n`;
function jsx(html, index) {
  html = html.replace(/<img[^>]*>/g, '<img src="/images/branding/kemenkeu-seal.webp" alt="Kementerian Keuangan" />');
  html = html.replace(/\bclass=/g, 'className=').replace(/\bcolspan=/g,'colSpan=').replace(/\browspan=/g,'rowSpan=');
  html = html.replace(/style="([^"]*)"/g, (_, style) => 'style={' + JSON.stringify(Object.fromEntries(style.split(';').filter(Boolean).map(item => { const split=item.indexOf(':');return [item.slice(0,split).trim().replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase()),item.slice(split+1).trim()]; }))) + '}');
  html = html.replace(/<(br|col)(\s[^>]*?)?>/g, '<$1$2 />');
  if(index===0){
    let digit=0;
    html=html.replace(/(<span className="digits thin">)([\s\S]*?)(<\/span><\/span>)/g, (whole)=>{const key=digit++===0?'tin':'spouseTin';return whole.replace(/<\/span>$/, `{input('${key}')}<\/span>`);});
    const keys=['name','idNumber','phone','email','maritalTax']; let field=0;
    html=html.replace(/(<div className="id-value"[^>]*>)(<\/div>)/g,(_,open,close)=>open+`{input('${keys[field++]}')}`+close);
    html=html.replace(/<div className="yearboxes">[\s\S]*?<\/div>/,`<div className="yearboxes">{input('year')}</div>`);
  }
  return html;
}
const component = `/* eslint-disable @next/next/no-img-element */\nimport type { Draft } from '../../../modules/spt-op/model';\nimport './source-template.css';\ntype Props={draft:Draft;sheet:number;print?:boolean;onField?:(key:string,value:string)=>void};\nexport function SourceSheet({draft,sheet,print,onField}:Props){\nconst input=(key:string)=>print?<span>{draft.profile[key]||''}</span>:<input aria-label={'Formulir '+key} value={draft.profile[key]||''} onChange={event=>onField?.(key,event.target.value)}/>;\nswitch(sheet){\n${sheets.map((html,index)=>`case ${index}:return <div className="spt-source">${jsx(html,index)}</div>;`).join('\n')}\ndefault:return null;}}\n`;
for(const [path, content] of [['src/components/tools/spt-op/source-template.tsx',component],['src/components/tools/spt-op/source-template.css',styles]]) {
 console.log('*** Begin Patch\n*** Add File: '+path+'\n'+content.split('\n').map(line=>'+'+line).join('\n')+'\n*** End Patch');
}
